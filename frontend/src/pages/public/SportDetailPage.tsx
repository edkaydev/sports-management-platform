import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { getPublicSport } from '@/lib/api';
import { Spinner, EmptyState } from '@/components/ui';
import { formatMatchDate } from './FixturesPage';

export default function SportDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError } = useQuery({
    queryKey: ['public', 'sport', id],
    queryFn: () => getPublicSport(id!),
    enabled: !!id,
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      {isLoading ? (
        <div className="py-16 flex justify-center"><Spinner /></div>
      ) : isError || !data ? (
        <div className="py-16">
          <EmptyState message="Sport not found" />
          <div className="text-center mt-4">
            <Link to="/sports" className="text-sm font-semibold text-primary hover:underline">
              ← Back to all sports
            </Link>
          </div>
        </div>
      ) : (
        <>
          <Link to="/sports" className="text-sm font-semibold text-primary hover:underline">
            ← All sports
          </Link>
          <header className="mt-4 bg-gradient-to-r from-blue-900 to-blue-700 text-white rounded-lg px-6 py-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-3xl font-bold">{data.sport.name}</h1>
                <p className="mt-1 text-blue-100 capitalize">
                  {data.sport.category.replace('_', ' ')} · {data.sport.gender.toLowerCase()}
                </p>
              </div>
              <div className="flex gap-6 text-center">
                <div>
                  <div className="text-2xl font-bold">{data.sport._count.teams}</div>
                  <div className="text-xs text-blue-200 uppercase tracking-wide">Teams</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{data.sport._count.matches}</div>
                  <div className="text-xs text-blue-200 uppercase tracking-wide">Matches</div>
                </div>
              </div>
            </div>
            {data.sport.description && (
              <p className="mt-4 max-w-2xl text-blue-100 text-sm">{data.sport.description}</p>
            )}
          </header>

          {data.teams.length > 0 && (
            <section className="mt-8">
              <h2 className="text-xl font-bold text-gray-900 mb-3">Teams</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {data.teams.map((t) => (
                  <Link
                    key={t.id}
                    to={`/teams/${t.id}`}
                    className="bg-surface border border-border rounded-lg p-5 hover:border-primary/40 hover:shadow-sm transition"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">{t.name}</h3>
                      <span className="px-2 py-0.5 rounded-full bg-gray-100 text-xs font-semibold text-muted capitalize">
                        {t.gender.toLowerCase()}
                      </span>
                    </div>
                    <p className="text-xs text-muted mt-1">
                      {t._count.squadEntries} athletes — {t.homeVenue ?? 'Venue TBD'}
                    </p>
                  </Link>
                ))}
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
                        {m.event?.name ?? 'Match'} · {formatMatchDate(m.scheduledDate)}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {data.events.length > 0 && (
            <section className="mt-8">
              <h2 className="text-xl font-bold text-gray-900 mb-3">Events</h2>
              <ul className="space-y-3">
                {data.events.map((e) => (
                  <li key={e.id} className="bg-surface border border-border rounded-lg p-4">
                    <div className="font-medium text-gray-900">{e.name}</div>
                    <div className="text-xs text-muted mt-0.5">
                      {e.startDate ? new Date(e.startDate).toLocaleDateString() : 'TBD'}
                      {e.endDate ? ` – ${new Date(e.endDate).toLocaleDateString()}` : ''}
                      {e.venue ? ` · ${e.venue}` : ''}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  );
}
