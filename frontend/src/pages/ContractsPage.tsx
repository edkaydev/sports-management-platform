import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import api, { getErrorMessage } from '@/lib/api';
import {
  PageHeader, Table, Badge, Spinner, EmptyState, statusColor,
  Button, Field, inputClass, InlineAlert,
} from '@/components/ui';

// ─── Types ─────────────────────────────────────────────────────────────────────
interface Contract {
  id: string;
  contractType: string;
  startDate: string;
  endDate: string;
  termsSummary: string | null;
  hasAccompanyingScholarship: boolean;
  signedByAthlete: boolean;
  signedAt: string | null;
  status: string;
  notes: string | null;
  terminationReason: string | null;
  terminationDate: string | null;
  athlete: { id: string; fullName: string; registrationNumber: string };
  scholarship: { id: string; scholarshipType: string; sponsorName: string | null } | null;
}

const CONTRACT_TYPES = ['PLAYING', 'COACHING', 'SCHOLARSHIP_AGREEMENT', 'SPONSORSHIP', 'OTHER'];
const STATUSES = ['ACTIVE', 'EXPIRED', 'TERMINATED', 'SUSPENDED'];

// ─── Add/Edit Modal ────────────────────────────────────────────────────────────
function ContractModal({ contract, onClose }: { contract: Contract | null; onClose: () => void }) {
  const qc = useQueryClient();
  const isEdit = !!contract;
  const [error, setError] = useState('');

  const { data: athletes } = useQuery({
    queryKey: ['athletes-select'],
    queryFn: async () =>
      (await api.get('/athletes', { params: { pageSize: 500 } })).data.athletes as {
        id: string; fullName: string; registrationNumber: string;
      }[],
  });

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      athleteId: contract?.athlete?.id ?? '',
      contractType: contract?.contractType ?? 'PLAYING',
      startDate: contract?.startDate?.slice(0, 10) ?? '',
      endDate: contract?.endDate?.slice(0, 10) ?? '',
      termsSummary: contract?.termsSummary ?? '',
      hasAccompanyingScholarship: contract?.hasAccompanyingScholarship ?? false,
      signedByAthlete: contract?.signedByAthlete ?? false,
      signedAt: contract?.signedAt?.slice(0, 10) ?? '',
      status: contract?.status ?? 'ACTIVE',
      notes: contract?.notes ?? '',
    },
  });

  const onSubmit = async (values: Record<string, unknown>) => {
    setError('');
    try {
      const payload = { ...values, signedAt: values.signedAt || undefined, termsSummary: values.termsSummary || undefined };
      if (isEdit) {
        await api.patch(`/contracts/${contract.id}`, payload);
      } else {
        await api.post('/contracts', payload);
      }
      await qc.invalidateQueries({ queryKey: ['contracts'] });
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-border flex justify-between items-center">
          <h2 className="text-lg font-semibold">{isEdit ? 'Edit Contract' : 'New Contract'}</h2>
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
            <Field label="Contract Type" required>
              <select className={inputClass} {...register('contractType', { required: true })}>
                {CONTRACT_TYPES.map((t) => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
              </select>
            </Field>
            <Field label="Status">
              <select className={inputClass} {...register('status')}>
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Start Date" required error={errors.startDate?.message}>
              <input type="date" className={inputClass} {...register('startDate', { required: 'Required' })} />
            </Field>
            <Field label="End Date" required error={errors.endDate?.message}>
              <input type="date" className={inputClass} {...register('endDate', { required: 'Required' })} />
            </Field>
          </div>
          <Field label="Terms Summary">
            <textarea rows={3} className={inputClass} {...register('termsSummary')} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 mt-2">
              <input type="checkbox" id="hasScholarship" {...register('hasAccompanyingScholarship')} className="rounded" />
              <label htmlFor="hasScholarship" className="text-sm text-gray-700">Has Accompanying Scholarship</label>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <input type="checkbox" id="signedByAthlete" {...register('signedByAthlete')} className="rounded" />
              <label htmlFor="signedByAthlete" className="text-sm text-gray-700">Signed by Athlete</label>
            </div>
          </div>
          <Field label="Signed Date">
            <input type="date" className={inputClass} {...register('signedAt')} />
          </Field>
          <Field label="Notes">
            <textarea rows={2} className={inputClass} {...register('notes')} />
          </Field>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={onClose} type="button">Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Contract'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Terminate Modal ───────────────────────────────────────────────────────────
function TerminateModal({ contract, onClose }: { contract: Contract; onClose: () => void }) {
  const qc = useQueryClient();
  const [reason, setReason] = useState('');
  const [terminationDate, setTerminationDate] = useState(new Date().toISOString().slice(0, 10));
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleTerminate = async () => {
    if (!reason.trim()) { setError('Reason is required.'); return; }
    setSaving(true);
    setError('');
    try {
      await api.post(`/contracts/${contract.id}/terminate`, { reason, terminationDate });
      await qc.invalidateQueries({ queryKey: ['contracts'] });
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
          <h2 className="text-lg font-semibold text-danger">Terminate Contract</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl">&times;</button>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-600">
            Terminating <strong>{contract.contractType.replace(/_/g, ' ')}</strong> contract for{' '}
            <strong>{contract.athlete.fullName}</strong>.
          </p>
          {error && <InlineAlert type="error" message={error} />}
          <Field label="Termination Date" required>
            <input type="date" className={inputClass} value={terminationDate} onChange={(e) => setTerminationDate(e.target.value)} />
          </Field>
          <Field label="Reason" required>
            <textarea rows={3} className={inputClass} value={reason} onChange={(e) => setReason(e.target.value)} />
          </Field>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button variant="danger" onClick={handleTerminate} disabled={saving}>
              {saving ? 'Terminating…' : 'Terminate Contract'}
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
  | { type: 'edit'; contract: Contract }
  | { type: 'terminate'; contract: Contract }
  | null;

export default function ContractsPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [modal, setModal] = useState<ModalState>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['contracts', statusFilter],
    queryFn: async () => {
      const params: Record<string, string> = { pageSize: '200' };
      if (statusFilter) params.status = statusFilter;
      return (await api.get('/contracts', { params })).data;
    },
  });

  const contracts: Contract[] = data?.data ?? [];

  return (
    <div>
      <PageHeader
        title="Contracts"
        subtitle={`${contracts.length} contracts`}
        actions={<Button onClick={() => setModal({ type: 'add' })}>+ New Contract</Button>}
      />

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <select className={`${inputClass} w-40`} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {isLoading ? (
        <Spinner />
      ) : !contracts.length ? (
        <EmptyState
          message="No contracts found."
          action={<Button onClick={() => setModal({ type: 'add' })}>New Contract</Button>}
        />
      ) : (
        <div className="bg-surface border border-border rounded-lg">
          <Table headers={['Athlete', 'Type', 'Period', 'Scholarship', 'Signed', 'Status', '']}>
            {contracts.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-4 py-2.5">
                  <div className="font-medium text-gray-900">{c.athlete?.fullName}</div>
                  <div className="text-xs text-muted">{c.athlete?.registrationNumber}</div>
                </td>
                <td className="px-4 py-2.5 text-gray-600">{c.contractType.replace(/_/g, ' ')}</td>
                <td className="px-4 py-2.5 text-gray-600 text-xs whitespace-nowrap">
                  {new Date(c.startDate).toLocaleDateString()} – {new Date(c.endDate).toLocaleDateString()}
                </td>
                <td className="px-4 py-2.5 text-gray-600">
                  {c.hasAccompanyingScholarship ? (
                    <Badge color="blue">{c.scholarship?.scholarshipType ?? 'Yes'}</Badge>
                  ) : '—'}
                </td>
                <td className="px-4 py-2.5">
                  <Badge color={c.signedByAthlete ? 'green' : 'amber'}>
                    {c.signedByAthlete ? 'Signed' : 'Pending'}
                  </Badge>
                </td>
                <td className="px-4 py-2.5">
                  <Badge color={statusColor(c.status)}>{c.status}</Badge>
                </td>
                <td className="px-4 py-2.5">
                  <div className="flex gap-1.5">
                    <Button size="sm" variant="secondary" onClick={() => setModal({ type: 'edit', contract: c })}>
                      Edit
                    </Button>
                    {c.status === 'ACTIVE' && (
                      <Button size="sm" variant="danger" onClick={() => setModal({ type: 'terminate', contract: c })}>
                        Terminate
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </Table>
        </div>
      )}

      {modal?.type === 'add' && <ContractModal contract={null} onClose={() => setModal(null)} />}
      {modal?.type === 'edit' && <ContractModal contract={modal.contract} onClose={() => setModal(null)} />}
      {modal?.type === 'terminate' && <TerminateModal contract={modal.contract} onClose={() => setModal(null)} />}
    </div>
  );
}
