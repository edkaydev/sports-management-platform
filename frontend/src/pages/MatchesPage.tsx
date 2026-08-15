import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { PageHeader, Table, Badge, Spinner, EmptyState, statusColor } from '@/components/ui';

export default function MatchesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['matches'],
    queryFn: async () => (await api.get('/matches')).data.data,
  });

  const fixtures = data
    ? [...data].sort(
        (a: any, b: any) =>
          new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()
      )
    : [];

  return (
    <div>
      <PageHeader title="Fixtures & Matches" subtitle={`${fixtures.length} matches`} />
      {isLoading ? (
        <Spinner />
      ) : !fixtures.length ? (
        <EmptyState message="No fixtures scheduled." />
      ) : (
        <div className="bg-surface border border-border rounded-lg">
          <Table headers={['Match', 'Event', 'Venue', 'Date & Time', 'Score', 'Status']}>
            {fixtures.map((m: any) => (
              <tr key={m.id} className="hover:bg-gray-50">
                <td className="px-4 py-2.5 font-medium text-gray-900">
                  {m.homeTeam?.name ?? 'TBD'} vs {m.awayTeam?.name ?? 'TBD'}
                </td>
                <td className="px-4 py-2.5 text-gray-600">{m.event?.name ?? '—'}</td>
                <td className="px-4 py-2.5 text-gray-600">{m.venue ?? '—'}</td>
                <td className="px-4 py-2.5 text-gray-600">
                  {new Date(m.scheduledDate).toLocaleString()}
                </td>
                <td className="px-4 py-2.5 text-gray-600">
                  {m.homeScore != null ? `${m.homeScore} – ${m.awayScore}` : '—'}
                </td>
                <td className="px-4 py-2.5">
                  <Badge color={statusColor(m.status)}>{m.status}</Badge>
                </td>
              </tr>
            ))}
          </Table>
        </div>
      )}
    </div>
  );
}
