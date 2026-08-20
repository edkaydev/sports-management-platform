import api from '@/lib/api';

export const academicService = {
  async getAll(params?: Record<string, unknown>) {
    const res = await api.get('/academic-records', { params });
    return res.data;
  },
  async getById(id: string) {
    const res = await api.get(`/academic-records/${id}`);
    return res.data;
  },
  async create(data: Record<string, unknown>) {
    const res = await api.post('/academic-records', data);
    return res.data;
  },
  async update(id: string, data: Record<string, unknown>) {
    const res = await api.patch(`/academic-records/${id}`, data);
    return res.data;
  },
  async delete(id: string) {
    const res = await api.delete(`/academic-records/${id}`);
    return res.data;
  },
  async importCsv(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('/academic-records/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
};
