import api from './api';

export const searchService = {
  search: (query) => api.get('/search', { params: { q: query } }),
};
