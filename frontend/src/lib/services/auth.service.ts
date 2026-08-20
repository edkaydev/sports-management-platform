import api from '@/lib/api';
import type { User } from '@/types';

type MeResponse = User;

interface LoginResponse {
  user: User;
  accessToken: string;
}

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
  },
  async logout() {
    await api.post('/auth/logout');
  },
  async getMe(): Promise<MeResponse> {
    const res = await api.get('/auth/me');
    return res.data;
  },
  async refresh() {
    const res = await api.post('/auth/refresh');
    return res.data;
  },
  async changePassword(currentPassword: string, newPassword: string) {
    const res = await api.post('/auth/change-password', { currentPassword, newPassword });
    return res.data;
  },
  async forceChangePassword(currentPassword: string, newPassword: string) {
    const res = await api.post('/auth/force-change-password', { currentPassword, newPassword });
    return res.data;
  },
};
