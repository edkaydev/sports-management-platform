import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { api, getErrorMessage } from '@/lib/api';
import {
  PageHeader, Table, Badge, Spinner, EmptyState, statusColor,
  Button, Field, inputClass, Card, InlineAlert,
} from '@/components/ui';

// ─── Types ─────────────────────────────────────────────────────────────────────
interface AcademicRecord {
  id: string;
  academicYear: string;
  semester: string;
  yearOfStudy: number | null;
  gpa: string | null;
  cgpa: string | null;
  failedUnits: number;
  attendancePercentage: string | null;
  academicStanding: string;
  notes: string | null;
  athlete: { id: string; fullName: string; registrationNumber: string };
  courseResults: CourseResult[];
}

interface CourseResult {
  id: string;
  courseCode: string;
  courseName: string;
  creditUnits: number;
  marks: string | null;
  grade: string | null;
  result: string;
  retake: boolean;
}

interface FormValues {
  athleteId: string;
  academicYear: string;
  semester: string;
  yearOfStudy: string;
  gpa: string;
  cgpa: string;
  failedUnits: string;
  attendancePercentage: string;
  notes: string;
}

const YEARS = ['2024/2025', '2025/2026', '2026/2027'];
const SEMESTERS = ['SEM1', 'SEM2', 'RESIT'];
const STANDINGS = ['', 'GOOD_STANDING', 'WARNING', 'PROBATION', 'ACADEMIC_SUSPENSION', 'WITHDRAWN'];

