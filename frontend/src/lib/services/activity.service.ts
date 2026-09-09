import api from '@/lib/api';

export interface ActivityEntry {
  id: string;
  action: 'create' | 'update' | 'delete' | 'note';
  summary: string;
  entityType: string | null;
  entityId: string | null;
  fileUrl: string | null;
  fileName: string | null;
  note: string | null;
  createdAt: string;
  user: { fullName: string; username: string };
}

export interface ActivityStats {
  totals: { create: number; update: number; delete: number; note: number };
  total: number;
  createdSince: number;
  today: number;
  filesUploaded: number;
  daily: { date: string; count: number }[];
}

export async function getActivity(limit = 50) {
  const res = await api.get<{ success: boolean; data: ActivityEntry[] }>('/activity', {
    params: { limit },
  });
  return res.data.data;
}

export async function getActivityStats() {
  const res = await api.get<{ success: boolean; data: ActivityStats }>('/activity/stats');
  return res.data.data;
}

export async function createEvidence(form: FormData) {
  const res = await api.post<{ success: boolean; data: ActivityEntry }>('/activity', form);
  return res.data.data;
}

export async function deleteActivity(id: string) {
  await api.delete(`/activity/${id}`);
}