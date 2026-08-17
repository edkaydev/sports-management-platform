import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, getErrorMessage, isTutorRole } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { PageHeader, Button, Table, Badge, Spinner, EmptyState, statusColor, Field, inputClass, Card, InlineAlert } from '@/components/ui';

interface Match {
  id: string;
  eventId: string;
  sportId: string;
  matchNumber: number | null;
  round: string | null;
  homeTeamId: string | null;
  awayTeamId: string | null;
  venue: string | null;
  scheduledDate: string;
  scheduledTime: string | null;
  homeScore: number | null;
  awayScore: number | null;
  status: string;
  matchType: string;
  event?: { id: string; name: string };
  homeTeam?: { id: string; name: string };
  awayTeam?: { id: string; name: string };
}

const EMPTY_FORM = {
  eventId: '',
  sportId: '',
  homeTeamId: '',
  awayTeamId: '',
  matchNumber: '',
  round: '',
  venue: '',
  scheduledDate: '',
  scheduledTime: '',
  status: 'SCHEDULED',
  matchType: 'OTHER',
};

export default function MatchesPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Match | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const canDelete = isTutorRole(user);

  const { data: events } = useQuery({
    queryKey: ['events'],
    queryFn: async () => (await api.get('/events')).data.data,
  });
  const { data: sports } = useQuery({
    queryKey: ['sports'],
    queryFn: async () => (await api.get('/sports')).data.data,
  });
  const { data: teams } = useQuery({
    queryKey: ['teams'],
    queryFn: async () => (await api.get('/teams')).data.data,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['matches'],
    queryFn: async () => (await api.get('/matches')).data.data,
  });

  const fixtures = data
    ? [...data].sort(
        (a: Match, b: Match) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()
      )
    : [];

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        eventId: form.eventId,
        sportId: form.sportId,
        homeTeamId: form.homeTeamId || undefined,
        awayTeamId: form.awayTeamId || undefined,
        matchNumber: form.matchNumber ? parseInt(form.matchNumber, 10) : undefined,
        round: form.round || undefined,
        venue: form.venue || undefined,
        scheduledDate: new Date(`${form.scheduledDate}T${form.scheduledTime || '00:00'}`).toISOString(),
        scheduledTime: form.scheduledTime || undefined,
        status: form.status,
        matchType: form.matchType,
      };
      if (editing) {
        await api.patch(`/matches/${editing.id}`, payload);
      } else {
        await api.post('/matches', payload);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['matches'] });
      setShowForm(false);
      setEditing(null);
      setForm(EMPTY_FORM);
      setError('');
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/matches/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['matches'] }),
    onError: (err) => setError(getErrorMessage(err)),
  });

  function startEdit(m: Match) {
    setEditing(m);
    setForm({
      eventId: m.eventId,
      sportId: m.sportId,
      homeTeamId: m.homeTeamId ?? '',
      awayTeamId: m.awayTeamId ?? '',
      matchNumber: m.matchNumber?.toString() ?? '',
      round: m.round ?? '',
      venue: m.venue ?? '',
      scheduledDate: m.scheduledDate.slice(0, 10),
      scheduledTime: m.scheduledTime ?? m.scheduledDate.slice(11, 16),
      status: m.status,
      matchType: m.matchType,
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
        title="Fixtures & Matches"
        subtitle={`${fixtures.length} matches`}
        actions={<Button onClick={() => { setEditing(null); setForm(EMPTY_FORM); setShowForm((v) => !v); }}>{showForm ? 'Close' : 'Add Match'}</Button>}
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
            <h3 className="font-semibold text-gray-900">{editing ? 'Edit Match' : 'Add Match'}</h3>
            {error && <InlineAlert type="error" message={error} />}
            <div className="grid grid-cols-2 gap-4">
              <Field label="Event" required>
                <select className={inputClass} value={form.eventId} onChange={(e) => set('eventId', e.target.value)} required>
                  <option value="">Select event…</option>
                  {events?.map((e: any) => (
                    <option key={e.id} value={e.id}>{e.name}</option>
                  ))}
                </select>
              </Field>
              <Field label="Sport" required>
                <select className={inputClass} value={form.sportId} onChange={(e) => set('sportId', e.target.value)} required>
                  <option value="">Select sport…</option>
                  {sports?.map((s: any) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </Field>
              <Field label="Home Team">
                <select className={inputClass} value={form.homeTeamId} onChange={(e) => set('homeTeamId', e.target.value)}>
                  <option value="">None</option>
                  {teams?.map((t: any) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </Field>
              <Field label="Away Team">
                <select className={inputClass} value={form.awayTeamId} onChange={(e) => set('awayTeamId', e.target.value)}>
                  <option value="">None</option>
                  {teams?.map((t: any) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </Field>
              <Field label="Match Number">
                <input type="number" min={1} className={inputClass} value={form.matchNumber} onChange={(e) => set('matchNumber', e.target.value)} />
              </Field>
              <Field label="Round">
                <input className={inputClass} value={form.round} onChange={(e) => set('round', e.target.value)} />
              </Field>
              <Field label="Date" required>
                <input type="date" className={inputClass} value={form.scheduledDate} onChange={(e) => set('scheduledDate', e.target.value)} required />
              </Field>
              <Field label="Time">
                <input type="time" className={inputClass} value={form.scheduledTime} onChange={(e) => set('scheduledTime', e.target.value)} />
              </Field>
              <Field label="Venue">
                <input className={inputClass} value={form.venue} onChange={(e) => set('venue', e.target.value)} />
              </Field>
              <Field label="Status">
                <select className={inputClass} value={form.status} onChange={(e) => set('status', e.target.value)}>
                  {['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'POSTPONED', 'ABANDONED'].map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </Field>
            </div>
            <div className="flex justify-end">
              <Button type="submit">{editing ? 'Save Changes' : 'Save Match'}</Button>
            </div>
          </form>
        </Card>
      )}
      {isLoading ? (
        <Spinner />
      ) : !fixtures.length ? (
        <EmptyState message="No fixtures scheduled." />
      ) : (
        <div className="bg-surface border border-border rounded-lg">
          <Table headers={['Match', 'Event', 'Venue', 'Date & Time', 'Score', 'Status', 'Actions']}>
            {fixtures.map((m: Match) => (
              <tr key={m.id} className="hover:bg-gray-50">
                <td className="px-4 py-2.5 font-medium text-gray-900">
                  {m.homeTeam?.name ?? 'TBD'} vs {m.awayTeam?.name ?? 'TBD'}
                </td>
                <td className="px-4 py-2.5 text-gray-600">{m.event?.name ?? '—'}</td>
                <td className="px-4 py-2.5 text-gray-600">{m.venue ?? '—'}</td>
                <td className="px-4 py-2.5 text-gray-600">
                  {new Date(m.scheduledDate).toLocaleString()}
                </td>
                <td className="px-4 py-2.5 text-gray-600">
                  {m.homeScore != null ? `${m.homeScore} – ${m.awayScore}` : '—'}
                </td>
                <td className="px-4 py-2.5">
                  <Badge color={statusColor(m.status)}>{m.status}</Badge>
                </td>
                <td className="px-4 py-2.5">
                  <div className="flex gap-2">
                    <button className="text-sm text-primary font-medium hover:underline" onClick={() => startEdit(m)}>
                      Edit
                    </button>
                    {canDelete && (
                      <button
                        className="text-sm text-danger font-medium hover:underline"
                        onClick={() => {
                          if (window.confirm('Delete this match?')) remove.mutate(m.id);
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
