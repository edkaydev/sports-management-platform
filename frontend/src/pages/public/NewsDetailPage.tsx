import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { getPublicNewsBySlug } from '@/lib/api';
import { Spinner, EmptyState } from '@/components/ui';

export default function NewsDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data, isLoading, isError } = useQuery({
    queryKey: ['public', 'news', slug],
    queryFn: () => getPublicNewsBySlug(slug!),
    enabled: !!slug,
  });

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      {isLoading ? (
        <div className="py-16 flex justify-center"><Spinner /></div>
      ) : isError || !data ? (
        <div className="py-16">
          <EmptyState message="News post not found" />
          <div className="text-center mt-4">
            <Link to="/news" className="text-sm font-semibold text-primary hover:underline">
              ← Back to news
            </Link>
          </div>
        </div>
      ) : (
        <article>
          <Link to="/news" className="text-sm font-semibold text-primary hover:underline">
            ← Back to news
          </Link>
          <div className="mt-4 text-xs font-semibold text-muted uppercase tracking-wide">
            {data.tags ?? 'Announcement'}
          </div>
          <h1 className="mt-1 text-3xl font-bold text-gray-900 leading-tight">{data.title}</h1>
          <div className="mt-2 text-sm text-muted">
            {data.author ? `${data.author.fullName} · ` : ''}
            {data.publishedAt ? new Date(data.publishedAt).toLocaleDateString() : ''}
          </div>
          {data.coverImage && (
            <div
              className="mt-6 h-64 rounded-lg bg-cover bg-center"
              style={{ backgroundImage: `url(${data.coverImage})` }}
            />
          )}
          <div className="mt-6 prose prose-sm max-w-none text-gray-800 whitespace-pre-wrap">
            {data.content}
          </div>
        </article>
      )}
    </div>
  );
}
