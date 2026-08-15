import axios from 'axios';

export const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('umu_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('umu_token');
      localStorage.removeItem('umu_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string };
    if (data?.message) return data.message;
    return error.message;
  }
  return 'Something went wrong. Please try again.';
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: string;
  isActive: boolean;
}

export async function login(email: string, password: string) {
  const res = await api.post<{ success: boolean; data: { accessToken: string; user: User } }>(
    '/auth/login',
    { email, password }
  );
  return res.data.data;
}
