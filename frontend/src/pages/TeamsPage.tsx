import { useState } from 'react';
import { useTeams } from '@/hooks/useTeams';
import { useSports } from '@/hooks/useSports';
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

const EMPTY_FORM = { name: '', shortName: '', sportId: '', gender: 'MALE', homeVenue: '' };

export default function TeamsPage() {
  const { user } = useAuth();
  const canDelete = isTutorRole(user);
  const { teams, isLoading, createTeam, updateTeam, deleteTeam } = useTeams();
  const { sports } = useSports();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');

  function startEdit(t: any) {
    setEditing(t);
    setForm({ name: t.name, shortName: t.shortName ?? '', sportId: t.sportId, gender: t.gender, homeVenue: t.homeVenue ?? '' });
    setShowForm(true);
    setError('');
  }

  function resetForm() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowForm(false);
    setError('');
  }

  function handleSubmit() {
    const payload = {
      name: form.name,
      shortName: form.shortName || null,
      sportId: form.sportId,
      gender: form.gender,
      homeVenue: form.homeVenue || null,
    };
    if (editing) {
      updateTeam.mutate(
        { id: editing.id, data: payload },
        { onSuccess: resetForm, onError: (err) => setError(err.message) }
      );
    } else {
      createTeam.mutate(payload, { onSuccess: resetForm, onError: (err) => setError(err.message) });
    }
  }

  if (isLoading) return <PageLoader />;

  return (
    <div>
      <PageHeader
        title="Teams"
        subtitle={`${teams.length} teams`}
        actions={
          <Button onClick={() => { setEditing(null); setForm(EMPTY_FORM); setShowForm(true); }}>
            <Plus className="w-4 h-4 mr-2" /> Add Team
          </Button>
        }
      />

      {teams.length === 0 ? (
        <EmptyState
          message="No teams found."
          action={<Button onClick={() => setShowForm(true)}>Add Team</Button>}
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Sport</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Venue</TableHead>
                  <TableHead>Squad</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teams.map((t: any) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">
                      {t.name} {t.shortName && <span className="text-muted-foreground">({t.shortName})</span>}
                    </TableCell>
                    <TableCell>{t.sport?.name}</TableCell>
                    <TableCell>{t.gender}</TableCell>
                    <TableCell>{t.homeVenue ?? '—'}</TableCell>
                    <TableCell>{t._count?.squadEntries ?? 0}</TableCell>
                    <TableCell>
                      <Badge variant={t.isActive ? 'default' : 'secondary'}>
                        {t.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => startEdit(t)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        {canDelete && (
                          <Button variant="ghost" size="icon" onClick={() => {
                            if (window.confirm(`Delete ${t.name}?`)) deleteTeam.mutate(t.id);
                          }}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
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
        open={showForm}
        onOpenChange={setShowForm}
        title={editing ? `Edit ${editing.name}` : 'Add Team'}
        onSubmit={handleSubmit}
        submitLabel={editing ? 'Save Changes' : 'Save Team'}
        isSubmitting={createTeam.isPending || updateTeam.isPending}
        maxWidth="max-w-md"
      >
        {error && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">{error}</div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
          <Input value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Short Name</label>
            <Input value={form.shortName} onChange={(e) => setForm(f => ({ ...f, shortName: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
            <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.gender} onChange={(e) => setForm(f => ({ ...f, gender: e.target.value }))}>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="MIXED">Mixed</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sport *</label>
          <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.sportId} onChange={(e) => setForm(f => ({ ...f, sportId: e.target.value }))} required>
            <option value="">Select sport...</option>
            {sports.map((s: any) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Home Venue</label>
          <Input value={form.homeVenue} onChange={(e) => setForm(f => ({ ...f, homeVenue: e.target.value }))} />
        </div>
      </FormDialog>
    </div>
  );
}
