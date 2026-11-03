"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DEFAULT_HERO_SLIDES, type HeroSlide } from "@/data/hero-slides";

interface HeroCarouselProps {
  initialSlides?: HeroSlide[];
}

export default function HeroCarousel({ initialSlides }: HeroCarouselProps = {}) {
  const [slides, setSlides] = useState<HeroSlide[]>(
    initialSlides && initialSlides.length > 0 ? initialSlides : DEFAULT_HERO_SLIDES
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    fetch("/api/hero-slides", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data.slides && data.slides.length > 0) {
          setSlides(data.slides);
        }
      })
      .catch((err) => console.warn("Could not load dynamic hero slides:", err));

    const handleUpdate = (e: CustomEvent) => {
      if (e.detail && Array.isArray(e.detail) && e.detail.length > 0) {
        setSlides(e.detail);
      }
    };

    window.addEventListener("hero-slides-updated" as any, handleUpdate);
    return () =>
      window.removeEventListener("hero-slides-updated" as any, handleUpdate);
  }, []);

  const total = slides.length || 1;

  useEffect(() => {
    if (paused || total <= 1) return;

    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % total);
    }, 5000);

    return () => clearInterval(interval);
  }, [paused, total]);

  const activeSlide = slides[activeIndex] || slides[0] || DEFAULT_HERO_SLIDES[0];

  return (
    <section
      className="relative isolate min-h-[620px] overflow-hidden rounded-[22px] bg-[#35312c] md:min-h-[720px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-label="Hotel highlights"
    >
      {/* Background images */}
      {slides.map((slide, index) => (
        <div
          key={slide.title}
          className={`absolute inset-0 transition-opacity duration-[1200ms] ease-in-out ${
            index === activeIndex ? "opacity-100" : "opacity-0"
          }`}
          aria-hidden="true"
        >
          <img
            src={slide.image}
            alt=""
            className={`h-full w-full object-cover transition-transform duration-[6000ms] ease-out ${
              index === activeIndex ? "scale-110" : "scale-100"
            }`}
          />
        </div>
      ))}

      {/* Image overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#211e1a]/85 via-[#211e1a]/55 to-[#211e1a]/10" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#211e1a]/55 via-transparent to-[#211e1a]/10" />

      {/* Content */}
      <div
        key={activeIndex}
        className="relative z-10 flex min-h-[620px] max-w-3xl flex-col items-start justify-center px-7 py-20 sm:px-12 md:min-h-[720px] md:px-20"
      >
        <p className="hero-content mb-6 text-xs font-medium tracking-[0.28em] text-[#e0c49a] sm:text-sm">
          {activeSlide.eyebrow}
        </p>

        <h1 className="hero-content hero-content-delay-1 whitespace-pre-line text-4xl font-light leading-[1.12] tracking-tight text-[#f0ede7] sm:text-6xl md:text-7xl">
          {activeSlide.title}
        </h1>

        <p className="hero-content hero-content-delay-2 mt-6 max-w-lg text-sm leading-7 text-[#ded8cf] sm:text-base sm:leading-8">
          {activeSlide.description}
        </p>

        <Link
          href={activeSlide.href}
          className="cursor-pointer hero-content hero-content-delay-3 mt-9 inline-flex items-center gap-4 rounded-lg border border-[#d5b78a] bg-[#d5b78a] px-6 py-3.5 text-sm font-medium text-[#30271e] transition-all duration-300 hover:-translate-y-1 hover:border-[#ead7b8] hover:bg-[#ead7b8] hover:shadow-lg hover:shadow-black/20"
        >
          {activeSlide.button}
          <span aria-hidden="true" className="text-lg">
            ↗
          </span>
        </Link>
      </div>

      {/* Navigation arrows */}
      <div className="absolute bottom-8 right-6 z-20 flex items-center gap-3 sm:right-12 md:bottom-12 md:right-16">
        <button
          type="button"
          onClick={() =>
            setActiveIndex(
              (current) => (current - 1 + slides.length) % slides.length
            )
          }
          aria-label="Previous slide"
          className="cursor-pointer flex h-10 w-10 items-center justify-center rounded-lg border border-white/30 bg-black/10 text-lg text-[#f0ede7] backdrop-blur-sm transition hover:border-[#d5b78a] hover:bg-[#d5b78a] hover:text-[#30271e]"
        >
          ←
        </button>

        <button
          type="button"
          onClick={() =>
            setActiveIndex((current) => (current + 1) % slides.length)
          }
          aria-label="Next slide"
          className="cursor-pointer flex h-10 w-10 items-center justify-center rounded-lg border border-white/30 bg-black/10 text-lg text-[#f0ede7] backdrop-blur-sm transition hover:border-[#d5b78a] hover:bg-[#d5b78a] hover:text-[#30271e]"
        >
          →
        </button>
      </div>

      {/* Slide indicators */}
      <div className="absolute bottom-10 left-7 z-20 flex items-center gap-3 sm:left-12 md:bottom-14 md:left-20">
        {slides.map((slide, index) => (
          <button
            key={slide.title}
            type="button"
            onClick={() => setActiveIndex(index)}
            aria-label={`Go to slide ${index + 1}`}
            aria-current={index === activeIndex ? "true" : undefined}
            className={`cursor-pointer h-1 rounded-full transition-all duration-500 ${
              index === activeIndex
                ? "w-12 bg-[#d5b78a]"
                : "w-5 bg-[#f0ede7]/50 hover:bg-[#f0ede7]"
            }`}
          />
        ))}
      </div>

      <style jsx>{`
        .hero-content {
          animation: reveal 800ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .hero-content-delay-1 {
          animation-delay: 100ms;
        }

        .hero-content-delay-2 {
          animation-delay: 200ms;
        }

        .hero-content-delay-3 {
          animation-delay: 300ms;
        }

        @keyframes reveal {
          from {
            opacity: 0;
            transform: translateY(24px);
            filter: blur(4px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
            filter: blur(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .hero-content {
            animation: none;
          }
        }
      `}</style>
    </section>
  );
}
