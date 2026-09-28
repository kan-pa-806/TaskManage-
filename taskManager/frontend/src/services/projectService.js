import api from './api';

export const projectService = {
  getAll: () => api.get('/projects'),
  getById: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  remove: (id) => api.delete(`/projects/${id}`),
  getIssues: (id, params) => api.get(`/projects/${id}/issues`, { params }),
  getSprints: (id) => api.get(`/projects/${id}/sprints`),
  createSprint: (id, data) => api.post(`/projects/${id}/sprints`, data),
};
