import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getPublicEvents } from '@/lib/api';
import { PageHeader, Spinner, EmptyState } from '@/components/ui';

export default function EventsPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['public', 'events'],
    queryFn: getPublicEvents,
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <PageHeader title="Events" subtitle="Competitions, galas, and special fixtures." />
      {isLoading ? (
        <div className="py-16 flex justify-center"><Spinner /></div>
      ) : isError ? (
        <div className="py-16"><EmptyState message="Couldn't load events" /></div>
      ) : !data || data.length === 0 ? (
        <div className="py-16"><EmptyState message="No upcoming events" /></div>
      ) : (
        <ul className="space-y-3">
          {data.map((e) => (
            <li key={e.id} className="bg-surface border border-border rounded-lg p-5">
              <Link to={`/events/${e.id}`} className="block">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 hover:text-primary">{e.name}</h3>
                    <div className="text-sm text-muted mt-1">
                      {e.sport?.name ? `${e.sport.name} · ` : ''}
                      {e.type.replace('_', ' ')} · {e.level.replace('_', ' ')}
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-blue-50 text-primary text-xs font-semibold capitalize">
                    {e.status.toLowerCase()}
                  </span>
                </div>
                <div className="mt-3 grid gap-2 sm:grid-cols-3 text-sm text-gray-700">
                  <div>
                    <div className="text-xs text-muted">Start</div>
                    {e.startDate ? new Date(e.startDate).toLocaleDateString() : 'TBD'}
                  </div>
                  <div>
                    <div className="text-xs text-muted">End</div>
                    {e.endDate ? new Date(e.endDate).toLocaleDateString() : 'TBD'}
                  </div>
                  <div>
                    <div className="text-xs text-muted">Venue</div>
                    {e.venue ?? 'TBD'}
                  </div>
                </div>
                {e.description && <p className="mt-3 text-sm text-muted">{e.description}</p>}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
