import { useState } from 'react';
import { UploadCloud } from 'lucide-react';
import { Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui';
import { createEvidence } from '@/lib/services/activity.service';

const CATEGORIES = [
  'general',
  'training',
  'match',
  'scholarship',
  'equipment',
  'recruitment',
  'event',
  'document',
];

interface Props {
  onAdded?: () => void;
}

export default function EvidenceUpload({ onAdded }: Props) {
  const [category, setCategory] = useState('general');
  const [summary, setSummary] = useState('');
  const [note, setNote] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setDone(false);
    if (!summary.trim() && !note.trim() && !file) {
      setError('Add a note or attach an evidence file');
      return;
    }
    setSubmitting(true);
    try {
      const form = new FormData();
      form.append('entityType', category);
      if (summary.trim()) form.append('summary', summary.trim());
      if (note.trim()) form.append('note', note.trim());
      if (file) form.append('file', file);
      await createEvidence(form);
      setSummary('');
      setNote('');
      setFile(null);
      setDone(true);
      onAdded?.();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Could not save the entry');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-m3-xl border border-outline-variant/60 bg-white shadow-sm p-5">
      <div className="flex items-center gap-2">
        <UploadCloud className="w-5 h-5 text-umu-red" />
        <h3 className="text-base font-semibold text-on-surface">Today's Evidence</h3>
      </div>
      <p className="text-[13px] text-on-surface-variant mt-1">
        Attach a file (photos, medical forms, match sheets…), a note, or a short summary — it's stamped with today's date and counted in your tracker.
      </p>

      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <span className="text-xs text-on-surface-variant">Category</span>
            <Select value={category} onValueChange={(v) => setCategory(v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <span className="text-xs text-on-surface-variant">Evidence file</span>
            <Input
              id="evidence-file"
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <span className="text-xs text-on-surface-variant">Short summary</span>
          <Input
            id="evidence-summary"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="e.g. Filed medical clearance for Netball team"
          />
        </div>

        <div className="space-y-1.5">
          <span className="text-xs text-on-surface-variant">Note (optional)</span>
          <textarea
            id="evidence-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            placeholder="Anything worth recording about today…"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
          />
        </div>

        {error && <p className="text-xs text-red-600">{error}</p>}
        {done && <p className="text-xs text-green-600">Saved — recorded under today's date.</p>}

        <Button type="submit" disabled={submitting}>
          {submitting ? 'Saving…' : "Save today's entry"}
        </Button>
      </form>
    </div>
  );
}