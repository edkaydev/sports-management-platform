import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getPublicSports } from '@/lib/api';
import { PageHeader, Spinner, EmptyState } from '@/components/ui';

export default function SportsPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['public', 'sports'],
    queryFn: getPublicSports,
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <PageHeader title="Sports" subtitle="The sports we run at Uganda Martyrs University." />
      {isLoading ? (
        <div className="py-16 flex justify-center"><Spinner /></div>
      ) : isError ? (
        <div className="py-16"><EmptyState message="Couldn't load sports" /></div>
      ) : !data || data.length === 0 ? (
        <div className="py-16"><EmptyState message="No sports" /></div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((s) => (
            <div key={s.id} className="bg-surface border border-border rounded-lg p-5">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">{s.name}</h3>
                <span className="px-2 py-0.5 rounded-full bg-blue-50 text-primary text-xs font-semibold">
                  {s.category.replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs text-muted mt-1 capitalize">{s.gender.toLowerCase()}</p>
              <div className="mt-4 flex gap-4 text-sm text-muted">
                <span>{s._count.teams} team{s._count.teams === 1 ? '' : 's'}</span>
                <span>{s._count.matches} match{s._count.matches === 1 ? '' : 'es'}</span>
              </div>
              <Link to={`/sports/${s.id}`} className="mt-3 inline-block text-sm font-semibold text-primary hover:underline">
                View details →
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
