import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api, { getErrorMessage } from '@/lib/api';
import {
  PageHeader, Table, Badge, Spinner, EmptyState, statusColor,
  Button, Field, inputClass, InlineAlert,
} from '@/components/ui';

// ─── Types ─────────────────────────────────────────────────────────────────────
interface Document {
  id: string;
  title: string;
  category: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSizeBytes: number;
  ownerType: string;
  expiryDate: string | null;
  isVerified: boolean;
  verifiedAt: string | null;
  status: string;
  notes: string | null;
  uploadedAt: string;
  athlete: { id: string; fullName: string; registrationNumber: string } | null;
  team: { id: string; name: string } | null;
  uploadedByUser: { id: string; fullName: string } | null;
  verifiedByUser: { id: string; fullName: string } | null;
}

const CATEGORIES = [
  'ACADEMIC_TRANSCRIPT', 'MEDICAL_CERTIFICATE', 'IDENTITY', 'SCHOLARSHIP_LETTER',
  'CONTRACT', 'INSURANCE', 'CLEARANCE', 'PHOTO', 'OTHER',
];
const OWNER_TYPES = ['ATHLETE', 'TEAM', 'DEPARTMENT', 'EVENT', 'MATCH', 'TRIAL'];
const DOC_STATUSES = ['ACTIVE', 'EXPIRED', 'ARCHIVED', 'PENDING_VERIFICATION'];

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── Upload Modal ──────────────────────────────────────────────────────────────
function UploadModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('OTHER');
  const [ownerType, setOwnerType] = useState('ATHLETE');
  const [athleteId, setAthleteId] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  const { data: athletes } = useQuery({
    queryKey: ['athletes-select'],
    queryFn: async () =>
      (await api.get('/athletes', { params: { pageSize: 500 } })).data as {
        id: string; fullName: string; registrationNumber: string;
      }[],
  });

  const handleUpload = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file) { setError('Please select a file.'); return; }
    if (!title.trim()) { setError('Title is required.'); return; }
    setError('');
    setUploading(true);

    const form = new FormData();
    form.append('file', file);
    form.append('title', title.trim());
    form.append('category', category);
    form.append('ownerType', ownerType);
    if (ownerType === 'ATHLETE' && athleteId) form.append('athleteId', athleteId);
    if (expiryDate) form.append('expiryDate', expiryDate);
    if (notes.trim()) form.append('notes', notes.trim());

    try {
      await api.post('/documents', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await qc.invalidateQueries({ queryKey: ['documents'] });
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-border flex justify-between items-center">
          <h2 className="text-lg font-semibold">Upload Document</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl">&times;</button>
        </div>
        <div className="p-6 space-y-4">
          {error && <InlineAlert type="error" message={error} />}

          <Field label="File" required>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.docx,.xlsx"
              className="text-sm text-gray-600 w-full"
            />
            <p className="text-xs text-muted mt-1">Allowed: PDF, JPEG, PNG, DOCX, XLSX (max 5 MB)</p>
          </Field>

          <Field label="Title" required>
            <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Descriptive title…" />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Category">
              <select className={inputClass} value={category} onChange={(e) => setCategory(e.target.value)}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
              </select>
            </Field>
            <Field label="Owner Type">
              <select className={inputClass} value={ownerType} onChange={(e) => setOwnerType(e.target.value)}>
                {OWNER_TYPES.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </Field>
          </div>

          {ownerType === 'ATHLETE' && (
            <Field label="Athlete">
              <select className={inputClass} value={athleteId} onChange={(e) => setAthleteId(e.target.value)}>
                <option value="">— Department document —</option>
                {athletes?.map((a) => (
                  <option key={a.id} value={a.id}>{a.fullName} ({a.registrationNumber})</option>
                ))}
              </select>
            </Field>
          )}

          <Field label="Expiry Date">
            <input type="date" className={inputClass} value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
          </Field>

          <Field label="Notes">
            <textarea rows={2} className={inputClass} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </Field>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button onClick={handleUpload} disabled={uploading}>
              {uploading ? 'Uploading…' : 'Upload Document'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function DocumentsPage() {
  const qc = useQueryClient();
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [verifiedFilter, setVerifiedFilter] = useState('');
  const [search, setSearch] = useState('');
  const [showUpload, setShowUpload] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['documents', categoryFilter, statusFilter, verifiedFilter, search],
    queryFn: async () => {
      const params: Record<string, string> = { pageSize: '200' };
      if (categoryFilter) params.category = categoryFilter;
      if (statusFilter) params.status = statusFilter;
      if (search) params.search = search;
      return (await api.get('/documents', { params })).data;
    },
  });

  const documents: Document[] = data?.documents ?? [];

  const filteredDocs = verifiedFilter === ''
    ? documents
    : documents.filter((d) => (verifiedFilter === 'verified') === d.isVerified);

  const verifyDoc = useMutation({
    mutationFn: async ({ id, isVerified }: { id: string; isVerified: boolean }) =>
      api.patch(`/documents/${id}/verify`, { isVerified }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['documents'] }),
  });

  const deleteDoc = useMutation({
    mutationFn: async (id: string) => api.delete(`/documents/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['documents'] }),
  });

  return (
    <div>
      <PageHeader
        title="Documents"
        subtitle={`${data?.pagination?.total ?? 0} documents`}
        actions={<Button onClick={() => setShowUpload(true)}>+ Upload Document</Button>}
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <input
          className={`${inputClass} w-52`}
          placeholder="Search title, athlete name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className={`${inputClass} w-48`} value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
        </select>
        <select className={`${inputClass} w-40`} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          {DOC_STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
        </select>
        <select className={`${inputClass} w-40`} value={verifiedFilter} onChange={(e) => setVerifiedFilter(e.target.value)}>
          <option value="">All Verification</option>
          <option value="verified">Verified</option>
          <option value="unverified">Unverified</option>
        </select>
      </div>

      {isLoading ? (
        <Spinner />
      ) : !filteredDocs.length ? (
        <EmptyState
          message="No documents found."
          action={<Button onClick={() => setShowUpload(true)}>Upload Document</Button>}
        />
      ) : (
        <div className="bg-surface border border-border rounded-lg">
          <Table headers={['Title', 'Owner', 'Category', 'Type', 'Size', 'Expiry', 'Verified', 'Status', '']}>
            {filteredDocs.map((d) => (
              <tr key={d.id} className="hover:bg-gray-50">
                <td className="px-4 py-2.5">
                  <a
                    className="font-medium text-primary hover:underline"
                    href={d.fileUrl.startsWith('http') ? d.fileUrl : `/uploads/${d.fileName}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {d.title}
                  </a>
                  <div className="text-xs text-muted">{d.fileName}</div>
                </td>
                <td className="px-4 py-2.5 text-gray-600">
                  {d.athlete?.fullName ?? d.team?.name ?? d.ownerType}
                  {d.athlete && (
                    <div className="text-xs text-muted">{d.athlete.registrationNumber}</div>
                  )}
                </td>
                <td className="px-4 py-2.5 text-xs text-gray-600">
                  {d.category.replace(/_/g, ' ')}
                </td>
                <td className="px-4 py-2.5 text-xs text-gray-500">{d.fileType}</td>
                <td className="px-4 py-2.5 text-xs text-gray-500">{formatBytes(d.fileSizeBytes)}</td>
                <td className="px-4 py-2.5 text-xs text-gray-600">
                  {d.expiryDate ? (
                    <span className={new Date(d.expiryDate) < new Date() ? 'text-red-600 font-medium' : ''}>
                      {new Date(d.expiryDate).toLocaleDateString()}
                    </span>
                  ) : '—'}
                </td>
                <td className="px-4 py-2.5">
                  <Badge color={d.isVerified ? 'green' : 'amber'}>
                    {d.isVerified ? 'Verified' : 'Pending'}
                  </Badge>
                </td>
                <td className="px-4 py-2.5">
                  <Badge color={statusColor(d.status)}>{d.status.replace(/_/g, ' ')}</Badge>
                </td>
                <td className="px-4 py-2.5">
                  <div className="flex gap-1.5 flex-wrap">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => verifyDoc.mutate({ id: d.id, isVerified: !d.isVerified })}
                      disabled={verifyDoc.isPending}
                    >
                      {d.isVerified ? 'Unverify' : 'Verify'}
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => {
                        if (confirm(`Delete "${d.title}"? This cannot be undone.`)) {
                          deleteDoc.mutate(d.id);
                        }
                      }}
                      disabled={deleteDoc.isPending}
                    >
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </Table>
        </div>
      )}

      {showUpload && <UploadModal onClose={() => setShowUpload(false)} />}
    </div>
  );
}
