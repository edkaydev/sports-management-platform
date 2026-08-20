import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import api, { getErrorMessage } from '@/lib/api';
import {
  PageHeader, Table, Badge, Spinner, EmptyState, statusColor,
  Button, Field, inputClass, InlineAlert,
} from '@/components/ui';

// ─── Types ─────────────────────────────────────────────────────────────────────
interface Trial {
  id: string;
  trialDate: string;
  startTime: string | null;
  venue: string | null;
  description: string | null;
  status: string;
  sport: { id: string; name: string };
  team: { id: string; name: string } | null;
  season: { id: string; name: string } | null;
  conductedByUser: { id: string; fullName: string } | null;
  _count: { participants: number; assessments: number };
}

interface TrialDetail extends Omit<Trial, '_count'> {
  participants: {
    prospectId: string;
    attended: boolean;
    prospect: {
      id: string; fullName: string; gender: string;
      sport: { name: string };
    };
  }[];
  assessments: {
    prospectId: string;
    overallScore: string | null;
    recommendation: string | null;
    selectionOutcome: string | null;
    scoreTechnical: string | null;
    scorePhysical: string | null;
    scoreSpeed: string | null;
    scoreTactical: string | null;
    scoreTeamwork: string | null;
    scoreDiscipline: string | null;
    coachNotes: string | null;
    prospect: { id: string; fullName: string };
  }[];
}

