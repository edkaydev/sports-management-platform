import api from '@/lib/api';

export const contractService = {
  async getAll(params?: Record<string, unknown>) {
    return api.get('/contracts', { params });
  },
  async getById(id: string) {
    return api.get(`/contracts/${id}`);
  },
  async create(data: Record<string, unknown>) {
    return api.post('/contracts', data);
  },
  async update(id: string, data: Record<string, unknown>) {
    return api.patch(`/contracts/${id}`, data);
  },
  async delete(id: string) {
    return api.delete(`/contracts/${id}`);
  },
  async terminate(id: string, data: Record<string, unknown>) {
    return api.post(`/contracts/${id}/terminate`, data);
  },
};
