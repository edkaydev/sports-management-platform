import api from '@/lib/api';

export const sportService = {
  async getAll(params?: Record<string, unknown>) {
    const res = await api.get('/sports', { params });
    return res.data;
  },
  async getById(id: string) {
    const res = await api.get(`/sports/${id}`);
    return res.data;
  },
  async create(data: Record<string, unknown>) {
    const res = await api.post('/sports', data);
    return res.data;
  },
  async update(id: string, data: Record<string, unknown>) {
    const res = await api.patch(`/sports/${id}`, data);
    return res.data;
  },
  async delete(id: string) {
    const res = await api.delete(`/sports/${id}`);
    return res.data;
  },
};
