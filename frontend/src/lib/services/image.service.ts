import api from '@/lib/api';

export interface ImageUploadResult {
  url: string;
  filename: string;
  width?: number;
  height?: number;
}

export const imageService = {
  async upload(file: File, purpose?: string): Promise<ImageUploadResult> {
    const formData = new FormData();
    formData.append('file', file);
    if (purpose) formData.append('purpose', purpose);
    const res = await api.post('/uploads', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  async uploadNewsImage(file: File, newsId?: string): Promise<ImageUploadResult> {
    const formData = new FormData();
    formData.append('file', file);
    if (newsId) formData.append('newsId', newsId);
    const res = await api.post('/uploads/news', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  async uploadSlideImage(file: File): Promise<ImageUploadResult> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('/uploads/slides', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  async uploadEventImage(file: File, eventId?: string): Promise<ImageUploadResult> {
    const formData = new FormData();
    formData.append('file', file);
    if (eventId) formData.append('eventId', eventId);
    const res = await api.post('/uploads/events', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  getImageUrl(path: string | null | undefined): string {
    if (!path) return '/placeholder-image.png';
    if (path.startsWith('http')) return path;
    return `/api${path}`;
  },
};
