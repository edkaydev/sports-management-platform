import { useQuery } from '@tanstack/react-query';
import { getPublicResults } from '@/lib/api';
import { PageHeader, Spinner, EmptyState } from '@/components/ui';
import { formatMatchDate } from './FixturesPage';

export default function ResultsPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['public', 'results'],
    queryFn: getPublicResults,
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <PageHeader title="Results" subtitle="Completed matches and final scores." />
      {isLoading ? (
        <div className="py-16 flex justify-center"><Spinner /></div>
      ) : isError ? (
        <div className="py-16"><EmptyState message="Couldn't load results" /></div>
      ) : !data || data.length === 0 ? (
        <div className="py-16"><EmptyState message="No results yet" /></div>
      ) : (
        <ul className="space-y-3">
          {data.map((m) => {
            const result = m.results;
            const homeScore = result ? result.homeScore : m.homeScore;
            const awayScore = result ? result.awayScore : m.awayScore;
            return (
              <li key={m.id} className="bg-surface border border-border rounded-lg p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0 font-medium text-gray-900">
                    {m.homeTeam?.name ?? m.homeIndividual?.fullName ?? 'TBD'}
                  </div>
                  <div className="px-4 py-1 rounded-md bg-gray-100 font-bold text-gray-900 whitespace-nowrap">
                    {homeScore ?? 0} – {awayScore ?? 0}
                  </div>
                  <div className="min-w-0 text-right font-medium text-gray-900">
                    {m.awayTeam?.name ?? m.awayIndividual?.fullName ?? 'TBD'}
                  </div>
                </div>
                <div className="mt-2 text-xs text-muted">
                  {m.sport.name} · {m.event?.name ?? 'Match'} · {formatMatchDate(m.scheduledDate)}
                  {result?.resultType ? ` · ${result.resultType.replace('_', ' ')}` : ''}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
