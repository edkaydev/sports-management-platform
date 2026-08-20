import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { getPublicNewsBySlug } from '@/lib/api';
import { Spinner } from '@/components/ui';

export default function NewsDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data, isLoading, isError } = useQuery({
    queryKey: ['public', 'news', slug],
    queryFn: () => getPublicNewsBySlug(slug!),
    enabled: !!slug,
  });

  if (isLoading) {
    return <div className="py-20 flex justify-center"><Spinner /></div>;
  }

  if (isError || !data) {
    return (
      <div className="py-20 text-center">
        <p className="text-on-surface-variant">Article not found.</p>
        <Link to="/news" className="mt-4 inline-block text-[14px] font-medium text-umu-red hover:underline">
          &larr; Back to news
        </Link>
      </div>
    );
  }

  const article = data;

  return (
    <article className="max-w-3xl mx-auto px-6 sm:px-8 py-14">
      <Link to="/news" className="text-[13px] font-medium text-umu-red hover:underline mb-6 inline-block">
        &larr; Back to news
      </Link>

      <div className="mb-4 inline-flex items-center rounded-full bg-umu-red-light px-3 py-1 text-[11px] font-medium text-umu-red">
        {article.tags ?? 'Announcement'}
      </div>

      <h1 className="text-[28px] sm:text-[34px] font-semibold text-on-surface tracking-tight leading-tight">
        {article.title}
      </h1>

      <div className="mt-3 text-[13px] text-on-surface-variant">
        {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : ''}
      </div>

      {article.coverImage && (
        <div className="mt-8 overflow-hidden rounded-m3-xl">
          <img src={article.coverImage} alt={article.title} className="w-full h-auto object-cover max-h-96" />
        </div>
      )}

      <div className="mt-8 text-[15px] leading-relaxed text-on-surface whitespace-pre-line">
        {article.content || article.excerpt || ''}
      </div>
    </article>
  );
}
