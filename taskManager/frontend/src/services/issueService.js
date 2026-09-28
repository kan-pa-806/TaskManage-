import api from './api';

export const issueService = {
  getAll: (params) => api.get('/issues', { params }),
  getById: (id) => api.get(`/issues/${id}`),
  create: (data) => api.post('/issues', data),
  update: (id, data) => api.put(`/issues/${id}`, data),
  remove: (id) => api.delete(`/issues/${id}`),
  getComments: (id) => api.get(`/issues/${id}/comments`),
  addComment: (id, data) => api.post(`/issues/${id}/comments`, data),
};
