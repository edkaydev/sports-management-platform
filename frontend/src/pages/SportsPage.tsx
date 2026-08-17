import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, getErrorMessage, isTutorRole } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { PageHeader, Button, Table, Badge, Spinner, EmptyState, statusColor, Field, inputClass, Card, InlineAlert } from '@/components/ui';

interface Sport {
  id: string;
  name: string;
  gender: string;
  category: string;
  description: string | null;
  isActive: boolean;
  _count?: { teams: number };
}

const EMPTY_FORM = { name: '', gender: 'MALE', category: 'TEAM', description: '' };

export default function SportsPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Sport | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const canDelete = isTutorRole(user);

  const { data, isLoading } = useQuery({
    queryKey: ['sports'],
    queryFn: async () => (await api.get('/sports')).data.data,
  });

  const save = useMutation({
    mutationFn: async () => {
      const payload = { ...form, description: form.description || null };
      if (editing) {
        await api.patch(`/sports/${editing.id}`, payload);
      } else {
        await api.post('/sports', payload);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sports'] });
      setShowForm(false);
      setEditing(null);
      setForm(EMPTY_FORM);
      setError('');
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/sports/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sports'] }),
    onError: (err) => setError(getErrorMessage(err)),
  });

  function startEdit(s: Sport) {
    setEditing(s);
    setForm({ name: s.name, gender: s.gender, category: s.category, description: s.description ?? '' });
    setShowForm(true);
    setError('');
  }

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  return (
    <div>
      <PageHeader
        title="Sports"
        actions={<Button onClick={() => { setEditing(null); setForm(EMPTY_FORM); setShowForm((v) => !v); }}>{showForm ? 'Close' : 'Add Sport'}</Button>}
      />
      {showForm && (
        <Card className="mb-6 max-w-md">
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              save.mutate();
            }}
          >
            <h3 className="font-semibold text-gray-900">{editing ? `Edit ${editing.name}` : 'Add Sport'}</h3>
            {error && <InlineAlert type="error" message={error} />}
            <Field label="Name" required>
              <input className={inputClass} value={form.name} onChange={(e) => set('name', e.target.value)} required />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Gender" required>
                <select className={inputClass} value={form.gender} onChange={(e) => set('gender', e.target.value)}>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="MIXED">Mixed</option>
                </select>
              </Field>
              <Field label="Category" required>
                <select className={inputClass} value={form.category} onChange={(e) => set('category', e.target.value)}>
                  <option value="TEAM">Team</option>
                  <option value="INDIVIDUAL">Individual</option>
                </select>
              </Field>
            </div>
            <Field label="Description">
              <textarea
                className={inputClass}
                rows={3}
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                placeholder="Shown on the public sports page"
              />
            </Field>
            <div className="flex justify-end">
              <Button type="submit">{editing ? 'Save Changes' : 'Save Sport'}</Button>
            </div>
          </form>
        </Card>
      )}
      {isLoading ? (
        <Spinner />
      ) : !data?.length ? (
        <EmptyState message="No sports found." />
      ) : (
        <div className="bg-surface border border-border rounded-lg">
          <Table headers={['Name', 'Gender', 'Category', 'Teams', 'Status', 'Actions']}>
            {data.map((s: Sport) => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="px-4 py-2.5 font-medium text-gray-900">{s.name}</td>
                <td className="px-4 py-2.5 text-gray-600">{s.gender}</td>
                <td className="px-4 py-2.5 text-gray-600">{s.category}</td>
                <td className="px-4 py-2.5 text-gray-600">{s._count?.teams ?? 0}</td>
                <td className="px-4 py-2.5">
                  <Badge color={statusColor(s.isActive ? 'ACTIVE' : 'INACTIVE')}>{s.isActive ? 'Active' : 'Inactive'}</Badge>
                </td>
                <td className="px-4 py-2.5">
                  <div className="flex gap-2">
                    <button className="text-sm text-primary font-medium hover:underline" onClick={() => startEdit(s)}>
                      Edit
                    </button>
                    {canDelete && (
                      <button
                        className="text-sm text-danger font-medium hover:underline"
                        onClick={() => {
                          if (window.confirm(`Delete ${s.name}?`)) remove.mutate(s.id);
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
