import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, getErrorMessage } from '@/lib/api';
import { PageHeader, Button, Table, Badge, Spinner, EmptyState, statusColor, Field, inputClass, Card, InlineAlert } from '@/components/ui';

export default function EventsPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    type: 'TOURNAMENT',
    level: 'UNIVERSITY',
    sportId: '',
    venue: '',
    startDate: '',
    endDate: '',
    format: 'OTHER',
    status: 'PLANNED',
  });

  const { data: sports } = useQuery({
    queryKey: ['sports'],
    queryFn: async () => (await api.get('/sports')).data.data,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: async () => (await api.get('/events')).data.data,
  });

  const create = useMutation({
    mutationFn: async () => {
      await api.post('/events', {
        ...form,
        sportId: form.sportId || undefined,
        venue: form.venue || undefined,
        startDate: form.startDate ? new Date(form.startDate).toISOString() : undefined,
        endDate: form.endDate ? new Date(form.endDate).toISOString() : undefined,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['events'] });
      setShowForm(false);
      setError('');
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  return (
    <div>
      <PageHeader
        title="Events & Competitions"
        actions={<Button onClick={() => setShowForm((v) => !v)}>Add Event</Button>}
      />
      {showForm && (
        <Card className="mb-6 max-w-lg">
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              create.mutate();
            }}
          >
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
              <Field label="Venue">
                <input className={inputClass} value={form.venue} onChange={(e) => set('venue', e.target.value)} />
              </Field>
              <Field label="Start Date">
                <input type="date" className={inputClass} value={form.startDate} onChange={(e) => set('startDate', e.target.value)} />
              </Field>
              <Field label="End Date">
                <input type="date" className={inputClass} value={form.endDate} onChange={(e) => set('endDate', e.target.value)} />
              </Field>
            </div>
            <div className="flex justify-end">
              <Button type="submit">Save Event</Button>
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
          <Table headers={['Name', 'Type', 'Sport', 'Dates', 'Participants', 'Status']}>
            {data.map((e: any) => (
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
              </tr>
            ))}
          </Table>
        </div>
      )}
    </div>
  );
}
