import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getPublicTeams, getPublicSports } from '@/lib/api';
import { PageHeader, Spinner, EmptyState } from '@/components/ui';

export default function TeamsPage() {
  const teams = useQuery({ queryKey: ['public', 'teams'], queryFn: getPublicTeams });
  const sports = useQuery({ queryKey: ['public', 'sports'], queryFn: getPublicSports });

  const loading = teams.isLoading || sports.isLoading;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <PageHeader title="Teams" subtitle="Represent UMU across all sports." />
      {loading ? (
        <div className="py-16 flex justify-center"><Spinner /></div>
      ) : teams.isError ? (
        <div className="py-16"><EmptyState message="Couldn't load teams" /></div>
      ) : (
        <div className="space-y-8">
          {sports.data?.map((sport) => {
            const sportTeams = (teams.data ?? []).filter((t) => t.sport.id === sport.id);
            if (sportTeams.length === 0) return null;
            return (
              <section key={sport.id}>
                <h3 className="text-lg font-bold text-gray-900 mb-3">{sport.name}</h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {sportTeams.map((t) => (
                    <Link
                      key={t.id}
                      to={`/teams/${t.id}`}
                      className="bg-surface border border-border rounded-lg p-5 hover:border-primary/40 hover:shadow-sm transition"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-gray-900">{t.name}</h4>
                        <span className="px-2 py-0.5 rounded-full bg-gray-100 text-xs font-semibold text-muted capitalize">
                          {t.gender.toLowerCase()}
                        </span>
                      </div>
                      <p className="text-xs text-muted mt-1">
                        {t._count.squadEntries} athletes — {t.homeVenue ?? 'Venue TBD'}
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
      <div className="mt-10 text-center">
        <Link to="/sports" className="text-sm font-semibold text-primary hover:underline">
          ← Back to all sports
        </Link>
      </div>
    </div>
  );
}
