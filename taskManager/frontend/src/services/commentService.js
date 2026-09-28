import api from './api';

export const commentService = {
  getByIssue: (issueId) => api.get(`/issues/${issueId}/comments`),
  create: (issueId, data) => api.post(`/issues/${issueId}/comments`, data),
  remove: (id) => api.delete(`/comments/${id}`),
};
