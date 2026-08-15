import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { PageHeader, Table, Badge, Spinner, EmptyState, statusColor } from '@/components/ui';

export default function ScholarshipsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['scholarships'],
    queryFn: async () => (await api.get('/scholarships', { params: { pageSize: 100 } })).data,
  });

  return (
    <div>
      <PageHeader
        title="Scholarships"
        subtitle={`${data?.pagination?.total ?? 0} records`}
      />
      {isLoading ? (
        <Spinner />
      ) : !data?.scholarships?.length ? (
        <EmptyState message="No scholarships found." />
      ) : (
        <div className="bg-surface border border-border rounded-lg">
          <Table headers={['Athlete', 'Type', 'Sponsor', 'Period', 'Coverage', 'Status']}>
            {data.scholarships.map((s: any) => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="px-4 py-2.5 font-medium text-gray-900">{s.athlete?.fullName}</td>
                <td className="px-4 py-2.5 text-gray-600">{s.scholarshipType}</td>
                <td className="px-4 py-2.5 text-gray-600">{s.sponsorName ?? 'UMU'}</td>
                <td className="px-4 py-2.5 text-gray-600">
                  {new Date(s.startDate).toLocaleDateString()} – {new Date(s.endDate).toLocaleDateString()}
                </td>
                <td className="px-4 py-2.5 text-gray-600">
                  {s.coveragePercentage != null ? `${s.coveragePercentage}%` : '—'}
                </td>
                <td className="px-4 py-2.5">
                  <Badge color={statusColor(s.status)}>{s.status}</Badge>
                </td>
              </tr>
            ))}
          </Table>
        </div>
      )}
    </div>
  );
}
