import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { PageHeader, Table, Badge, Spinner, EmptyState, statusColor } from '@/components/ui';

export default function ContractsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['contracts'],
    queryFn: async () => (await api.get('/contracts', { params: { pageSize: 100 } })).data,
  });

  const contracts = data?.data ?? [];

  return (
    <div>
      <PageHeader title="Contracts" subtitle={`${contracts.length} contracts`} />
      {isLoading ? (
        <Spinner />
      ) : !contracts.length ? (
        <EmptyState message="No contracts found." />
      ) : (
        <div className="bg-surface border border-border rounded-lg">
          <Table headers={['Athlete', 'Type', 'Period', 'Scholarship', 'Status']}>
            {contracts.map((c: any) => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-4 py-2.5 font-medium text-gray-900">{c.athlete?.fullName}</td>
                <td className="px-4 py-2.5 text-gray-600">{c.contractType}</td>
                <td className="px-4 py-2.5 text-gray-600">
                  {new Date(c.startDate).toLocaleDateString()} – {new Date(c.endDate).toLocaleDateString()}
                </td>
                <td className="px-4 py-2.5 text-gray-600">{c.hasAccompanyingScholarship ? 'Yes' : 'No'}</td>
                <td className="px-4 py-2.5">
                  <Badge color={statusColor(c.status)}>{c.status}</Badge>
                </td>
              </tr>
            ))}
          </Table>
        </div>
      )}
    </div>
  );
}
