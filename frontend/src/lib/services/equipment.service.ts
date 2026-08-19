import api from '@/lib/api';

export const equipmentService = {
  async getAll(params?: Record<string, unknown>) {
    const cleaned = params
      ? Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined))
      : undefined;
    return api.get('/equipment', { params: cleaned });
  },
  async getById(id: string) {
    return api.get(`/equipment/${id}`);
  },
  async create(data: Record<string, unknown>) {
    return api.post('/equipment', data);
  },
  async update(id: string, data: Record<string, unknown>) {
    return api.patch(`/equipment/${id}`, data);
  },
  async delete(id: string) {
    return api.delete(`/equipment/${id}`);
  },
  async assign(id: string, data: Record<string, unknown>) {
    return api.post(`/equipment/${id}/assign`, data);
  },
  async returnItem(assignmentId: string, data: Record<string, unknown>) {
    return api.post(`/equipment/assignments/${assignmentId}/return`, data);
  },
  async deleteAssignment(assignmentId: string) {
    return api.delete(`/equipment/assignments/${assignmentId}`);
  },
  async getAssignments(id: string) {
    return api.get(`/equipment/${id}/assignments`);
  },
};
