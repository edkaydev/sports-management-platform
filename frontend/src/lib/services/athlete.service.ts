import api from '@/lib/api';

export const athleteService = {
  async getAll(params?: Record<string, unknown>) {
    return api.get('/athletes', { params });
  },
  async getById(id: string) {
    return api.get(`/athletes/${id}`);
  },
  async create(data: Record<string, unknown>) {
    return api.post('/athletes', data);
  },
  async update(id: string, data: Record<string, unknown>) {
    return api.patch(`/athletes/${id}`, data);
  },
  async delete(id: string) {
    return api.delete(`/athletes/${id}`);
  },
};