const TRIAL_STATUSES = ['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
const SELECTION_OUTCOMES = ['SELECTED', 'REJECTED', 'PENDING', 'DEFERRED'];

// ─── Add/Edit Trial Modal ──────────────────────────────────────────────────────
function TrialModal({ trial, onClose }: { trial: Trial | null; onClose: () => void }) {
  const qc = useQueryClient();
  const isEdit = !!trial;
  const [error, setError] = useState('');

  const { data: sports } = useQuery({
    queryKey: ['sports-select'],
    queryFn: async () =>
      (await api.get('/sports', { params: { pageSize: 100 } })).data as {
        id: string; name: string;
      }[],
  });

  const { data: seasons } = useQuery({
    queryKey: ['seasons-select'],
    queryFn: async () =>
      (await api.get('/seasons', { params: { pageSize: 20 } })).data as {
        id: string; name: string;
      }[],
  });

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      sportId: trial?.sport?.id ?? '',
      trialDate: trial?.trialDate?.slice(0, 10) ?? '',
      startTime: trial?.startTime ?? '',
      venue: trial?.venue ?? '',
      description: trial?.description ?? '',
      status: trial?.status ?? 'PLANNED',
      seasonId: trial?.season?.id ?? '',
    },
  });

  const onSubmit = async (values: Record<string, unknown>) => {
    setError('');
    const payload = {
      ...values,
      startTime: (values.startTime as string) || undefined,
      venue: (values.venue as string) || undefined,
      description: (values.description as string) || undefined,
      seasonId: (values.seasonId as string) || undefined,
    };
    try {
      if (isEdit) {
        await api.patch(`/recruitment/trials/${trial.id}`, payload);
      } else {
        await api.post('/recruitment/trials', payload);
      }
      await qc.invalidateQueries({ queryKey: ['trials'] });
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-border flex justify-between items-center">
          <h2 className="text-lg font-semibold">{isEdit ? 'Edit Trial' : 'Schedule Trial'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl">&times;</button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {error && <InlineAlert type="error" message={error} />}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Sport" required error={errors.sportId?.message}>
              <select className={inputClass} {...register('sportId', { required: 'Required' })}>
                <option value="">Select sport…</option>
                {sports?.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </Field>
            <Field label="Status">
              <select className={inputClass} {...register('status')}>
                {TRIAL_STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Trial Date" required error={errors.trialDate?.message}>
              <input type="date" className={inputClass} {...register('trialDate', { required: 'Required' })} />
            </Field>
            <Field label="Start Time">
              <input type="time" className={inputClass} {...register('startTime')} />
            </Field>
          </div>
          <Field label="Venue">
            <input className={inputClass} {...register('venue')} placeholder="e.g. Main Ground" />
          </Field>
          <Field label="Season">
            <select className={inputClass} {...register('seasonId')}>
              <option value="">— No Season —</option>
              {seasons?.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </Field>
          <Field label="Description">
            <textarea rows={2} className={inputClass} {...register('description')} />
          </Field>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={onClose} type="button">Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving…' : isEdit ? 'Save Changes' : 'Schedule Trial'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Assessment Form ───────────────────────────────────────────────────────────
function AssessmentForm({
  trialId,
  prospect,
  existing,
  onDone,
}: {
  trialId: string;
  prospect: { id: string; fullName: string };
  existing: TrialDetail['assessments'][0] | undefined;
  onDone: () => void;
}) {
  const qc = useQueryClient();
  const [error, setError] = useState('');
  const { register, handleSubmit, formState: { isSubmitting } } = useForm({
    defaultValues: {
      scoreTechnical: existing?.scoreTechnical ?? '',
      scorePhysical: existing?.scorePhysical ?? '',
      scoreSpeed: existing?.scoreSpeed ?? '',
      scoreTactical: existing?.scoreTactical ?? '',
      scoreTeamwork: existing?.scoreTeamwork ?? '',
      scoreDiscipline: existing?.scoreDiscipline ?? '',
      recommendation: existing?.recommendation ?? '',
      selectionOutcome: existing?.selectionOutcome ?? 'PENDING',
      coachNotes: existing?.coachNotes ?? '',
    },
  });

  const onSubmit = async (values: Record<string, unknown>) => {
    setError('');
    const toNum = (v: unknown) => (v !== '' && v != null ? parseFloat(v as string) : undefined);
    try {
      await api.post(`/recruitment/trials/${trialId}/assessments`, {
        prospectId: prospect.id,
        scoreTechnical: toNum(values.scoreTechnical),
        scorePhysical: toNum(values.scorePhysical),
        scoreSpeed: toNum(values.scoreSpeed),
        scoreTactical: toNum(values.scoreTactical),
        scoreTeamwork: toNum(values.scoreTeamwork),
        scoreDiscipline: toNum(values.scoreDiscipline),
        recommendation: (values.recommendation as string) || undefined,
        selectionOutcome: values.selectionOutcome || undefined,
        coachNotes: (values.coachNotes as string) || undefined,
      });
      await qc.invalidateQueries({ queryKey: ['trial-detail', trialId] });
      onDone();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="border border-border rounded-lg p-4 bg-gray-50 space-y-3">
      <div className="font-medium text-gray-800">Assessment — {prospect.fullName}</div>
      {error && <InlineAlert type="error" message={error} />}
      <div className="grid grid-cols-3 gap-3">
        {(['scoreTechnical', 'scorePhysical', 'scoreSpeed', 'scoreTactical', 'scoreTeamwork', 'scoreDiscipline'] as const).map((field) => (
          <Field key={field} label={field.replace('score', '').replace(/([A-Z])/g, ' $1').trim()}>
            <input type="number" min={0} max={10} step={0.1} className={inputClass} {...register(field)} />
          </Field>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Outcome">
          <select className={inputClass} {...register('selectionOutcome')}>
            {SELECTION_OUTCOMES.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </Field>
        <Field label="Recommendation">
          <input className={inputClass} {...register('recommendation')} placeholder="Brief recommendation…" />
        </Field>
      </div>
      <Field label="Coach Notes">
        <textarea rows={2} className={inputClass} {...register('coachNotes')} />
      </Field>
      <div className="flex justify-end gap-3">
        <Button variant="secondary" type="button" onClick={onDone}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : 'Save Assessment'}
        </Button>
      </div>
    </form>
  );
}

// ─── Trial Detail Panel ────────────────────────────────────────────────────────
function TrialDetailPanel({ trialId, onClose }: { trialId: string; onClose: () => void }) {
  const qc = useQueryClient();
  const [assessingProspect, setAssessingProspect] = useState<{ id: string; fullName: string } | null>(null);

  const { data: trial, isLoading } = useQuery<TrialDetail>({
    queryKey: ['trial-detail', trialId],
    queryFn: async () => (await api.get(`/recruitment/trials/${trialId}`)).data,
  });

  const markAttendance = useMutation({
    mutationFn: async ({ prospectId, attended }: { prospectId: string; attended: boolean }) => {
      await api.patch(`/recruitment/trials/${trialId}/attendance`, {
        attendance: [{ prospectId, attended }],
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['trial-detail', trialId] }),
  });

  if (isLoading) return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center"><Spinner /></div>
  );
  if (!trial) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-border flex justify-between items-start">
          <div>
            <h2 className="text-lg font-semibold">Trial — {trial.sport.name}</h2>
            <p className="text-sm text-muted">
              {new Date(trial.trialDate).toLocaleDateString()}{trial.venue ? ` · ${trial.venue}` : ''}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl leading-none">&times;</button>
        </div>
        <div className="p-6 space-y-6">
          {/* Participants */}
          <div>
            <h3 className="font-medium text-gray-800 mb-3">Participants ({trial.participants.length})</h3>
            {trial.participants.length === 0 ? (
              <p className="text-sm text-muted">No participants registered.</p>
            ) : (
              <div className="border border-border rounded overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-border">
                    <tr>
                      <th className="px-4 py-2.5 text-left font-medium text-gray-600">Name</th>
                      <th className="px-4 py-2.5 text-left font-medium text-gray-600">Attended</th>
                      <th className="px-4 py-2.5 text-left font-medium text-gray-600">Score</th>
                      <th className="px-4 py-2.5 text-left font-medium text-gray-600">Outcome</th>
                      <th className="px-4 py-2.5 text-left font-medium text-gray-600"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {trial.participants.map((p) => {
                      const assessment = trial.assessments.find((a) => a.prospectId === p.prospectId);
                      return (
                        <tr key={p.prospectId} className="hover:bg-gray-50">
                          <td className="px-4 py-2.5 font-medium text-gray-900">{p.prospect.fullName}</td>
                          <td className="px-4 py-2.5">
                            <button
                              className={`text-xs px-2 py-1 rounded-full font-medium ${p.attended ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}
                              onClick={() => markAttendance.mutate({ prospectId: p.prospectId, attended: !p.attended })}
                            >
                              {p.attended ? 'Present' : 'Absent'}
                            </button>
                          </td>
                          <td className="px-4 py-2.5 text-gray-600">
                            {assessment?.overallScore != null ? Number(assessment.overallScore).toFixed(1) : '—'}
                          </td>
                          <td className="px-4 py-2.5">
                            {assessment?.selectionOutcome ? (
                              <Badge color={statusColor(assessment.selectionOutcome)}>
                                {assessment.selectionOutcome}
                              </Badge>
                            ) : '—'}
                          </td>
                          <td className="px-4 py-2.5">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => setAssessingProspect(
                                assessingProspect?.id === p.prospectId ? null : { id: p.prospectId, fullName: p.prospect.fullName }
                              )}
                            >
                              {assessment ? 'Edit Score' : 'Score'}
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Assessment form */}
          {assessingProspect && (
            <AssessmentForm
              trialId={trialId}
              prospect={assessingProspect}
              existing={trial.assessments.find((a) => a.prospectId === assessingProspect.id)}
              onDone={() => setAssessingProspect(null)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
type ModalState =
  | { type: 'add' }
  | { type: 'edit'; trial: Trial }
  | { type: 'detail'; trialId: string }
  | null;

export default function TrialsPage() {
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
    queryKey: ['trials', statusFilter, sportFilter],
    queryFn: async () => {
      const params: Record<string, string> = { pageSize: '100' };
      if (statusFilter) params.status = statusFilter;
      if (sportFilter) params.sport = sportFilter;
      return (await api.get('/recruitment/trials', { params })).data;
    },
  });

  const trials: Trial[] = data?.trials ?? [];

  return (
    <div>
      <PageHeader
        title="Trials"
        subtitle={`${data?.pagination?.total ?? trials.length} trials`}
        actions={<Button onClick={() => setModal({ type: 'add' })}>+ Schedule Trial</Button>}
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <select className={`${inputClass} w-40`} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          {TRIAL_STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
        </select>
        <select className={`${inputClass} w-40`} value={sportFilter} onChange={(e) => setSportFilter(e.target.value)}>
          <option value="">All Sports</option>
          {sports?.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      {isLoading ? (
        <Spinner />
      ) : !trials.length ? (
        <EmptyState
          message="No trials scheduled."
          action={<Button onClick={() => setModal({ type: 'add' })}>Schedule Trial</Button>}
        />
      ) : (
        <div className="bg-surface border border-border rounded-lg">
          <Table headers={['Date', 'Sport', 'Venue', 'Season', 'Participants', 'Assessments', 'Status', '']}>
            {trials.map((t) => (
              <tr key={t.id} className="hover:bg-gray-50">
                <td className="px-4 py-2.5">
                  <div className="font-medium text-gray-900">{new Date(t.trialDate).toLocaleDateString()}</div>
                  {t.startTime && <div className="text-xs text-muted">{t.startTime}</div>}
                </td>
                <td className="px-4 py-2.5 text-gray-600">{t.sport?.name}</td>
                <td className="px-4 py-2.5 text-gray-600">{t.venue ?? '—'}</td>
                <td className="px-4 py-2.5 text-gray-600">{t.season?.name ?? '—'}</td>
                <td className="px-4 py-2.5 text-gray-600">{t._count?.participants ?? 0}</td>
                <td className="px-4 py-2.5 text-gray-600">{t._count?.assessments ?? 0}</td>
                <td className="px-4 py-2.5">
                  <Badge color={statusColor(t.status)}>{t.status.replace(/_/g, ' ')}</Badge>
                </td>
                <td className="px-4 py-2.5">
                  <div className="flex gap-1.5">
                    <Button size="sm" variant="secondary" onClick={() => setModal({ type: 'detail', trialId: t.id })}>
                      View
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => setModal({ type: 'edit', trial: t })}>
                      Edit
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </Table>
        </div>
      )}

      {modal?.type === 'add' && <TrialModal trial={null} onClose={() => setModal(null)} />}
      {modal?.type === 'edit' && <TrialModal trial={modal.trial} onClose={() => setModal(null)} />}
      {modal?.type === 'detail' && <TrialDetailPanel trialId={modal.trialId} onClose={() => setModal(null)} />}
    </div>
  );
}
