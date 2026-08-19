import api from '@/lib/api';

export const scholarshipService = {
  async getAll(params?: Record<string, unknown>) {
    return api.get('/scholarships', { params });
  },
  async getById(id: string) {
    return api.get(`/scholarships/${id}`);
  },
  async create(data: Record<string, unknown>) {
    return api.post('/scholarships', data);
  },
  async update(id: string, data: Record<string, unknown>) {
    return api.patch(`/scholarships/${id}`, data);
  },
  async delete(id: string) {
    return api.delete(`/scholarships/${id}`);
  },
  async renew(id: string, data: Record<string, unknown>) {
    return api.post(`/scholarships/${id}/renew`, data);
  },
  async revoke(id: string, data: Record<string, unknown>) {
    return api.post(`/scholarships/${id}/revoke`, data);
  },
};
