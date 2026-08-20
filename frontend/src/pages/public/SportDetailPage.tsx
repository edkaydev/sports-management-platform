import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { getPublicSport } from '@/lib/api';
import { Spinner, EmptyState } from '@/components/ui';
import { formatMatchDate } from './FixturesPage';

function formatGenderLabel(gender?: string | null) {
  if (!gender) return 'Mixed';
  return gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase();
}

export default function SportDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError } = useQuery({
    queryKey: ['public', 'sport', id],
    queryFn: () => getPublicSport(id!),
    enabled: !!id,
  });

  return (
    <div className="max-w-6xl mx-auto px-6 sm:px-8 py-14">
      {isLoading ? (
        <div className="py-16 flex justify-center"><Spinner /></div>
      ) : isError || !data ? (
        <div className="py-16">
          <EmptyState message="Sport not found" />
          <div className="text-center mt-4">
            <Link to="/sports" className="text-[14px] font-medium text-umu-red hover:underline">&larr; Back to all sports</Link>
          </div>
        </div>
      ) : (
        <>
          <Link to="/sports" className="text-[13px] font-medium text-umu-red hover:underline">&larr; All sports</Link>
          <header className="mt-4 rounded-m3-xl bg-surface-dim p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-[32px] font-semibold text-on-surface tracking-tight">{data.sport.name}</h1>
                <p className="mt-1 text-[14px] text-on-surface-variant capitalize">
                  {data.sport.category.replace('_', ' ')} · {formatGenderLabel(data.sport.gender)}
                </p>
              </div>
              <div className="flex gap-8 text-center">
                <div>
                  <div className="text-[28px] font-semibold text-on-surface">{data.sport._count.teams}</div>
                  <div className="text-[11px] font-medium text-on-surface-variant uppercase tracking-wide">Teams</div>
                </div>
                <div>
                  <div className="text-[28px] font-semibold text-on-surface">{data.sport._count.matches}</div>
                  <div className="text-[11px] font-medium text-on-surface-variant uppercase tracking-wide">Matches</div>
                </div>
              </div>
            </div>
            {data.sport.description && (
              <p className="mt-4 max-w-2xl text-[14px] text-on-surface-variant leading-relaxed">{data.sport.description}</p>
            )}
          </header>

          {data.teams.length > 0 && (
            <section className="mt-10">
              <h2 className="text-[20px] font-semibold text-on-surface mb-4">Teams</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {data.teams.map((t: any) => (
                  <Link key={t.id} to={`/teams/${t.id}`} className="group rounded-m3-lg border border-outline-variant bg-white p-5 transition hover:shadow-m3-1 hover:border-outline">
                    <div className="flex items-center justify-between">
                      <h3 className="text-[15px] font-medium text-on-surface group-hover:text-umu-red transition">{t.name}</h3>
                      <span className="shrink-0 rounded-full bg-surface-dim px-2.5 py-0.5 text-[11px] font-medium text-on-surface-variant capitalize">{t.gender.toLowerCase()}</span>
                    </div>
                    <p className="text-[13px] text-on-surface-variant mt-1.5">{t._count.squadEntries} athletes · {t.homeVenue ?? 'Venue TBD'}</p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {data.fixtures.length > 0 && (
            <section className="mt-10">
              <h2 className="text-[20px] font-semibold text-on-surface mb-4">Upcoming Fixtures</h2>
              <ul className="space-y-2.5">
                {data.fixtures.map((m: any) => (
                  <li key={m.id} className="rounded-m3-lg border border-outline-variant bg-white p-5 sm:flex sm:items-center sm:justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[12px] font-medium text-on-surface-variant">{m.event?.name ?? 'Match'}</span>
                        {m.round && <span className="text-[12px] text-on-surface-variant">· {m.round}</span>}
                      </div>
                      <div className="text-[15px] font-medium text-on-surface">
                        {m.homeTeam?.name ?? m.homeIndividual?.fullName ?? 'TBD'}
                        <span className="mx-2 text-on-surface-variant font-normal">vs</span>
                        {m.awayTeam?.name ?? m.awayIndividual?.fullName ?? 'TBD'}
                      </div>
                      <div className="text-[13px] text-on-surface-variant mt-1">{formatMatchDate(m.scheduledDate)}{m.venue ? ` · ${m.venue}` : ''}</div>
                    </div>
                    <span className="mt-3 sm:mt-0 shrink-0 inline-block px-3 py-1 rounded-full bg-surface-dim text-[12px] font-medium text-on-surface-variant capitalize">{m.status.replace('_', ' ')}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {data.results.length > 0 && (
            <section className="mt-10">
              <h2 className="text-[20px] font-semibold text-on-surface mb-4">Recent Results</h2>
              <ul className="space-y-2.5">
                {data.results.map((m: any) => {
                  const r = m.results;
                  return (
                    <li key={m.id} className="rounded-m3-lg border border-outline-variant bg-white p-5">
                      <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0 text-[15px] font-medium text-on-surface">{m.homeTeam?.name ?? m.homeIndividual?.fullName ?? 'TBD'}</div>
                        <div className="px-4 py-1.5 rounded-full bg-surface-dim text-[17px] font-semibold text-on-surface whitespace-nowrap">{r ? `${r.homeScore} – ${r.awayScore}` : `${m.homeScore ?? 0} – ${m.awayScore ?? 0}`}</div>
                        <div className="min-w-0 text-right text-[15px] font-medium text-on-surface">{m.awayTeam?.name ?? m.awayIndividual?.fullName ?? 'TBD'}</div>
                      </div>
                      <div className="mt-2 text-[12px] text-on-surface-variant">{m.event?.name ?? 'Match'} · {formatMatchDate(m.scheduledDate)}</div>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {data.events.length > 0 && (
            <section className="mt-10">
              <h2 className="text-[20px] font-semibold text-on-surface mb-4">Events</h2>
              <ul className="space-y-2.5">
                {data.events.map((e: any) => (
                  <li key={e.id} className="rounded-m3-lg border border-outline-variant bg-white p-5">
                    <div className="text-[15px] font-medium text-on-surface">{e.name}</div>
                    <div className="text-[12px] text-on-surface-variant mt-1">
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
