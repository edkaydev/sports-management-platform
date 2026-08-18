import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  getPublicFixtures,
  getPublicResults,
  getPublicEvents,
  getPublicNews,
} from '@/lib/api';
import { Spinner } from '@/components/ui';
import HomeSlider from '@/components/public/HomeSlider';

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
    <div className="bg-[#f5f3f2] text-zinc-900">
      <HomeSlider />

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
