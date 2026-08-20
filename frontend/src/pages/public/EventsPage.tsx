import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getPublicEvents } from '@/lib/api';
import { Spinner, EmptyState } from '@/components/ui';

export default function EventsPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['public', 'events'],
    queryFn: getPublicEvents,
  });

  return (
    <div className="max-w-4xl mx-auto px-6 sm:px-8 py-14">
      <div className="text-center mb-10">
        <div className="inline-flex items-center rounded-full bg-umu-red-light px-4 py-1.5 mb-4">
          <span className="text-[13px] font-medium text-umu-red">Competitions</span>
        </div>
        <h1 className="text-[32px] font-semibold text-on-surface tracking-tight">Events</h1>
        <p className="mt-2 text-[15px] text-on-surface-variant max-w-md mx-auto">
          Competitions, galas, and special fixtures.
        </p>
      </div>

      {isLoading ? (
        <div className="py-16 flex justify-center"><Spinner /></div>
      ) : isError ? (
        <div className="py-16"><EmptyState message="Couldn't load events" /></div>
      ) : !data || data.length === 0 ? (
        <div className="py-16"><EmptyState message="No upcoming events" /></div>
      ) : (
        <ul className="space-y-3">
          {data.map((e) => (
            <li key={e.id} className="rounded-m3-lg border border-outline-variant bg-white transition hover:shadow-m3-1 overflow-hidden">
              <Link to={`/events/${e.id}`} className="block p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-[16px] font-medium text-on-surface hover:text-umu-red transition">{e.name}</h3>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="rounded-full bg-umu-red-light px-2.5 py-0.5 text-[11px] font-medium text-umu-red capitalize">
                        {e.type.replace('_', ' ')}
                      </span>
                      <span className="text-[12px] text-on-surface-variant">
                        {e.sport?.name ? `${e.sport.name} · ` : ''}{e.level.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  <span className="shrink-0 rounded-full bg-surface-dim px-3 py-1 text-[12px] font-medium text-on-surface-variant capitalize">
                    {e.status.toLowerCase()}
                  </span>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-3 text-[13px]">
                  <div className="rounded-m3-sm bg-surface-dim p-3">
                    <div className="text-[11px] font-medium text-on-surface-variant mb-0.5">Start</div>
                    <div className="text-on-surface">{e.startDate ? new Date(e.startDate).toLocaleDateString() : 'TBD'}</div>
                  </div>
                  <div className="rounded-m3-sm bg-surface-dim p-3">
                    <div className="text-[11px] font-medium text-on-surface-variant mb-0.5">End</div>
                    <div className="text-on-surface">{e.endDate ? new Date(e.endDate).toLocaleDateString() : 'TBD'}</div>
                  </div>
                  <div className="rounded-m3-sm bg-surface-dim p-3">
                    <div className="text-[11px] font-medium text-on-surface-variant mb-0.5">Venue</div>
                    <div className="text-on-surface">{e.venue ?? 'TBD'}</div>
                  </div>
                </div>
                {e.description && (
                  <p className="mt-3 text-[13px] text-on-surface-variant line-clamp-2">{e.description}</p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
