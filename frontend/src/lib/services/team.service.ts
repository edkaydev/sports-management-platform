import api from '@/lib/api';

export const teamService = {
  async getAll(params?: Record<string, unknown>) {
    return api.get('/teams', { params });
  },
  async getById(id: string) {
    return api.get(`/teams/${id}`);
  },
  async create(data: Record<string, unknown>) {
    return api.post('/teams', data);
  },
  async update(id: string, data: Record<string, unknown>) {
    return api.patch(`/teams/${id}`, data);
  },
  async delete(id: string) {
    return api.delete(`/teams/${id}`);
  },
};
