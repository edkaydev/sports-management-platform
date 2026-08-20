import api from '@/lib/api';

export const equipmentService = {
  async getAll(params?: Record<string, unknown>) {
    const cleaned = params
      ? Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined))
      : undefined;
    const res = await api.get('/equipment', { params: cleaned });
    return res.data;
  },
  async getById(id: string) {
    const res = await api.get(`/equipment/${id}`);
    return res.data;
  },
  async create(data: Record<string, unknown>) {
    const res = await api.post('/equipment', data);
    return res.data;
  },
  async update(id: string, data: Record<string, unknown>) {
    const res = await api.patch(`/equipment/${id}`, data);
    return res.data;
  },
  async delete(id: string) {
    const res = await api.delete(`/equipment/${id}`);
    return res.data;
  },
  async assign(id: string, data: Record<string, unknown>) {
    const res = await api.post(`/equipment/${id}/assign`, data);
    return res.data;
  },
  async returnItem(assignmentId: string, data: Record<string, unknown>) {
    const res = await api.post(`/equipment/assignments/${assignmentId}/return`, data);
    return res.data;
  },
  async deleteAssignment(assignmentId: string) {
    const res = await api.delete(`/equipment/assignments/${assignmentId}`);
    return res.data;
  },
  async getAssignments(id: string) {
    const res = await api.get(`/equipment/${id}/assignments`);
    return res.data;
  },
};
