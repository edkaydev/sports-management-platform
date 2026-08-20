import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getPublicNews } from '@/lib/api';
import { Spinner, EmptyState } from '@/components/ui';

export default function NewsPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['public', 'news'],
    queryFn: getPublicNews,
  });

  return (
    <div className="max-w-6xl mx-auto px-6 sm:px-8 py-14">
      <div className="text-center mb-12">
        <div className="inline-flex items-center rounded-full bg-umu-red-light px-4 py-1.5 mb-4">
          <span className="text-[13px] font-medium text-umu-red">Updates</span>
        </div>
        <h1 className="text-[32px] font-semibold text-on-surface tracking-tight">News</h1>
        <p className="mt-2 text-[15px] text-on-surface-variant max-w-md mx-auto">
          The latest from UMU Sports.
        </p>
      </div>

      {isLoading ? (
        <div className="py-16 flex justify-center"><Spinner /></div>
      ) : isError ? (
        <div className="py-16"><EmptyState message="Couldn't load news" /></div>
      ) : !data || data.news.length === 0 ? (
        <div className="py-16"><EmptyState message="No news yet" /></div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {data.news.map((item: any) => (
            <Link
              key={item.id}
              to={`/news/${item.slug}`}
              className="group rounded-m3-lg border border-outline-variant bg-white overflow-hidden transition hover:shadow-m3-1 hover:border-outline"
            >
              {item.coverImage && (
                <div className="h-44 bg-cover bg-center" style={{ backgroundImage: `url(${item.coverImage})` }} />
              )}
              <div className="p-6">
                <div className="mb-2.5 inline-flex items-center rounded-full bg-umu-red-light px-2.5 py-0.5 text-[11px] font-medium text-umu-red">
                  {item.tags ?? 'Announcement'}
                </div>
                <h3 className="text-[16px] font-medium text-on-surface group-hover:text-umu-red transition line-clamp-2 leading-snug">
                  {item.title}
                </h3>
                {item.excerpt && (
                  <p className="mt-2 text-[13px] text-on-surface-variant line-clamp-2">{item.excerpt}</p>
                )}
                <div className="mt-3 text-[12px] text-on-surface-variant">
                  {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : ''}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
