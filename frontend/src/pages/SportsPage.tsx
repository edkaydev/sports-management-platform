import { useState } from 'react';
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

const EMPTY_FORM = { name: '', gender: 'MALE', category: 'TEAM', description: '' };

export default function SportsPage() {
  const { user } = useAuth();
  const canDelete = isTutorRole(user);
  const { sports, isLoading, createSport, updateSport, deleteSport } = useSports();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');

  function startEdit(s: any) {
    setEditing(s);
    setForm({ name: s.name, gender: s.gender, category: s.category, description: s.description ?? '' });
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
    const payload = { ...form, description: form.description || null };
    if (editing) {
      updateSport.mutate(
        { id: editing.id, data: payload },
        { onSuccess: resetForm, onError: (err) => setError(err.message) }
      );
    } else {
      createSport.mutate(payload, { onSuccess: resetForm, onError: (err) => setError(err.message) });
    }
  }

  function handleDelete(s: any) {
    if (window.confirm(`Delete ${s.name}?`)) deleteSport.mutate(s.id);
  }

  if (isLoading) return <PageLoader />;

  return (
    <div>
      <PageHeader
        title="Sports"
        subtitle={`${sports.length} sports`}
        actions={
          <Button onClick={() => { setEditing(null); setForm(EMPTY_FORM); setShowForm(true); }}>
            <Plus className="w-4 h-4 mr-2" /> Add Sport
          </Button>
        }
      />

      {sports.length === 0 ? (
        <EmptyState
          message="No sports found."
          action={<Button onClick={() => setShowForm(true)}>Add Sport</Button>}
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Teams</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sports.map((s: any) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell>{s.gender}</TableCell>
                    <TableCell>{s.category}</TableCell>
                    <TableCell>{s._count?.teams ?? 0}</TableCell>
                    <TableCell>
                      <Badge variant={s.isActive ? 'default' : 'secondary'}>
                        {s.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => startEdit(s)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        {canDelete && (
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(s)}>
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
        title={editing ? `Edit ${editing.name}` : 'Add Sport'}
        onSubmit={handleSubmit}
        submitLabel={editing ? 'Save Changes' : 'Save Sport'}
        isSubmitting={createSport.isPending || updateSport.isPending}
        maxWidth="max-w-md"
      >
        {error && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
          <Input value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
            <select
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={form.gender}
              onChange={(e) => setForm(f => ({ ...f, gender: e.target.value }))}
            >
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="MIXED">Mixed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
            <select
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={form.category}
              onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))}
            >
              <option value="TEAM">Team</option>
              <option value="INDIVIDUAL">Individual</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px]"
            value={form.description}
            onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="Shown on the public sports page"
          />
        </div>
      </FormDialog>
    </div>
  );
}
