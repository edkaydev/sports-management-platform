import api from '@/lib/api';

export const contractService = {
  async getAll(params?: Record<string, unknown>) {
    const res = await api.get('/contracts', { params });
    return res.data;
  },
  async getById(id: string) {
    const res = await api.get(`/contracts/${id}`);
    return res.data;
  },
  async create(data: Record<string, unknown>) {
    const res = await api.post('/contracts', data);
    return res.data;
  },
  async update(id: string, data: Record<string, unknown>) {
    const res = await api.patch(`/contracts/${id}`, data);
    return res.data;
  },
  async delete(id: string) {
    const res = await api.delete(`/contracts/${id}`);
    return res.data;
  },
  async terminate(id: string, data: Record<string, unknown>) {
    const res = await api.post(`/contracts/${id}/terminate`, data);
    return res.data;
  },
};
