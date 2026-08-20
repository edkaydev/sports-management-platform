import { useQuery } from '@tanstack/react-query';
import { getPublicFixtures } from '@/lib/api';
import { Spinner, EmptyState } from '@/components/ui';

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
    <div className="max-w-4xl mx-auto px-6 sm:px-8 py-14">
      <div className="text-center mb-10">
        <div className="inline-flex items-center rounded-full bg-umu-red-light px-4 py-1.5 mb-4">
          <span className="text-[13px] font-medium text-umu-red">Schedule</span>
        </div>
        <h1 className="text-[32px] font-semibold text-on-surface tracking-tight">Fixtures</h1>
        <p className="mt-2 text-[15px] text-on-surface-variant max-w-md mx-auto">
          Upcoming matches and schedules across all sports.
        </p>
      </div>

      {isLoading ? (
        <div className="py-16 flex justify-center"><Spinner /></div>
      ) : isError ? (
        <div className="py-16"><EmptyState message="Couldn't load fixtures" /></div>
      ) : !data || data.length === 0 ? (
        <div className="py-16"><EmptyState message="No upcoming fixtures" /></div>
      ) : (
        <ul className="space-y-2.5">
          {data.map((m) => (
            <li key={m.id} className="rounded-m3-lg border border-outline-variant bg-white p-5 transition hover:shadow-m3-1 sm:flex sm:items-center sm:justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="rounded-full bg-umu-red-light px-2.5 py-0.5 text-[11px] font-medium text-umu-red">
                    {m.sport.name}
                  </span>
                  {m.event?.name && (
                    <span className="text-[11px] text-on-surface-variant">{m.event.name}</span>
                  )}
                  {m.round && (
                    <span className="text-[11px] text-on-surface-variant">· {m.round}</span>
                  )}
                </div>
                <div className="text-[15px] font-medium text-on-surface">
                  {m.homeTeam?.name ?? m.homeIndividual?.fullName ?? 'TBD'}
                  <span className="mx-2 text-on-surface-variant font-normal">vs</span>
                  {m.awayTeam?.name ?? m.awayIndividual?.fullName ?? 'TBD'}
                </div>
                <div className="text-[13px] text-on-surface-variant mt-1">
                  {formatMatchDate(m.scheduledDate)}
                  {m.venue ? ` · ${m.venue}` : ''}
                </div>
              </div>
              <div className="mt-3 sm:mt-0 shrink-0">
                <span className="inline-block px-3 py-1 rounded-full bg-surface-dim text-[12px] font-medium text-on-surface-variant capitalize">
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
