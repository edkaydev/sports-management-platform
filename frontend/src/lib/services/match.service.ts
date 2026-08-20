import api from '@/lib/api';

export const matchService = {
  async getAll(params?: Record<string, unknown>) {
    const res = await api.get('/matches', { params });
    return res.data;
  },
  async getById(id: string) {
    const res = await api.get(`/matches/${id}`);
    return res.data;
  },
  async create(data: Record<string, unknown>) {
    const res = await api.post('/matches', data);
    return res.data;
  },
  async update(id: string, data: Record<string, unknown>) {
    const res = await api.patch(`/matches/${id}`, data);
    return res.data;
  },
  async delete(id: string) {
    const res = await api.delete(`/matches/${id}`);
    return res.data;
  },
};
