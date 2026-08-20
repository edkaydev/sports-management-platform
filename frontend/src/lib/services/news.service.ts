import api from '@/lib/api';

export const newsService = {
  async getAll(params?: Record<string, unknown>) {
    const res = await api.get('/news', { params });
    return res.data;
  },
  async getById(id: string) {
    const res = await api.get(`/news/${id}`);
    return res.data;
  },
  async create(data: Record<string, unknown>) {
    const res = await api.post('/news', data);
    return res.data;
  },
  async update(id: string, data: Record<string, unknown>) {
    const res = await api.patch(`/news/${id}`, data);
    return res.data;
  },
  async delete(id: string) {
    const res = await api.delete(`/news/${id}`);
    return res.data;
  },
};

export const slideService = {
  async getAll() {
    const res = await api.get('/slides');
    return res.data;
  },
  async create(data: Record<string, unknown>) {
    const res = await api.post('/slides', data);
    return res.data;
  },
  async update(id: string, data: Record<string, unknown>) {
    const res = await api.patch(`/slides/${id}`, data);
    return res.data;
  },
  async delete(id: string) {
    const res = await api.delete(`/slides/${id}`);
    return res.data;
  },
};
