"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Tag,
  CalendarDays,
  Check,
  Copy,
  ArrowRight,
  ShieldCheck,
  Award,
  Crown,
  Sparkles,
  Info,
  Gift,
  Clock,
  PhoneCall,
  CheckCircle2,
  Heart,
  Wifi,
  MapPin,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  DEFAULT_OFFERS_SETTINGS,
  DEFAULT_OFFERS_ITEMS,
  DEFAULT_GUARANTEE_ITEMS,
} from "@/lib/offers-settings";
import type { OffersSettings, OfferItem } from "@/types/database";

function renderGuaranteeIcon(iconName?: string) {
  const props = { className: "h-6 w-6 text-[#a58b72]" };
  switch (iconName) {
    case "Award":
      return <Award {...props} />;
    case "Clock":
      return <Clock {...props} />;
    case "PhoneCall":
      return <PhoneCall {...props} />;
    case "Crown":
      return <Crown {...props} />;
    case "Heart":
      return <Heart {...props} />;
    case "Wifi":
      return <Wifi {...props} />;
    case "Check":
      return <Check {...props} />;
    case "Sparkles":
      return <Sparkles {...props} />;
    case "Tag":
      return <Tag {...props} />;
    case "MapPin":
      return <MapPin {...props} />;
    case "ShieldCheck":
    default:
      return <ShieldCheck {...props} />;
  }
}

