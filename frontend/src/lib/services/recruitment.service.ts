import api from '@/lib/api';

export const recruitmentService = {
  prospects: {
    async getAll(params?: Record<string, unknown>) {
      const res = await api.get('/recruitment/prospects', { params });
      return res.data;
    },
    async getById(id: string) {
      const res = await api.get(`/recruitment/prospects/${id}`);
      return res.data;
    },
    async create(data: Record<string, unknown>) {
      const res = await api.post('/recruitment/prospects', data);
      return res.data;
    },
    async update(id: string, data: Record<string, unknown>) {
      const res = await api.patch(`/recruitment/prospects/${id}`, data);
      return res.data;
    },
    async delete(id: string) {
      const res = await api.delete(`/recruitment/prospects/${id}`);
      return res.data;
    },
    async enroll(id: string, data: Record<string, unknown>) {
      const res = await api.post(`/recruitment/prospects/${id}/enroll`, data);
      return res.data;
    },
  },
  trials: {
    async getAll(params?: Record<string, unknown>) {
      const res = await api.get('/recruitment/trials', { params });
      return res.data;
    },
    async getById(id: string) {
      const res = await api.get(`/recruitment/trials/${id}`);
      return res.data;
    },
    async create(data: Record<string, unknown>) {
      const res = await api.post('/recruitment/trials', data);
      return res.data;
    },
    async update(id: string, data: Record<string, unknown>) {
      const res = await api.patch(`/recruitment/trials/${id}`, data);
      return res.data;
    },
    async delete(id: string) {
      const res = await api.delete(`/recruitment/trials/${id}`);
      return res.data;
    },
    async addParticipant(trialId: string, data: Record<string, unknown>) {
      const res = await api.post(`/recruitment/trials/${trialId}/participants`, data);
      return res.data;
    },
    async logAttendance(trialId: string, participantId: string, data: Record<string, unknown>) {
      const res = await api.patch(`/recruitment/trials/${trialId}/participants/${participantId}`, data);
      return res.data;
    },
    async addAssessment(trialId: string, data: Record<string, unknown>) {
      const res = await api.post(`/recruitment/trials/${trialId}/assessments`, data);
      return res.data;
    },
  },
};
