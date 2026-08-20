import api from '@/lib/api';

export const documentService = {
  async getAll(params?: Record<string, unknown>) {
    const res = await api.get('/documents', { params });
    return res.data;
  },
  async getById(id: string) {
    const res = await api.get(`/documents/${id}`);
    return res.data;
  },
  async upload(data: FormData) {
    const res = await api.post('/documents', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  async verify(id: string) {
    const res = await api.patch(`/documents/${id}/verify`);
    return res.data;
  },
  async unverify(id: string) {
    const res = await api.patch(`/documents/${id}/unverify`);
    return res.data;
  },
  async delete(id: string) {
    const res = await api.delete(`/documents/${id}`);
    return res.data;
  },
};
