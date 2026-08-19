import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import api, { getErrorMessage } from '@/lib/api';
import {
  PageHeader, Table, Badge, Spinner, EmptyState, statusColor,
  Button, Field, inputClass, Card, InlineAlert,
} from '@/components/ui';

// ─── Types ─────────────────────────────────────────────────────────────────────
interface Scholarship {
  id: string;
  scholarshipType: string;
  sponsorName: string | null;
  coverageDescription: string | null;
  coveragePercentage: string | null;
  startDate: string;
  endDate: string;
  renewable: boolean;
  status: string;
  academicRequirementGpa: string | null;
  sportsRequirement: string | null;
  notes: string | null;
  renewalCount: number;
  athlete: { id: string; fullName: string; registrationNumber: string };
  renewals: { id: string; newEndDate: string; renewalNumber: number }[];
}

interface Dashboard {
  active: number;
  expiringWithin30Days: number;
  atAcademicRisk: number;
  revokedThisSemester: number;
  total: number;
}

const SCHOLARSHIP_TYPES = ['FULL', 'PARTIAL', 'SPORTS_EXCELLENCE', 'NEED_BASED', 'EXTERNAL', 'OTHER'];
const STATUSES = ['PENDING', 'ACTIVE', 'EXPIRED', 'REVOKED', 'RENEWED'];

// ─── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, color = 'gray' }: { label: string; value: number; color?: string }) {
  const colors: Record<string, string> = {
    green: 'text-green-700',
    amber: 'text-amber-600',
    red: 'text-red-600',
    gray: 'text-gray-700',
    blue: 'text-blue-700',
  };
  return (
    <Card className="text-center py-4">
      <div className={`text-3xl font-bold ${colors[color]}`}>{value}</div>
      <div className="text-xs text-muted mt-1">{label}</div>
    </Card>
  );
}

