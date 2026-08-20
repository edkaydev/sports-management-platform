import api from '@/lib/api';

export const scholarshipService = {
  async getAll(params?: Record<string, unknown>) {
    const res = await api.get('/scholarships', { params });
    return res.data;
  },
  async getById(id: string) {
    const res = await api.get(`/scholarships/${id}`);
    return res.data;
  },
  async create(data: Record<string, unknown>) {
    const res = await api.post('/scholarships', data);
    return res.data;
  },
  async update(id: string, data: Record<string, unknown>) {
    const res = await api.patch(`/scholarships/${id}`, data);
    return res.data;
  },
  async delete(id: string) {
    const res = await api.delete(`/scholarships/${id}`);
    return res.data;
  },
  async renew(id: string, data: Record<string, unknown>) {
    const res = await api.post(`/scholarships/${id}/renew`, data);
    return res.data;
  },
  async revoke(id: string, data: Record<string, unknown>) {
    const res = await api.post(`/scholarships/${id}/revoke`, data);
    return res.data;
  },
};
