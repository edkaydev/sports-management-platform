import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FaChevronLeft, FaChevronRight, FaCircle, FaRegCircle } from 'react-icons/fa6';
import { getPublicSlides } from '@/lib/api';
import { Spinner } from '@/components/ui';

export default function HomeSlider() {
  const { data: slides, isLoading } = useQuery({
    queryKey: ['public', 'slides'],
    queryFn: getPublicSlides,
    staleTime: 60_000,
  });

  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const total = slides?.length ?? 0;

  const next = useCallback(() => {
    if (total > 0) setCurrent((i) => (i + 1) % total);
  }, [total]);

  const prev = useCallback(() => {
    if (total > 0) setCurrent((i) => (i - 1 + total) % total);
  }, [total]);

  useEffect(() => {
    if (paused || total <= 1) return;
    const id = setInterval(next, 5000);
    return () => clearInterval(id);
  }, [paused, next, total]);

  if (isLoading) {
    return (
      <div className="bg-gradient-to-r from-red-950 via-red-900 to-red-700 h-[28rem] sm:h-[36rem] flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!slides || slides.length === 0) {
    return (
      <section className="bg-gradient-to-r from-red-950 via-red-900 to-red-700 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <p className="text-red-200 text-sm font-semibold tracking-widest uppercase mb-3">
            Uganda Martyrs University
          </p>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight leading-tight">
            Home of the UMU Saints
          </h1>
          <p className="mt-4 max-w-2xl text-red-100 text-base sm:text-lg">
            Follow fixtures, results, teams, and events from the UMU Sports Department — and
            support our student-athletes across football, netball, basketball, rugby, and more.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/fixtures"
              className="px-6 py-3 rounded-md bg-white text-red-700 font-semibold hover:bg-red-50"
            >
              View Fixtures
            </Link>
            <Link
              to="/results"
              className="px-6 py-3 rounded-md border border-white/40 text-white font-semibold hover:bg-white/10"
            >
              Latest Results
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const activeSlide = slides[current];

  return (
    <section
      className="mx-auto max-w-6xl px-4 py-6 sm:px-6"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="overflow-hidden rounded-[30px] border border-red-100 bg-white shadow-[0_20px_50px_rgba(127,29,29,0.08)] lg:grid lg:grid-cols-[1.35fr_0.75fr]">
        <div className="relative h-[24rem] sm:h-[30rem]">
          <img
            src={activeSlide.imageUrl}
            alt={activeSlide.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/25 to-black/10" />

          <div className="absolute inset-0 z-10 flex flex-col justify-end p-6 sm:p-8">
            <div className="mb-3 inline-flex w-fit items-center rounded-full border border-white/40 bg-black/20 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-red-100 backdrop-blur-sm">
              Featured update
            </div>

            <h2 className="max-w-lg text-2xl font-black tracking-tight text-white sm:text-4xl">
              {activeSlide.title}
            </h2>

            {activeSlide.subtitle && (
              <p className="mt-3 max-w-xl text-sm text-white/80 sm:text-base">
                {activeSlide.subtitle}
              </p>
            )}

            <div className="mt-5 flex items-center gap-3">
              {activeSlide.linkUrl && (
                <Link
                  to={activeSlide.linkUrl}
                  className="inline-flex items-center justify-center rounded-full bg-white px-5 py-2.5 text-sm font-bold text-red-700 transition hover:bg-red-50"
                >
                  {activeSlide.linkLabel ?? 'Learn More'}
                </Link>
              )}

              {total > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={prev}
                    aria-label="Previous slide"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/40 bg-black/20 text-white transition hover:bg-black/30"
                  >
                    <FaChevronLeft className="text-sm" />
                  </button>
                  <button
                    onClick={next}
                    aria-label="Next slide"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/40 bg-black/20 text-white transition hover:bg-black/30"
                  >
                    <FaChevronRight className="text-sm" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {total > 1 && (
          <div className="flex flex-col justify-between bg-[#111827] p-4 sm:p-5">
            <div className="space-y-3">
              {slides.map((slide, i) => (
                <button
                  key={slide.id}
                  onClick={() => setCurrent(i)}
                  className={`group relative flex w-full overflow-hidden rounded-2xl border text-left transition-all ${
                    i === current
                      ? 'border-red-400 shadow-[0_10px_30px_rgba(239,68,68,0.25)]'
                      : 'border-white/10 opacity-80 hover:border-white/30'
                  }`}
                >
                  <img
                    src={slide.imageUrl}
                    alt={slide.title}
                    className="h-24 w-24 object-cover sm:h-28 sm:w-28"
                  />
                  <div className="relative flex flex-1 items-end justify-between bg-gradient-to-r from-black/70 to-black/40 px-3 py-3 sm:px-4">
                    <div>
                      <div className="text-[9px] font-bold uppercase tracking-[0.18em] text-red-200">
                        {slide.linkLabel ?? 'Update'}
                      </div>
                      <p className="mt-1 text-sm font-semibold text-white">{slide.title}</p>
                    </div>
                    <div className="ml-2 flex h-6 w-6 items-center justify-center rounded-full border border-white/20 bg-white/10 text-[8px] text-white">
                      {i === current ? 'Now' : i + 1}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-5 flex items-center justify-center gap-2">
              {slides.map((slide, i) => (
                <button
                  key={`${slide.id}-dot`}
                  onClick={() => setCurrent(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className="flex h-5 w-5 items-center justify-center"
                >
                  {i === current ? (
                    <FaCircle className="text-[10px] text-white" />
                  ) : (
                    <FaRegCircle className="text-[10px] text-white/50" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
