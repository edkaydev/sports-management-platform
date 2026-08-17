import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { getPublicEvent, PublicEventDetail } from '@/lib/api';
import { Spinner, EmptyState } from '@/components/ui';
import { formatMatchDate } from './FixturesPage';

function standingsWithNames(data: PublicEventDetail) {
  const nameById = new Map<string, string>();
  for (const p of data.participants) {
    if (p.team) nameById.set(p.team.id, p.team.name);
    if (p.athlete) nameById.set(p.athlete.id, p.athlete.fullName);
  }
  return data.standings.map((row) => ({
    ...row,
    name: nameById.get(row.teamId) ?? 'Unknown',
  }));
}

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError } = useQuery({
    queryKey: ['public', 'event', id],
    queryFn: () => getPublicEvent(id!),
    enabled: !!id,
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      {isLoading ? (
        <div className="py-16 flex justify-center"><Spinner /></div>
      ) : isError || !data ? (
        <div className="py-16">
          <EmptyState message="Event not found" />
          <div className="text-center mt-4">
            <Link to="/events" className="text-sm font-semibold text-primary hover:underline">
              ← Back to all events
            </Link>
          </div>
        </div>
      ) : (
        <>
          <Link to="/events" className="text-sm font-semibold text-primary hover:underline">
            ← All events
          </Link>
          <header className="mt-4 bg-gradient-to-r from-blue-900 to-blue-700 text-white rounded-lg px-6 py-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-3xl font-bold">{data.event.name}</h1>
                <p className="mt-1 text-blue-100 capitalize">
                  {data.event.sport?.name ? `${data.event.sport.name} · ` : ''}
                  {data.event.type.replace('_', ' ')} · {data.event.level.replace('_', ' ')} · {data.event.format.replace('_', ' ')}
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-white/15 text-xs font-semibold uppercase tracking-wide">
                {data.event.status.replace('_', ' ')}
              </span>
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-3 text-sm text-blue-100">
              <div>
                <span className="text-blue-300">Start:</span>{' '}
                {data.event.startDate ? new Date(data.event.startDate).toLocaleDateString() : 'TBD'}
              </div>
              <div>
                <span className="text-blue-300">End:</span>{' '}
                {data.event.endDate ? new Date(data.event.endDate).toLocaleDateString() : 'TBD'}
              </div>
              <div>
                <span className="text-blue-300">Venue:</span> {data.event.venue ?? 'TBD'}
              </div>
            </div>
            {data.event.description && (
              <p className="mt-4 max-w-2xl text-blue-100 text-sm">{data.event.description}</p>
            )}
          </header>

          {data.standings.length > 0 && (
            <section className="mt-8">
              <h2 className="text-xl font-bold text-gray-900 mb-3">Standings</h2>
              <div className="bg-surface border border-border rounded-lg overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wide text-muted border-b border-border">
                      <th className="px-4 py-2">#</th>
                      <th className="px-4 py-2">Team</th>
                      <th className="px-4 py-2 text-center">P</th>
                      <th className="px-4 py-2 text-center">W</th>
                      <th className="px-4 py-2 text-center">D</th>
                      <th className="px-4 py-2 text-center">L</th>
                      <th className="px-4 py-2 text-center">GF</th>
                      <th className="px-4 py-2 text-center">GA</th>
                      <th className="px-4 py-2 text-center">GD</th>
                      <th className="px-4 py-2 text-center">Pts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {standingsWithNames(data).map((row, i) => (
                      <tr key={row.teamId} className="border-b border-border last:border-0">
                        <td className="px-4 py-2 font-semibold text-muted">{i + 1}</td>
                        <td className="px-4 py-2 font-medium text-gray-900">{row.name}</td>
                        <td className="px-4 py-2 text-center">{row.played}</td>
                        <td className="px-4 py-2 text-center">{row.won}</td>
                        <td className="px-4 py-2 text-center">{row.drawn}</td>
                        <td className="px-4 py-2 text-center">{row.lost}</td>
                        <td className="px-4 py-2 text-center">{row.goalsFor}</td>
                        <td className="px-4 py-2 text-center">{row.goalsAgainst}</td>
                        <td className="px-4 py-2 text-center">{row.goalsFor - row.goalsAgainst}</td>
                        <td className="px-4 py-2 text-center font-bold text-primary">{row.points}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {data.fixtures.length > 0 && (
            <section className="mt-8">
              <h2 className="text-xl font-bold text-gray-900 mb-3">Upcoming Fixtures</h2>
              <ul className="space-y-3">
                {data.fixtures.map((m) => (
                  <li key={m.id} className="bg-surface border border-border rounded-lg p-4 sm:flex sm:items-center sm:justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-muted uppercase tracking-wide">
                        {m.round ? `Round ${m.round}` : 'Match'}
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
              <h2 className="text-xl font-bold text-gray-900 mb-3">Results</h2>
              <ul className="space-y-3">
                {data.results.map((m) => {
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
                        {m.round ? `Round ${m.round} · ` : ''}
                        {formatMatchDate(m.scheduledDate)}
                        {m.venue ? ` · ${m.venue}` : ''}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {data.participants.length > 0 && data.standings.length === 0 && (
            <section className="mt-8">
              <h2 className="text-xl font-bold text-gray-900 mb-3">Participants</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {data.participants.map((p) => (
                  <div key={p.id} className="bg-surface border border-border rounded-lg p-4 font-medium text-gray-900">
                    {p.team?.name ?? p.athlete?.fullName ?? 'TBD'}
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
