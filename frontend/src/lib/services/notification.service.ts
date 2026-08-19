import api from '@/lib/api';

export const notificationService = {
  async broadcast(data: { title: string; message: string; type?: string; targetRole?: string }) {
    const res = await api.post('/notifications/broadcast', data);
    return res.data;
  },

  async getAll(params?: Record<string, unknown>) {
    const res = await api.get('/notifications', { params });
    return res.data;
  },

  async markRead(id: string) {
    const res = await api.patch(`/notifications/${id}/read`);
    return res.data;
  },

  async markAllRead() {
    const res = await api.post('/notifications/read-all');
    return res.data;
  },

  async sendEmailNotification(data: {
    subject: string;
    body: string;
    recipientRole?: string;
    recipientEmails?: string[];
    html?: boolean;
  }) {
    const res = await api.post('/notifications/email', data);
    return res.data;
  },
};
