import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import api, { getErrorMessage } from '@/lib/api';
import {
  PageHeader, Table, Badge, Spinner, EmptyState, statusColor,
  Button, Field, inputClass, InlineAlert,
} from '@/components/ui';

// ─── Types ─────────────────────────────────────────────────────────────────────
interface Prospect {
  id: string;
  fullName: string;
  email: string | null;
  phoneNumber: string | null;
  gender: string;
  dateOfBirth: string | null;
  schoolOrInstitution: string | null;
  programmeApplied: string | null;
  position: string | null;
  previousLevel: string | null;
  previousClubs: string | null;
  previousAchievements: string | null;
  referredBy: string | null;
  source: string;
  status: string;
  notes: string | null;
  sport: { id: string; name: string; gender: string };
}

const SOURCES = ['SCOUTED', 'REFERRED', 'WALK_IN', 'ONLINE_APPLICATION', 'INTERNAL', 'OTHER'];
const STATUSES = ['IDENTIFIED', 'CONTACTED', 'INVITED', 'ASSESSED', 'SELECTED', 'REJECTED', 'ENROLLED', 'WITHDRAWN'];

// ─── Add/Edit Modal ────────────────────────────────────────────────────────────
function ProspectModal({ prospect, onClose }: { prospect: Prospect | null; onClose: () => void }) {
  const qc = useQueryClient();
  const isEdit = !!prospect;
  const [error, setError] = useState('');

  const { data: sports } = useQuery({
    queryKey: ['sports-select'],
    queryFn: async () =>
      (await api.get('/sports', { params: { pageSize: 100 } })).data as {
        id: string; name: string;
      }[],
  });

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      fullName: prospect?.fullName ?? '',
      email: prospect?.email ?? '',
      phoneNumber: prospect?.phoneNumber ?? '',
      gender: prospect?.gender ?? 'MALE',
      dateOfBirth: prospect?.dateOfBirth?.slice(0, 10) ?? '',
      sportId: prospect?.sport?.id ?? '',
      schoolOrInstitution: prospect?.schoolOrInstitution ?? '',
      programmeApplied: prospect?.programmeApplied ?? '',
      position: prospect?.position ?? '',
      previousLevel: prospect?.previousLevel ?? '',
      previousClubs: prospect?.previousClubs ?? '',
      previousAchievements: prospect?.previousAchievements ?? '',
      referredBy: prospect?.referredBy ?? '',
      source: prospect?.source ?? 'WALK_IN',
      status: prospect?.status ?? 'IDENTIFIED',
      notes: prospect?.notes ?? '',
    },
  });

  const onSubmit = async (values: Record<string, unknown>) => {
    setError('');
    const payload = {
      ...values,
      email: (values.email as string) || undefined,
      phoneNumber: (values.phoneNumber as string) || undefined,
      dateOfBirth: (values.dateOfBirth as string) || undefined,
      schoolOrInstitution: (values.schoolOrInstitution as string) || undefined,
      programmeApplied: (values.programmeApplied as string) || undefined,
      position: (values.position as string) || undefined,
      previousLevel: (values.previousLevel as string) || undefined,
      previousClubs: (values.previousClubs as string) || undefined,
      previousAchievements: (values.previousAchievements as string) || undefined,
      referredBy: (values.referredBy as string) || undefined,
      notes: (values.notes as string) || undefined,
    };
    try {
      if (isEdit) {
        await api.patch(`/recruitment/prospects/${prospect.id}`, payload);
      } else {
        await api.post('/recruitment/prospects', payload);
      }
      await qc.invalidateQueries({ queryKey: ['prospects'] });
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-border flex justify-between items-center">
          <h2 className="text-lg font-semibold">{isEdit ? 'Edit Prospect' : 'New Prospect'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl">&times;</button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {error && <InlineAlert type="error" message={error} />}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Full Name" required error={errors.fullName?.message}>
              <input className={inputClass} {...register('fullName', { required: 'Required' })} />
            </Field>
            <Field label="Gender" required>
              <select className={inputClass} {...register('gender')}>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Email">
              <input type="email" className={inputClass} {...register('email')} />
            </Field>
            <Field label="Phone">
              <input className={inputClass} {...register('phoneNumber')} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Date of Birth">
              <input type="date" className={inputClass} {...register('dateOfBirth')} />
            </Field>
            <Field label="Sport" required error={errors.sportId?.message}>
              <select className={inputClass} {...register('sportId', { required: 'Required' })}>
                <option value="">Select sport…</option>
                {sports?.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Source" required>
              <select className={inputClass} {...register('source')}>
                {SOURCES.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
              </select>
            </Field>
            <Field label="Status">
              <select className={inputClass} {...register('status')}>
                {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="School / Institution">
              <input className={inputClass} {...register('schoolOrInstitution')} />
            </Field>
            <Field label="Programme Applied">
              <input className={inputClass} {...register('programmeApplied')} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Position">
              <input className={inputClass} {...register('position')} />
            </Field>
            <Field label="Previous Level">
              <input className={inputClass} placeholder="e.g. National, Regional" {...register('previousLevel')} />
            </Field>
          </div>
          <Field label="Previous Clubs">
            <input className={inputClass} {...register('previousClubs')} />
          </Field>
          <Field label="Previous Achievements">
            <textarea rows={2} className={inputClass} {...register('previousAchievements')} />
          </Field>
          <Field label="Referred By">
            <input className={inputClass} {...register('referredBy')} />
          </Field>
          <Field label="Notes">
            <textarea rows={2} className={inputClass} {...register('notes')} />
          </Field>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={onClose} type="button">Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Prospect'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Enroll Modal ──────────────────────────────────────────────────────────────
function EnrollModal({ prospect, onClose }: { prospect: Prospect; onClose: () => void }) {
  const qc = useQueryClient();
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [yearOfStudy, setYearOfStudy] = useState('1');
  const [programme, setProgramme] = useState(prospect.programmeApplied ?? '');
  const [faculty, setFaculty] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleEnroll = async () => {
    if (!registrationNumber.trim()) { setError('Registration number is required.'); return; }
    setSaving(true);
    setError('');
    try {
      await api.post(`/recruitment/prospects/${prospect.id}/enroll`, {
        registrationNumber: registrationNumber.trim(),
        yearOfStudy: parseInt(yearOfStudy, 10) || undefined,
        programme: programme || undefined,
        faculty: faculty || undefined,
      });
      await qc.invalidateQueries({ queryKey: ['prospects'] });
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
          <h2 className="text-lg font-semibold">Enroll as Student-Athlete</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl">&times;</button>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-600">
            Enrolling <strong>{prospect.fullName}</strong> as a student-athlete. This will create a new athlete record.
          </p>
          {error && <InlineAlert type="error" message={error} />}
          <Field label="Registration Number" required>
            <input className={inputClass} value={registrationNumber} onChange={(e) => setRegistrationNumber(e.target.value)} placeholder="e.g. 2026/BSC/CS/001" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Year of Study">
              <input type="number" min={1} max={6} className={inputClass} value={yearOfStudy} onChange={(e) => setYearOfStudy(e.target.value)} />
            </Field>
            <Field label="Faculty">
              <input className={inputClass} value={faculty} onChange={(e) => setFaculty(e.target.value)} />
            </Field>
          </div>
          <Field label="Programme">
            <input className={inputClass} value={programme} onChange={(e) => setProgramme(e.target.value)} />
          </Field>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button onClick={handleEnroll} disabled={saving}>
              {saving ? 'Enrolling…' : 'Enroll Athlete'}
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
  | { type: 'edit'; prospect: Prospect }
  | { type: 'enroll'; prospect: Prospect }
  | null;

export default function ProspectsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sportFilter, setSportFilter] = useState('');
  const [modal, setModal] = useState<ModalState>(null);

  const { data: sports } = useQuery({
    queryKey: ['sports-select'],
    queryFn: async () =>
      (await api.get('/sports', { params: { pageSize: 100 } })).data as {
        id: string; name: string;
      }[],
  });

  const { data, isLoading } = useQuery({
    queryKey: ['prospects', search, statusFilter, sportFilter],
    queryFn: async () => {
      const params: Record<string, string> = { pageSize: '200' };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (sportFilter) params.sport = sportFilter;
      return (await api.get('/recruitment/prospects', { params })).data;
    },
  });

  const deleteProspect = useMutation({
    mutationFn: async (id: string) => api.delete(`/recruitment/prospects/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['prospects'] }),
  });

  const prospects: Prospect[] = data?.prospects ?? [];

  return (
    <div>
      <PageHeader
        title="Prospects"
        subtitle={`${data?.pagination?.total ?? prospects.length} prospects`}
        actions={<Button onClick={() => setModal({ type: 'add' })}>+ Add Prospect</Button>}
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <input
          className={`${inputClass} w-52`}
          placeholder="Search name, email, school…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className={`${inputClass} w-44`} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
        </select>
        <select className={`${inputClass} w-40`} value={sportFilter} onChange={(e) => setSportFilter(e.target.value)}>
          <option value="">All Sports</option>
          {sports?.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      {isLoading ? (
        <Spinner />
      ) : !prospects.length ? (
        <EmptyState
          message="No prospects found."
          action={<Button onClick={() => setModal({ type: 'add' })}>Add Prospect</Button>}
        />
      ) : (
        <div className="bg-surface border border-border rounded-lg">
          <Table headers={['Name', 'Sport', 'Institution', 'Contact', 'Source', 'Status', '']}>
            {prospects.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-2.5">
                  <div className="font-medium text-gray-900">{p.fullName}</div>
                  <div className="text-xs text-muted">{p.gender}</div>
                </td>
                <td className="px-4 py-2.5 text-gray-600">{p.sport?.name}</td>
                <td className="px-4 py-2.5 text-gray-600">{p.schoolOrInstitution ?? '—'}</td>
                <td className="px-4 py-2.5 text-xs text-gray-500">
                  {p.email && <div>{p.email}</div>}
                  {p.phoneNumber && <div>{p.phoneNumber}</div>}
                </td>
                <td className="px-4 py-2.5 text-gray-600">{p.source.replace(/_/g, ' ')}</td>
                <td className="px-4 py-2.5">
                  <Badge color={statusColor(p.status)}>{p.status.replace(/_/g, ' ')}</Badge>
                </td>
                <td className="px-4 py-2.5">
                  <div className="flex gap-1.5 flex-wrap">
                    <Button size="sm" variant="secondary" onClick={() => setModal({ type: 'edit', prospect: p })}>Edit</Button>
                    {p.status === 'SELECTED' && (
                      <Button size="sm" onClick={() => setModal({ type: 'enroll', prospect: p })}>Enroll</Button>
                    )}
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => { if (confirm('Delete this prospect?')) deleteProspect.mutate(p.id); }}
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

      {modal?.type === 'add' && <ProspectModal prospect={null} onClose={() => setModal(null)} />}
      {modal?.type === 'edit' && <ProspectModal prospect={modal.prospect} onClose={() => setModal(null)} />}
      {modal?.type === 'enroll' && <EnrollModal prospect={modal.prospect} onClose={() => setModal(null)} />}
    </div>
  );
}
