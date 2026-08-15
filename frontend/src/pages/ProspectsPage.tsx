import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { PageHeader, Table, Badge, Spinner, EmptyState, statusColor } from '@/components/ui';

export default function ProspectsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['prospects'],
    queryFn: async () => (await api.get('/recruitment/prospects', { params: { pageSize: 100 } })).data,
  });

  return (
    <div>
      <PageHeader
        title="Prospects"
        subtitle={`${data?.pagination?.total ?? 0} prospects`}
      />
      {isLoading ? (
        <Spinner />
      ) : !data?.prospects?.length ? (
        <EmptyState message="No prospects found." />
      ) : (
        <div className="bg-surface border border-border rounded-lg">
          <Table headers={['Name', 'Sport', 'Institution', 'Source', 'Status']}>
            {data.prospects.map((p: any) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-2.5 font-medium text-gray-900">{p.fullName}</td>
                <td className="px-4 py-2.5 text-gray-600">{p.sport?.name}</td>
                <td className="px-4 py-2.5 text-gray-600">{p.schoolOrInstitution ?? '—'}</td>
                <td className="px-4 py-2.5 text-gray-600">{p.source}</td>
                <td className="px-4 py-2.5">
                  <Badge color={statusColor(p.status)}>{p.status}</Badge>
                </td>
              </tr>
            ))}
          </Table>
        </div>
      )}
    </div>
  );
}
