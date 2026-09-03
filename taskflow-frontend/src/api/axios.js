import axios from "axios";

const getDefaultApiUrl = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (typeof window !== "undefined" && window.location.hostname.endsWith(".vercel.app")) {
    return "https://taskflowflies.onrender.com/api/v1";
  }
  return "http://localhost:8000/api/v1";
};

export const BASE_URL = getDefaultApiUrl();
export const STATIC_URL = BASE_URL.replace("/api/v1", "");

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

let accessToken = null;
export const setAccessToken = (t) => { accessToken = t; };

api.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

let isRefreshing = false;
let queue = [];
const drain = (err, token = null) => {
  queue.forEach(({ resolve, reject }) => err ? reject(err) : resolve(token));
  queue = [];
};

api.interceptors.response.use(
  (r) => r,
  async (error) => {
    const orig = error.config;
    const isRefreshRequest = orig?.url?.includes("/auth/refresh-token");
    const isCurrentUserRequest = orig?.url?.includes("/auth/current-user");
    const canRefresh = !isRefreshRequest && (!orig?.url?.includes("/auth/") || isCurrentUserRequest);
    if (error.response?.status === 401 && !orig?._retry && canRefresh) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => queue.push({ resolve, reject }))
          .then((tok) => { orig.headers.Authorization = `Bearer ${tok}`; return api(orig); })
          .catch(Promise.reject.bind(Promise));
      }
      orig._retry = true;
      isRefreshing = true;
      try {
        const { data } = await api.post("/auth/refresh-token");
        const tok = data?.data?.accessToken;
        setAccessToken(tok);
        drain(null, tok);
        orig.headers.Authorization = `Bearer ${tok}`;
        return api(orig);
      } catch (e) {
        drain(e);
        setAccessToken(null);
        window.dispatchEvent(new CustomEvent("auth:logout"));
        return Promise.reject(e);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);
