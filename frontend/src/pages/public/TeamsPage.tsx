import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getPublicTeams, getPublicSports } from '@/lib/api';
import { Spinner, EmptyState } from '@/components/ui';

function formatGenderLabel(gender?: string | null) {
  if (!gender) return 'Mixed';
  return gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase();
}

export default function TeamsPage() {
  const teams = useQuery({ queryKey: ['public', 'teams'], queryFn: getPublicTeams });
  const sports = useQuery({ queryKey: ['public', 'sports'], queryFn: getPublicSports });

  const loading = teams.isLoading || sports.isLoading;

  return (
    <div className="max-w-6xl mx-auto px-6 sm:px-8 py-14">
      <div className="text-center mb-12">
        <div className="inline-flex items-center rounded-full bg-umu-red-light px-4 py-1.5 mb-4">
          <span className="text-[13px] font-medium text-umu-red">UMU Teams</span>
        </div>
        <h1 className="text-[32px] font-semibold text-on-surface tracking-tight">Teams</h1>
        <p className="mt-2 text-[15px] text-on-surface-variant max-w-lg mx-auto">
          Represent UMU across all sports.
        </p>
      </div>

      {loading ? (
        <div className="py-16 flex justify-center"><Spinner /></div>
      ) : teams.isError ? (
        <div className="py-16"><EmptyState message="Couldn't load teams" /></div>
      ) : (
        <div className="space-y-10">
          {sports.data?.map((sport) => {
            const sportTeams = (teams.data ?? []).filter((t) => t.sport.id === sport.id);
            if (sportTeams.length === 0) return null;
            return (
              <section key={sport.id}>
                <h3 className="text-[18px] font-semibold text-on-surface mb-4">{sport.name}</h3>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {sportTeams.map((t) => (
                    <Link
                      key={t.id}
                      to={`/teams/${t.id}`}
                      className="group rounded-m3-lg border border-outline-variant bg-white p-5 transition hover:shadow-m3-1 hover:border-outline"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-[15px] font-medium text-on-surface group-hover:text-umu-red transition">{t.name}</h4>
                        <span className="shrink-0 rounded-full bg-surface-dim px-2.5 py-0.5 text-[11px] font-medium text-on-surface-variant">
                          {formatGenderLabel(t.gender)}
                        </span>
                      </div>
                      <p className="text-[13px] text-on-surface-variant mt-1.5">
                        {t._count.squadEntries} athletes &middot; {t.homeVenue ?? 'Venue TBD'}
                      </p>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
          {(!teams.data || teams.data.length === 0) && (
            <div className="py-16"><EmptyState message="No teams yet" /></div>
          )}
        </div>
      )}
      <div className="mt-12 text-center">
        <Link to="/sports" className="text-[14px] font-medium text-umu-red hover:underline">
          &larr; Back to all sports
        </Link>
      </div>
    </div>
  );
}
