import prisma from '../../config/database';
import { AppError } from '../../middleware/error.middleware';
import type { CreateSlideInput, UpdateSlideInput } from './slides.schema';

export async function listSlides() {
  return prisma.sliderSlide.findMany({
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
  });
}

export async function getSlide(id: string) {
  const slide = await prisma.sliderSlide.findUnique({ where: { id } });
  if (!slide) throw new AppError(404, 'NOT_FOUND', 'Slide not found');
  return slide;
}

export async function createSlide(data: CreateSlideInput) {
  return prisma.sliderSlide.create({
    data: {
      title: data.title,
      subtitle: data.subtitle,
      imageUrl: data.imageUrl,
      linkUrl: data.linkUrl,
      linkLabel: data.linkLabel,
      sortOrder: data.sortOrder ?? 0,
      isActive: data.isActive ?? true,
    },
  });
}

export async function updateSlide(id: string, data: UpdateSlideInput) {
  const existing = await prisma.sliderSlide.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, 'NOT_FOUND', 'Slide not found');

  return prisma.sliderSlide.update({
    where: { id },
    data: {
      title: data.title,
      subtitle: data.subtitle,
      imageUrl: data.imageUrl,
      linkUrl: data.linkUrl,
      linkLabel: data.linkLabel,
      sortOrder: data.sortOrder,
      isActive: data.isActive,
    },
  });
}

export async function deleteSlide(id: string) {
  const existing = await prisma.sliderSlide.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, 'NOT_FOUND', 'Slide not found');
  await prisma.sliderSlide.delete({ where: { id } });
  return { message: 'Slide deleted' };
}

export async function listActiveSlides() {
  return prisma.sliderSlide.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
    select: {
      id: true,
      title: true,
      subtitle: true,
      imageUrl: true,
      linkUrl: true,
      linkLabel: true,
    },
  });
}
