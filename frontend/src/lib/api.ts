import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('umu_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let _refreshing: Promise<string | null> | null = null;

async function attemptRefresh(): Promise<string | null> {
  if (_refreshing) return _refreshing;
  _refreshing = api
    .post<{ success: boolean; data: { accessToken: string } }>('/auth/refresh')
    .then((res) => {
      const newToken = res.data.data.accessToken;
      localStorage.setItem('umu_token', newToken);
      return newToken;
    })
    .catch(() => {
      localStorage.removeItem('umu_token');
      localStorage.removeItem('umu_user');
      return null;
    })
    .finally(() => { _refreshing = null; });
  return _refreshing;
}

api.interceptors.response.use(
  (res) => {
    if (res.data?.data !== undefined) {
      res.data = res.data.data;
    }
    return res;
  },
  async (error) => {
    const originalRequest = error.config as typeof error.config & { _retry?: boolean };
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const newToken = await attemptRefresh();
      if (newToken) {
        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        return api(originalRequest);
      }
      if (window.location.pathname !== '/login') {
        // Dynamically import toast to avoid circular dep issues
        import('sonner').then(({ toast }) => {
          toast.error('Your session has expired. Please sign in again.', { id: 'session-expired' });
        });
        setTimeout(() => { window.location.href = '/login'; }, 1200);
      }
    }
    return Promise.reject(error);
  }
);

const TUTOR_ROLES = ['OWNER', 'ADMIN', 'DIRECTOR', 'DEPUTY_DIRECTOR', 'TUTOR', 'HEAD_OF_DEPARTMENT', 'ACADEMIC'];

export function isTutorRole(user: { role?: string } | null | undefined): boolean {
  return !!user?.role && TUTOR_ROLES.includes(user.role);
}

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string };
    if (data?.message) return data.message;
    return error.message;
  }
  return 'Something went wrong. Please try again.';
}

export async function downloadFile(url: string, filename: string) {
  const res = await api.get<Blob>(url, { responseType: 'blob' });
  const blobUrl = window.URL.createObjectURL(res.data);
  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(blobUrl);
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  mustChangePassword: boolean;
}

export async function login(email: string, password: string): Promise<{ accessToken: string; user: User }> {
  const res = await api.post('/auth/login', { email, password });
  return res.data.data ?? res.data;
}

export async function getPublicSlides() {
  const res = await api.get('/slides/public');
  return (res.data.data ?? res.data) as any[];
}

export async function getPublicEvents() {
  const res = await api.get('/events/public');
  return (res.data.data ?? res.data) as any[];
}

export async function getPublicEvent(id: string) {
  const res = await api.get(`/events/public/${id}`);
  return (res.data.data ?? res.data) as any;
}

export interface PublicEventDetail {
  event: any;
  participants: any[];
  standings: any[];
  fixtures: any[];
  results: any[];
}

export async function getPublicFixtures() {
  const res = await api.get('/matches/public');
  return (res.data.data ?? res.data) as any[];
}

export async function getPublicResults() {
  const res = await api.get('/matches/public/results');
  return (res.data.data ?? res.data) as any[];
}

export async function getPublicNews() {
  const res = await api.get('/news/public');
  return (res.data.data ?? res.data) as any;
}

export async function getPublicNewsBySlug(slug: string) {
  const res = await api.get(`/news/public/${slug}`);
  return (res.data.data ?? res.data) as any;
}

export async function getPublicSports() {
  const res = await api.get('/sports/public');
  return (res.data.data ?? res.data) as any[];
}

export async function getPublicSport(id: string) {
  const res = await api.get(`/sports/public/${id}`);
  return (res.data.data ?? res.data) as any;
}

export async function getPublicTeams() {
  const res = await api.get('/teams/public');
  return (res.data.data ?? res.data) as any[];
}

export async function getPublicTeam(id: string) {
  const res = await api.get(`/teams/public/${id}`);
  return (res.data.data ?? res.data) as any;
}

export interface SliderSlide {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string;
  linkUrl: string | null;
  linkLabel: string | null;
  sortOrder: number;
  isActive: boolean;
}

export interface EquipmentItem {
  id: string;
  name: string;
  category: string;
  description: string | null;
  totalQuantity: number;
  availableQuantity: number;
  condition: string;
  location: string | null;
  storageLocation: string | null;
  notes: string | null;
  imageUrl: string | null;
  assetNumber: string | null;
  serialNumber: string | null;
  quantity: number;
  status: string;
  sportId: string | null;
  purchasedDate: string | null;
  purchaseCost: number | null;
  sport?: { id: string; name: string };
}

export interface EquipmentAssignment {
  id: string;
  quantity: number;
  assignedDate: string;
  assignedAt: string;
  dueDate: string | null;
  returnedDate: string | null;
  returnedAt: string | null;
  status: string;
  notes: string | null;
  assignedToType: string | null;
  equipment: EquipmentItem;
  athlete: { id: string; fullName: string; registrationNumber: string };
  team?: { id: string; name: string };
}

export async function listEquipment(params?: Record<string, string> | string) {
  const resolvedParams = typeof params === 'string' ? { category: params } : params;
  const res = await api.get('/equipment', { params: resolvedParams });
  const data = res.data.data ?? res.data;
  return Array.isArray(data) ? data : data?.items ?? data?.equipment ?? [];
}

export async function getEquipmentAssignments(params?: Record<string, string> | string) {
  const resolvedParams = typeof params === 'string' ? { status: params } : params;
  const res = await api.get('/equipment/assignments', { params: resolvedParams });
  const data = res.data.data ?? res.data;
  return Array.isArray(data) ? data : data?.assignments ?? data?.items ?? [];
}

export async function assignEquipment(data: Record<string, unknown> | string, extra?: Record<string, unknown>) {
  const payload = typeof data === 'string' ? { equipmentId: data, ...extra } : data;
  const res = await api.post('/equipment/assign', payload);
  return res.data.data ?? res.data;
}

export async function returnEquipment(id: string, data?: Record<string, unknown>) {
  const res = await api.post(`/equipment/return/${id}`, data);
  return res.data.data ?? res.data;
}

export async function deleteEquipmentAssignment(id: string) {
  const res = await api.delete(`/equipment/assignments/${id}`);
  return res.data.data ?? res.data;
}

export default api;
