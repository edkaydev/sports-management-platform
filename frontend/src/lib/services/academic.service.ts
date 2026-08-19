import api from '@/lib/api';

export const academicService = {
  async getAll(params?: Record<string, unknown>) {
    return api.get('/academic-records', { params });
  },
  async getById(id: string) {
    return api.get(`/academic-records/${id}`);
  },
  async create(data: Record<string, unknown>) {
    return api.post('/academic-records', data);
  },
  async update(id: string, data: Record<string, unknown>) {
    return api.patch(`/academic-records/${id}`, data);
  },
  async delete(id: string) {
    return api.delete(`/academic-records/${id}`);
  },
  async importCsv(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/academic-records/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
