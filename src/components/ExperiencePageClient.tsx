"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  MapPin,
  Clock,
  Navigation,
  ExternalLink,
  Crown,
  Check,
  ArrowRight,
  Compass,
  Plane,
  ChevronRight,
  ChevronLeft,
  CalendarDays,
  Car,
  Footprints,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  DEFAULT_EXPERIENCE_SETTINGS,
  DEFAULT_RECREATION_ITEMS,
  DEFAULT_FACILITY_ITEMS,
  DEFAULT_NEARBY_ITEMS,
} from "@/lib/experience-settings";
import type {
  ExperienceSettings,
  RecreationItem,
  FacilityItem,
  NearbyPlaceItem,
} from "@/types/database";

export default function ExperiencePageClient({
  initialSettings,
}: {
  initialSettings?: ExperienceSettings;
}) {
  const [settings, setSettings] = useState<ExperienceSettings>(
    initialSettings || DEFAULT_EXPERIENCE_SETTINGS
  );
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (initialSettings) {
      setSettings(initialSettings);
    }
  }, [initialSettings]);

  useEffect(() => {
    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<ExperienceSettings>;
      if (customEvent.detail) {
        setSettings(customEvent.detail);
      } else {
        fetch("/api/experience", { cache: "no-store" })
          .then((res) => res.json())
          .then((data) => {
            if (data.settings) setSettings(data.settings);
          })
          .catch(() => {});
      }
    };

    window.addEventListener(
      "experience-settings-updated" as any,
      handleUpdate
    );
    return () =>
      window.removeEventListener(
        "experience-settings-updated" as any,
        handleUpdate
      );
  }, []);

  const recreations =
    settings.recreations_items && settings.recreations_items.length > 0
      ? settings.recreations_items
      : DEFAULT_RECREATION_ITEMS;

  const facilities =
    settings.facilities_items && settings.facilities_items.length > 0
      ? settings.facilities_items
      : DEFAULT_FACILITY_ITEMS;

  const nearbyPlaces =
    settings.nearby_items && settings.nearby_items.length > 0
      ? settings.nearby_items
      : DEFAULT_NEARBY_ITEMS;

  const totalSlides = recreations.length || 1;

  // Auto-slide effect (pauses on hover)
  useEffect(() => {
    if (isPaused || totalSlides <= 1) return;
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % totalSlides);
    }, 5500);
    return () => clearInterval(interval);
  }, [isPaused, totalSlides]);

  const nextSlide = () => setActiveSlide((prev) => (prev + 1) % totalSlides);
  const prevSlide = () =>
    setActiveSlide((prev) => (prev - 1 + totalSlides) % totalSlides);

  const currentRecreation =
    recreations[activeSlide] || recreations[0] || DEFAULT_RECREATION_ITEMS[0];

  // Helper: dynamic transit icon for nearby waypoint cards
  const getTransitIcon = (distance: string) => {
    const d = distance.toLowerCase();
    if (
      d.includes("walk") ||
      d.includes("jalan") ||
      d.includes("foot") ||
      d.includes("step")
    ) {
      return <Footprints size={12} className="text-[#a58b72]" />;
    }
    if (
      d.includes("drive") ||
      d.includes("car") ||
      d.includes("mobil") ||
      d.includes("toll") ||
      d.includes("mins")
    ) {
      return <Car size={12} className="text-[#a58b72]" />;
    }
    return <Compass size={12} className="text-[#a58b72]" />;
  };

  return (
    <div className="min-h-screen bg-[#f8f6f1] text-[#292722]">
      <Navbar />

      {/* ================================================================ */}
      {/* 1. HERO BANNER: VARIETY OF RECREATIONS CAROUSEL */}
      {/* ================================================================ */}
      <section
        id="recreations"
        className="relative isolate min-h-[640px] overflow-hidden bg-[#241f1b] md:min-h-[740px] lg:min-h-[800px]"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        aria-label="Variety of Resort Recreations"
      >
        {/* Background Slides with Crossfade and Subtle Zoom */}
        {recreations.map((item, idx) => (
          <div
            key={item.id || idx}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              idx === activeSlide
                ? "opacity-100 z-0"
                : "opacity-0 -z-10 pointer-events-none"
            }`}
          >
            <img
              src={item.image}
              alt={item.title}
              className={`h-full w-full object-cover transition-transform duration-[7000ms] ease-out ${
                idx === activeSlide ? "scale-108" : "scale-100"
              }`}
            />
          </div>
        ))}

        {/* Multi-layered Architectural & Luxury Dark Gradients */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#1b1713]/95 via-[#1b1713]/80 to-[#1b1713]/35 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1b1713]/95 via-transparent to-[#1b1713]/40 pointer-events-none" />

        {/* Slide Main Content */}
        <div className="container-custom relative z-10 flex min-h-[640px] flex-col justify-between py-12 md:min-h-[740px] md:py-16 lg:min-h-[800px]">
          {/* Top Row: Section Eyebrow Badge & Quick Jump to Facilities */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#d5b78a]/40 bg-[#d5b78a]/10 px-4 py-1.5 backdrop-blur-md">
              <Crown size={13} className="text-[#e0c49a]" />
              <span className="text-xs font-semibold tracking-[0.25em] text-[#e0c49a]">
                {settings.recreations_eyebrow || "VARIETY OF RECREATIONS"}
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <a
                href="#facilities"
                className="cursor-pointer inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/30 px-4 py-1.5 text-xs font-medium text-[#f0ede7] backdrop-blur-md transition hover:border-[#d5b78a] hover:bg-black/50"
              >
                <span>Our Facilities</span>
                <ChevronRight size={13} className="text-[#e0c49a]" />
              </a>
              <a
                href="#location"
                className="cursor-pointer inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/30 px-4 py-1.5 text-xs font-medium text-[#f0ede7] backdrop-blur-md transition hover:border-[#d5b78a] hover:bg-black/50"
              >
                <MapPin size={12} className="text-[#e0c49a]" />
                <span>Location</span>
              </a>
            </div>
          </div>

          {/* Center Content: Active Recreation Narrative */}
          <div className="my-auto max-w-3xl py-8">
            {/* Category & Badge Row */}
            <div className="flex flex-wrap items-center gap-2.5">
              {currentRecreation.category && (
                <span className="rounded-full border border-white/25 bg-[#201c18]/80 px-3.5 py-1 text-[11px] font-semibold uppercase tracking-widest text-[#f0ede7] backdrop-blur-md">
                  {currentRecreation.category}
                </span>
              )}

              {currentRecreation.badge && (
                <span className="rounded-full bg-gradient-to-r from-[#d5b78a] to-[#c4aa8c] px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-[#2a2118] shadow-xs">
                  {currentRecreation.badge}
                </span>
              )}

              {currentRecreation.timing && (
                <div className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/40 px-3.5 py-1 text-xs font-medium text-[#ded8cf] backdrop-blur-md">
                  <Clock size={12} className="text-[#e0c49a]" />
                  <span>{currentRecreation.timing}</span>
                </div>
              )}
            </div>

            {/* Display Title with Serif Grandeur */}
            <h1
              key={`title-${activeSlide}`}
              className="mt-6 font-serif text-4xl font-light leading-[1.12] tracking-tight text-[#f0ede7] sm:text-5xl md:text-6xl lg:text-7xl"
            >
              {currentRecreation.title}
            </h1>

            {/* Description */}
            <p
              key={`desc-${activeSlide}`}
              className="mt-6 max-w-2xl text-sm leading-8 text-[#ded8cf] sm:text-base sm:leading-8"
            >
              {currentRecreation.description}
            </p>

            {/* Inquiry Action Button */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/#contact"
                className="cursor-pointer inline-flex items-center gap-2.5 rounded-lg border border-[#d5b78a] bg-[#d5b78a] px-6 py-3.5 text-xs font-semibold text-[#30271e] shadow-md transition-all hover:bg-[#ead7b8] hover:border-[#ead7b8]"
              >
                <span>Inquire This Experience</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Bottom Controls Bar: Slide Counter, Progress Indicators, Quick Selector Strip & Arrows */}
          <div className="border-t border-white/15 pt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Left: Counter & Slide Indicator Bars */}
            <div className="flex items-center gap-5">
              <span className="font-mono text-xs font-semibold tracking-widest text-[#e0c49a]">
                № {String(activeSlide + 1).padStart(2, "0")} /{" "}
                {String(recreations.length).padStart(2, "0")}
              </span>

              {/* Indicator Pills */}
              <div className="flex items-center gap-2">
                {recreations.map((item, idx) => (
                  <button
                    key={item.id || idx}
                    type="button"
                    onClick={() => setActiveSlide(idx)}
                    className={`h-1.5 rounded-full transition-all duration-500 cursor-pointer ${
                      idx === activeSlide
                        ? "w-8 bg-[#e0c49a]"
                        : "w-2.5 bg-white/30 hover:bg-white/60"
                    }`}
                    title={item.title}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Middle: Desktop Clickable Recreation Title Pills */}
            <div className="hidden lg:flex items-center gap-1.5 overflow-x-auto max-w-lg">
              {recreations.map((item, idx) => (
                <button
                  key={item.id || idx}
                  type="button"
                  onClick={() => setActiveSlide(idx)}
                  className={`cursor-pointer truncate max-w-[150px] rounded-lg px-3 py-1.5 text-[11px] font-medium transition ${
                    idx === activeSlide
                      ? "border border-[#e0c49a] bg-[#e0c49a]/20 text-[#e0c49a]"
                      : "border border-white/10 bg-black/25 text-white/70 hover:border-white/25 hover:text-white"
                  }`}
                  title={item.title}
                >
                  {item.title}
                </button>
              ))}
            </div>

            {/* Right: Prev & Next Arrow Buttons */}
            <div className="flex items-center gap-2.5 self-end sm:self-auto">
              <button
                type="button"
                onClick={prevSlide}
                className="cursor-pointer flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-black/40 text-white backdrop-blur-md transition hover:border-[#e0c49a] hover:bg-[#e0c49a] hover:text-[#2a2118]"
                aria-label="Previous recreation"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={nextSlide}
                className="cursor-pointer flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-black/40 text-white backdrop-blur-md transition hover:border-[#e0c49a] hover:bg-[#e0c49a] hover:text-[#2a2118]"
                aria-label="Next recreation"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* 2. SECTION 2: OUR FACILITIES (Alternating Editorial Showcases) */}
      {/* ================================================================ */}
      <section id="facilities" className="bg-[#eee7dc] py-24 md:py-28">
        <div className="container-custom">
          {/* Header */}
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-[0.3em] text-[#a58b72]">
              {settings.facilities_eyebrow || "OUR FACILITIES"}
            </p>
            <h2 className="mt-3 font-serif text-3xl font-normal leading-tight text-[#4a382d] sm:text-4xl md:text-5xl">
              {settings.facilities_title ||
                "World-Class Amenities for Discerning Guests"}
            </h2>
            <p className="mt-4 text-sm leading-8 text-[#777064]">
              {settings.facilities_description ||
                "Every space at Arundra Signature Pondok Indah is an architectural homage to elegance, offering state-of-the-art facilities crafted for effortless comfort and indulgence."}
            </p>
          </div>

          {/* SECTION 2: EDITORIAL FACILITY STORIES (Alternating Visual Showcase) */}
          <div className="mt-16 space-y-24 md:space-y-36">
            {facilities.map((fac, idx) => {
              const isEven = idx % 2 === 0;
              return (
                <div
                  key={fac.id || idx}
                  className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16"
                >
                  {/* Photo Side (7 cols on lg, alternates order) */}
                  <div
                    className={`group relative lg:col-span-7 ${
                      isEven ? "lg:order-1" : "lg:order-2"
                    }`}
                  >
                    <div className="relative overflow-hidden rounded-3xl border border-[#ded5c8] bg-[#ded5c8]/50 shadow-md transition-all duration-700 group-hover:shadow-2xl">
                      <div className="relative aspect-[16/11] sm:aspect-[16/10] w-full overflow-hidden">
                        <img
                          src={fac.image}
                          alt={fac.name}
                          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-106"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60" />
                      </div>

                      {/* Floating Glass Pill at Top-Left */}
                      {fac.tagline && (
                        <div className="absolute top-4 left-4 rounded-full border border-white/25 bg-black/45 px-3.5 py-1 text-[11px] font-medium tracking-wider text-white backdrop-blur-md">
                          {fac.tagline}
                        </div>
                      )}

                      {/* Facility Index Pill at Top-Right */}
                      <div className="absolute top-4 right-4 rounded-full border border-[#ded5c8]/60 bg-white/85 px-3 py-1 font-mono text-[10px] font-bold tracking-widest text-[#4a382d] backdrop-blur-md shadow-2xs">
                        № {String(idx + 1).padStart(2, "0")}
                      </div>
                    </div>

                    {/* Floating Architectural Badge (Homage to homepage badge, with distinct luxury styling) */}
                    <div
                      className={`absolute -bottom-6 ${
                        isEven ? "-right-3 sm:-right-6" : "-left-3 sm:-left-6"
                      } rounded-2xl border border-[#ded5c8] bg-[#fcfaf7] px-6 py-4 shadow-xl backdrop-blur-sm transition-transform duration-300 group-hover:-translate-y-1`}
                    >
                      <span className="block text-[10px] font-mono uppercase tracking-widest text-[#a58b72]">
                        RESORT AMENITY
                      </span>
                      <p className="mt-0.5 font-serif text-lg font-medium text-[#4a382d]">
                        {fac.tagline || "Exclusive Access"}
                      </p>
                      {fac.hours && (
                        <div className="mt-1 flex items-center gap-1.5 text-[11px] text-[#777064]">
                          <Clock size={11} className="text-[#a58b72]" />
                          <span>{fac.hours}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Text / Narrative Story Side (5 cols on lg, alternates order) */}
                  <div
                    className={`lg:col-span-5 flex flex-col justify-center pt-6 lg:pt-0 ${
                      isEven ? "lg:order-2" : "lg:order-1"
                    }`}
                  >
                    {/* Eyebrow with accent line */}
                    <div className="flex items-center gap-2.5">
                      <span className="h-px w-8 bg-[#a58b72]" />
                      <span className="text-xs font-semibold uppercase tracking-[0.28em] text-[#a58b72]">
                        {fac.tagline || `FACILITY ${String(idx + 1).padStart(2, "0")}`}
                      </span>
                    </div>

                    {/* Facility Name (Serif Headline) */}
                    <h3 className="mt-4 font-serif text-3xl sm:text-4xl lg:text-5xl font-light leading-tight text-[#4a382d]">
                      {fac.name}
                    </h3>

                    {/* Narrative Description */}
                    <p className="mt-5 text-sm sm:text-base leading-relaxed text-[#777064]">
                      {fac.description}
                    </p>

                    {/* Operating Hours Ribbon */}
                    {fac.hours && (
                      <div className="mt-6 inline-flex items-center gap-2.5 self-start rounded-full border border-[#ded5c8] bg-white/80 px-4 py-2 text-xs font-medium text-[#4a382d] shadow-2xs backdrop-blur-xs">
                        <Clock size={13} className="text-[#a58b72]" />
                        <span>Daily Hours:</span>
                        <span className="font-semibold text-[#292722]">{fac.hours}</span>
                      </div>
                    )}

                    {/* Signature Privileges Feature Highlights */}
                    {fac.features && fac.features.length > 0 && (
                      <div className="mt-8 border-t border-[#ded5c8] pt-6">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8c745f]">
                          Signature Privileges & Features
                        </p>
                        <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {fac.features.map((feat, fIdx) => (
                            <div
                              key={fIdx}
                              className="flex items-center gap-2.5 text-xs text-[#524b42]"
                            >
                              <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#ded5c8] text-[#4a382d]">
                                <Check size={10} strokeWidth={2.5} />
                              </span>
                              <span className="font-medium">{feat}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* 4. SECTION 3: LOCATION INFO [VIEW MAPS] & NEARBY PLACES */}
      {/* ================================================================ */}
      <section id="location" className="py-24 md:py-28">
        <div className="container-custom">
          {/* Header */}
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-[0.3em] text-[#a58b72]">
              {settings.location_eyebrow || "LOCATION & NEARBY PLACES"}
            </p>
            <h2 className="mt-3 font-serif text-3xl font-normal leading-tight text-[#4a382d] sm:text-4xl md:text-5xl">
              {settings.location_title || "Prestigious Pondok Indah Corridor"}
            </h2>
            <p className="mt-4 text-sm leading-8 text-[#777064]">
              {settings.location_description ||
                "Strategically situated in South Jakarta's prestigious Pondok Indah corridor, offering seamless connectivity to premier healthcare, shopping malls, golf courses, and MRT transit."}
            </p>
          </div>

          {/* Location Details & Interactive Maps Banner */}
          <div className="mt-12 overflow-hidden rounded-3xl border border-[#ded5c8] bg-white shadow-xl">
            <div className="grid grid-cols-1 lg:grid-cols-12">
              {/* Left / Info Column (5 cols) */}
              <div className="flex flex-col justify-between p-8 sm:p-10 lg:col-span-5 bg-[#fbf9f5]">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-[#ded5c8] bg-white px-3 py-1 text-xs font-medium text-[#755b43]">
                    <MapPin size={13} className="text-[#a58b72]" />
                    <span>
                      {settings.location_badge || "Prestigious South Jakarta Corridor"}
                    </span>
                  </div>

                  <h3 className="mt-5 font-serif text-2xl font-semibold text-[#4a382d]">
                    {settings.location_hotel_name || "Arundra Signature Pondok Indah"}
                  </h3>

                  <div className="mt-6 space-y-4 text-xs leading-relaxed text-[#62594f]">
                    {/* Physical Address */}
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#f4ede4] text-[#755b43]">
                        <MapPin size={15} />
                      </div>
                      <div>
                        <span className="block font-semibold text-[#4a382d]">
                          Hotel Address
                        </span>
                        <p className="mt-0.5 text-[#777064]">
                          {settings.location_address ||
                            "Jl. Metro Pondok Indah No. 27, RT.15/RW.13, Kel. Pondok Pinang, Kec. Kebayoran Lama, Jakarta Selatan, DKI Jakarta 12310, Indonesia"}
                        </p>
                      </div>
                    </div>

                    {/* Airport Proximity */}
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#f4ede4] text-[#755b43]">
                        <Plane size={15} />
                      </div>
                      <div>
                        <span className="block font-semibold text-[#4a382d]">
                          Airport Access
                        </span>
                        <p className="mt-0.5 text-[#777064]">
                          {settings.location_airport_distance ||
                            "~38 mins to Halim (HLP) • ~42 mins to Soekarno-Hatta (CGK)"}
                        </p>
                      </div>
                    </div>

                    {/* Check-in Times */}
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#f4ede4] text-[#755b43]">
                        <CalendarDays size={15} />
                      </div>
                      <div>
                        <span className="block font-semibold text-[#4a382d]">
                          Check-in & Concierge
                        </span>
                        <p className="mt-0.5 text-[#777064]">
                          {settings.location_check_in_info ||
                            "Check-in: 14:00 - 23:59 WIB • Check-out: 12:00 WIB • Cashless Property"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Primary CTA: View Maps Button */}
                <div className="mt-8 border-t border-[#ded5c8] pt-6">
                  <a
                    href={
                      settings.location_maps_url ||
                      "https://maps.google.com/?q=Jl.+Metro+Pondok+Indah+No.+27+Jakarta+Selatan"
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cursor-pointer inline-flex w-full items-center justify-center gap-2.5 rounded-xl bg-[#4a382d] px-6 py-3.5 text-xs font-semibold text-white shadow-md transition-all hover:bg-[#655043] hover:shadow-lg"
                  >
                    <Navigation size={15} className="text-[#e0c49a]" />
                    <span>View Maps & Directions</span>
                    <ExternalLink size={13} className="opacity-80" />
                  </a>
                  <p className="mt-2.5 text-center text-[10px] text-[#9c9388]">
                    Opens exact location in Google Maps application
                  </p>
                </div>
              </div>

              {/* Right / Map Embed Column (7 cols) */}
              <div className="relative min-h-[360px] lg:col-span-7 bg-[#ded5c8]/40">
                <iframe
                  title="Arundra Signature Location Map"
                  src={
                    settings.location_embed_url ||
                    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3965.867969850259!2d106.777014!3d-6.281075!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f1c37b3f9b8b%3A0x6b7c53d9e03d4c3a!2sJl.%20Metro%20Pondok%20Indah%20No.27%2C%20Pondok%20Pinang%2C%20Kebayoran%20Lama%2C%20Jakarta%20Selatan!5e0!3m2!1sen!2sid!4v1700000000000!5m2!1sen!2sid"
                  }
                  className="h-full w-full border-0"
                  style={{ minHeight: "380px" }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
            </div>
          </div>

          {/* SECTION 3 CARDS: Curated Nearby Places (Arched Viewfinder / Waypoint Cards) */}
          <div className="mt-16">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#a58b72]">
                  EXPLORE THE SURROUNDINGS
                </p>
                <h3 className="mt-2 font-serif text-2xl font-semibold text-[#4a382d] sm:text-3xl">
                  Curated Nearby Places
                </h3>
              </div>
              <p className="text-xs text-[#777064] max-w-md">
                Handpicked landmarks, premier shopping destinations, and healthcare hubs located within comfortable reach of the hotel.
              </p>
            </div>

            {/* Arched Viewfinder / Waypoint Grid */}
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {nearbyPlaces.map((place, idx) => (
                <div
                  key={place.id || idx}
                  className="group flex flex-col overflow-hidden rounded-3xl border border-[#ded5c8] bg-white p-3 shadow-xs transition-all duration-500 hover:-translate-y-2 hover:border-[#b89c7d] hover:shadow-xl"
                >
                  {/* Arched Top Photo Frame */}
                  <div className="relative aspect-[4/5] sm:aspect-[3/4] w-full overflow-hidden rounded-t-[2.25rem] rounded-b-xl bg-[#eee7dc]">
                    <img
                      src={place.image}
                      alt={place.name}
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

                    {/* Category Stamp */}
                    <span className="absolute top-3 right-3 rounded-full border border-white/20 bg-black/60 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wider text-white backdrop-blur-md">
                      {place.category}
                    </span>

                    {/* Floating Transit Ribbon */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between rounded-xl bg-white/95 px-3 py-1.5 text-xs text-[#4a382d] shadow-md backdrop-blur-md">
                      <div className="flex items-center gap-1.5 min-w-0">
                        {getTransitIcon(place.distance)}
                        <span className="text-[11px] font-semibold truncate">
                          {place.distance}
                        </span>
                      </div>
                      <ChevronRight size={12} className="text-[#a58b72] shrink-0" />
                    </div>
                  </div>

                  {/* Base Waypoint Details */}
                  <div className="flex flex-1 flex-col justify-between p-4 pt-3.5">
                    <div>
                      <h4 className="font-serif text-base sm:text-lg font-semibold leading-snug text-[#4a382d] transition-colors group-hover:text-[#8e6848]">
                        {place.name}
                      </h4>
                      <p className="mt-2 text-xs leading-relaxed text-[#777064] line-clamp-3">
                        {place.description}
                      </p>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-dashed border-[#ded5c8] pt-3 text-[10px] font-semibold uppercase tracking-wider text-[#a58b72]">
                      <span className="inline-flex items-center gap-1">
                        <MapPin size={10} />
                        <span>Curated Waypoint</span>
                      </span>
                      <Compass size={11} className="opacity-70" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* 5. LUXURY RESERVATION CTA */}
      {/* ================================================================ */}
      <section className="bg-[#35312c] py-20 text-[#f0ede7]">
        <div className="container-custom text-center max-w-2xl">
          <p className="text-xs font-semibold tracking-[0.3em] text-[#e0c49a]">
            YOUR EXTRAORDINARY STAY AWAITS
          </p>
          <h2 className="mt-4 font-serif text-3xl font-light sm:text-4xl md:text-5xl">
            Experience the Distinction of Arundra Signature
          </h2>
          <p className="mt-5 text-sm leading-relaxed text-[#ded8cf]">
            Reserve your private sanctuary today and let our concierge tailor your personalized recreation, dining, and wellness journey.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/rooms"
              className="cursor-pointer inline-flex items-center gap-2 rounded-lg border border-[#d5b78a] bg-[#d5b78a] px-7 py-3 text-xs font-semibold text-[#30271e] shadow-md transition hover:bg-[#ead7b8]"
            >
              <span>Explore Our Rooms & Suites</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

