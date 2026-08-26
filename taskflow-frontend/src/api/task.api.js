import { api } from "./axios.js";

const base = (wId, pId) => `/workspaces/${wId}/projects/${pId}/tasks`;

export const taskApi = {
  list: (wId, pId, params = {}) => api.get(base(wId, pId), { params }),
  getById: (wId, pId, tId) => api.get(`${base(wId, pId)}/${tId}`),
  create: (wId, pId, formData) =>
    api.post(base(wId, pId), formData, { headers: { "Content-Type": "multipart/form-data" } }),
  update: (wId, pId, tId, data) => api.put(`${base(wId, pId)}/${tId}`, data),
  remove: (wId, pId, tId) => api.delete(`${base(wId, pId)}/${tId}`),
  createSubtask: (wId, pId, tId, d) => api.post(`${base(wId, pId)}/${tId}/subtasks`, d),
  updateSubtask: (wId, pId, tId, sId, d) => api.put(`${base(wId, pId)}/${tId}/subtasks/${sId}`, d),
  removeSubtask: (wId, pId, tId, sId) => api.delete(`${base(wId, pId)}/${tId}/subtasks/${sId}`),
};
