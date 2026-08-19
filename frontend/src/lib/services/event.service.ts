import api from '@/lib/api';

export const eventService = {
  async getAll(params?: Record<string, unknown>) {
    return api.get('/events', { params });
  },
  async getById(id: string) {
    return api.get(`/events/${id}`);
  },
  async create(data: Record<string, unknown>) {
    return api.post('/events', data);
  },
  async update(id: string, data: Record<string, unknown>) {
    return api.patch(`/events/${id}`, data);
  },
  async delete(id: string) {
    return api.delete(`/events/${id}`);
  },
};
