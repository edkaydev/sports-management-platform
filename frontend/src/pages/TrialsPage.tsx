import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { PageHeader, Table, Badge, Spinner, EmptyState, statusColor } from '@/components/ui';

export default function TrialsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['trials'],
    queryFn: async () => (await api.get('/recruitment/trials')).data.data,
  });

  return (
    <div>
      <PageHeader title="Trials" subtitle={`${data?.length ?? 0} trials`} />
      {isLoading ? (
        <Spinner />
      ) : !data?.length ? (
        <EmptyState message="No trials scheduled." />
      ) : (
        <div className="bg-surface border border-border rounded-lg">
          <Table headers={['Date', 'Sport', 'Venue', 'Participants', 'Status']}>
            {data.map((t: any) => (
              <tr key={t.id} className="hover:bg-gray-50">
                <td className="px-4 py-2.5 font-medium text-gray-900">
                  {new Date(t.trialDate).toLocaleDateString()}
                </td>
                <td className="px-4 py-2.5 text-gray-600">{t.sport?.name}</td>
                <td className="px-4 py-2.5 text-gray-600">{t.venue ?? '—'}</td>
                <td className="px-4 py-2.5 text-gray-600">{t._count?.participants ?? 0}</td>
                <td className="px-4 py-2.5">
                  <Badge color={statusColor(t.status)}>{t.status}</Badge>
                </td>
              </tr>
            ))}
          </Table>
        </div>
      )}
    </div>
  );
}
