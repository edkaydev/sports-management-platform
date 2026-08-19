import api from '@/lib/api';

export const reportService = {
  async getOverview() {
    return api.get('/reports/overview');
  },
  async getAthleteReport(params?: Record<string, unknown>) {
    return api.get('/reports/athletes', { params });
  },
  async getAcademicReport(params?: Record<string, unknown>) {
    return api.get('/reports/academic', { params });
  },
  async getScholarshipReport(params?: Record<string, unknown>) {
    return api.get('/reports/scholarships', { params });
  },
};
