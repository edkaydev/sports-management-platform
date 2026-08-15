import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, getErrorMessage } from '@/lib/api';
import { PageHeader, Button, Table, Badge, Spinner, EmptyState, statusColor, Field, inputClass, Card, InlineAlert } from '@/components/ui';

export default function SportsPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [gender, setGender] = useState('MALE');
  const [category, setCategory] = useState('TEAM');
  const [error, setError] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['sports'],
    queryFn: async () => (await api.get('/sports')).data.data,
  });

  const create = useMutation({
    mutationFn: async () => {
      await api.post('/sports', { name, gender, category });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sports'] });
      setShowForm(false);
      setName('');
      setError('');
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  return (
    <div>
      <PageHeader
        title="Sports"
        actions={<Button onClick={() => setShowForm((v) => !v)}>Add Sport</Button>}
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
              <Field label="Gender" required>
                <select className={inputClass} value={gender} onChange={(e) => setGender(e.target.value)}>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="MIXED">Mixed</option>
                </select>
              </Field>
              <Field label="Category" required>
                <select className={inputClass} value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="TEAM">Team</option>
                  <option value="INDIVIDUAL">Individual</option>
                </select>
              </Field>
            </div>
            <div className="flex justify-end">
              <Button type="submit">Save Sport</Button>
            </div>
          </form>
        </Card>
      )}
      {isLoading ? (
        <Spinner />
      ) : !data?.length ? (
        <EmptyState message="No sports found." />
      ) : (
        <div className="bg-surface border border-border rounded-lg">
          <Table headers={['Name', 'Gender', 'Category', 'Teams', 'Status']}>
            {data.map((s: any) => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="px-4 py-2.5 font-medium text-gray-900">{s.name}</td>
                <td className="px-4 py-2.5 text-gray-600">{s.gender}</td>
                <td className="px-4 py-2.5 text-gray-600">{s.category}</td>
                <td className="px-4 py-2.5 text-gray-600">{s._count?.teams ?? 0}</td>
                <td className="px-4 py-2.5">
                  <Badge color={statusColor(s.isActive ? 'ACTIVE' : 'INACTIVE')}>{s.isActive ? 'Active' : 'Inactive'}</Badge>
                </td>
              </tr>
            ))}
          </Table>
        </div>
      )}
    </div>
  );
}
