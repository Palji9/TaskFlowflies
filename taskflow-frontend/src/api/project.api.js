import { api } from "./axios.js";

export const projectApi = {
  list: (workspaceId) => api.get(`/workspaces/${workspaceId}/projects`),
  getById: (workspaceId, projectId) => api.get(`/workspaces/${workspaceId}/projects/${projectId}`),
  create: (workspaceId, d) => api.post(`/workspaces/${workspaceId}/projects`, d),
  update: (workspaceId, projectId, d) => api.put(`/workspaces/${workspaceId}/projects/${projectId}`, d),
  remove: (workspaceId, projectId) => api.delete(`/workspaces/${workspaceId}/projects/${projectId}`),
  getMembers: (workspaceId, projectId) => api.get(`/workspaces/${workspaceId}/projects/${projectId}/members`),
  addMember: (workspaceId, projectId, d) => api.post(`/workspaces/${workspaceId}/projects/${projectId}/members`, d),
  updateMemberRole: (workspaceId, projectId, userId, role) =>
    api.put(`/workspaces/${workspaceId}/projects/${projectId}/members/${userId}`, { role }),
  removeMember: (workspaceId, projectId, userId) =>
    api.delete(`/workspaces/${workspaceId}/projects/${projectId}/members/${userId}`),
};
