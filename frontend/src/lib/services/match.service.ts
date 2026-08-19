import api from '@/lib/api';

export const matchService = {
  async getAll(params?: Record<string, unknown>) {
    return api.get('/matches', { params });
  },
  async getById(id: string) {
    return api.get(`/matches/${id}`);
  },
  async create(data: Record<string, unknown>) {
    return api.post('/matches', data);
  },
  async update(id: string, data: Record<string, unknown>) {
    return api.patch(`/matches/${id}`, data);
  },
  async delete(id: string) {
    return api.delete(`/matches/${id}`);
  },
};
