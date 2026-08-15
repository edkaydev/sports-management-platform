import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { PageHeader, Table, Badge, Spinner, EmptyState, statusColor } from '@/components/ui';

export default function DocumentsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: async () => (await api.get('/documents', { params: { pageSize: 100 } })).data,
  });

  return (
    <div>
      <PageHeader
        title="Documents"
        subtitle={`${data?.pagination?.total ?? 0} documents`}
      />
      {isLoading ? (
        <Spinner />
      ) : !data?.documents?.length ? (
        <EmptyState message="No documents found." />
      ) : (
        <div className="bg-surface border border-border rounded-lg">
          <Table headers={['Title', 'Owner', 'Category', 'Expiry', 'Verified', 'Status']}>
            {data.documents.map((d: any) => (
              <tr key={d.id} className="hover:bg-gray-50">
                <td className="px-4 py-2.5">
                  <a
                    className="font-medium text-primary hover:underline"
                    href={d.fileUrl.startsWith('http') ? d.fileUrl : `/uploads/${d.fileName}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {d.title}
                  </a>
                </td>
                <td className="px-4 py-2.5 text-gray-600">
                  {d.athlete?.fullName ?? d.team?.name ?? d.ownerType}
                </td>
                <td className="px-4 py-2.5 text-gray-600">{d.category}</td>
                <td className="px-4 py-2.5 text-gray-600">
                  {d.expiryDate ? new Date(d.expiryDate).toLocaleDateString() : '—'}
                </td>
                <td className="px-4 py-2.5">
                  <Badge color={d.isVerified ? 'green' : 'amber'}>
                    {d.isVerified ? 'Verified' : 'Pending'}
                  </Badge>
                </td>
                <td className="px-4 py-2.5">
                  <Badge color={statusColor(d.status)}>{d.status}</Badge>
                </td>
              </tr>
            ))}
          </Table>
        </div>
      )}
    </div>
  );
}