export default function OffersPageClient({
  initialSettings,
}: {
  initialSettings?: OffersSettings;
}) {
  const [settings, setSettings] = useState<OffersSettings>(
    initialSettings || DEFAULT_OFFERS_SETTINGS
  );
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    if (initialSettings) {
      setSettings(initialSettings);
    }
  }, [initialSettings]);

  useEffect(() => {
    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<OffersSettings>;
      if (customEvent.detail) {
        setSettings(customEvent.detail);
      } else {
        fetch("/api/offers", { cache: "no-store" })
          .then((res) => res.json())
          .then((data) => {
            if (data.settings) setSettings(data.settings);
          })
          .catch(() => {});
      }
    };

    window.addEventListener("offers-settings-updated" as any, handleUpdate);
    return () =>
      window.removeEventListener("offers-settings-updated" as any, handleUpdate);
  }, []);

  const offers = useMemo(() => {
    return Array.isArray(settings.offers_items) && settings.offers_items.length > 0
      ? settings.offers_items
      : DEFAULT_OFFERS_ITEMS;
  }, [settings.offers_items]);

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    offers.forEach((o) => {
      if (o.category) set.add(o.category);
    });
    return ["All", ...Array.from(set)];
  }, [offers]);

  // Filtered offers
  const filteredOffers = useMemo(() => {
    if (activeCategory === "All") return offers;
    return offers.filter((o) => o.category === activeCategory);
  }, [offers, activeCategory]);

  const guaranteeItems = useMemo(() => {
    return Array.isArray(settings.guarantee_items) && settings.guarantee_items.length > 0
      ? settings.guarantee_items
      : DEFAULT_GUARANTEE_ITEMS;
  }, [settings.guarantee_items]);

  const handleCopyCode = (code?: string) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => {
      setCopiedCode(null);
    }, 2500);
  };

  return (
    <main className="min-h-screen bg-[#fcfaf7] text-[#4a382d]">
      <Navbar />

      {/* ================================================================ */}
      {/* 1. HERO BANNER: Atmospheric Luxury Curations */}
      {/* ================================================================ */}
      <section className="relative overflow-hidden bg-[#1b1713] text-[#f0ede7] pt-32 pb-24 md:pt-40 md:pb-28">
        {/* Background Image with Deep Contrast Gradients */}
        <div className="absolute inset-0 z-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={
              settings.hero_image ||
              "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1600&q=85"
            }
            alt="Arundra Offers"
            className="h-full w-full object-cover opacity-45 scale-105 transition-transform duration-[10000ms]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1b1713] via-[#1b1713]/70 to-[#1b1713]/40" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1b1713] via-[#1b1713]/60 to-transparent" />
        </div>

        <div className="container-custom relative z-10">
          <div className="max-w-3xl">
            {/* Eyebrow Pill */}
            <div className="inline-flex items-center gap-2 rounded-full border border-[#d5b78a]/40 bg-[#d5b78a]/10 px-4 py-1.5 backdrop-blur-md">
              <Gift size={13} className="text-[#e0c49a]" />
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#e0c49a]">
                {settings.hero_eyebrow || "EXCLUSIVE CURATIONS & PRIVILEGES"}
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="mt-6 font-serif text-4xl font-light leading-[1.12] tracking-tight text-[#f0ede7] sm:text-5xl md:text-6xl">
              {settings.hero_title || "Exceptional Stays, Tailored for Wonder"}
            </h1>

            {/* Description */}
            <p className="mt-6 max-w-2xl text-sm leading-8 text-[#ded8cf] sm:text-base sm:leading-8">
              {settings.hero_description ||
                "Discover bespoke packages, seasonal staycations, and sensory wellness journeys crafted to elevate every moment of your stay at Arundra Signature Pondok Indah."}
            </p>

            {/* Highlights Bar */}
            <div className="mt-8 flex flex-wrap items-center gap-6 pt-4 border-t border-white/10 text-xs text-[#ded8cf]">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-[#e0c49a]" />
                <span>Best Direct Rate Guaranteed</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-[#e0c49a]" />
                <span>Complimentary Spa & Dining Privileges</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-[#e0c49a]" />
                <span>Flexible Rescheduling Support</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* 2. CATEGORY FILTER NAVIGATION BAR */}
      {/* ================================================================ */}
      <section className="sticky top-0 z-30 border-b border-[#ded5c8] bg-white/95 backdrop-blur-md py-3 shadow-xs">
        <div className="container-custom flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`cursor-pointer whitespace-nowrap rounded-full px-4 py-2 text-xs font-medium transition-all ${
                  activeCategory === cat
                    ? "bg-[#4a382d] text-white shadow-xs"
                    : "border border-[#ded5c8] bg-[#fbf9f5] text-[#755b43] hover:border-[#a58b72] hover:text-[#4a382d]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <span className="hidden sm:inline-block text-xs font-mono text-[#a58b72]">
            {filteredOffers.length} {filteredOffers.length === 1 ? "Offer" : "Offers"} Available
          </span>
        </div>
      </section>

      {/* ================================================================ */}
      {/* 3. OFFERS DOSSIER: Alternating Editorial Showcase with Ticket Motifs */}
      {/* ================================================================ */}
      <section className="py-20 md:py-28 bg-[#eee7dc]/50">
        <div className="container-custom">
          <div className="space-y-24 md:space-y-32">
            {filteredOffers.map((offer, idx) => {
              const isEven = idx % 2 === 0;
              return (
                <div
                  key={offer.id || idx}
                  className="grid items-stretch gap-10 lg:grid-cols-12 lg:gap-14"
                >
                  {/* Photo Side (7 cols on lg) */}
                  <div
                    className={`group relative lg:col-span-7 flex flex-col ${
                      isEven ? "lg:order-1" : "lg:order-2"
                    }`}
                  >
                    <div className="relative h-full min-h-[380px] sm:min-h-[460px] overflow-hidden rounded-3xl border border-[#ded5c8] bg-white shadow-md transition-all duration-700 group-hover:shadow-2xl">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={offer.image}
                        alt={offer.title}
                        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                      {/* Top Badges */}
                      <div className="absolute top-5 left-5 right-5 flex items-center justify-between gap-3">
                        {offer.badge && (
                          <div className="rounded-full bg-white/90 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#4a382d] shadow-sm backdrop-blur-md">
                            {offer.badge}
                          </div>
                        )}

                        <div className="rounded-full border border-white/20 bg-black/45 px-3 py-1 font-mono text-[10px] font-bold tracking-widest text-[#f0ede7] backdrop-blur-md">
                          № {String(idx + 1).padStart(2, "0")}
                        </div>
                      </div>

                      {/* Floating Bottom Card: Pricing & Validity */}
                      <div className="absolute bottom-5 left-5 right-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/20 bg-black/60 p-4 text-white backdrop-blur-md">
                        <div>
                          <span className="block text-[10px] font-mono uppercase tracking-widest text-[#e0c49a]">
                            Exclusive Package Rate
                          </span>
                          <p className="mt-0.5 font-serif text-lg font-semibold text-white">
                            {offer.price}
                          </p>
                        </div>

                        {offer.validity && (
                          <div className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs text-[#ded8cf]">
                            <CalendarDays size={13} className="text-[#e0c49a]" />
                            <span>{offer.validity}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Voucher Narrative & Inclusions Side (5 cols on lg) */}
                  <div
                    className={`lg:col-span-5 flex flex-col justify-between rounded-3xl border border-[#ded5c8] bg-white p-7 sm:p-9 shadow-sm ${
                      isEven ? "lg:order-2" : "lg:order-1"
                    }`}
                  >
                    <div>
                      {/* Eyebrow & Category */}
                      <div className="flex items-center gap-2.5">
                        <span className="h-px w-8 bg-[#a58b72]" />
                        <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#a58b72]">
                          {offer.category || "SIGNATURE RETREAT"}
                        </span>
                      </div>

                      {/* Offer Title */}
                      <h2 className="mt-3 font-serif text-2xl sm:text-3xl lg:text-4xl font-normal leading-snug text-[#4a382d]">
                        {offer.title}
                      </h2>

                      {/* Tagline */}
                      {offer.tagline && (
                        <p className="mt-1 font-serif text-sm italic text-[#755b43]">
                          {offer.tagline}
                        </p>
                      )}

                      {/* Narrative Description */}
                      <p className="mt-4 text-xs sm:text-sm leading-relaxed text-[#777064]">
                        {offer.description}
                      </p>

                      {/* Package Inclusions Checklist */}
                      {offer.inclusions && offer.inclusions.length > 0 && (
                        <div className="mt-6 border-t border-[#ded5c8] pt-5">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8c745f]">
                            Curated Inclusions & Privileges
                          </p>
                          <ul className="mt-3 space-y-2">
                            {offer.inclusions.map((inc, iIdx) => (
                              <li
                                key={iIdx}
                                className="flex items-start gap-2.5 text-xs text-[#524b42]"
                              >
                                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#ded5c8]/60 text-[#4a382d]">
                                  <Check size={10} strokeWidth={2.5} />
                                </span>
                                <span className="font-medium leading-relaxed">{inc}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Promo Code Box if available */}
                      {offer.promo_code && (
                        <div className="mt-6 flex items-center justify-between rounded-xl border border-dashed border-[#a58b72] bg-[#fbf9f5] px-4 py-2.5">
                          <div>
                            <span className="block text-[10px] font-mono uppercase tracking-wider text-[#a58b72]">
                              Booking Promo Code
                            </span>
                            <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#4a382d]">
                              {offer.promo_code}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleCopyCode(offer.promo_code)}
                            className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg border border-[#ded5c8] bg-white px-3 py-1.5 text-xs font-medium text-[#4a382d] transition hover:bg-[#f8f6f1]"
                          >
                            {copiedCode === offer.promo_code ? (
                              <>
                                <Check size={12} className="text-emerald-600" />
                                <span className="text-emerald-700 font-semibold">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy size={12} className="text-[#a58b72]" />
                                <span>Copy Code</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Bottom Actions & Policy Notes */}
                    <div className="mt-8 border-t border-[#ded5c8] pt-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <span className="text-[11px] font-mono text-[#a58b72] uppercase tracking-wider block">
                            Special Rate
                          </span>
                          <span className="font-serif text-lg font-bold text-[#4a382d]">
                            {offer.price}
                          </span>
                        </div>

                        {offer.show_button !== false && (
                          <Link
                            href={offer.button_link || "/#booking"}
                            className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-xl bg-[#4a382d] px-6 py-3 text-xs font-semibold text-white shadow-sm transition hover:bg-[#392b23]"
                          >
                            <span>{offer.button_text || "Reserve This Offer"}</span>
                            <ArrowRight size={14} />
                          </Link>
                        )}
                      </div>

                      {offer.terms && (
                        <p className="mt-3 text-[11px] text-[#8c745f] leading-normal flex items-center gap-1.5">
                          <Info size={11} className="shrink-0 text-[#a58b72]" />
                          <span>{offer.terms}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* 4. WHY BOOK DIRECT: Concierge Privileges Bar */}
      {/* ================================================================ */}
      <section className="border-t border-[#ded5c8] bg-white py-16">
        <div className="container-custom">
          <div className="text-center max-w-xl mx-auto">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#a58b72]">
              {settings.guarantee_eyebrow || "THE ARUNDRA GUARANTEE"}
            </span>
            <h3 className="mt-2 font-serif text-2xl font-normal text-[#4a382d]">
              {settings.guarantee_title || "Direct Reservation Privileges"}
            </h3>
            <p className="mt-2 text-xs text-[#755b43]">
              {settings.guarantee_description ||
                "Every booking made through our official portal receives dedicated VIP hospitality attention."}
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {guaranteeItems.map((item, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-[#ded5c8] bg-[#fbf9f5] p-5"
              >
                {renderGuaranteeIcon(item.icon)}
                <h4 className="mt-3 font-serif text-sm font-semibold text-[#4a382d]">
                  {item.title}
                </h4>
                <p className="mt-1 text-xs text-[#777064]">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

