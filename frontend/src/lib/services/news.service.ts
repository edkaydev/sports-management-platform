import api from '@/lib/api';

export const newsService = {
  async getAll(params?: Record<string, unknown>) {
    return api.get('/news', { params });
  },
  async getById(id: string) {
    return api.get(`/news/${id}`);
  },
  async create(data: Record<string, unknown>) {
    return api.post('/news', data);
  },
  async update(id: string, data: Record<string, unknown>) {
    return api.patch(`/news/${id}`, data);
  },
  async delete(id: string) {
    return api.delete(`/news/${id}`);
  },
};

export const slideService = {
  async getAll() {
    return api.get('/slides');
  },
  async create(data: Record<string, unknown>) {
    return api.post('/slides', data);
  },
  async update(id: string, data: Record<string, unknown>) {
    return api.patch(`/slides/${id}`, data);
  },
  async delete(id: string) {
    return api.delete(`/slides/${id}`);
  },
};
