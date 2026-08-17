import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  getPublicFixtures,
  getPublicResults,
  getPublicEvents,
  getPublicNews,
} from '@/lib/api';
import { Spinner } from '@/components/ui';

function formatDate(value: string | null): string {
  if (!value) return 'TBD';
  return new Date(value).toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function HomePage() {
  const fixtures = useQuery({ queryKey: ['public', 'fixtures'], queryFn: getPublicFixtures });
  const results = useQuery({ queryKey: ['public', 'results'], queryFn: getPublicResults });
  const events = useQuery({ queryKey: ['public', 'events'], queryFn: getPublicEvents });
  const news = useQuery({ queryKey: ['public', 'news'], queryFn: getPublicNews });

  const loading = fixtures.isLoading || results.isLoading || events.isLoading || news.isLoading;
  const featured = news.data?.news.find((n) => n.featured) ?? news.data?.news[0];

  return (
    <div>
      <section className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <p className="text-blue-200 text-sm font-semibold tracking-widest uppercase mb-3">
            Uganda Martyrs University
          </p>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight leading-tight">
            Home of the UMU Saints
          </h1>
          <p className="mt-4 max-w-2xl text-blue-100 text-base sm:text-lg">
            Follow fixtures, results, teams, and events from the UMU Sports Department — and
            support our student-athletes across football, netball, basketball, rugby, and more.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/fixtures"
              className="px-6 py-3 rounded-md bg-white text-primary font-semibold hover:bg-blue-50"
            >
              View Fixtures
            </Link>
            <Link
              to="/results"
              className="px-6 py-3 rounded-md border border-white/40 text-white font-semibold hover:bg-white/10"
            >
              Latest Results
            </Link>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="py-16 flex justify-center"><Spinner /></div>
      ) : (
        <>
          <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Upcoming Fixtures</h2>
              <Link to="/fixtures" className="text-sm font-semibold text-primary hover:underline">
                View all →
              </Link>
            </div>
            {fixtures.data && fixtures.data.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {fixtures.data.slice(0, 4).map((m) => (
                  <div key={m.id} className="bg-surface border border-border rounded-lg p-4">
                    <div className="text-xs font-semibold text-muted uppercase tracking-wide">
                      {m.sport.name} · {m.event?.name ?? 'Match'}
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-3">
                      <span className="font-medium text-gray-900">
                        {m.homeTeam?.name ?? m.homeIndividual?.fullName ?? 'TBD'}
                      </span>
                      <span className="text-muted text-sm">vs</span>
                      <span className="font-medium text-gray-900 text-right">
                        {m.awayTeam?.name ?? m.awayIndividual?.fullName ?? 'TBD'}
                      </span>
                    </div>
                    <div className="mt-2 text-sm text-muted">{formatDate(m.scheduledDate)}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted text-sm">No upcoming fixtures yet.</p>
            )}
          </section>

          <section className="bg-gray-50 border-y border-border">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 grid gap-10 lg:grid-cols-2">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Latest Results</h2>
                  <Link to="/results" className="text-sm font-semibold text-primary hover:underline">
                    View all →
                  </Link>
                </div>
                {results.data && results.data.length > 0 ? (
                  <ul className="space-y-3">
                    {results.data.slice(0, 5).map((m) => (
                      <li key={m.id} className="bg-surface border border-border rounded-lg p-4 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate font-medium text-gray-900">
                            {m.homeTeam?.name ?? m.homeIndividual?.fullName ?? 'TBD'}{' '}
                            <span className="text-muted font-normal">vs</span>{' '}
                            {m.awayTeam?.name ?? m.awayIndividual?.fullName ?? 'TBD'}
                          </div>
                          <div className="text-xs text-muted mt-0.5">{formatDate(m.scheduledDate)}</div>
                        </div>
                        <div className="font-bold text-primary text-lg whitespace-nowrap">
                          {m.results
                            ? `${m.results.homeScore} – ${m.results.awayScore}`
                            : `${m.homeScore ?? 0} – ${m.awayScore ?? 0}`}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted text-sm">No results yet.</p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Upcoming Events</h2>
                  <Link to="/events" className="text-sm font-semibold text-primary hover:underline">
                    View all →
                  </Link>
                </div>
                {events.data && events.data.length > 0 ? (
                  <ul className="space-y-3">
                    {events.data.slice(0, 5).map((e) => (
                      <li key={e.id} className="bg-surface border border-border rounded-lg p-4">
                        <div className="font-medium text-gray-900">{e.name}</div>
                        <div className="text-xs text-muted mt-0.5">
                          {e.sport?.name ? `${e.sport.name} · ` : ''}
                          {e.startDate ? new Date(e.startDate).toLocaleDateString() : 'TBD'}
                          {e.venue ? ` · ${e.venue}` : ''}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted text-sm">No upcoming events.</p>
                )}
              </div>
            </div>
          </section>

          {featured && (
            <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Latest News</h2>
                <Link to="/news" className="text-sm font-semibold text-primary hover:underline">
                  View all →
                </Link>
              </div>
              <div className="bg-surface border border-border rounded-lg overflow-hidden sm:grid sm:grid-cols-3">
                <div className="sm:col-span-2 p-6">
                  <div className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">
                    {featured.tags ?? 'Announcement'}
                  </div>
                  <Link
                    to={`/news/${featured.slug}`}
                    className="text-xl font-bold text-gray-900 hover:text-primary"
                  >
                    {featured.title}
                  </Link>
                  <p className="mt-2 text-sm text-muted">{featured.excerpt}</p>
                  <Link
                    to={`/news/${featured.slug}`}
                    className="inline-block mt-4 text-sm font-semibold text-primary hover:underline"
                  >
                    Read more →
                  </Link>
                </div>
                {featured.coverImage && (
                  <div
                    className="min-h-40 bg-cover bg-center"
                    style={{ backgroundImage: `url(${featured.coverImage})` }}
                  />
                )}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
