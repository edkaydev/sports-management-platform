import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ImageIcon } from 'lucide-react';
import api, { getErrorMessage, isTutorRole } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { imageService } from '@/lib/services/image.service';
import { PageHeader, Button, Table, Badge, Spinner, EmptyState, statusColor, Field, inputClass, Card, InlineAlert } from '@/components/ui';

interface NewsPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  tags: string | null;
  featured: boolean;
  status: string;
  publishedAt: string | null;
  author?: { id: string; fullName: string };
}

const EMPTY_FORM = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  coverImage: '',
  tags: '',
  featured: false,
  status: 'DRAFT',
};

export default function NewsManagePage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<NewsPost | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const { user } = useAuth();
  const canDelete = isTutorRole(user);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['news'],
    queryFn: async () => (await api.get('/news')).data.data,
  });

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        title: form.title,
        slug: form.slug || undefined,
        excerpt: form.excerpt || undefined,
        content: form.content,
        coverImage: form.coverImage || undefined,
        tags: form.tags || undefined,
        featured: form.featured,
        status: form.status,
      };
      if (editing) {
        await api.patch(`/news/${editing.id}`, payload);
      } else {
        await api.post('/news', payload);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['news'] });
      setShowForm(false);
      setEditing(null);
      setForm(EMPTY_FORM);
      setError('');
      toast.success(editing ? 'Post updated' : 'Post created');
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/news/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['news'] });
      toast.success('Post deleted');
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  async function handleCoverImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const result = await imageService.uploadNewsImage(file, editing?.id);
      setForm((f) => ({ ...f, coverImage: result.url }));
      toast.success('Cover image uploaded');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setUploading(false);
    }
  }

  function startEdit(p: NewsPost) {
    setEditing(p);
    setForm({
      title: p.title,
      slug: p.slug,
      excerpt: p.excerpt ?? '',
      content: p.content,
      coverImage: p.coverImage ?? '',
      tags: p.tags ?? '',
      featured: p.featured,
      status: p.status,
    });
    setShowForm(true);
    setError('');
  }

  return (
    <div>
      <PageHeader
        title="News & Announcements"
        subtitle="Drafts are hidden from the public site until published."
        actions={
          <Button onClick={() => { setEditing(null); setForm(EMPTY_FORM); setShowForm((v) => !v); }}>
            {showForm ? 'Close' : 'New Post'}
          </Button>
        }
      />
      {showForm && (
        <Card className="mb-6 max-w-lg">
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              save.mutate();
            }}
          >
            <h3 className="font-semibold text-gray-900">{editing ? `Edit: ${editing.title}` : 'New Post'}</h3>
            {error && <InlineAlert type="error" message={error} />}
            <Field label="Title" required>
              <input className={inputClass} value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} required />
            </Field>
            <Field label="Slug (optional — auto-generated from title)">
              <input className={inputClass} value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} placeholder="my-post-slug" />
            </Field>
            <Field label="Excerpt">
              <input className={inputClass} value={form.excerpt} onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))} />
            </Field>
            <Field label="Content" required>
              <textarea className={inputClass} rows={6} value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} required />
            </Field>

            {/* Cover image upload */}
            <Field label="Cover Image">
              {form.coverImage && (
                <div className="mb-2 relative group">
                  <img
                    src={form.coverImage}
                    alt="Cover preview"
                    className="w-full h-32 object-cover rounded-lg border border-border"
                  />
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, coverImage: '' }))}
                    className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity text-xs px-1.5"
                  >
                    ✕
                  </button>
                </div>
              )}
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 cursor-pointer px-3 py-1.5 rounded border border-border text-sm hover:bg-gray-50 text-gray-700">
                  <ImageIcon className="w-4 h-4" />
                  {uploading ? 'Uploading…' : 'Upload image'}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleCoverImageUpload}
                    disabled={uploading}
                  />
                </label>
                <span className="text-xs text-gray-400">or paste URL:</span>
                <input
                  className={inputClass + ' flex-1'}
                  value={form.coverImage}
                  onChange={(e) => setForm((f) => ({ ...f, coverImage: e.target.value }))}
                  placeholder="https://…"
                />
              </div>
            </Field>

            <Field label="Tags">
              <input className={inputClass} value={form.tags} onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))} placeholder="football, gala" />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Status">
                <select className={inputClass} value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </Field>
              <Field label="Featured">
                <select className={inputClass} value={form.featured ? 'true' : 'false'} onChange={(e) => setForm((f) => ({ ...f, featured: e.target.value === 'true' }))}>
                  <option value="false">No</option>
                  <option value="true">Yes</option>
                </select>
              </Field>
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={save.isPending || uploading}>
                {save.isPending ? 'Saving…' : editing ? 'Save Changes' : 'Create Post'}
              </Button>
            </div>
          </form>
        </Card>
      )}
      {isLoading ? (
        <Spinner />
      ) : !data?.length ? (
        <EmptyState message="No news posts yet." />
      ) : (
        <div className="bg-surface border border-border rounded-lg">
          <Table headers={['Cover', 'Title', 'Author', 'Published', 'Featured', 'Status', 'Actions']}>
            {data.map((p: NewsPost) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-2.5">
                  {p.coverImage ? (
                    <img
                      src={p.coverImage}
                      alt={p.title}
                      className="h-10 w-16 rounded object-cover border border-border"
                    />
                  ) : (
                    <div className="h-10 w-16 rounded border border-border bg-gray-100 flex items-center justify-center">
                      <ImageIcon className="w-4 h-4 text-gray-300" />
                    </div>
                  )}
                </td>
                <td className="px-4 py-2.5 font-medium text-gray-900 max-w-xs truncate">{p.title}</td>
                <td className="px-4 py-2.5 text-gray-600">{p.author?.fullName ?? '—'}</td>
                <td className="px-4 py-2.5 text-gray-600">
                  {p.publishedAt ? new Date(p.publishedAt).toLocaleDateString() : '—'}
                </td>
                <td className="px-4 py-2.5 text-gray-600">{p.featured ? 'Yes' : 'No'}</td>
                <td className="px-4 py-2.5">
                  <Badge color={statusColor(p.status)}>{p.status}</Badge>
                </td>
                <td className="px-4 py-2.5">
                  <div className="flex gap-2">
                    <button className="text-sm text-primary font-medium hover:underline" onClick={() => startEdit(p)}>
                      Edit
                    </button>
                    {canDelete && (
                      <button
                        className="text-sm text-danger font-medium hover:underline"
                        onClick={() => {
                          if (window.confirm(`Delete "${p.title}"?`)) remove.mutate(p.id);
                        }}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </Table>
        </div>
      )}
    </div>
  );
}
