import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api, { getErrorMessage } from '@/lib/api';
import { PageHeader, Button, Field, inputClass, InlineAlert, Card } from '@/components/ui';

export default function AthleteFormPage() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    fullName: '',
    registrationNumber: '',
    gender: 'MALE',
    dateOfBirth: '',
    email: '',
    phoneNumber: '',
    yearOfStudy: '',
    programme: '',
    faculty: '',
    athleteType: 'REGULAR',
    status: 'ACTIVE',
    sportId: '',
    teamId: '',
    position: '',
    jerseyNumber: '',
  });

  const { data: sports } = useQuery({
    queryKey: ['sports'],
    queryFn: async () => (await api.get('/sports')).data,
  });

  const { data: teams } = useQuery({
    queryKey: ['teams'],
    queryFn: async () => (await api.get('/teams')).data,
  });

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        fullName: form.fullName,
        registrationNumber: form.registrationNumber,
        gender: form.gender,
        dateOfBirth: form.dateOfBirth ? new Date(form.dateOfBirth).toISOString() : null,
        email: form.email || null,
        phoneNumber: form.phoneNumber || null,
        yearOfStudy: form.yearOfStudy ? parseInt(form.yearOfStudy, 10) : null,
        programme: form.programme || null,
        faculty: form.faculty || null,
        athleteType: form.athleteType,
        status: form.status,
      };
      if (form.sportId) {
        payload.affiliations = [
          {
            sportId: form.sportId,
            teamId: form.teamId || null,
            position: form.position || null,
            jerseyNumber: form.jerseyNumber ? parseInt(form.jerseyNumber, 10) : null,
          },
        ];
      }
      await api.post('/athletes', payload);
      navigate('/athletes');
    } catch (err) {
      setError(getErrorMessage(err));
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <PageHeader
        title="Add Athlete"
        actions={
          <Link to="/athletes">
            <Button variant="secondary">Cancel</Button>
          </Link>
        }
      />
      <Card>
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && <InlineAlert type="error" message={error} />}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Personal Information</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Full Name" required>
                <input className={inputClass} value={form.fullName} onChange={(e) => set('fullName', e.target.value)} required />
              </Field>
              <Field label="Registration Number" required>
                <input className={inputClass} value={form.registrationNumber} onChange={(e) => set('registrationNumber', e.target.value)} required placeholder="2025/BSCS/001" />
              </Field>
              <Field label="Gender" required>
                <select className={inputClass} value={form.gender} onChange={(e) => set('gender', e.target.value)}>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                </select>
              </Field>
              <Field label="Date of Birth">
                <input type="date" className={inputClass} value={form.dateOfBirth} onChange={(e) => set('dateOfBirth', e.target.value)} />
              </Field>
              <Field label="Email">
                <input type="email" className={inputClass} value={form.email} onChange={(e) => set('email', e.target.value)} />
              </Field>
              <Field label="Phone">
                <input className={inputClass} value={form.phoneNumber} onChange={(e) => set('phoneNumber', e.target.value)} />
              </Field>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Academic Information</h3>
            <div className="grid sm:grid-cols-3 gap-4">
              <Field label="Year of Study">
                <input type="number" min={1} max={5} className={inputClass} value={form.yearOfStudy} onChange={(e) => set('yearOfStudy', e.target.value)} />
              </Field>
              <Field label="Programme">
                <input className={inputClass} value={form.programme} onChange={(e) => set('programme', e.target.value)} />
              </Field>
              <Field label="Faculty">
                <input className={inputClass} value={form.faculty} onChange={(e) => set('faculty', e.target.value)} />
              </Field>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Sport &amp; Position</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Sport">
                <select className={inputClass} value={form.sportId} onChange={(e) => set('sportId', e.target.value)}>
                  <option value="">None</option>
                  {sports?.map((s: any) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.gender})
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Team">
                <select className={inputClass} value={form.teamId} onChange={(e) => set('teamId', e.target.value)}>
                  <option value="">None</option>
                  {teams?.map((t: any) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Position">
                <input className={inputClass} value={form.position} onChange={(e) => set('position', e.target.value)} />
              </Field>
              <Field label="Jersey Number">
                <input type="number" className={inputClass} value={form.jerseyNumber} onChange={(e) => set('jerseyNumber', e.target.value)} />
              </Field>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Athlete Type &amp; Status</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Athlete Type">
                <select className={inputClass} value={form.athleteType} onChange={(e) => set('athleteType', e.target.value)}>
                  <option value="REGULAR">Regular</option>
                  <option value="SCHOLARSHIP">Scholarship</option>
                  <option value="CONTRACT">Contract</option>
                </select>
              </Field>
              <Field label="Status">
                <select className={inputClass} value={form.status} onChange={(e) => set('status', e.target.value)}>
                  <option value="ACTIVE">Active</option>
                  <option value="INJURED">Injured</option>
                  <option value="SUSPENDED">Suspended</option>
                  <option value="GRADUATED">Graduated</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </Field>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-border">
            <Link to="/athletes">
              <Button variant="secondary">Cancel</Button>
            </Link>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving…' : 'Save Athlete'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
