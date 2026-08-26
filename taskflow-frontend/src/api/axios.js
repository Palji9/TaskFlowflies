import axios from "axios";

export const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";
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
    const isAuth = orig?.url?.includes("/auth/");
    if (error.response?.status === 401 && !orig._retry && !isAuth) {
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
