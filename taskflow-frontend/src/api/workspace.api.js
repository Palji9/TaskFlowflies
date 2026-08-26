import { api } from "./axios.js";

export const workspaceApi = {
  list: () => api.get("/workspaces"),
  getById: (id) => api.get(`/workspaces/${id}`),
  create: (d) => api.post("/workspaces", d),
  update: (id, d) => api.put(`/workspaces/${id}`, d),
  remove: (id) => api.delete(`/workspaces/${id}`),
  getStats: (id) => api.get(`/workspaces/${id}/stats`),
  getActivity: (id, limit = 20) => api.get(`/workspaces/${id}/activity?limit=${limit}`),
  getMembers: (id) => api.get(`/workspaces/${id}/members`),
  addMember: (id, d) => api.post(`/workspaces/${id}/members`, d),
  updateMemberRole: (id, userId, role) => api.put(`/workspaces/${id}/members/${userId}`, { role }),
  removeMember: (id, userId) => api.delete(`/workspaces/${id}/members/${userId}`),
};
