import api from '@/lib/api';

export const teamService = {
  async getAll(params?: Record<string, unknown>) {
    const res = await api.get('/teams', { params });
    return res.data;
  },
  async getById(id: string) {
    const res = await api.get(`/teams/${id}`);
    return res.data;
  },
  async create(data: Record<string, unknown>) {
    const res = await api.post('/teams', data);
    return res.data;
  },
  async update(id: string, data: Record<string, unknown>) {
    const res = await api.patch(`/teams/${id}`, data);
    return res.data;
  },
  async delete(id: string) {
    const res = await api.delete(`/teams/${id}`);
    return res.data;
  },
};
