import { api } from "./axios.js";

export const authApi = {
  register: (d) => api.post("/auth/register", d),
  login: (d) => api.post("/auth/login", d),
  logout: () => api.post("/auth/logout"),
  getCurrentUser: () => api.get("/auth/current-user"),
  verifyEmail: (token) => api.get(`/auth/verify-email/${token}`),
  resendVerification: () => api.post("/auth/resend-email-verification"),
  forgotPassword: (email) => api.post("/auth/forgot-password", { email }),
  resetPassword: (token, newPassword) => api.post(`/auth/reset-password/${token}`, { newPassword }),
  changePassword: (oldPassword, newPassword) => api.post("/auth/change-password", { oldPassword, newPassword }),
  refreshToken: () => api.post("/auth/refresh-token"),
};
