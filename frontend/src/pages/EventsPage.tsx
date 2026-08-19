import { useState } from 'react';
import { useEvents } from '@/hooks/useEvents';
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
import { imageService } from '@/lib/services/image.service';
import { Plus, Pencil, Trash2, ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

const EMPTY_FORM = {
  name: '', type: 'TOURNAMENT', level: 'UNIVERSITY', sportId: '', venue: '',
  startDate: '', endDate: '', format: 'OTHER', status: 'PLANNED', description: '',
  bannerImage: '',
};

export default function EventsPage() {
  const { user } = useAuth();
  const canDelete = isTutorRole(user);
  const { events, isLoading, createEvent, updateEvent, deleteEvent } = useEvents();
  const { sports } = useSports();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  async function handleBannerUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const result = await imageService.uploadEventImage(file, editing?.id);
      setForm((f) => ({ ...f, bannerImage: result.url }));
      toast.success('Banner uploaded');
    } catch {
      toast.error('Image upload failed');
    } finally {
      setUploading(false);
    }
  }

  function startEdit(e: any) {
    setEditing(e);
    setForm({
      name: e.name, type: e.type, level: e.level, sportId: e.sportId ?? '',
      venue: e.venue ?? '', startDate: e.startDate?.slice(0, 10) ?? '',
      endDate: e.endDate?.slice(0, 10) ?? '', format: e.format,
      status: e.status, description: e.description ?? '',
      bannerImage: e.bannerImage ?? '',
    });
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
    const payload: Record<string, unknown> = {
      name: form.name, type: form.type, level: form.level,
      sportId: form.sportId || undefined, venue: form.venue || undefined,
      startDate: form.startDate ? new Date(form.startDate).toISOString() : undefined,
      endDate: form.endDate ? new Date(form.endDate).toISOString() : undefined,
      format: form.format, status: form.status, description: form.description || undefined,
    };
    if (form.bannerImage) payload.bannerImage = form.bannerImage;

    if (editing) {
      updateEvent.mutate(
        { id: editing.id, data: payload },
        { onSuccess: resetForm, onError: (err) => setError(err.message) }
      );
    } else {
      createEvent.mutate(payload as any, { onSuccess: resetForm, onError: (err) => setError(err.message) });
    }
  }

  if (isLoading) return <PageLoader />;

  return (
    <div>
      <PageHeader
        title="Events & Competitions"
        subtitle={`${events.length} events`}
        actions={
          <Button onClick={() => { setEditing(null); setForm(EMPTY_FORM); setShowForm(true); }}>
            <Plus className="w-4 h-4 mr-2" /> Add Event
          </Button>
        }
      />

      {events.length === 0 ? (
        <EmptyState message="No events found." action={<Button onClick={() => setShowForm(true)}>Add Event</Button>} />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Banner</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Sport</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((e: any) => (
                  <TableRow key={e.id}>
                    <TableCell>
                      {e.bannerImage ? (
                        <img
                          src={e.bannerImage}
                          alt={e.name}
                          className="h-9 w-14 rounded object-cover border border-border"
                        />
                      ) : (
                        <div className="h-9 w-14 rounded border border-border bg-gray-100 flex items-center justify-center">
                          <ImageIcon className="w-4 h-4 text-gray-300" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{e.name}</TableCell>
                    <TableCell>{e.type}</TableCell>
                    <TableCell>{e.sport?.name ?? 'Any'}</TableCell>
                    <TableCell className="text-xs">
                      {e.startDate ? new Date(e.startDate).toLocaleDateString() : 'TBD'}
                    </TableCell>
                    <TableCell><Badge variant={e.status === 'COMPLETED' ? 'secondary' : 'outline'}>{e.status}</Badge></TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => startEdit(e)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        {canDelete && (
                          <Button variant="ghost" size="icon" onClick={() => {
                            if (window.confirm(`Delete ${e.name}?`)) deleteEvent.mutate(e.id);
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
        title={editing ? `Edit ${editing.name}` : 'Add Event'}
        onSubmit={handleSubmit}
        submitLabel={editing ? 'Save Changes' : 'Save Event'}
        isSubmitting={createEvent.isPending || updateEvent.isPending}
        maxWidth="max-w-lg"
      >
        {error && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">{error}</div>
        )}

        {/* Banner image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Banner Image</label>
          {form.bannerImage && (
            <div className="mb-2 relative group">
              <img
                src={form.bannerImage}
                alt="Banner preview"
                className="w-full h-28 object-cover rounded-lg border border-border"
              />
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, bannerImage: '' }))}
                className="absolute top-1 right-1 bg-black/50 text-white rounded-full px-1.5 py-0.5 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ✕
              </button>
            </div>
          )}
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 cursor-pointer px-3 py-1.5 rounded border border-border text-sm hover:bg-gray-50 text-gray-700 whitespace-nowrap">
              <ImageIcon className="w-4 h-4" />
              {uploading ? 'Uploading…' : 'Upload'}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleBannerUpload}
                disabled={uploading}
              />
            </label>
            <Input
              value={form.bannerImage}
              onChange={(e) => setForm((f) => ({ ...f, bannerImage: e.target.value }))}
              placeholder="or paste image URL"
              className="flex-1"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
          <Input value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
            <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.type} onChange={(e) => setForm(f => ({ ...f, type: e.target.value }))}>
              {['GALA', 'TOURNAMENT', 'LEAGUE', 'COMPETITION', 'FRIENDLY', 'TRIAL', 'TRAINING'].map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Level *</label>
            <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.level} onChange={(e) => setForm(f => ({ ...f, level: e.target.value }))}>
              {['CAMPUS', 'FACULTY', 'UNIVERSITY', 'LOCAL', 'NATIONAL', 'REGIONAL', 'INTERNATIONAL'].map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sport</label>
            <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.sportId} onChange={(e) => setForm(f => ({ ...f, sportId: e.target.value }))}>
              <option value="">Any</option>
              {sports.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.status} onChange={(e) => setForm(f => ({ ...f, status: e.target.value }))}>
              {['PLANNED', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'POSTPONED'].map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Venue</label>
            <Input value={form.venue} onChange={(e) => setForm(f => ({ ...f, venue: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Format</label>
            <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.format} onChange={(e) => setForm(f => ({ ...f, format: e.target.value }))}>
              {['KNOCKOUT', 'ROUND_ROBIN', 'LEAGUE', 'GROUP_STAGE', 'SINGLE_MATCH', 'OTHER'].map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <Input type="date" value={form.startDate} onChange={(e) => setForm(f => ({ ...f, startDate: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <Input type="date" value={form.endDate} onChange={(e) => setForm(f => ({ ...f, endDate: e.target.value }))} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px]" value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Shown on the public events page" />
        </div>
      </FormDialog>
    </div>
  );
}
