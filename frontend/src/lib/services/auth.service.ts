import api from '@/lib/api';
import type { User } from '@/types';

type MeResponse = User;

interface LoginResponse {
  user: User;
  accessToken: string;
}

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    return api.post('/auth/login', { email, password }) as Promise<LoginResponse>;
  },
  async logout() {
    return api.post('/auth/logout');
  },
  async getMe(): Promise<MeResponse> {
    return api.get('/auth/me') as Promise<MeResponse>;
  },
  async refresh() {
    return api.post('/auth/refresh');
  },
  async changePassword(currentPassword: string, newPassword: string) {
    return api.post('/auth/change-password', { currentPassword, newPassword });
  },
  async forceChangePassword(currentPassword: string, newPassword: string) {
    return api.post('/auth/force-change-password', { currentPassword, newPassword });
  },
};
