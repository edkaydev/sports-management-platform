import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, getErrorMessage } from '@/lib/api';
import { PageHeader, Button, Table, Badge, Spinner, EmptyState, statusColor, Field, inputClass, Card, InlineAlert } from '@/components/ui';

export default function TeamsPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [shortName, setShortName] = useState('');
  const [sportId, setSportId] = useState('');
  const [gender, setGender] = useState('MALE');
  const [error, setError] = useState('');

  const { data: sports } = useQuery({
    queryKey: ['sports'],
    queryFn: async () => (await api.get('/sports')).data.data,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['teams'],
    queryFn: async () => (await api.get('/teams')).data.data,
  });

  const create = useMutation({
    mutationFn: async () => {
      await api.post('/teams', { name, shortName: shortName || null, sportId, gender });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['teams'] });
      setShowForm(false);
      setName('');
      setShortName('');
      setError('');
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  return (
    <div>
      <PageHeader
        title="Teams"
        actions={<Button onClick={() => setShowForm((v) => !v)}>Add Team</Button>}
      />
      {showForm && (
        <Card className="mb-6 max-w-md">
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              create.mutate();
            }}
          >
            {error && <InlineAlert type="error" message={error} />}
            <Field label="Name" required>
              <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} required />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Short Name">
                <input className={inputClass} value={shortName} onChange={(e) => setShortName(e.target.value)} />
              </Field>
              <Field label="Gender" required>
                <select className={inputClass} value={gender} onChange={(e) => setGender(e.target.value)}>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="MIXED">Mixed</option>
                </select>
              </Field>
            </div>
            <Field label="Sport" required>
              <select className={inputClass} value={sportId} onChange={(e) => setSportId(e.target.value)} required>
                <option value="">Select sport…</option>
                {sports?.map((s: any) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </Field>
            <div className="flex justify-end">
              <Button type="submit">Save Team</Button>
            </div>
          </form>
        </Card>
      )}
      {isLoading ? (
        <Spinner />
      ) : !data?.length ? (
        <EmptyState message="No teams found." />
      ) : (
        <div className="bg-surface border border-border rounded-lg">
          <Table headers={['Name', 'Sport', 'Gender', 'Squad Size', 'Status']}>
            {data.map((t: any) => (
              <tr key={t.id} className="hover:bg-gray-50">
                <td className="px-4 py-2.5 font-medium text-gray-900">
                  {t.name} {t.shortName && <span className="text-muted">({t.shortName})</span>}
                </td>
                <td className="px-4 py-2.5 text-gray-600">{t.sport?.name}</td>
                <td className="px-4 py-2.5 text-gray-600">{t.gender}</td>
                <td className="px-4 py-2.5 text-gray-600">{t._count?.squadEntries ?? 0}</td>
                <td className="px-4 py-2.5">
                  <Badge color={statusColor(t.isActive ? 'ACTIVE' : 'INACTIVE')}>{t.isActive ? 'Active' : 'Inactive'}</Badge>
                </td>
              </tr>
            ))}
          </Table>
        </div>
      )}
    </div>
  );
}
