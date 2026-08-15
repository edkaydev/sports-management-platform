import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { PageHeader, Card, Badge, Spinner, EmptyState, statusColor } from '@/components/ui';

export default function AthleteDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: athlete, isLoading } = useQuery({
    queryKey: ['athlete', id],
    queryFn: async () => (await api.get(`/athletes/${id}`)).data.data,
  });

  const { data: performance } = useQuery({
    queryKey: ['athlete', id, 'performance'],
    queryFn: async () => (await api.get(`/athletes/${id}/performances`)).data.data,
    enabled: !!id,
  });

  if (isLoading) return <Spinner />;
  if (!athlete) return <EmptyState message="Athlete not found." />;

  return (
    <div>
      <PageHeader title={athlete.fullName} subtitle={`${athlete.registrationNumber} · ${athlete.programme ?? 'N/A'} · Year ${athlete.yearOfStudy ?? 'N/A'} · ${athlete.athleteType}`} />

      <div className="space-y-6">
        <Card>
          <h3 className="font-medium text-gray-900 mb-3">Sports</h3>
          {!athlete.affiliations?.length ? (
            <p className="text-sm text-muted">No sport affiliations.</p>
          ) : (
            <ul className="divide-y divide-border text-sm">
              {athlete.affiliations.map((a: any) => (
                <li key={a.id} className="py-2.5 flex justify-between">
                  <span className="text-gray-900">
                    {a.sport?.name} <span className="text-muted">· {a.position ?? '—'}</span>{' '}
                    {a.team && <span className="text-muted">· {a.team.name}</span>}
                    {a.jerseyNumber && <span className="text-muted"> · #{a.jerseyNumber}</span>}
                  </span>
                  <Badge color={statusColor(a.status)}>{a.status}</Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <h3 className="font-medium text-gray-900 mb-3">Academic Performance</h3>
          {!athlete.academicRecords?.length ? (
            <p className="text-sm text-muted">No academic records.</p>
          ) : (
            <ul className="divide-y divide-border text-sm">
              {athlete.academicRecords.map((r: any) => (
                <li key={r.id} className="py-2.5 flex justify-between">
                  <span className="text-gray-900">
                    {r.academicYear} · {r.semester} · GPA {r.gpa ?? 'N/A'}
                  </span>
                  <Badge color={statusColor(r.academicStanding)}>{r.academicStanding}</Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <h3 className="font-medium text-gray-900 mb-3">Sports Performance</h3>
          {!performance ? (
            <p className="text-sm text-muted">No performance data.</p>
          ) : (
            <div className="text-sm text-gray-700 space-y-1">
              <p>
                Matches: <span className="font-medium">{performance.summary.appearances}</span>
                {'  '}· Goals: <span className="font-medium">{performance.summary.totalGoals}</span>
                {'  '}· Assists: <span className="font-medium">{performance.summary.totalAssists}</span>
                {'  '}· Avg Rating: <span className="font-medium">{performance.summary.averageRating ?? 'N/A'}</span>
              </p>
            </div>
          )}
        </Card>

        <Card>
          <h3 className="font-medium text-gray-900 mb-3">Details</h3>
          <div className="grid sm:grid-cols-2 gap-2 text-sm text-gray-700">
            <div><span className="text-muted">Gender:</span> {athlete.gender}</div>
            <div><span className="text-muted">Email:</span> {athlete.email ?? '—'}</div>
            <div><span className="text-muted">Phone:</span> {athlete.phoneNumber ?? '—'}</div>
            <div><span className="text-muted">Faculty:</span> {athlete.faculty ?? '—'}</div>
            <div><span className="text-muted">Status:</span> <Badge color={statusColor(athlete.status)}>{athlete.status}</Badge></div>
          </div>
        </Card>
      </div>
    </div>
  );
}
