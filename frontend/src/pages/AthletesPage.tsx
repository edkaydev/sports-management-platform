import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { PageHeader, Button, Table, Badge, Spinner, EmptyState, statusColor, inputClass } from '@/components/ui';

export default function AthletesPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['athletes', search, page],
    queryFn: async () => {
      const res = await api.get('/athletes', {
        params: { search: search || undefined, page, pageSize: 20 },
      });
      return res.data;
    },
  });

  return (
    <div>
      <PageHeader
        title="Athletes"
        subtitle={`${data?.pagination?.total ?? 0} student-athletes`}
        actions={
          <Link to="/athletes/new">
            <Button>Add Athlete</Button>
          </Link>
        }
      />
      <div className="mb-4 flex gap-3 flex-wrap">
        <input
          className={`${inputClass} max-w-xs`}
          placeholder="Search name, reg no, or email…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>
      {isLoading ? (
        <Spinner />
      ) : !data?.athletes?.length ? (
        <EmptyState message="No athletes match these filters." />
      ) : (
        <>
          <div className="bg-surface border border-border rounded-lg">
            <Table
              headers={['Name', 'Reg. No.', 'Sport', 'Type', 'Status']}
            >
              {data.athletes.map((a: any) => (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2.5">
                    <Link to={`/athletes/${a.id}`} className="font-medium text-primary hover:underline">
                      {a.fullName}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5 text-gray-600">{a.registrationNumber}</td>
                  <td className="px-4 py-2.5 text-gray-600">
                    {a.affiliations?.map((x: any) => x.sport?.name).join(', ') || '—'}
                  </td>
                  <td className="px-4 py-2.5 text-gray-600">{a.athleteType}</td>
                  <td className="px-4 py-2.5">
                    <Badge color={statusColor(a.status)}>{a.status}</Badge>
                  </td>
                </tr>
              ))}
            </Table>
          </div>
          <div className="mt-4 flex items-center justify-between text-sm text-muted">
            <span>
              Showing page {data.pagination.page} of {data.pagination.totalPages || 1}
            </span>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={page >= (data.pagination.totalPages || 1)}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
