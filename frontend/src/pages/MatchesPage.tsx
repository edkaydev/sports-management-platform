import { useState } from 'react';
import { useMatches } from '@/hooks/useMatches';
import { useEvents } from '@/hooks/useEvents';
import { useSports } from '@/hooks/useSports';
import { useTeams } from '@/hooks/useTeams';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader, EmptyState } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { FormDialog } from '@/components/shared/FormDialog';
import { PageLoader } from '@/components/PageLoader';
import { isTutorRole } from '@/lib/api';
import { Plus, Pencil, Trash2 } from 'lucide-react';

const EMPTY_FORM = {
  eventId: '', sportId: '', homeTeamId: '', awayTeamId: '', matchNumber: '',
  round: '', venue: '', scheduledDate: '', scheduledTime: '',
  status: 'SCHEDULED', matchType: 'OTHER',
};

function SelectField({ label, value, onChange, options, required }: {
  label: string; value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[]; required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && '*'}
      </label>
      <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={value} onChange={(e) => onChange(e.target.value)} required={required}>
        <option value="">Select...</option>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

export default function MatchesPage() {
  const { user } = useAuth();
  const canDelete = isTutorRole(user);
  const { matches, isLoading, createMatch, updateMatch, deleteMatch } = useMatches();
  const { events } = useEvents();
  const { sports } = useSports();
  const { teams } = useTeams();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');

  const fixtures = [...matches].sort(
    (a: any, b: any) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()
  );

  function startEdit(m: any) {
    setEditing(m);
    setForm({
      eventId: m.eventId, sportId: m.sportId, homeTeamId: m.homeTeamId ?? '',
      awayTeamId: m.awayTeamId ?? '', matchNumber: m.matchNumber?.toString() ?? '',
      round: m.round ?? '', venue: m.venue ?? '', scheduledDate: m.scheduledDate.slice(0, 10),
      scheduledTime: m.scheduledTime ?? m.scheduledDate.slice(11, 16),
      status: m.status, matchType: m.matchType,
    });
    setShowForm(true);
    setError('');
  }

  function resetForm() { setEditing(null); setForm(EMPTY_FORM); setShowForm(false); setError(''); }

  function handleSubmit() {
    const payload = {
      eventId: form.eventId, sportId: form.sportId,
      homeTeamId: form.homeTeamId || undefined, awayTeamId: form.awayTeamId || undefined,
      matchNumber: form.matchNumber ? parseInt(form.matchNumber, 10) : undefined,
      round: form.round || undefined, venue: form.venue || undefined,
      scheduledDate: new Date(`${form.scheduledDate}T${form.scheduledTime || '00:00'}`).toISOString(),
      scheduledTime: form.scheduledTime || undefined, status: form.status, matchType: form.matchType,
    };
    if (editing) {
      updateMatch.mutate({ id: editing.id, data: payload }, { onSuccess: resetForm, onError: (e) => setError(e.message) });
    } else {
      createMatch.mutate(payload, { onSuccess: resetForm, onError: (e) => setError(e.message) });
    }
  }

  if (isLoading) return <PageLoader />;

  return (
    <div>
      <PageHeader
        title="Fixtures & Matches"
        subtitle={`${fixtures.length} matches`}
        actions={
          <Button onClick={() => { setEditing(null); setForm(EMPTY_FORM); setShowForm(true); }}>
            <Plus className="w-4 h-4 mr-2" /> Add Match
          </Button>
        }
      />

      {fixtures.length === 0 ? (
        <EmptyState message="No fixtures scheduled." action={<Button onClick={() => setShowForm(true)}>Add Match</Button>} />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Match</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Venue</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fixtures.map((m: any) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium">{m.homeTeam?.name ?? 'TBD'} vs {m.awayTeam?.name ?? 'TBD'}</TableCell>
                    <TableCell>{m.event?.name ?? '—'}</TableCell>
                    <TableCell>{m.venue ?? '—'}</TableCell>
                    <TableCell className="text-xs">{new Date(m.scheduledDate).toLocaleString()}</TableCell>
                    <TableCell>{m.homeScore != null ? `${m.homeScore} – ${m.awayScore}` : '—'}</TableCell>
                    <TableCell><Badge variant="outline">{m.status}</Badge></TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => startEdit(m)}><Pencil className="w-4 h-4" /></Button>
                        {canDelete && (
                          <Button variant="ghost" size="icon" onClick={() => {
                            if (window.confirm('Delete this match?')) deleteMatch.mutate(m.id);
                          }}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <FormDialog
        open={showForm} onOpenChange={setShowForm}
        title={editing ? 'Edit Match' : 'Add Match'}
        onSubmit={handleSubmit}
        submitLabel={editing ? 'Save Changes' : 'Save Match'}
        isSubmitting={createMatch.isPending || updateMatch.isPending}
        maxWidth="max-w-lg"
      >
        {error && <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">{error}</div>}
        <div className="grid grid-cols-2 gap-4">
          <SelectField label="Event" value={form.eventId} onChange={(v) => setForm(f => ({ ...f, eventId: v }))}
            options={events.map((e: any) => ({ value: e.id, label: e.name }))} required />
          <SelectField label="Sport" value={form.sportId} onChange={(v) => setForm(f => ({ ...f, sportId: v }))}
            options={sports.map((s: any) => ({ value: s.id, label: s.name }))} required />
          <SelectField label="Home Team" value={form.homeTeamId} onChange={(v) => setForm(f => ({ ...f, homeTeamId: v }))}
            options={teams.map((t: any) => ({ value: t.id, label: t.name }))} />
          <SelectField label="Away Team" value={form.awayTeamId} onChange={(v) => setForm(f => ({ ...f, awayTeamId: v }))}
            options={teams.map((t: any) => ({ value: t.id, label: t.name }))} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Match Number</label>
            <Input type="number" min={1} value={form.matchNumber} onChange={(e) => setForm(f => ({ ...f, matchNumber: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Round</label>
            <Input value={form.round} onChange={(e) => setForm(f => ({ ...f, round: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
            <Input type="date" value={form.scheduledDate} onChange={(e) => setForm(f => ({ ...f, scheduledDate: e.target.value }))} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
            <Input type="time" value={form.scheduledTime} onChange={(e) => setForm(f => ({ ...f, scheduledTime: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Venue</label>
            <Input value={form.venue} onChange={(e) => setForm(f => ({ ...f, venue: e.target.value }))} />
          </div>
          <SelectField label="Status" value={form.status} onChange={(v) => setForm(f => ({ ...f, status: v }))}
            options={['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'POSTPONED', 'ABANDONED'].map(s => ({ value: s, label: s }))} />
        </div>
      </FormDialog>
    </div>
  );
}
