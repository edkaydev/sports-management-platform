import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getPublicNews } from '@/lib/api';
import { PageHeader, Spinner, EmptyState } from '@/components/ui';

export default function NewsPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['public', 'news'],
    queryFn: getPublicNews,
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <PageHeader title="News" subtitle="Latest updates from the UMU Sports Department." />
      {isLoading ? (
        <div className="py-16 flex justify-center"><Spinner /></div>
      ) : isError ? (
        <div className="py-16"><EmptyState message="Couldn't load news" /></div>
      ) : !data || data.news.length === 0 ? (
        <div className="py-16"><EmptyState message="No news yet" /></div>
      ) : (
        <div className="space-y-6">
          {data.news.map((post: any) => (
            <article key={post.id} className="bg-surface border border-border rounded-lg overflow-hidden sm:flex">
              {post.coverImage && (
                <div
                  className="sm:w-48 min-h-32 bg-cover bg-center"
                  style={{ backgroundImage: `url(${post.coverImage})` }}
                />
              )}
              <div className="p-5">
                <div className="text-xs font-semibold text-muted uppercase tracking-wide">
                  {post.tags ?? 'Announcement'}
                  {post.featured ? ' · Featured' : ''}
                </div>
                <Link to={`/news/${post.slug}`} className="mt-1 block text-lg font-bold text-gray-900 hover:text-primary">
                  {post.title}
                </Link>
                <p className="mt-2 text-sm text-muted">{post.excerpt}</p>
                <div className="mt-3 text-xs text-muted">
                  {post.author ? `${post.author.fullName} · ` : ''}
                  {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : ''}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
