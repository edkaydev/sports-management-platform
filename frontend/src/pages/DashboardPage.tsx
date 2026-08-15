import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '@/lib/api';
import { PageHeader, Card, Badge, Spinner, EmptyState, statusColor } from '@/components/ui';

export default function DashboardPage() {
  const { data: athletes, isLoading } = useQuery({
    queryKey: ['dashboard', 'athletes'],
    queryFn: async () => (await api.get('/athletes', { params: { pageSize: 1 } })).data,
  });

  const { data: events } = useQuery({
    queryKey: ['dashboard', 'events'],
    queryFn: async () => (await api.get('/events')).data.data,
  });

  const { data: matches } = useQuery({
    queryKey: ['dashboard', 'matches'],
    queryFn: async () => (await api.get('/matches')).data.data,
  });

  const { data: academic } = useQuery({
    queryKey: ['dashboard', 'academic'],
    queryFn: async () =>
      (await api.get('/reports/academic-standing', { params: { season: '2025/2026' } })).data.data,
  });

  const { data: scholarships } = useQuery({
    queryKey: ['dashboard', 'scholarships'],
    queryFn: async () => (await api.get('/reports/scholarships')).data.data,
  });

  if (isLoading) return <Spinner />;

  const upcoming =
    matches?.filter(
      (m: { status: string; scheduledDate: string }) =>
        (m.status === 'SCHEDULED' || m.status === 'IN_PROGRESS') && new Date(m.scheduledDate) >= new Date()
    ).length ?? 0;

  const warningCount =
    academic?.byStanding?.reduce(
      (acc: number, s: { standing: string; count: number }) =>
        s.standing === 'WARNING' || s.standing === 'PROBATION' ? acc + s.count : acc,
      0
    ) ?? 0;

  const expiringCount = scholarships?.expiringWithin30Days ?? 0;

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="2025/2026 Season" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="text-sm text-muted">Athletes</div>
          <div className="text-2xl font-semibold text-gray-900 mt-1">{athletes?.pagination?.total ?? 0}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted">Competitions</div>
          <div className="text-2xl font-semibold text-gray-900 mt-1">{events?.length ?? 0}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted">Matches</div>
          <div className="text-2xl font-semibold text-gray-900 mt-1">{matches?.length ?? 0}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted">Upcoming</div>
          <div className="text-2xl font-semibold text-gray-900 mt-1">{upcoming}</div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="font-medium text-gray-900 mb-3">Attention Required</h3>
          <ul className="divide-y divide-border text-sm">
            <li className="py-2.5 flex justify-between">
              <span className="text-gray-700">Academic Warnings</span>
              <span className="flex items-center gap-2">
                <Badge color="amber">{warningCount} athletes</Badge>
                <Link to="/academic" className="text-primary hover:underline">
                  View
                </Link>
              </span>
            </li>
            <li className="py-2.5 flex justify-between">
              <span className="text-gray-700">Scholarships Expiring</span>
              <span className="flex items-center gap-2">
                <Badge color="amber">{expiringCount} records</Badge>
                <Link to="/scholarships" className="text-primary hover:underline">
                  View
                </Link>
              </span>
            </li>
            <li className="py-2.5 flex justify-between">
              <span className="text-gray-700">Active Scholarships</span>
              <span className="flex items-center gap-2">
                <Badge color="green">{scholarships?.active ?? 0}</Badge>
                <Link to="/scholarships" className="text-primary hover:underline">
                  View
                </Link>
              </span>
            </li>
            <li className="py-2.5 flex justify-between">
              <span className="text-gray-700">Contracts</span>
              <span className="flex items-center gap-2">
                <Badge color="gray">{scholarships ? undefined : '—'}</Badge>
                <Link to="/contracts" className="text-primary hover:underline">
                  View
                </Link>
              </span>
            </li>
          </ul>
        </Card>

        <Card>
          <h3 className="font-medium text-gray-900 mb-3">Upcoming Fixtures</h3>
          {!matches || matches.length === 0 ? (
            <EmptyState message="No fixtures scheduled." />
          ) : (
            <ul className="divide-y divide-border text-sm">
              {matches
                .filter(
                  (m: { status: string }) =>
                    m.status === 'SCHEDULED' || m.status === 'IN_PROGRESS'
                )
                .slice(0, 6)
                .map((m: any) => (
                  <li key={m.id} className="py-2.5 flex justify-between items-center gap-3">
                    <div>
                      <div className="font-medium text-gray-900">
                        {m.homeTeam?.name ?? 'TBD'} vs {m.awayTeam?.name ?? 'TBD'}
                      </div>
                      <div className="text-xs text-muted">
                        {new Date(m.scheduledDate).toLocaleString()}
                      </div>
                    </div>
                    <Badge color={statusColor(m.status)}>{m.status}</Badge>
                  </li>
                ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
