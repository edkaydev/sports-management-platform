import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, getErrorMessage, isTutorRole } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { PageHeader, Button, Table, Badge, Spinner, EmptyState, statusColor, Field, inputClass, Card, InlineAlert } from '@/components/ui';

interface Team {
  id: string;
  name: string;
  shortName: string | null;
  sportId: string;
  gender: string;
  homeVenue: string | null;
  isActive: boolean;
  sport?: { id: string; name: string };
  _count?: { squadEntries: number };
}

const EMPTY_FORM = { name: '', shortName: '', sportId: '', gender: 'MALE', homeVenue: '' };

export default function TeamsPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Team | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const canDelete = isTutorRole(user);

  const { data: sports } = useQuery({
    queryKey: ['sports'],
    queryFn: async () => (await api.get('/sports')).data.data,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['teams'],
    queryFn: async () => (await api.get('/teams')).data.data,
  });

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        name: form.name,
        shortName: form.shortName || null,
        sportId: form.sportId,
        gender: form.gender,
        homeVenue: form.homeVenue || null,
      };
      if (editing) {
        await api.patch(`/teams/${editing.id}`, payload);
      } else {
        await api.post('/teams', payload);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['teams'] });
      setShowForm(false);
      setEditing(null);
      setForm(EMPTY_FORM);
      setError('');
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/teams/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['teams'] }),
    onError: (err) => setError(getErrorMessage(err)),
  });

  function startEdit(t: Team) {
    setEditing(t);
    setForm({ name: t.name, shortName: t.shortName ?? '', sportId: t.sportId, gender: t.gender, homeVenue: t.homeVenue ?? '' });
    setShowForm(true);
    setError('');
  }

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  return (
    <div>
      <PageHeader
        title="Teams"
        actions={<Button onClick={() => { setEditing(null); setForm(EMPTY_FORM); setShowForm((v) => !v); }}>{showForm ? 'Close' : 'Add Team'}</Button>}
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
            <h3 className="font-semibold text-gray-900">{editing ? `Edit ${editing.name}` : 'Add Team'}</h3>
            {error && <InlineAlert type="error" message={error} />}
            <Field label="Name" required>
              <input className={inputClass} value={form.name} onChange={(e) => set('name', e.target.value)} required />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Short Name">
                <input className={inputClass} value={form.shortName} onChange={(e) => set('shortName', e.target.value)} />
              </Field>
              <Field label="Gender" required>
                <select className={inputClass} value={form.gender} onChange={(e) => set('gender', e.target.value)}>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="MIXED">Mixed</option>
                </select>
              </Field>
            </div>
            <Field label="Sport" required>
              <select className={inputClass} value={form.sportId} onChange={(e) => set('sportId', e.target.value)} required>
                <option value="">Select sport…</option>
                {sports?.map((s: any) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Home Venue">
              <input className={inputClass} value={form.homeVenue} onChange={(e) => set('homeVenue', e.target.value)} />
            </Field>
            <div className="flex justify-end">
              <Button type="submit">{editing ? 'Save Changes' : 'Save Team'}</Button>
            </div>
          </form>
        </Card>
      )}
      {isLoading ? (
        <Spinner />
      ) : !data?.length ? (
        <EmptyState message="No teams found." />
      ) : (
        <div className="bg-surface border border-border rounded-lg">
          <Table headers={['Name', 'Sport', 'Gender', 'Venue', 'Squad Size', 'Status', 'Actions']}>
            {data.map((t: Team) => (
              <tr key={t.id} className="hover:bg-gray-50">
                <td className="px-4 py-2.5 font-medium text-gray-900">
                  {t.name} {t.shortName && <span className="text-muted">({t.shortName})</span>}
                </td>
                <td className="px-4 py-2.5 text-gray-600">{t.sport?.name}</td>
                <td className="px-4 py-2.5 text-gray-600">{t.gender}</td>
                <td className="px-4 py-2.5 text-gray-600">{t.homeVenue ?? '—'}</td>
                <td className="px-4 py-2.5 text-gray-600">{t._count?.squadEntries ?? 0}</td>
                <td className="px-4 py-2.5">
                  <Badge color={statusColor(t.isActive ? 'ACTIVE' : 'INACTIVE')}>{t.isActive ? 'Active' : 'Inactive'}</Badge>
                </td>
                <td className="px-4 py-2.5">
                  <div className="flex gap-2">
                    <button className="text-sm text-primary font-medium hover:underline" onClick={() => startEdit(t)}>
                      Edit
                    </button>
                    {canDelete && (
                      <button
                        className="text-sm text-danger font-medium hover:underline"
                        onClick={() => {
                          if (window.confirm(`Delete ${t.name}?`)) remove.mutate(t.id);
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
