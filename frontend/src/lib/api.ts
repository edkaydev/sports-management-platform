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

// ─── Token refresh on 401 ────────────────────────────────────────────────────
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
    .finally(() => {
      _refreshing = null;
    });
  return _refreshing;
}

api.interceptors.response.use(
  (res) => res,
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
      // Refresh failed — redirect to login
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
  fullName: string;
  email: string;
  role: string;
  isActive: boolean;
}

export enum UserRole {
  TUTOR = 'TUTOR',
  SPORTS_REP = 'SPORTS_REP',
}

export function roleLabel(role: string): string {
  switch (role) {
    case 'TUTOR':
      return 'Sports Tutor';
    case 'SPORTS_REP':
      return 'Sports Representative';
    default:
      return role;
  }
}

export function isTutorRole(user: User | null): boolean {
  return user?.role === 'TUTOR';
}

export async function login(email: string, password: string) {
  const res = await api.post<{ success: boolean; data: { accessToken: string; user: User } }>(
    '/auth/login',
    { email, password }
  );
  return res.data.data;
}

export interface PublicMatch {
  id: string;
  matchNumber: number | null;
  round: string | null;
  venue: string | null;
  scheduledDate: string;
  scheduledTime: string | null;
  homeScore: number | null;
  awayScore: number | null;
  status: string;
  sport: { id: string; name: string };
  event: { id: string; name: string } | null;
  homeTeam: { id: string; name: string; shortName: string | null } | null;
  awayTeam: { id: string; name: string; shortName: string | null } | null;
  homeIndividual: { id: string; fullName: string } | null;
  awayIndividual: { id: string; fullName: string } | null;
  results: {
    homeScore: number;
    awayScore: number;
    resultType: string;
    winnerTeamId: string | null;
    homePenalties: number | null;
    awayPenalties: number | null;
    walkover: boolean;
  } | null;
}

export interface PublicTeam {
  id: string;
  name: string;
  shortName: string | null;
  gender: string;
  logoUrl: string | null;
  homeVenue: string | null;
  foundingYear: number | null;
  sport: { id: string; name: string; gender: string };
  _count: { squadEntries: number };
}

export interface PublicSport {
  id: string;
  name: string;
  gender: string;
  category: string;
  description: string | null;
  _count: { teams: number; matches: number };
}

export interface PublicEvent {
  id: string;
  name: string;
  type: string;
  level: string;
  venue: string | null;
  startDate: string | null;
  endDate: string | null;
  description: string | null;
  status: string;
  format: string;
  sport: { id: string; name: string } | null;
  _count: { participants: number; matches: number };
}

export interface PublicNewsPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  tags: string | null;
  featured: boolean;
  publishedAt: string | null;
  author: { id: string; fullName: string } | null;
}

export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export async function getPublicFixtures() {
  const res = await api.get<{ success: boolean; data: PublicMatch[] }>('/public/fixtures', {
    params: { limit: 50 },
  });
  return res.data.data;
}

export async function getPublicResults() {
  const res = await api.get<{ success: boolean; data: PublicMatch[] }>('/public/results', {
    params: { limit: 50 },
  });
  return res.data.data;
}

export async function getPublicSports() {
  const res = await api.get<{ success: boolean; data: PublicSport[] }>('/public/sports');
  return res.data.data;
}

export interface PublicSportDetail {
  sport: PublicSport;
  teams: PublicTeam[];
  fixtures: PublicMatch[];
  results: PublicMatch[];
  events: PublicEvent[];
}

export async function getPublicSport(identifier: string) {
  const res = await api.get<{ success: boolean; data: PublicSportDetail }>(`/public/sports/${encodeURIComponent(identifier)}`);
  return res.data.data;
}

export async function getPublicTeams() {
  const res = await api.get<{ success: boolean; data: PublicTeam[] }>('/public/teams');
  return res.data.data;
}

export interface PublicSquadEntry {
  id: string;
  jerseyNumber: number | null;
  position: string | null;
  isCaptain: boolean;
  isViceCaptain: boolean;
  status: string;
  joinedDate: string | null;
  athlete: {
    id: string;
    fullName: string;
    profilePhotoUrl: string | null;
    athleteType: string;
  };
}

export interface PublicTeamDetail {
  team: PublicTeam & { _count: { squadEntries: number; homeMatches: number; awayMatches: number } };
  squad: PublicSquadEntry[];
  fixtures: PublicMatch[];
  results: PublicMatch[];
}

export async function getPublicTeam(identifier: string) {
  const res = await api.get<{ success: boolean; data: PublicTeamDetail }>(`/public/teams/${encodeURIComponent(identifier)}`);
  return res.data.data;
}

export async function getPublicEvents() {
  const res = await api.get<{ success: boolean; data: PublicEvent[] }>('/public/events', {
    params: { limit: 50 },
  });
  return res.data.data;
}

export interface StandingRow {
  teamId: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
}

export interface EventParticipant {
  id: string;
  team: { id: string; name: string; shortName: string | null; gender: string; logoUrl: string | null } | null;
  athlete: { id: string; fullName: string; gender: string } | null;
}

