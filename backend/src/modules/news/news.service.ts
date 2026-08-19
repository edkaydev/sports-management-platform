import { NewsStatus } from '@prisma/client';
import prisma from '../../config/database';
import { AppError } from '../../middleware/error.middleware';
import { emitDomainUpdate } from '../../config/socket';
import type { CreateNewsInput, UpdateNewsInput } from './news.schema';

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export async function listNews() {
  return prisma.newsPost.findMany({
    include: { author: { select: { id: true, fullName: true } } },
    orderBy: [{ featured: 'desc' }, { publishedAt: 'desc' }, { createdAt: 'desc' }],
  });
}

export async function getNews(id: string) {
  const post = await prisma.newsPost.findUnique({
    where: { id },
    include: { author: { select: { id: true, fullName: true } } },
  });
  if (!post) throw new AppError(404, 'NOT_FOUND', 'News post not found');
  return post;
}

export async function createNews(data: CreateNewsInput, authorId: string) {
  const slug = data.slug ?? slugify(data.title);
  const existing = await prisma.newsPost.findUnique({ where: { slug } });
  if (existing) throw new AppError(409, 'CONFLICT', 'A news post with this slug already exists');

  const post = await prisma.newsPost.create({
    data: {
      title: data.title,
      slug,
      excerpt: data.excerpt,
      content: data.content,
      coverImage: data.coverImage,
      tags: data.tags,
      featured: data.featured ?? false,
      status: data.status,
      publishedAt:
        data.status === NewsStatus.PUBLISHED
          ? data.publishedAt
            ? new Date(data.publishedAt)
            : new Date()
          : data.publishedAt
            ? new Date(data.publishedAt)
            : null,
      authorId,
    },
    include: { author: { select: { id: true, fullName: true } } },
  });

  emitDomainUpdate('news', { action: 'create', id: post.id });
  return post;
}

export async function updateNews(id: string, data: UpdateNewsInput) {
  const existing = await prisma.newsPost.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, 'NOT_FOUND', 'News post not found');

  if (data.slug && data.slug !== existing.slug) {
    const taken = await prisma.newsPost.findUnique({ where: { slug: data.slug } });
    if (taken) throw new AppError(409, 'CONFLICT', 'A news post with this slug already exists');
  }

  const updated = await prisma.newsPost.update({
    where: { id },
    data: {
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt,
      content: data.content,
      coverImage: data.coverImage,
      tags: data.tags,
      featured: data.featured,
      status: data.status,
      publishedAt:
        data.status === NewsStatus.PUBLISHED && !existing.publishedAt
          ? new Date()
          : data.publishedAt
            ? new Date(data.publishedAt)
            : undefined,
    },
    include: { author: { select: { id: true, fullName: true } } },
  });

  emitDomainUpdate('news', { action: 'update', id: updated.id });
  return updated;
}

export async function deleteNews(id: string) {
  const existing = await prisma.newsPost.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, 'NOT_FOUND', 'News post not found');
  await prisma.newsPost.delete({ where: { id } });
  emitDomainUpdate('news', { action: 'delete', id });
  return { message: 'News post deleted' };
}
