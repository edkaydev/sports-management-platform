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

  const heroStats = [
    { label: 'Fixtures', value: '12', icon: '📅' },
    { label: 'Results', value: '08', icon: '🏆' },
    { label: 'Teams', value: '14', icon: '👥' },
    { label: 'Events', value: '05', icon: '🎯' },
  ];

  return (
    <div className="bg-[#f5f3f2] text-zinc-900">
      <section className="bg-gradient-to-r from-[#111111] via-[#2d0707] to-[#b91c1c] text-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="grid items-end gap-10 lg:grid-cols-[1.4fr_0.6fr]">
            <div>
              <p className="mb-3 text-sm font-bold uppercase tracking-[0.28em] text-red-200">
                Uganda Martyrs University
              </p>
              <h1 className="text-3xl font-black leading-tight tracking-tight sm:text-5xl">
                Home of the UMU Saints
              </h1>
              <p className="mt-4 max-w-2xl text-base text-red-50 sm:text-lg">
                Follow fixtures, results, teams, and events from the UMU Sports Department —
                and support our student-athletes across football, netball, basketball, rugby, and more.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/fixtures"
                  className="rounded-md bg-white px-6 py-3 text-sm font-bold text-red-700 shadow-sm transition hover:bg-red-50"
                >
                  View Fixtures
                </Link>
                <Link
                  to="/results"
                  className="rounded-md border border-white/50 bg-white/5 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10"
                >
                  Latest Results
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {heroStats.map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm"
                >
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-lg">
                    {item.icon}
                  </div>
                  <div className="text-2xl font-black text-white">{item.value}</div>
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-red-100">
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : (
        <>
          <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-black text-zinc-900">Upcoming Fixtures</h2>
              <Link to="/fixtures" className="text-sm font-bold text-red-700 hover:underline">
                View all →
              </Link>
            </div>

            {fixtures.data && fixtures.data.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {fixtures.data.slice(0, 4).map((m) => (
                  <div
                    key={m.id}
                    className="rounded-2xl border-2 border-red-100 bg-white p-4 shadow-sm"
                  >
                    <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-red-700">
                      {m.sport.name} · {m.event?.name ?? 'Match'}
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <span className="font-bold text-zinc-900">
                        {m.homeTeam?.name ?? m.homeIndividual?.fullName ?? 'TBD'}
                      </span>
                      <span className="text-sm font-semibold text-zinc-500">vs</span>
                      <span className="text-right font-bold text-zinc-900">
                        {m.awayTeam?.name ?? m.awayIndividual?.fullName ?? 'TBD'}
                      </span>
                    </div>
                    <div className="mt-3 text-sm text-zinc-600">{formatDate(m.scheduledDate)}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-zinc-600">No upcoming fixtures yet.</p>
            )}
          </section>

          <section className="border-y border-red-100 bg-white">
            <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-2">
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-2xl font-black text-zinc-900">Latest Results</h2>
                  <Link to="/results" className="text-sm font-bold text-red-700 hover:underline">
                    View all →
                  </Link>
                </div>

                {results.data && results.data.length > 0 ? (
                  <ul className="space-y-3">
                    {results.data.slice(0, 5).map((m) => (
                      <li
                        key={m.id}
                        className="flex items-center justify-between gap-3 rounded-2xl border border-red-100 bg-[#fff7f7] p-4"
                      >
                        <div className="min-w-0">
                          <div className="truncate font-bold text-zinc-900">
                            {m.homeTeam?.name ?? m.homeIndividual?.fullName ?? 'TBD'}{' '}
                            <span className="font-normal text-zinc-500">vs</span>{' '}
                            {m.awayTeam?.name ?? m.awayIndividual?.fullName ?? 'TBD'}
                          </div>
                          <div className="mt-1 text-xs text-zinc-500">{formatDate(m.scheduledDate)}</div>
                        </div>
                        <div className="whitespace-nowrap text-xl font-black text-red-700">
                          {m.results
                            ? `${m.results.homeScore} – ${m.results.awayScore}`
                            : `${m.homeScore ?? 0} – ${m.awayScore ?? 0}`}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-zinc-600">No results yet.</p>
                )}
              </div>

              <div>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-2xl font-black text-zinc-900">Upcoming Events</h2>
                  <Link to="/events" className="text-sm font-bold text-red-700 hover:underline">
                    View all →
                  </Link>
                </div>

                {events.data && events.data.length > 0 ? (
                  <ul className="space-y-3">
                    {events.data.slice(0, 5).map((e) => (
                      <li key={e.id} className="rounded-2xl border border-red-100 bg-[#fff7f7] p-4">
                        <div className="font-bold text-zinc-900">{e.name}</div>
                        <div className="mt-1 text-xs text-zinc-600">
                          {e.sport?.name ? `${e.sport.name} · ` : ''}
                          {e.startDate ? new Date(e.startDate).toLocaleDateString() : 'TBD'}
                          {e.venue ? ` · ${e.venue}` : ''}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-zinc-600">No upcoming events.</p>
                )}
              </div>
            </div>
          </section>

          {featured && (
            <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-black text-zinc-900">Latest News</h2>
                <Link to="/news" className="text-sm font-bold text-red-700 hover:underline">
                  View all →
                </Link>
              </div>

              <div className="overflow-hidden rounded-3xl border-2 border-red-100 bg-white shadow-sm sm:grid sm:grid-cols-3">
                <div className="p-6 sm:col-span-2">
                  <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-red-700">
                    {featured.tags ?? 'Announcement'}
                  </div>
                  <Link
                    to={`/news/${featured.slug}`}
                    className="text-2xl font-black text-zinc-900 transition hover:text-red-700"
                  >
                    {featured.title}
                  </Link>
                  <p className="mt-3 text-sm text-zinc-600">{featured.excerpt}</p>
                  <Link
                    to={`/news/${featured.slug}`}
                    className="mt-5 inline-block text-sm font-bold text-red-700 hover:underline"
                  >
                    Read more →
                  </Link>
                </div>

                {featured.coverImage && (
                  <div
                    className="min-h-52 bg-cover bg-center"
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
