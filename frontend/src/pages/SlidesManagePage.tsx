import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api, { getErrorMessage, isTutorRole, type SliderSlide } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader, Button, Table, Spinner, EmptyState, Field, inputClass, Card, InlineAlert } from '@/components/ui';

interface SlideForm {
  title: string;
  subtitle: string;
  imageUrl: string;
  linkUrl: string;
  linkLabel: string;
  sortOrder: string;
  isActive: boolean;
}

const EMPTY_FORM: SlideForm = {
  title: '',
  subtitle: '',
  imageUrl: '',
  linkUrl: '',
  linkLabel: '',
  sortOrder: '0',
  isActive: true,
};

export default function SlidesManagePage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<SliderSlide | null>(null);
  const [form, setForm] = useState<SlideForm>(EMPTY_FORM);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const canDelete = isTutorRole(user);

  const { data, isLoading } = useQuery({
    queryKey: ['slides'],
    queryFn: async () => (await api.get('/slides')).data as SliderSlide[],
  });

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        title: form.title,
        subtitle: form.subtitle || undefined,
        imageUrl: form.imageUrl,
        linkUrl: form.linkUrl || undefined,
        linkLabel: form.linkLabel || undefined,
        sortOrder: parseInt(form.sortOrder, 10) || 0,
        isActive: form.isActive,
      };
      if (editing) {
        await api.patch(`/slides/${editing.id}`, payload);
      } else {
        await api.post('/slides', payload);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['slides'] });
      setShowForm(false);
      setEditing(null);
      setForm(EMPTY_FORM);
      setError('');
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/slides/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['slides'] }),
    onError: (err) => setError(getErrorMessage(err)),
  });

  const uploadImage = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post('/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data.data.fileUrl as string;
    },
    onSuccess: (fileUrl) => {
      setForm((f) => ({ ...f, imageUrl: `http://localhost:3000${fileUrl}` }));
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  function startEdit(slide: SliderSlide) {
    setEditing(slide);
    setForm({
      title: slide.title,
      subtitle: slide.subtitle ?? '',
      imageUrl: slide.imageUrl,
      linkUrl: slide.linkUrl ?? '',
      linkLabel: slide.linkLabel ?? '',
      sortOrder: String(slide.sortOrder),
      isActive: slide.isActive,
    });
    setShowForm(true);
    setError('');
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) uploadImage.mutate(file);
  }

  return (
    <div>
      <PageHeader
        title="Home Slider"
        subtitle="Manage the image slider shown on the home page."
        actions={
          <Button onClick={() => { setEditing(null); setForm(EMPTY_FORM); setShowForm((v) => !v); }}>
            {showForm ? 'Close' : 'Add Slide'}
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
            <h3 className="font-semibold text-gray-900">{editing ? `Edit: ${editing.title}` : 'New Slide'}</h3>
            {error && <InlineAlert type="error" message={error} />}

            <Field label="Title" required>
              <input
                className={inputClass}
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                required
              />
            </Field>

            <Field label="Subtitle">
              <input
                className={inputClass}
                value={form.subtitle}
                onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))}
              />
            </Field>

            <Field label="Image">
              {form.imageUrl && (
                <div className="mb-2">
                  <img
                    src={form.imageUrl}
                    alt="Preview"
                    className="h-32 w-full object-cover rounded border border-border"
                  />
                </div>
              )}
              <div className="flex gap-2">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageUpload}
                  className={inputClass}
                />
                {uploadImage.isPending && <Spinner />}
              </div>
              <p className="text-xs text-muted mt-1">Upload an image or paste a URL below.</p>
              <input
                className={inputClass + ' mt-2'}
                value={form.imageUrl}
                onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
                placeholder="https://example.com/image.jpg"
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Link URL (optional)">
                <input
                  className={inputClass}
                  value={form.linkUrl}
                  onChange={(e) => setForm((f) => ({ ...f, linkUrl: e.target.value }))}
                  placeholder="https://..."
                />
              </Field>
              <Field label="Link Label (optional)">
                <input
                  className={inputClass}
                  value={form.linkLabel}
                  onChange={(e) => setForm((f) => ({ ...f, linkLabel: e.target.value }))}
                  placeholder="Learn More"
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Sort Order">
                <input
                  type="number"
                  className={inputClass}
                  value={form.sortOrder}
                  onChange={(e) => setForm((f) => ({ ...f, sortOrder: e.target.value }))}
                  min={0}
                />
              </Field>
              <Field label="Active">
                <select
                  className={inputClass}
                  value={form.isActive ? 'true' : 'false'}
                  onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.value === 'true' }))}
                >
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </Field>
            </div>

            <div className="flex justify-end">
              <Button type="submit">{editing ? 'Save Changes' : 'Add Slide'}</Button>
            </div>
          </form>
        </Card>
      )}

      {isLoading ? (
        <Spinner />
      ) : !data?.length ? (
        <EmptyState message="No slides yet. Add your first slide to show on the home page." />
      ) : (
        <div className="bg-surface border border-border rounded-lg">
          <Table headers={['Preview', 'Title', 'Order', 'Active', 'Actions']}>
            {data.map((slide) => (
              <tr key={slide.id} className="hover:bg-gray-50">
                <td className="px-4 py-2.5">
                  <img
                    src={slide.imageUrl}
                    alt={slide.title}
                    className="h-12 w-20 rounded object-cover border border-border"
                  />
                </td>
                <td className="px-4 py-2.5">
                  <div className="font-medium text-gray-900">{slide.title}</div>
                  {slide.subtitle && (
                    <div className="text-xs text-muted truncate max-w-xs">{slide.subtitle}</div>
                  )}
                </td>
                <td className="px-4 py-2.5 text-gray-600">{slide.sortOrder}</td>
                <td className="px-4 py-2.5">
                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${slide.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {slide.isActive ? 'Active' : 'Hidden'}
                  </span>
                </td>
                <td className="px-4 py-2.5">
                  <div className="flex gap-2">
                    <button
                      className="text-sm text-primary font-medium hover:underline"
                      onClick={() => startEdit(slide)}
                    >
                      Edit
                    </button>
                    {canDelete && (
                      <button
                        className="text-sm text-danger font-medium hover:underline"
                        onClick={() => {
                          if (window.confirm(`Delete slide "${slide.title}"?`)) remove.mutate(slide.id);
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
