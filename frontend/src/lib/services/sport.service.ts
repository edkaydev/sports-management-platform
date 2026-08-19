import api from '@/lib/api';

export const sportService = {
  async getAll(params?: Record<string, unknown>) {
    return api.get('/sports', { params });
  },
  async getById(id: string) {
    return api.get(`/sports/${id}`);
  },
  async create(data: Record<string, unknown>) {
    return api.post('/sports', data);
  },
  async update(id: string, data: Record<string, unknown>) {
    return api.patch(`/sports/${id}`, data);
  },
  async delete(id: string) {
    return api.delete(`/sports/${id}`);
  },
};
