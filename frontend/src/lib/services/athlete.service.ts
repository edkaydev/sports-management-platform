import api from '@/lib/api';

export const athleteService = {
  async getAll(params?: Record<string, unknown>) {
    const res = await api.get('/athletes', { params });
    return res.data;
  },
  async getById(id: string) {
    const res = await api.get(`/athletes/${id}`);
    return res.data;
  },
  async create(data: Record<string, unknown>) {
    const res = await api.post('/athletes', data);
    return res.data;
  },
  async update(id: string, data: Record<string, unknown>) {
    const res = await api.patch(`/athletes/${id}`, data);
    return res.data;
  },
  async delete(id: string) {
    const res = await api.delete(`/athletes/${id}`);
    return res.data;
  },
};
