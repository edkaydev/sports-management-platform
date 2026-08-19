import api from '@/lib/api';

export const recruitmentService = {
  prospects: {
    async getAll(params?: Record<string, unknown>) {
      return api.get('/recruitment/prospects', { params });
    },
    async getById(id: string) {
      return api.get(`/recruitment/prospects/${id}`);
    },
    async create(data: Record<string, unknown>) {
      return api.post('/recruitment/prospects', data);
    },
    async update(id: string, data: Record<string, unknown>) {
      return api.patch(`/recruitment/prospects/${id}`, data);
    },
    async delete(id: string) {
      return api.delete(`/recruitment/prospects/${id}`);
    },
    async enroll(id: string, data: Record<string, unknown>) {
      return api.post(`/recruitment/prospects/${id}/enroll`, data);
    },
  },
  trials: {
    async getAll(params?: Record<string, unknown>) {
      return api.get('/recruitment/trials', { params });
    },
    async getById(id: string) {
      return api.get(`/recruitment/trials/${id}`);
    },
    async create(data: Record<string, unknown>) {
      return api.post('/recruitment/trials', data);
    },
    async update(id: string, data: Record<string, unknown>) {
      return api.patch(`/recruitment/trials/${id}`, data);
    },
    async delete(id: string) {
      return api.delete(`/recruitment/trials/${id}`);
    },
    async addParticipant(trialId: string, data: Record<string, unknown>) {
      return api.post(`/recruitment/trials/${trialId}/participants`, data);
    },
    async logAttendance(trialId: string, participantId: string, data: Record<string, unknown>) {
      return api.patch(`/recruitment/trials/${trialId}/participants/${participantId}`, data);
    },
    async addAssessment(trialId: string, data: Record<string, unknown>) {
      return api.post(`/recruitment/trials/${trialId}/assessments`, data);
    },
  },
};
