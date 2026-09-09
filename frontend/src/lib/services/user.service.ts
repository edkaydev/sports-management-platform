import api from '@/lib/api';
import type { User, UserRole } from '@/types';

export interface CreateUserInput {
  username: string;
  fullName: string;
  password: string;
  role?: UserRole;
  email?: string;
}

export interface UpdateUserInput {
  fullName?: string;
  role?: UserRole;
  isActive?: boolean;
}

export const userService = {
  async list(): Promise<User[]> {
    const res = await api.get('/users');
    return res.data;
  },
  async create(input: CreateUserInput): Promise<User> {
    const res = await api.post('/users', input);
    return res.data;
  },
  async update(id: string, input: UpdateUserInput): Promise<User> {
    const res = await api.patch(`/users/${id}`, input);
    return res.data;
  },
  async resetPassword(id: string, newPassword: string) {
    const res = await api.post(`/users/${id}/reset-password`, { newPassword });
    return res.data;
  },
  async remove(id: string): Promise<User> {
    const res = await api.delete(`/users/${id}`);
    return res.data;
  },
};