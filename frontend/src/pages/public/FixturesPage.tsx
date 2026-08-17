import { useQuery } from '@tanstack/react-query';
import { getPublicFixtures } from '@/lib/api';
import { PageHeader, Spinner, EmptyState } from '@/components/ui';

export function formatMatchDate(value: string | null): string {
  if (!value) return 'TBD';
  return new Date(value).toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function FixturesPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['public', 'fixtures'],
    queryFn: getPublicFixtures,
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <PageHeader title="Fixtures" subtitle="Upcoming matches and schedules across all sports." />
      {isLoading ? (
        <div className="py-16 flex justify-center"><Spinner /></div>
      ) : isError ? (
        <div className="py-16"><EmptyState message="Couldn't load fixtures" /></div>
      ) : !data || data.length === 0 ? (
        <div className="py-16"><EmptyState message="No upcoming fixtures" /></div>
      ) : (
        <ul className="space-y-3">
          {data.map((m) => (
            <li key={m.id} className="bg-surface border border-border rounded-lg p-4 sm:flex sm:items-center sm:justify-between gap-4">
              <div className="min-w-0">
                <div className="text-xs font-semibold text-muted uppercase tracking-wide">
                  {m.sport.name} · {m.event?.name ?? 'Match'}
                  {m.round ? ` · ${m.round}` : ''}
                </div>
                <div className="mt-1 font-medium text-gray-900">
                  {m.homeTeam?.name ?? m.homeIndividual?.fullName ?? 'TBD'}
                  <span className="text-muted font-normal"> vs </span>
                  {m.awayTeam?.name ?? m.awayIndividual?.fullName ?? 'TBD'}
                </div>
                <div className="text-sm text-muted mt-0.5">
                  {formatMatchDate(m.scheduledDate)}
                  {m.venue ? ` · ${m.venue}` : ''}
                </div>
              </div>
              <div className="mt-3 sm:mt-0">
                <span className="inline-block px-3 py-1 rounded-full bg-blue-50 text-primary text-xs font-semibold">
                  {m.status.replace('_', ' ')}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
