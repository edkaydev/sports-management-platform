import api from '@/lib/api';

export const documentService = {
  async getAll(params?: Record<string, unknown>) {
    return api.get('/documents', { params });
  },
  async getById(id: string) {
    return api.get(`/documents/${id}`);
  },
  async upload(data: FormData) {
    return api.post('/documents', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  async verify(id: string) {
    return api.patch(`/documents/${id}/verify`);
  },
  async unverify(id: string) {
    return api.patch(`/documents/${id}/unverify`);
  },
  async delete(id: string) {
    return api.delete(`/documents/${id}`);
  },
};
