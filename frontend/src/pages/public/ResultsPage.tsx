import { useQuery } from '@tanstack/react-query';
import { getPublicResults } from '@/lib/api';
import { Spinner, EmptyState } from '@/components/ui';
import { formatMatchDate } from './FixturesPage';

export default function ResultsPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['public', 'results'],
    queryFn: getPublicResults,
  });

  return (
    <div className="max-w-4xl mx-auto px-6 sm:px-8 py-14">
      <div className="text-center mb-10">
        <div className="inline-flex items-center rounded-full bg-umu-red-light px-4 py-1.5 mb-4">
          <span className="text-[13px] font-medium text-umu-red">Scores</span>
        </div>
        <h1 className="text-[32px] font-semibold text-on-surface tracking-tight">Results</h1>
        <p className="mt-2 text-[15px] text-on-surface-variant max-w-md mx-auto">
          Completed matches and final scores.
        </p>
      </div>

      {isLoading ? (
        <div className="py-16 flex justify-center"><Spinner /></div>
      ) : isError ? (
        <div className="py-16"><EmptyState message="Couldn't load results" /></div>
      ) : !data || data.length === 0 ? (
        <div className="py-16"><EmptyState message="No results yet" /></div>
      ) : (
        <ul className="space-y-2.5">
          {data.map((m) => {
            const result = m.results;
            const homeScore = result ? result.homeScore : m.homeScore;
            const awayScore = result ? result.awayScore : m.awayScore;
            return (
              <li key={m.id} className="rounded-m3-lg border border-outline-variant bg-white p-5 transition hover:shadow-m3-1">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0 text-[15px] font-medium text-on-surface">
                    {m.homeTeam?.name ?? m.homeIndividual?.fullName ?? 'TBD'}
                  </div>
                  <div className="px-4 py-1.5 rounded-full bg-surface-dim text-[17px] font-semibold text-on-surface whitespace-nowrap">
                    {homeScore ?? 0} – {awayScore ?? 0}
                  </div>
                  <div className="min-w-0 text-right text-[15px] font-medium text-on-surface">
                    {m.awayTeam?.name ?? m.awayIndividual?.fullName ?? 'TBD'}
                  </div>
                </div>
                <div className="mt-2.5 flex items-center gap-2">
                  <span className="rounded-full bg-umu-red-light px-2.5 py-0.5 text-[11px] font-medium text-umu-red">
                    {m.sport.name}
                  </span>
                  <span className="text-[12px] text-on-surface-variant">
                    {m.event?.name ?? 'Match'} &middot; {formatMatchDate(m.scheduledDate)}
                  </span>
                  {result?.resultType && (
                    <span className="text-[11px] text-on-surface-variant capitalize">
                      &middot; {result.resultType.replace('_', ' ')}
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
