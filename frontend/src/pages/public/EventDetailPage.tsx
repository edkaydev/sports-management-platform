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
    <div className="max-w-6xl mx-auto px-6 sm:px-8 py-14">
      {isLoading ? (
        <div className="py-16 flex justify-center"><Spinner /></div>
      ) : isError || !data ? (
        <div className="py-16">
          <EmptyState message="Event not found" />
          <div className="text-center mt-4">
            <Link to="/events" className="text-[14px] font-medium text-umu-red hover:underline">&larr; Back to all events</Link>
          </div>
        </div>
      ) : (
        <>
          <Link to="/events" className="text-[13px] font-medium text-umu-red hover:underline">&larr; All events</Link>
          <header className="mt-4 rounded-m3-xl bg-surface-dim p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-[32px] font-semibold text-on-surface tracking-tight">{data.event.name}</h1>
                <p className="mt-1 text-[14px] text-on-surface-variant capitalize">
                  {data.event.sport?.name ? `${data.event.sport.name} · ` : ''}
                  {data.event.type.replace('_', ' ')} · {data.event.level.replace('_', ' ')} · {data.event.format.replace('_', ' ')}
                </p>
              </div>
              <span className="shrink-0 px-3 py-1 rounded-full bg-umu-red-light text-[12px] font-medium text-umu-red capitalize">
                {data.event.status.replace('_', ' ')}
              </span>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3 text-[13px]">
              <div className="rounded-m3-sm bg-white/60 p-3">
                <div className="text-[11px] font-medium text-on-surface-variant mb-0.5">Start</div>
                <div className="text-on-surface">{data.event.startDate ? new Date(data.event.startDate).toLocaleDateString() : 'TBD'}</div>
              </div>
              <div className="rounded-m3-sm bg-white/60 p-3">
                <div className="text-[11px] font-medium text-on-surface-variant mb-0.5">End</div>
                <div className="text-on-surface">{data.event.endDate ? new Date(data.event.endDate).toLocaleDateString() : 'TBD'}</div>
              </div>
              <div className="rounded-m3-sm bg-white/60 p-3">
                <div className="text-[11px] font-medium text-on-surface-variant mb-0.5">Venue</div>
                <div className="text-on-surface">{data.event.venue ?? 'TBD'}</div>
              </div>
            </div>
            {data.event.description && (
              <p className="mt-4 max-w-2xl text-[14px] text-on-surface-variant leading-relaxed">{data.event.description}</p>
            )}
          </header>

          {data.standings.length > 0 && (
            <section className="mt-10">
              <h2 className="text-[20px] font-semibold text-on-surface mb-4">Standings</h2>
              <div className="rounded-m3-lg border border-outline-variant bg-white overflow-x-auto">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="text-left text-[11px] uppercase tracking-wide text-on-surface-variant border-b border-outline-variant">
                      <th className="px-4 py-3">#</th>
                      <th className="px-4 py-3">Team</th>
                      <th className="px-4 py-3 text-center">P</th>
                      <th className="px-4 py-3 text-center">W</th>
                      <th className="px-4 py-3 text-center">D</th>
                      <th className="px-4 py-3 text-center">L</th>
                      <th className="px-4 py-3 text-center">GF</th>
                      <th className="px-4 py-3 text-center">GA</th>
                      <th className="px-4 py-3 text-center">GD</th>
                      <th className="px-4 py-3 text-center">Pts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {standingsWithNames(data).map((row, i) => (
                      <tr key={row.teamId} className="border-b border-outline-variant last:border-0">
                        <td className="px-4 py-3 text-on-surface-variant font-medium">{i + 1}</td>
                        <td className="px-4 py-3 font-medium text-on-surface">{row.name}</td>
                        <td className="px-4 py-3 text-center">{row.played}</td>
                        <td className="px-4 py-3 text-center">{row.won}</td>
                        <td className="px-4 py-3 text-center">{row.drawn}</td>
                        <td className="px-4 py-3 text-center">{row.lost}</td>
                        <td className="px-4 py-3 text-center">{row.goalsFor}</td>
                        <td className="px-4 py-3 text-center">{row.goalsAgainst}</td>
                        <td className="px-4 py-3 text-center">{row.goalsFor - row.goalsAgainst}</td>
                        <td className="px-4 py-3 text-center font-semibold text-umu-red">{row.points}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
                      <div className="text-[12px] font-medium text-on-surface-variant mb-1.5">{m.round ? `Round ${m.round}` : 'Match'}</div>
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
              <h2 className="text-[20px] font-semibold text-on-surface mb-4">Results</h2>
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
                      <div className="mt-2 text-[12px] text-on-surface-variant">{m.round ? `Round ${m.round} · ` : ''}{formatMatchDate(m.scheduledDate)}{m.venue ? ` · ${m.venue}` : ''}</div>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {data.participants.length > 0 && data.standings.length === 0 && (
            <section className="mt-10">
              <h2 className="text-[20px] font-semibold text-on-surface mb-4">Participants</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {data.participants.map((p: any) => (
                  <div key={p.id} className="rounded-m3-lg border border-outline-variant bg-white p-5 text-[14px] font-medium text-on-surface">
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