// ─── Modal ─────────────────────────────────────────────────────────────────────
function RecordModal({
  record,
  onClose,
}: {
  record: AcademicRecord | null;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const isEdit = !!record;

  const { data: athletes } = useQuery({
    queryKey: ['athletes-select'],
    queryFn: async () => {
      const res = await api.get('/athletes', { params: { pageSize: 500, status: 'ACTIVE' } });
      return res.data.athletes as { id: string; fullName: string; registrationNumber: string }[];
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      athleteId: record?.athlete?.id ?? '',
      academicYear: record?.academicYear ?? '2025/2026',
      semester: record?.semester ?? 'SEM1',
      yearOfStudy: record?.yearOfStudy?.toString() ?? '',
      gpa: record?.gpa ?? '',
      cgpa: record?.cgpa ?? '',
      failedUnits: record?.failedUnits?.toString() ?? '0',
      attendancePercentage: record?.attendancePercentage ?? '',
      notes: record?.notes ?? '',
    },
  });

  const [error, setError] = useState('');

  const onSubmit = async (values: FormValues) => {
    setError('');
    const payload = {
      athleteId: values.athleteId,
      academicYear: values.academicYear,
      semester: values.semester,
      yearOfStudy: values.yearOfStudy ? parseInt(values.yearOfStudy, 10) : undefined,
      gpa: values.gpa ? parseFloat(values.gpa) : undefined,
      cgpa: values.cgpa ? parseFloat(values.cgpa) : undefined,
      failedUnits: parseInt(values.failedUnits, 10) || 0,
      attendancePercentage: values.attendancePercentage
        ? parseFloat(values.attendancePercentage)
        : undefined,
      notes: values.notes || undefined,
    };

    try {
      if (isEdit) {
        await api.patch(`/academic-records/${record.id}`, payload);
      } else {
        await api.post('/academic-records', payload);
      }
      await qc.invalidateQueries({ queryKey: ['academic'] });
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-border flex justify-between items-center">
          <h2 className="text-lg font-semibold">
            {isEdit ? 'Edit Academic Record' : 'Add Academic Record'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl leading-none">&times;</button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {error && <InlineAlert type="error" message={error} />}

          {!isEdit && (
            <Field label="Athlete" required error={errors.athleteId?.message}>
              <select className={inputClass} {...register('athleteId', { required: 'Required' })}>
                <option value="">Select athlete…</option>
                {athletes?.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.fullName} ({a.registrationNumber})
                  </option>
                ))}
              </select>
            </Field>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Field label="Academic Year" required>
              <select className={inputClass} {...register('academicYear', { required: true })}>
                {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </Field>
            <Field label="Semester" required>
              <select className={inputClass} {...register('semester', { required: true })}>
                {SEMESTERS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Year of Study">
              <input type="number" min={1} max={6} className={inputClass} {...register('yearOfStudy')} />
            </Field>
            <Field label="Failed Units">
              <input type="number" min={0} className={inputClass} {...register('failedUnits')} />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="GPA (0–5)">
              <input type="number" step="0.01" min={0} max={5} className={inputClass} {...register('gpa')} />
            </Field>
            <Field label="CGPA (0–5)">
              <input type="number" step="0.01" min={0} max={5} className={inputClass} {...register('cgpa')} />
            </Field>
          </div>

          <Field label="Attendance (%)">
            <input type="number" step="0.1" min={0} max={100} className={inputClass} {...register('attendancePercentage')} />
          </Field>

          <Field label="Notes">
            <textarea rows={2} className={inputClass} {...register('notes')} />
          </Field>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={onClose} type="button">Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Record'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── CSV Import Panel ─────────────────────────────────────────────────────────
function CsvImport({ onDone }: { onDone: () => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [result, setResult] = useState<{ imported: number; skipped: number; errors: { row: number; message: string }[] } | null>(null);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file) { setError('Pick a CSV file first.'); return; }
    setError('');
    setResult(null);
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await api.post('/academic-records/import', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(res.data.data);
      onDone();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="mb-6">
      <h3 className="font-medium text-gray-900 mb-3">CSV Bulk Import</h3>
      <p className="text-xs text-muted mb-3">
        Required columns: <code>registration_number, academic_year, semester</code>. Optional: <code>gpa, cgpa, failed_units, attendance, year_of_study, notes, standing</code>
      </p>
      <div className="flex items-center gap-3">
        <input ref={fileRef} type="file" accept=".csv" className="text-sm text-gray-600" />
        <Button onClick={handleUpload} disabled={uploading}>
          {uploading ? 'Importing…' : 'Import CSV'}
        </Button>
      </div>
      {error && <div className="mt-3"><InlineAlert type="error" message={error} /></div>}
      {result && (
        <div className="mt-3 space-y-1">
          <InlineAlert type="success" message={`Imported: ${result.imported} · Skipped: ${result.skipped}`} />
          {result.errors.map((e, i) => (
            <InlineAlert key={i} type="warning" message={`Row ${e.row}: ${e.message}`} />
          ))}
        </div>
      )}
    </Card>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function AcademicPage() {
  const qc = useQueryClient();
  const [year, setYear] = useState('2025/2026');
  const [semester, setSemester] = useState('');
  const [standing, setStanding] = useState('');
  const [modalRecord, setModalRecord] = useState<AcademicRecord | null | undefined>(undefined);
  const [showImport, setShowImport] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['academic', year, semester, standing],
    queryFn: async () => {
      const params: Record<string, string> = { pageSize: '200' };
      if (year) params.academicYear = year;
      if (semester) params.semester = semester;
      if (standing) params.standing = standing;
      return (await api.get('/academic-records', { params })).data;
    },
  });

  const records: AcademicRecord[] = data?.records ?? [];

  const deleteRecord = useMutation({
    mutationFn: async (id: string) => api.delete(`/academic-records/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['academic'] }),
  });

  return (
    <div>
      <PageHeader
        title="Academic Performance"
        subtitle={`${data?.pagination?.total ?? records.length} records`}
        actions={
          <>
            <Button variant="secondary" onClick={() => setShowImport((v) => !v)}>
              {showImport ? 'Hide Import' : 'Import CSV'}
            </Button>
            <Button onClick={() => setModalRecord(null)}>+ Add Record</Button>
          </>
        }
      />

      {showImport && <CsvImport onDone={() => qc.invalidateQueries({ queryKey: ['academic'] })} />}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <select
          className={`${inputClass} w-36`}
          value={year}
          onChange={(e) => setYear(e.target.value)}
        >
          {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
        <select
          className={`${inputClass} w-32`}
          value={semester}
          onChange={(e) => setSemester(e.target.value)}
        >
          <option value="">All Semesters</option>
          {SEMESTERS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select
          className={`${inputClass} w-44`}
          value={standing}
          onChange={(e) => setStanding(e.target.value)}
        >
          {STANDINGS.map((s) => (
            <option key={s} value={s}>{s || 'All Standings'}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <Spinner />
      ) : !records.length ? (
        <EmptyState
          message="No academic records found."
          action={<Button onClick={() => setModalRecord(null)}>Add Record</Button>}
        />
      ) : (
        <div className="bg-surface border border-border rounded-lg">
          <Table headers={['Athlete', 'Reg. No.', 'Semester', 'GPA', 'CGPA', 'Failed', 'Attendance', 'Standing', '']}>
            {records.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="px-4 py-2.5 font-medium text-gray-900">{r.athlete?.fullName}</td>
                <td className="px-4 py-2.5 text-gray-500 text-xs">{r.athlete?.registrationNumber}</td>
                <td className="px-4 py-2.5 text-gray-600">{r.semester}</td>
                <td className="px-4 py-2.5 text-gray-600">{r.gpa ?? '—'}</td>
                <td className="px-4 py-2.5 text-gray-600">{r.cgpa ?? '—'}</td>
                <td className="px-4 py-2.5 text-gray-600">{r.failedUnits}</td>
                <td className="px-4 py-2.5 text-gray-600">
                  {r.attendancePercentage != null ? `${r.attendancePercentage}%` : '—'}
                </td>
                <td className="px-4 py-2.5">
                  <Badge color={statusColor(r.academicStanding)}>
                    {r.academicStanding.replace(/_/g, ' ')}
                  </Badge>
                </td>
                <td className="px-4 py-2.5">
                  <div className="flex gap-2">
                    <Button size="sm" variant="secondary" onClick={() => setModalRecord(r)}>Edit</Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => {
                        if (confirm('Delete this record?')) deleteRecord.mutate(r.id);
                      }}
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

      {modalRecord !== undefined && (
        <RecordModal
          record={modalRecord}
          onClose={() => setModalRecord(undefined)}
        />
      )}
    </div>
  );
}
