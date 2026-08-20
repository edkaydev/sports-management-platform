import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa6';
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
      <div className="bg-surface-dim h-[28rem] sm:h-[36rem] flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!slides || slides.length === 0) {
    return (
      <section className="bg-white">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 py-20 sm:py-28 text-center">
          <div className="inline-flex items-center rounded-full bg-umu-red-light px-4 py-1.5 mb-6">
            <span className="text-[13px] font-medium text-umu-red">Uganda Martyrs University</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-semibold tracking-tight text-on-surface leading-[1.1]">
            Home of the{' '}
            <span className="inline-block rounded-full bg-umu-red-light px-5 py-1 text-umu-red">
              UMU Saints
            </span>
          </h1>
          <p className="mt-5 max-w-2xl mx-auto text-[16px] sm:text-[18px] leading-relaxed text-on-surface-variant">
            Follow fixtures, results, teams, and events from the UMU Sports Department — and support our student-athletes across football, netball, basketball, rugby, and more.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/fixtures"
              className="px-7 py-3 rounded-full bg-umu-red text-white text-[14px] font-medium hover:bg-umu-red-dark hover:shadow-m3-1 transition-all"
            >
              View Fixtures
            </Link>
            <Link
              to="/results"
              className="px-7 py-3 rounded-full border border-outline text-on-surface text-[14px] font-medium hover:bg-surface-container transition-all"
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
      className="mx-auto max-w-6xl px-6 sm:px-8 pt-8 pb-4"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="overflow-hidden rounded-m3-xl bg-white shadow-m3-1 lg:grid lg:grid-cols-[1.4fr_0.6fr]">
        <div className="relative h-[22rem] sm:h-[28rem] lg:h-[32rem]">
          <img
            src={activeSlide.imageUrl}
            alt={activeSlide.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

          <div className="absolute inset-0 z-10 flex flex-col justify-end p-6 sm:p-10">
            <div className="mb-3 inline-flex w-fit items-center rounded-full bg-white/90 backdrop-blur-sm px-3.5 py-1 text-[11px] font-medium text-on-surface">
              Featured update
            </div>

            <h2 className="max-w-lg text-2xl font-semibold tracking-tight text-white sm:text-3xl lg:text-4xl">
              {activeSlide.title}
            </h2>

            {activeSlide.subtitle && (
              <p className="mt-3 max-w-xl text-[14px] text-white/80 sm:text-[15px] leading-relaxed">
                {activeSlide.subtitle}
              </p>
            )}

            <div className="mt-5 flex items-center gap-3">
              {activeSlide.linkUrl && (
                <Link
                  to={activeSlide.linkUrl}
                  className="inline-flex items-center justify-center rounded-full bg-white px-6 py-2.5 text-[13px] font-medium text-on-surface transition hover:shadow-m3-2"
                >
                  {activeSlide.linkLabel ?? 'Learn More'}
                </Link>
              )}

              {total > 1 && (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={prev}
                    aria-label="Previous slide"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition hover:bg-white/30"
                  >
                    <FaChevronLeft className="text-xs" />
                  </button>
                  <button
                    onClick={next}
                    aria-label="Next slide"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition hover:bg-white/30"
                  >
                    <FaChevronRight className="text-xs" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {total > 1 && (
          <div className="flex flex-col justify-between bg-surface-dim p-4 sm:p-5">
            <div className="space-y-2.5">
              {slides.map((slide, i) => (
                <button
                  key={slide.id}
                  onClick={() => setCurrent(i)}
                  className={`group relative flex w-full overflow-hidden rounded-2xl text-left transition-all ${
                    i === current
                      ? 'bg-white shadow-m3-1 ring-1 ring-umu-red/20'
                      : 'bg-transparent hover:bg-white/60'
                  }`}
                >
                  <img
                    src={slide.imageUrl}
                    alt={slide.title}
                    className="h-20 w-20 object-cover sm:h-24 sm:w-24 rounded-l-2xl"
                  />
                  <div className="flex flex-1 items-center justify-between px-4 py-3">
                    <div>
                      <div className="text-[10px] font-medium text-on-surface-variant">
                        {slide.linkLabel ?? 'Update'}
                      </div>
                      <p className="mt-0.5 text-[13px] font-medium text-on-surface line-clamp-1">{slide.title}</p>
                    </div>
                    {i === current && (
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-umu-red text-[9px] font-bold text-white">
                        Now
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-center gap-1.5">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === current ? 'w-6 bg-umu-red' : 'w-1.5 bg-outline hover:bg-on-surface-variant'
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
