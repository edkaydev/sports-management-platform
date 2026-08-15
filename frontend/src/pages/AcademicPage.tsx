import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { PageHeader, Table, Badge, Spinner, EmptyState, statusColor } from '@/components/ui';

export default function AcademicPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['academic'],
    queryFn: async () =>
      (await api.get('/academic', { params: { academicYear: '2025/2026', pageSize: 100 } })).data,
  });

  return (
    <div>
      <PageHeader
        title="Academic Performance"
        subtitle={`${data?.pagination?.total ?? 0} records (2025/2026)`}
      />
      {isLoading ? (
        <Spinner />
      ) : !data?.records?.length ? (
        <EmptyState message="No academic records found." />
      ) : (
        <div className="bg-surface border border-border rounded-lg">
          <Table headers={['Athlete', 'Semester', 'GPA', 'Failed Units', 'Attendance', 'Standing']}>
            {data.records.map((r: any) => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="px-4 py-2.5 font-medium text-gray-900">{r.athlete?.fullName}</td>
                <td className="px-4 py-2.5 text-gray-600">{r.semester}</td>
                <td className="px-4 py-2.5 text-gray-600">{r.gpa ?? 'N/A'}</td>
                <td className="px-4 py-2.5 text-gray-600">{r.failedUnits}</td>
                <td className="px-4 py-2.5 text-gray-600">{r.attendancePercentage != null ? `${r.attendancePercentage}%` : '—'}</td>
                <td className="px-4 py-2.5">
                  <Badge color={statusColor(r.academicStanding)}>{r.academicStanding}</Badge>
                </td>
              </tr>
            ))}
          </Table>
        </div>
      )}
    </div>
  );
}
