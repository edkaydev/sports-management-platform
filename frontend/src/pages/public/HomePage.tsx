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

function SectionHeader({ title, to }: { title: string; to: string }) {
  return (
    <div className="mb-5 flex items-end justify-between">
      <h2 className="text-[22px] font-semibold text-on-surface tracking-tight">{title}</h2>
      <Link
        to={to}
        className="group inline-flex items-center gap-1 text-[13px] font-medium text-umu-red"
      >
        View all
        <svg className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </Link>
    </div>
  );
}

const stats = [
  {
    label: 'Sports',
    value: '14',
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" /></svg>,
    color: 'bg-umu-red-light text-umu-red',
  },
  {
    label: 'Teams',
    value: '11',
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" /></svg>,
    color: 'bg-blue-50 text-blue-600',
  },
  {
    label: 'Athletes',
    value: '100+',
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>,
    color: 'bg-green-50 text-green-600',
  },
  {
    label: 'Events',
    value: '20+',
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>,
    color: 'bg-amber-50 text-amber-600',
  },
];

export default function HomePage() {
  const fixtures = useQuery({ queryKey: ['public', 'fixtures'], queryFn: getPublicFixtures });
  const results = useQuery({ queryKey: ['public', 'results'], queryFn: getPublicResults });
  const events = useQuery({ queryKey: ['public', 'events'], queryFn: getPublicEvents });
  const news = useQuery({ queryKey: ['public', 'news'], queryFn: getPublicNews });

  const loading = fixtures.isLoading || results.isLoading || events.isLoading || news.isLoading;
  const featured = news.data?.news.find((n: any) => n.featured) ?? news.data?.news[0];

  return (
    <div className="bg-white text-on-surface">
      <HomeSlider />

      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      ) : (
        <>
          <section className="mx-auto max-w-6xl px-6 sm:px-8 py-12">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="group rounded-m3-lg border border-outline-variant bg-white p-5 text-center transition-all hover:shadow-m3-1 hover:border-outline cursor-default">
                  <div className={`inline-flex items-center justify-center rounded-full p-2.5 ${stat.color} transition-transform group-hover:scale-110`}>
                    {stat.icon}
                  </div>
                  <div className="mt-3 text-[22px] font-semibold text-on-surface">{stat.value}</div>
                  <p className="mt-0.5 text-[13px] font-medium text-on-surface-variant">{stat.label}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mx-auto max-w-6xl px-6 sm:px-8 pb-14">
            <SectionHeader title="Upcoming fixtures" to="/fixtures" />
            {fixtures.data && fixtures.data.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {fixtures.data.slice(0, 4).map((m) => (
                  <div
                    key={m.id}
                    className="group rounded-m3-lg border border-outline-variant bg-white p-5 transition-all hover:shadow-m3-1 hover:border-outline"
                  >
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-umu-red-light px-2.5 py-0.5 text-[11px] font-medium text-umu-red">
                        {m.sport.name}
                      </span>
                      {m.event?.name && (
                        <span className="text-[11px] text-on-surface-variant">{m.event.name}</span>
                      )}
                    </div>
                    <div className="mt-4 flex items-center justify-between gap-3">
                      <span className="text-[15px] font-medium text-on-surface truncate min-w-0 flex-1 text-right">
                        {m.homeTeam?.name ?? m.homeIndividual?.fullName ?? 'TBD'}
                      </span>
                      <div className="shrink-0 rounded-full bg-surface-dim px-3 py-1 text-[12px] font-semibold text-on-surface-variant">
                        vs
                      </div>
                      <span className="text-[15px] font-medium text-on-surface truncate min-w-0 flex-1">
                        {m.awayTeam?.name ?? m.awayIndividual?.fullName ?? 'TBD'}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-[13px] text-on-surface-variant">{formatDate(m.scheduledDate)}</span>
                      {m.venue && (
                        <span className="text-[12px] text-on-surface-variant">{m.venue}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[14px] text-on-surface-variant py-8 text-center rounded-m3-lg border border-dashed border-outline-variant">
                No upcoming fixtures yet.
              </p>
            )}
          </section>

          <section className="bg-surface-dim">
            <div className="mx-auto grid max-w-6xl gap-8 px-6 py-14 sm:px-8 lg:grid-cols-2">
              <div>
                <SectionHeader title="Latest results" to="/results" />
                {results.data && results.data.length > 0 ? (
                  <ul className="space-y-2.5">
                    {results.data.slice(0, 5).map((m) => (
                      <li
                        key={m.id}
                        className="flex items-center justify-between gap-4 rounded-m3-lg bg-white border border-outline-variant p-4 transition-all hover:shadow-m3-1 hover:border-outline"
                      >
                        <div className="min-w-0">
                          <div className="text-[14px] font-medium text-on-surface truncate">
                            {m.homeTeam?.name ?? m.homeIndividual?.fullName ?? 'TBD'}
                            <span className="mx-1.5 text-on-surface-variant font-normal">vs</span>
                            {m.awayTeam?.name ?? m.awayIndividual?.fullName ?? 'TBD'}
                          </div>
                          <div className="mt-0.5 text-[12px] text-on-surface-variant">{formatDate(m.scheduledDate)}</div>
                        </div>
                        <div className="whitespace-nowrap text-[17px] font-semibold text-on-surface px-3 py-1 rounded-full bg-surface-dim">
                          {m.results
                            ? `${m.results.homeScore} – ${m.results.awayScore}`
                            : `${m.homeScore ?? 0} – ${m.awayScore ?? 0}`}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-[14px] text-on-surface-variant py-8 text-center rounded-m3-lg border border-dashed border-outline-variant">
                    No results yet.
                  </p>
                )}
              </div>

              <div>
                <SectionHeader title="Upcoming events" to="/events" />
                {events.data && events.data.length > 0 ? (
                  <ul className="space-y-2.5">
                    {events.data.slice(0, 5).map((e) => (
                      <li key={e.id} className="rounded-m3-lg bg-white border border-outline-variant p-4 transition-all hover:shadow-m3-1 hover:border-outline">
                        <div className="text-[14px] font-medium text-on-surface">{e.name}</div>
                        <div className="mt-1 text-[12px] text-on-surface-variant">
                          {e.sport?.name ? `${e.sport.name} · ` : ''}
                          {e.startDate ? new Date(e.startDate).toLocaleDateString() : 'TBD'}
                          {e.venue ? ` · ${e.venue}` : ''}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-[14px] text-on-surface-variant py-8 text-center rounded-m3-lg border border-dashed border-outline-variant">
                    No upcoming events.
                  </p>
                )}
              </div>
            </div>
          </section>

          {featured && (
            <section className="mx-auto max-w-6xl px-6 sm:px-8 py-14">
              <SectionHeader title="Latest news" to="/news" />
              <div className="overflow-hidden rounded-m3-xl border border-outline-variant bg-white shadow-m3-1 sm:grid sm:grid-cols-3">
                <div className="p-8 sm:col-span-2">
                  <div className="mb-3 inline-flex items-center rounded-full bg-umu-red-light px-3 py-1 text-[11px] font-medium text-umu-red">
                    {featured.tags ?? 'Announcement'}
                  </div>
                  <Link
                    to={`/news/${featured.slug}`}
                    className="text-[22px] font-semibold text-on-surface transition hover:text-umu-red leading-snug"
                  >
                    {featured.title}
                  </Link>
                  <p className="mt-3 text-[14px] text-on-surface-variant leading-relaxed">{featured.excerpt}</p>
                  <Link
                    to={`/news/${featured.slug}`}
                    className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-umu-red px-5 py-2.5 text-[13px] font-medium text-white transition-all hover:bg-umu-red-dark hover:shadow-m3-1 active:scale-[0.97]"
                  >
                    Read more
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </Link>
                </div>
                {featured.coverImage && (
                  <div
                    className="min-h-48 bg-cover bg-center sm:min-h-full"
                    style={{ backgroundImage: `url(${featured.coverImage})` }}
                  />
                )}
              </div>
            </section>
          )}

          <section className="mx-auto max-w-6xl px-6 sm:px-8 pb-16">
            <div className="relative overflow-hidden rounded-m3-xl bg-umu-red p-10 sm:p-14 text-center">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-[-50%] left-[-10%] h-[400px] w-[400px] rounded-full bg-white blur-3xl" />
                <div className="absolute bottom-[-30%] right-[-5%] h-[300px] w-[300px] rounded-full bg-white blur-3xl" />
              </div>
              <div className="relative z-10">
                <h3 className="text-[24px] font-semibold text-white">
                  Ready to get started?
                </h3>
                <p className="mt-3 text-[15px] text-white/80 max-w-md mx-auto">
                  Sign in to manage your athlete profile, track performance, and stay updated.
                </p>
                <Link
                  to="/login"
                  className="mt-7 inline-flex items-center rounded-full bg-white px-7 py-3 text-[14px] font-medium text-umu-red transition-all hover:shadow-m3-2 active:scale-[0.97]"
                >
                  Sign in to UMU Sports
                </Link>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
