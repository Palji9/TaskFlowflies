import { createContext, useContext, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { authApi } from "../api/auth.api.js";
import { setAccessToken } from "../api/axios.js";
import { useAuthStore } from "../store/authStore.js";
import { normalizeUser } from "../utils/normalize.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const { user, isAuthenticated, isLoading, setUser, clearUser } = useAuthStore();

  const fetchMe = useCallback(async () => {
    try {
      const { data } = await authApi.getCurrentUser();
      setUser(normalizeUser(data.data));
    } catch {
      clearUser();
    }
  }, [setUser, clearUser]);

  useEffect(() => {
    fetchMe();
    const onLogout = () => clearUser();
    window.addEventListener("auth:logout", onLogout);
    return () => window.removeEventListener("auth:logout", onLogout);
  }, [fetchMe, clearUser]);

  const login = async (credentials) => {
    const { data } = await authApi.login(credentials);
    setAccessToken(data.data.accessToken);
    const u = normalizeUser(data.data.user);
    setUser(u);
    return u;
  };

  const register = async (payload) => {
    const { data } = await authApi.register(payload);
    return data.data.user;
  };

  const logout = async () => {
    try { await authApi.logout(); } catch { /* ignore */ }
    setAccessToken(null);
    clearUser();
    toast.success("Logged out");
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, register, logout, refreshUser: fetchMe }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
};