export interface PublicEventDetail {
  event: PublicEvent;
  participants: EventParticipant[];
  fixtures: PublicMatch[];
  results: PublicMatch[];
  standings: StandingRow[];
}

export async function getPublicEvent(identifier: string) {
  const res = await api.get<{ success: boolean; data: PublicEventDetail }>(`/public/events/${encodeURIComponent(identifier)}`);
  return res.data.data;
}

export async function getPublicNews() {
  const res = await api.get<{ success: boolean; data: { news: PublicNewsPost[]; pagination: Pagination } }>(
    '/public/news',
    { params: { page: 1, limit: 50 } }
  );
  return res.data.data;
}

export async function getPublicNewsBySlug(slug: string) {
  const res = await api.get<{ success: boolean; data: PublicNewsPost }>(`/public/news/${slug}`);
  return res.data.data;
}

// ─── Public Slider Slides ─────────────────────────────────────────────────────

export interface SliderSlide {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string;
  linkUrl: string | null;
  linkLabel: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export async function getPublicSlides() {
  const res = await api.get<{ success: boolean; data: Array<Pick<SliderSlide, 'id' | 'title' | 'subtitle' | 'imageUrl' | 'linkUrl' | 'linkLabel'>> }>('/public/slides');
  return res.data.data;
}

export async function listSlides() {
  const res = await api.get<{ success: boolean; data: SliderSlide[] }>('/slides');
  return res.data.data;
}

export async function createSlide(payload: Partial<SliderSlide>) {
  const res = await api.post<{ success: boolean; data: SliderSlide }>('/slides', payload);
  return res.data.data;
}

export async function updateSlide(id: string, payload: Partial<SliderSlide>) {
  const res = await api.patch<{ success: boolean; data: SliderSlide }>(`/slides/${id}`, payload);
  return res.data.data;
}

export async function deleteSlide(id: string) {
  const res = await api.delete<{ success: boolean }>(`/slides/${id}`);
  return res.data;
}

// ─── Department Equipment (TUTOR only) ───────────────────────────────────────

export interface EquipmentItem {
  id: string;
  name: string;
  category: string;
  assetNumber: string | null;
  serialNumber: string | null;
  quantity: number;
  condition: string;
  status: string;
  sportId: string | null;
  storageLocation: string | null;
  purchasedDate: string | null;
  purchaseCost: string | null;
  notes: string | null;
  sport: { id: string; name: string } | null;
  assignments: EquipmentAssignment[];
}

export interface EquipmentAssignment {
  id: string;
  equipmentId: string;
  assignedToType: 'ATHLETE' | 'TEAM';
  athleteId: string | null;
  teamId: string | null;
  quantity: number;
  assignedAt: string;
  dueDate: string | null;
  returnedAt: string | null;
  conditionOnReturn: string | null;
  notes: string | null;
  athlete: { id: string; fullName: string } | null;
  team: { id: string; name: string } | null;
  assignedByUser?: { id: string; fullName: string } | null;
}

export interface EquipmentListResponse {
  items: EquipmentItem[];
  pagination: Pagination;
}

export async function listEquipment(params?: Record<string, string | number | undefined>) {
  // Strip undefined values before sending
  const cleaned = params
    ? Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined))
    : undefined;
  const res = await api.get<{ success: boolean } & EquipmentListResponse>('/equipment', { params: cleaned });
  return res.data;
}

export async function getEquipment(id: string) {
  const res = await api.get<{ success: boolean; data: EquipmentItem }>(`/equipment/${id}`);
  return res.data.data;
}

export async function createEquipment(payload: Record<string, unknown>) {
  const res = await api.post<{ success: boolean; data: EquipmentItem }>('/equipment', payload);
  return res.data.data;
}

export async function updateEquipment(id: string, payload: Record<string, unknown>) {
  const res = await api.patch<{ success: boolean; data: EquipmentItem }>(`/equipment/${id}`, payload);
  return res.data.data;
}

export async function deleteEquipment(id: string) {
  const res = await api.delete<{ success: boolean }>(`/equipment/${id}`);
  return res.data;
}

export async function assignEquipment(id: string, payload: Record<string, unknown>) {
  const res = await api.post<{ success: boolean; data: EquipmentAssignment }>(`/equipment/${id}/assign`, payload);
  return res.data.data;
}

export async function returnEquipment(assignmentId: string, payload: Record<string, unknown>) {
  const res = await api.post<{ success: boolean; data: EquipmentAssignment }>(
    `/equipment/assignments/${assignmentId}/return`,
    payload
  );
  return res.data.data;
}

export async function deleteEquipmentAssignment(assignmentId: string) {
  const res = await api.delete<{ success: boolean }>(`/equipment/assignments/${assignmentId}`);
  return res.data;
}

export async function getEquipmentAssignments(id: string) {
  const res = await api.get<{ success: boolean; data: EquipmentAssignment[] }>(`/equipment/${id}/assignments`);
  return res.data.data;
}
