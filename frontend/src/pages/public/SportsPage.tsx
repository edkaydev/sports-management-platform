import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getPublicSports } from '@/lib/api';
import { Spinner, EmptyState } from '@/components/ui';

function formatGenderLabel(gender?: string | null) {
  if (!gender) return 'Mixed';
  return gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase();
}

export default function SportsPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['public', 'sports'],
    queryFn: getPublicSports,
  });

  return (
    <div className="max-w-6xl mx-auto px-6 sm:px-8 py-14">
      <div className="text-center mb-12">
        <div className="inline-flex items-center rounded-full bg-umu-red-light px-4 py-1.5 mb-4">
          <span className="text-[13px] font-medium text-umu-red">UMU Athletics</span>
        </div>
        <h1 className="text-[32px] font-semibold text-on-surface tracking-tight">Sports</h1>
        <p className="mt-2 text-[15px] text-on-surface-variant max-w-lg mx-auto">
          The sports we run at Uganda Martyrs University.
        </p>
      </div>

      {isLoading ? (
        <div className="py-16 flex justify-center"><Spinner /></div>
      ) : isError ? (
        <div className="py-16"><EmptyState message="Couldn't load sports" /></div>
      ) : !data || data.length === 0 ? (
        <div className="py-16"><EmptyState message="No sports" /></div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((s) => (
            <Link
              key={s.id}
              to={`/sports/${s.id}`}
              className="group rounded-m3-lg border border-outline-variant bg-white p-6 transition hover:shadow-m3-1 hover:border-outline"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-[16px] font-medium text-on-surface group-hover:text-umu-red transition">{s.name}</h3>
                <span className="shrink-0 rounded-full bg-umu-red-light px-2.5 py-0.5 text-[11px] font-medium text-umu-red">
                  {s.category.replace('_', ' ')}
                </span>
              </div>
              <div className="mt-2.5">
                <span className="inline-flex items-center rounded-full bg-surface-dim px-2.5 py-0.5 text-[11px] font-medium text-on-surface-variant">
                  {formatGenderLabel(s.gender)}
                </span>
              </div>
              <div className="mt-4 flex gap-4 text-[13px] text-on-surface-variant">
                <span>{s._count.teams} team{s._count.teams === 1 ? '' : 's'}</span>
                <span>{s._count.matches} match{s._count.matches === 1 ? '' : 'es'}</span>
              </div>
              <div className="mt-4 text-[13px] font-medium text-umu-red opacity-0 group-hover:opacity-100 transition">
                View details &rarr;
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
