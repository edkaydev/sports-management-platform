import api from '@/lib/api';

export const reportService = {
  async getOverview() {
    const res = await api.get('/reports/overview');
    return res.data;
  },
  async getAthleteReport(params?: Record<string, unknown>) {
    const res = await api.get('/reports/athletes', { params });
    return res.data;
  },
  async getAcademicReport(params?: Record<string, unknown>) {
    const res = await api.get('/reports/academic', { params });
    return res.data;
  },
  async getScholarshipReport(params?: Record<string, unknown>) {
    const res = await api.get('/reports/scholarships', { params });
    return res.data;
  },
};