// ─── Add/Edit Modal ────────────────────────────────────────────────────────────
function ScholarshipModal({ scholarship, onClose }: { scholarship: Scholarship | null; onClose: () => void }) {
  const qc = useQueryClient();
  const isEdit = !!scholarship;
  const [error, setError] = useState('');

  const { data: athletes } = useQuery({
    queryKey: ['athletes-select'],
    queryFn: async () => {
      const res = await api.get('/athletes', { params: { pageSize: 500 } });
      return res.data.athletes as { id: string; fullName: string; registrationNumber: string }[];
    },
  });

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      athleteId: scholarship?.athlete?.id ?? '',
      scholarshipType: scholarship?.scholarshipType ?? 'FULL',
      sponsorName: scholarship?.sponsorName ?? '',
      coverageDescription: scholarship?.coverageDescription ?? '',
      coveragePercentage: scholarship?.coveragePercentage ?? '',
      startDate: scholarship?.startDate?.slice(0, 10) ?? '',
      endDate: scholarship?.endDate?.slice(0, 10) ?? '',
      renewable: scholarship?.renewable ?? false,
      academicRequirementGpa: scholarship?.academicRequirementGpa ?? '',
      sportsRequirement: scholarship?.sportsRequirement ?? '',
      status: scholarship?.status ?? 'PENDING',
      notes: scholarship?.notes ?? '',
    },
  });

  const onSubmit = async (values: Record<string, unknown>) => {
    setError('');
    const payload = {
      ...values,
      coveragePercentage: values.coveragePercentage ? parseFloat(values.coveragePercentage as string) : undefined,
      academicRequirementGpa: values.academicRequirementGpa ? parseFloat(values.academicRequirementGpa as string) : undefined,
    };
    try {
      if (isEdit) {
        await api.patch(`/scholarships/${scholarship.id}`, payload);
      } else {
        await api.post('/scholarships', payload);
      }
      await qc.invalidateQueries({ queryKey: ['scholarships'] });
      await qc.invalidateQueries({ queryKey: ['scholarships-dashboard'] });
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-border flex justify-between items-center">
          <h2 className="text-lg font-semibold">{isEdit ? 'Edit Scholarship' : 'New Scholarship'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl">&times;</button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {error && <InlineAlert type="error" message={error} />}
          {!isEdit && (
            <Field label="Athlete" required error={errors.athleteId?.message}>
              <select className={inputClass} {...register('athleteId', { required: 'Required' })}>
                <option value="">Select athlete…</option>
                {athletes?.map((a) => (
                  <option key={a.id} value={a.id}>{a.fullName} ({a.registrationNumber})</option>
                ))}
              </select>
            </Field>
          )}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Type" required>
              <select className={inputClass} {...register('scholarshipType', { required: true })}>
                {SCHOLARSHIP_TYPES.map((t) => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
              </select>
            </Field>
            <Field label="Status">
              <select className={inputClass} {...register('status')}>
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Sponsor Name">
            <input className={inputClass} {...register('sponsorName')} placeholder="UMU / external sponsor" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Coverage %">
              <input type="number" min={0} max={100} step={0.1} className={inputClass} {...register('coveragePercentage')} />
            </Field>
            <Field label="Min GPA Required">
              <input type="number" step="0.01" min={0} max={5} className={inputClass} {...register('academicRequirementGpa')} />
            </Field>
          </div>
          <Field label="Coverage Description">
            <textarea rows={2} className={inputClass} {...register('coverageDescription')} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Start Date" required error={errors.startDate?.message}>
              <input type="date" className={inputClass} {...register('startDate', { required: 'Required' })} />
            </Field>
            <Field label="End Date" required error={errors.endDate?.message}>
              <input type="date" className={inputClass} {...register('endDate', { required: 'Required' })} />
            </Field>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="renewable" {...register('renewable')} className="rounded" />
            <label htmlFor="renewable" className="text-sm text-gray-700">Renewable</label>
          </div>
          <Field label="Notes">
            <textarea rows={2} className={inputClass} {...register('notes')} />
          </Field>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={onClose} type="button">Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Scholarship'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Renew Modal ───────────────────────────────────────────────────────────────
function RenewModal({ scholarship, onClose }: { scholarship: Scholarship; onClose: () => void }) {
  const qc = useQueryClient();
  const [newEndDate, setNewEndDate] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleRenew = async () => {
    if (!newEndDate) { setError('New end date is required.'); return; }
    setSaving(true);
    setError('');
    try {
      await api.post(`/scholarships/${scholarship.id}/renew`, { newEndDate, notes: notes || undefined });
      await qc.invalidateQueries({ queryKey: ['scholarships'] });
      await qc.invalidateQueries({ queryKey: ['scholarships-dashboard'] });
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="px-6 py-4 border-b border-border flex justify-between items-center">
          <h2 className="text-lg font-semibold">Renew Scholarship</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl">&times;</button>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-600">
            Renewing scholarship for <strong>{scholarship.athlete.fullName}</strong>.
            Current end date: <strong>{new Date(scholarship.endDate).toLocaleDateString()}</strong>
          </p>
          {error && <InlineAlert type="error" message={error} />}
          <Field label="New End Date" required>
            <input type="date" className={inputClass} value={newEndDate} onChange={(e) => setNewEndDate(e.target.value)} />
          </Field>
          <Field label="Notes">
            <textarea rows={2} className={inputClass} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </Field>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button onClick={handleRenew} disabled={saving}>
              {saving ? 'Renewing…' : 'Renew'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Revoke Modal ──────────────────────────────────────────────────────────────
function RevokeModal({ scholarship, onClose }: { scholarship: Scholarship; onClose: () => void }) {
  const qc = useQueryClient();
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleRevoke = async () => {
    if (!reason.trim()) { setError('Reason is required.'); return; }
    setSaving(true);
    setError('');
    try {
      await api.post(`/scholarships/${scholarship.id}/revoke`, { reason });
      await qc.invalidateQueries({ queryKey: ['scholarships'] });
      await qc.invalidateQueries({ queryKey: ['scholarships-dashboard'] });
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="px-6 py-4 border-b border-border flex justify-between items-center">
          <h2 className="text-lg font-semibold text-danger">Revoke Scholarship</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl">&times;</button>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-600">
            Revoking scholarship for <strong>{scholarship.athlete.fullName}</strong>. This action cannot be undone.
          </p>
          {error && <InlineAlert type="error" message={error} />}
          <Field label="Reason for Revocation" required>
            <textarea rows={3} className={inputClass} value={reason} onChange={(e) => setReason(e.target.value)} />
          </Field>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button variant="danger" onClick={handleRevoke} disabled={saving}>
              {saving ? 'Revoking…' : 'Revoke Scholarship'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
type ModalState =
  | { type: 'add' }
  | { type: 'edit'; scholarship: Scholarship }
  | { type: 'renew'; scholarship: Scholarship }
  | { type: 'revoke'; scholarship: Scholarship }
  | null;

export default function ScholarshipsPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [modal, setModal] = useState<ModalState>(null);

  const { data: dashboard } = useQuery<Dashboard>({
    queryKey: ['scholarships-dashboard'],
    queryFn: async () => (await api.get('/scholarships/dashboard')).data.data,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['scholarships', statusFilter],
    queryFn: async () => {
      const params: Record<string, string> = { pageSize: '200' };
      if (statusFilter) params.status = statusFilter;
      return (await api.get('/scholarships', { params })).data;
    },
  });

  const scholarships: Scholarship[] = data?.scholarships ?? [];

  return (
    <div>
      <PageHeader
        title="Scholarships"
        subtitle={`${data?.pagination?.total ?? 0} scholarships`}
        actions={<Button onClick={() => setModal({ type: 'add' })}>+ New Scholarship</Button>}
      />

      {/* Dashboard stats */}
      {dashboard && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
          <StatCard label="Active" value={dashboard.active} color="green" />
          <StatCard label="Total" value={dashboard.total} color="blue" />
          <StatCard label="Expiring in 30 Days" value={dashboard.expiringWithin30Days} color="amber" />
          <StatCard label="At Academic Risk" value={dashboard.atAcademicRisk} color="red" />
          <StatCard label="Revoked" value={dashboard.revokedThisSemester} color="gray" />
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <select className={`${inputClass} w-40`} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {isLoading ? (
        <Spinner />
      ) : !scholarships.length ? (
        <EmptyState
          message="No scholarships found."
          action={<Button onClick={() => setModal({ type: 'add' })}>New Scholarship</Button>}
        />
      ) : (
        <div className="bg-surface border border-border rounded-lg">
          <Table headers={['Athlete', 'Type', 'Sponsor', 'Period', 'Coverage', 'Renewals', 'Status', '']}>
            {scholarships.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="px-4 py-2.5">
                  <div className="font-medium text-gray-900">{s.athlete?.fullName}</div>
                  <div className="text-xs text-muted">{s.athlete?.registrationNumber}</div>
                </td>
                <td className="px-4 py-2.5 text-gray-600">{s.scholarshipType.replace(/_/g, ' ')}</td>
                <td className="px-4 py-2.5 text-gray-600">{s.sponsorName ?? 'UMU'}</td>
                <td className="px-4 py-2.5 text-gray-600 whitespace-nowrap text-xs">
                  {new Date(s.startDate).toLocaleDateString()} –{' '}
                  {new Date(s.endDate).toLocaleDateString()}
                </td>
                <td className="px-4 py-2.5 text-gray-600">
                  {s.coveragePercentage != null ? `${s.coveragePercentage}%` : '—'}
                </td>
                <td className="px-4 py-2.5 text-gray-600">{s.renewalCount}</td>
                <td className="px-4 py-2.5">
                  <Badge color={statusColor(s.status)}>{s.status}</Badge>
                </td>
                <td className="px-4 py-2.5">
                  <div className="flex gap-1.5 flex-wrap">
                    <Button size="sm" variant="secondary" onClick={() => setModal({ type: 'edit', scholarship: s })}>
                      Edit
                    </Button>
                    {s.status === 'ACTIVE' && s.renewable && (
                      <Button size="sm" variant="secondary" onClick={() => setModal({ type: 'renew', scholarship: s })}>
                        Renew
                      </Button>
                    )}
                    {(s.status === 'ACTIVE' || s.status === 'PENDING') && (
                      <Button size="sm" variant="danger" onClick={() => setModal({ type: 'revoke', scholarship: s })}>
                        Revoke
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </Table>
        </div>
      )}

      {modal?.type === 'add' && (
        <ScholarshipModal scholarship={null} onClose={() => setModal(null)} />
      )}
      {modal?.type === 'edit' && (
        <ScholarshipModal scholarship={modal.scholarship} onClose={() => setModal(null)} />
      )}
      {modal?.type === 'renew' && (
        <RenewModal scholarship={modal.scholarship} onClose={() => setModal(null)} />
      )}
      {modal?.type === 'revoke' && (
        <RevokeModal scholarship={modal.scholarship} onClose={() => setModal(null)} />
      )}
    </div>
  );
}
