import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, getErrorMessage, isTutorRole } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { PageHeader, Button, Table, Badge, Spinner, EmptyState, statusColor, Field, inputClass, Card, InlineAlert } from '@/components/ui';

interface EventItem {
  id: string;
  name: string;
  type: string;
  level: string;
  sportId: string | null;
  venue: string | null;
  startDate: string | null;
  endDate: string | null;
  format: string;
  status: string;
  description: string | null;
  sport?: { id: string; name: string };
  _count?: { participants: number };
}

const EMPTY_FORM = {
  name: '',
  type: 'TOURNAMENT',
  level: 'UNIVERSITY',
  sportId: '',
  venue: '',
  startDate: '',
  endDate: '',
  format: 'OTHER',
  status: 'PLANNED',
  description: '',
};

export default function EventsPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<EventItem | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const canDelete = isTutorRole(user);

  const { data: sports } = useQuery({
    queryKey: ['sports'],
    queryFn: async () => (await api.get('/sports')).data.data,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: async () => (await api.get('/events')).data.data,
  });

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        name: form.name,
        type: form.type,
        level: form.level,
        sportId: form.sportId || undefined,
        venue: form.venue || undefined,
        startDate: form.startDate ? new Date(form.startDate).toISOString() : undefined,
        endDate: form.endDate ? new Date(form.endDate).toISOString() : undefined,
        format: form.format,
        status: form.status,
        description: form.description || undefined,
      };
      if (editing) {
        await api.patch(`/events/${editing.id}`, payload);
      } else {
        await api.post('/events', payload);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['events'] });
      setShowForm(false);
      setEditing(null);
      setForm(EMPTY_FORM);
      setError('');
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/events/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['events'] }),
    onError: (err) => setError(getErrorMessage(err)),
  });

  function startEdit(e: EventItem) {
    setEditing(e);
    setForm({
      name: e.name,
      type: e.type,
      level: e.level,
      sportId: e.sportId ?? '',
      venue: e.venue ?? '',
      startDate: e.startDate ? e.startDate.slice(0, 10) : '',
      endDate: e.endDate ? e.endDate.slice(0, 10) : '',
      format: e.format,
      status: e.status,
      description: e.description ?? '',
    });
    setShowForm(true);
    setError('');
  }

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  return (
    <div>
      <PageHeader
        title="Events & Competitions"
        actions={<Button onClick={() => { setEditing(null); setForm(EMPTY_FORM); setShowForm((v) => !v); }}>{showForm ? 'Close' : 'Add Event'}</Button>}
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
            <h3 className="font-semibold text-gray-900">{editing ? `Edit ${editing.name}` : 'Add Event'}</h3>
            {error && <InlineAlert type="error" message={error} />}
            <Field label="Name" required>
              <input className={inputClass} value={form.name} onChange={(e) => set('name', e.target.value)} required />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Type" required>
                <select className={inputClass} value={form.type} onChange={(e) => set('type', e.target.value)}>
                  {['GALA', 'TOURNAMENT', 'LEAGUE', 'COMPETITION', 'FRIENDLY', 'TRIAL', 'TRAINING'].map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </Field>
              <Field label="Level" required>
                <select className={inputClass} value={form.level} onChange={(e) => set('level', e.target.value)}>
                  {['CAMPUS', 'FACULTY', 'UNIVERSITY', 'LOCAL', 'NATIONAL', 'REGIONAL', 'INTERNATIONAL'].map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </Field>
              <Field label="Sport">
                <select className={inputClass} value={form.sportId} onChange={(e) => set('sportId', e.target.value)}>
                  <option value="">Any</option>
                  {sports?.map((s: any) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </Field>
              <Field label="Status">
                <select className={inputClass} value={form.status} onChange={(e) => set('status', e.target.value)}>
                  {['PLANNED', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'POSTPONED'].map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </Field>
              <Field label="Venue">
                <input className={inputClass} value={form.venue} onChange={(e) => set('venue', e.target.value)} />
              </Field>
              <Field label="Format">
                <select className={inputClass} value={form.format} onChange={(e) => set('format', e.target.value)}>
                  {['KNOCKOUT', 'ROUND_ROBIN', 'LEAGUE', 'GROUP_STAGE', 'SINGLE_MATCH', 'OTHER'].map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </Field>
              <Field label="Start Date">
                <input type="date" className={inputClass} value={form.startDate} onChange={(e) => set('startDate', e.target.value)} />
              </Field>
              <Field label="End Date">
                <input type="date" className={inputClass} value={form.endDate} onChange={(e) => set('endDate', e.target.value)} />
              </Field>
            </div>
            <Field label="Description">
              <textarea
                className={inputClass}
                rows={3}
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                placeholder="Shown on the public events page"
              />
            </Field>
            <div className="flex justify-end">
              <Button type="submit">{editing ? 'Save Changes' : 'Save Event'}</Button>
            </div>
          </form>
        </Card>
      )}
      {isLoading ? (
        <Spinner />
      ) : !data?.length ? (
        <EmptyState message="No events found." />
      ) : (
        <div className="bg-surface border border-border rounded-lg">
          <Table headers={['Name', 'Type', 'Sport', 'Dates', 'Participants', 'Status', 'Actions']}>
            {data.map((e: EventItem) => (
              <tr key={e.id} className="hover:bg-gray-50">
                <td className="px-4 py-2.5 font-medium text-gray-900">{e.name}</td>
                <td className="px-4 py-2.5 text-gray-600">{e.type}</td>
                <td className="px-4 py-2.5 text-gray-600">{e.sport?.name ?? 'Any'}</td>
                <td className="px-4 py-2.5 text-gray-600">
                  {e.startDate ? new Date(e.startDate).toLocaleDateString() : 'TBD'}
                </td>
                <td className="px-4 py-2.5 text-gray-600">{e._count?.participants ?? 0}</td>
                <td className="px-4 py-2.5">
                  <Badge color={statusColor(e.status)}>{e.status}</Badge>
                </td>
                <td className="px-4 py-2.5">
                  <div className="flex gap-2">
                    <button className="text-sm text-primary font-medium hover:underline" onClick={() => startEdit(e)}>
                      Edit
                    </button>
                    {canDelete && (
                      <button
                        className="text-sm text-danger font-medium hover:underline"
                        onClick={() => {
                          if (window.confirm(`Delete ${e.name}?`)) remove.mutate(e.id);
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
