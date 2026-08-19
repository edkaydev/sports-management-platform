import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { getPublicTeam } from '@/lib/api';
import { Spinner, EmptyState } from '@/components/ui';
import { formatMatchDate } from './FixturesPage';

function formatGenderLabel(gender?: string | null) {
  if (!gender) return 'Mixed';
  return gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase();
}

export default function TeamDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError } = useQuery({
    queryKey: ['public', 'team', id],
    queryFn: () => getPublicTeam(id!),
    enabled: !!id,
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      {isLoading ? (
        <div className="py-16 flex justify-center"><Spinner /></div>
      ) : isError || !data ? (
        <div className="py-16">
          <EmptyState message="Team not found" />
          <div className="text-center mt-4">
            <Link to="/teams" className="text-sm font-semibold text-primary hover:underline">
              ← Back to all teams
            </Link>
          </div>
        </div>
      ) : (
        <>
          <Link to="/teams" className="text-sm font-semibold text-primary hover:underline">
            ← All teams
          </Link>
          <header className="mt-4 bg-gradient-to-r from-blue-900 to-blue-700 text-white rounded-lg px-6 py-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-3xl font-bold">{data.team.name}</h1>
                <p className="mt-1 text-blue-100 capitalize">
                  {data.team.sport.name} · {formatGenderLabel(data.team.gender)}
                </p>
              </div>
              <div className="flex gap-6 text-center">
                <div>
                  <div className="text-2xl font-bold">{data.team._count.squadEntries}</div>
                  <div className="text-xs text-blue-200 uppercase tracking-wide">Squad</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {data.team._count.homeMatches + data.team._count.awayMatches}
                  </div>
                  <div className="text-xs text-blue-200 uppercase tracking-wide">Matches</div>
                </div>
              </div>
            </div>
            {data.team.homeVenue && (
              <p className="mt-4 text-blue-100 text-sm">Home venue: {data.team.homeVenue}</p>
            )}
          </header>

          {data.squad.length > 0 && (
            <section className="mt-8">
              <h2 className="text-xl font-bold text-gray-900 mb-3">Squad</h2>
              <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {data.squad.map((s: any) => (
                  <li key={s.id} className="bg-surface border border-border rounded-lg p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                      {s.jerseyNumber ?? (s.isCaptain ? 'C' : '•')}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-gray-900 truncate">
                        {s.athlete.fullName}
                        {s.isCaptain && <span className="ml-1 text-xs text-primary">(C)</span>}
                        {s.isViceCaptain && <span className="ml-1 text-xs text-primary">(VC)</span>}
                      </div>
                      <div className="text-xs text-muted">
                        {s.position ?? 'All-rounder'}
                        {s.jerseyNumber ? ` · #${s.jerseyNumber}` : ''}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {data.fixtures.length > 0 && (
            <section className="mt-8">
              <h2 className="text-xl font-bold text-gray-900 mb-3">Upcoming Fixtures</h2>
              <ul className="space-y-3">
                {data.fixtures.map((m: any) => (
                  <li key={m.id} className="bg-surface border border-border rounded-lg p-4 sm:flex sm:items-center sm:justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-muted uppercase tracking-wide">
                        {m.event?.name ?? 'Match'}
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
                    <span className="mt-3 sm:mt-0 inline-block px-3 py-1 rounded-full bg-blue-50 text-primary text-xs font-semibold self-start">
                      {m.status.replace('_', ' ')}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {data.results.length > 0 && (
            <section className="mt-8">
              <h2 className="text-xl font-bold text-gray-900 mb-3">Recent Results</h2>
              <ul className="space-y-3">
                {data.results.map((m: any) => {
                  const r = m.results;
                  return (
                    <li key={m.id} className="bg-surface border border-border rounded-lg p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0 font-medium text-gray-900">
                          {m.homeTeam?.name ?? m.homeIndividual?.fullName ?? 'TBD'}
                        </div>
                        <div className="px-4 py-1 rounded-md bg-gray-100 font-bold text-gray-900 whitespace-nowrap">
                          {r ? `${r.homeScore} – ${r.awayScore}` : `${m.homeScore ?? 0} – ${m.awayScore ?? 0}`}
                        </div>
                        <div className="min-w-0 text-right font-medium text-gray-900">
                          {m.awayTeam?.name ?? m.awayIndividual?.fullName ?? 'TBD'}
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-muted">
                        {m.event?.name ?? 'Match'} · {formatMatchDate(m.scheduledDate)}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  );
}
