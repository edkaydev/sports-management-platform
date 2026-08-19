import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/ui';
import { PageLoader } from '@/components/PageLoader';
import { Users, Calendar, Trophy, AlertTriangle, MapPin } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

const PIE_COLORS = ['#16a34a', '#f59e0b', '#ef4444', '#3b82f6', '#6b7280'];

function StatCard({ title, value, icon: Icon, color }: { title: string; value: number | string; icon: any; color: string }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { data: athletesRes, isLoading: loadingAthletes } = useQuery({
    queryKey: ['dashboard', 'athletes'],
    queryFn: async () => (await api.get('/athletes', { params: { pageSize: 1 } })).data,
  });

  const { data: events } = useQuery({
    queryKey: ['dashboard', 'events'],
    queryFn: async () => (await api.get('/events')).data,
  });

  const { data: matches } = useQuery({
    queryKey: ['dashboard', 'matches'],
    queryFn: async () => (await api.get('/matches')).data,
  });

  const { data: academic } = useQuery({
    queryKey: ['dashboard', 'academic'],
    queryFn: async () =>
      (await api.get('/reports/academic-standing', { params: { season: '2025/2026' } })).data,
  });

  const { data: scholarships } = useQuery({
    queryKey: ['dashboard', 'scholarships'],
    queryFn: async () => (await api.get('/reports/scholarships')).data,
  });

  const { data: sports } = useQuery({
    queryKey: ['dashboard', 'sports'],
    queryFn: async () => (await api.get('/sports')).data,
  });

  if (loadingAthletes) return <PageLoader />;

  const totalAthletes = athletesRes?.pagination?.total ?? 0;
  const eventsList = Array.isArray(events) ? events : events?.data ?? [];
  const matchesList = Array.isArray(matches) ? matches : matches?.data ?? [];
  const sportsList = Array.isArray(sports) ? sports : sports?.data ?? [];

  const upcoming = matchesList.filter(
    (m: any) => (m.status === 'SCHEDULED' || m.status === 'IN_PROGRESS') && new Date(m.scheduledDate) >= new Date()
  ).length;

  const warningCount =
    academic?.byStanding?.reduce(
      (acc: number, s: any) => (s.standing === 'WARNING' || s.standing === 'PROBATION') ? acc + s.count : acc,
      0
    ) ?? 0;

  const standingData = academic?.byStanding?.map((s: any) => ({
    name: s.standing?.replace(/_/g, ' ') ?? 'Unknown',
    value: s.count ?? 0,
  })) ?? [];

  const upcomingFixtures = matchesList
    .filter((m: any) => m.status === 'SCHEDULED' && new Date(m.scheduledDate) >= new Date())
    .sort((a: any, b: any) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())
    .slice(0, 6);

  const sportCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    sportsList.forEach((s: any) => { counts[s.name] = s._count?.teams ?? 0; });
    return Object.entries(counts)
      .map(([name, teams]) => ({ name, teams }))
      .sort((a, b) => b.teams - a.teams)
      .slice(0, 8);
  }, [sportsList]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">2025/2026 Season Overview</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Athletes" value={totalAthletes} icon={Users} color="bg-umu-red" />
        <StatCard title="Competitions" value={eventsList.length} icon={Trophy} color="bg-umu-gold" />
        <StatCard title="Upcoming Matches" value={upcoming} icon={Calendar} color="bg-blue-600" />
        <StatCard title="Academic Warnings" value={warningCount} icon={AlertTriangle} color="bg-amber-500" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Academic Standing Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {standingData.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={standingData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {standingData.map((_: any, i: number) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-10">No academic data available</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Teams per Sport</CardTitle>
          </CardHeader>
          <CardContent>
            {sportCounts.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={sportCounts}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="teams" fill="#dc2626" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-10">No sports data available</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Attention Required</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-border text-sm">
              <li className="py-3 flex justify-between items-center">
                <span className="text-gray-700">Academic Warnings</span>
                <div className="flex items-center gap-2">
                  <Badge variant="destructive">{warningCount} athletes</Badge>
                  <Link to="/academic" className="text-sm text-primary hover:underline">View</Link>
                </div>
              </li>
              <li className="py-3 flex justify-between items-center">
                <span className="text-gray-700">Scholarships Expiring</span>
                <div className="flex items-center gap-2">
                  <Badge variant="destructive">{scholarships?.expiringWithin30Days ?? 0} records</Badge>
                  <Link to="/scholarships" className="text-sm text-primary hover:underline">View</Link>
                </div>
              </li>
              <li className="py-3 flex justify-between items-center">
                <span className="text-gray-700">Active Scholarships</span>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{scholarships?.active ?? 0}</Badge>
                  <Link to="/scholarships" className="text-sm text-primary hover:underline">View</Link>
                </div>
              </li>
              <li className="py-3 flex justify-between items-center">
                <span className="text-gray-700">Total Events</span>
                <div className="flex items-center gap-2">
                  <Badge>{eventsList.length}</Badge>
                  <Link to="/events" className="text-sm text-primary hover:underline">View</Link>
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Upcoming Fixtures</CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingFixtures.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-10">No upcoming fixtures</p>
            ) : (
              <ul className="divide-y divide-border text-sm">
                {upcomingFixtures.map((m: any) => (
                  <li key={m.id} className="py-3 flex justify-between items-center gap-3">
                    <div className="min-w-0">
                      <div className="font-medium text-gray-900 truncate">
                        {m.homeTeam?.name ?? 'TBD'} vs {m.awayTeam?.name ?? 'TBD'}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                        <MapPin className="w-3 h-3" />
                        {m.venue ?? 'TBD'} &middot; {new Date(m.scheduledDate).toLocaleDateString()}
                      </div>
                    </div>
                    <Badge variant="outline">{m.status}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
