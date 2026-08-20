import api from '@/lib/api';

export const eventService = {
  async getAll(params?: Record<string, unknown>) {
    const res = await api.get('/events', { params });
    return res.data;
  },
  async getById(id: string) {
    const res = await api.get(`/events/${id}`);
    return res.data;
  },
  async create(data: Record<string, unknown>) {
    const res = await api.post('/events', data);
    return res.data;
  },
  async update(id: string, data: Record<string, unknown>) {
    const res = await api.patch(`/events/${id}`, data);
    return res.data;
  },
  async delete(id: string) {
    const res = await api.delete(`/events/${id}`);
    return res.data;
  },
};
