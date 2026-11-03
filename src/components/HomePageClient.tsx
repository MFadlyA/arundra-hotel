"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  ArrowRight,
  CalendarDays,
  ChevronDown,
  ShieldCheck,
  Crown,
  Users,
  Award,
  BedDouble,
  Clock,
  Coffee,
  Compass,
  Heart,
  Phone,
  Wifi,
  X,
  MapPin,
  Check,
} from "lucide-react";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroCarousel from "@/components/HeroCarousel";
import { formatPrice, type Room } from "@/data/rooms";
import { type HeroSlide } from "@/data/hero-slides";
import { DEFAULT_WHY_BOOK_SETTINGS } from "@/lib/why-book-settings";
import { DEFAULT_ESCAPE_SETTINGS } from "@/lib/escape-settings";
import { DEFAULT_ROOMS_HEADER_SETTINGS } from "@/lib/rooms-header-settings";
import type {
  DifferenceSettings,
  EscapeSettings,
  WhyBookSettings,
  HospitalitySettings,
  RoomsHeaderSettings,
} from "@/types/database";

function renderWhyBookIcon(
  name: string,
  size = 28,
  className = "text-[#a58b72]"
) {
  switch (name) {
    case "ShieldCheck":
      return <ShieldCheck className={className} size={size} />;
    case "Check":
      return <Check className={className} size={size} />;
    case "MapPin":
      return <MapPin className={className} size={size} />;
    case "Crown":
    case "Sparkles":
      return <Crown className={className} size={size} />;
    case "Clock":
      return <Clock className={className} size={size} />;
    case "Heart":
      return <Heart className={className} size={size} />;
    case "Coffee":
      return <Coffee className={className} size={size} />;
    case "BedDouble":
      return <BedDouble className={className} size={size} />;
    case "Award":
      return <Award className={className} size={size} />;
    case "Phone":
      return <Phone className={className} size={size} />;
    case "Wifi":
      return <Wifi className={className} size={size} />;
    case "Compass":
      return <Compass className={className} size={size} />;
    default:
      return <Award className={className} size={size} />;
  }
}

export interface HomePageClientProps {
  initialRooms: Room[];
  initialDifference: DifferenceSettings;
  initialEscape: EscapeSettings;
  initialWhyBook: WhyBookSettings;
  initialHospitality: HospitalitySettings;
  initialSlides: HeroSlide[];
  initialRoomsHeader?: RoomsHeaderSettings;
}

export default function HomePageClient({
  initialRooms,
  initialDifference,
  initialEscape,
  initialWhyBook,
  initialHospitality,
  initialSlides,
  initialRoomsHeader = DEFAULT_ROOMS_HEADER_SETTINGS,
}: HomePageClientProps) {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("2");

  // Initial state immediately hydrated with SSR data from database (no flash/flicker)
  const [roomList, setRoomList] = useState<Room[]>(initialRooms);
  const [difference, setDifference] = useState<DifferenceSettings>(initialDifference);
  const [escape, setEscape] = useState<EscapeSettings>(initialEscape);
  const [whyBook, setWhyBook] = useState<WhyBookSettings>(initialWhyBook);
  const [hospitality, setHospitality] = useState<HospitalitySettings>(initialHospitality);
  const [roomsHeader, setRoomsHeader] = useState<RoomsHeaderSettings>(
    initialRoomsHeader || DEFAULT_ROOMS_HEADER_SETTINGS
  );

  useEffect(() => {
    // Listen for live CMS updates when admin edits settings in real time
    const handleDifferenceUpdated = (e: Event) => {
      const customEvent = e as CustomEvent<DifferenceSettings>;
      if (customEvent.detail) {
        setDifference(customEvent.detail);
      } else {
        fetch("/api/difference", { cache: "no-store" })
          .then((res) => res.json())
          .then((data) => data.settings && setDifference(data.settings))
          .catch(() => {});
      }
    };

    const handleEscapeUpdated = (e: Event) => {
      const customEvent = e as CustomEvent<EscapeSettings>;
      if (customEvent.detail) {
        setEscape(customEvent.detail);
      } else {
        fetch("/api/escape", { cache: "no-store" })
          .then((res) => res.json())
          .then((data) => data.settings && setEscape(data.settings))
          .catch(() => {});
      }
    };

    const handleWhyBookUpdated = (e: Event) => {
      const customEvent = e as CustomEvent<WhyBookSettings>;
      if (customEvent.detail) {
        setWhyBook(customEvent.detail);
      } else {
        fetch("/api/why-book", { cache: "no-store" })
          .then((res) => res.json())
          .then((data) => data.settings && setWhyBook(data.settings))
          .catch(() => {});
      }
    };

    const handleHospitalityUpdated = (e: Event) => {
      const customEvent = e as CustomEvent<HospitalitySettings>;
      if (customEvent.detail) {
        setHospitality(customEvent.detail);
      } else {
        fetch("/api/hospitality", { cache: "no-store" })
          .then((res) => res.json())
          .then((data) => data.settings && setHospitality(data.settings))
          .catch(() => {});
      }
    };

    const handleRoomsHeaderUpdated = (e: Event) => {
      const customEvent = e as CustomEvent<RoomsHeaderSettings>;
      if (customEvent.detail) {
        setRoomsHeader(customEvent.detail);
      } else {
        fetch("/api/rooms-header", { cache: "no-store" })
          .then((res) => res.json())
          .then((data) => data.settings && setRoomsHeader(data.settings))
          .catch(() => {});
      }
    };

    window.addEventListener(
      "difference-settings-updated",
      handleDifferenceUpdated
    );
    window.addEventListener(
      "escape-settings-updated",
      handleEscapeUpdated
    );
    window.addEventListener(
      "why-book-settings-updated",
      handleWhyBookUpdated
    );
    window.addEventListener(
      "hospitality-settings-updated",
      handleHospitalityUpdated
    );
    window.addEventListener(
      "rooms-header-settings-updated",
      handleRoomsHeaderUpdated
    );

    return () => {
      window.removeEventListener(
        "difference-settings-updated",
        handleDifferenceUpdated
      );
      window.removeEventListener(
        "escape-settings-updated",
        handleEscapeUpdated
      );
      window.removeEventListener(
        "why-book-settings-updated",
        handleWhyBookUpdated
      );
      window.removeEventListener(
        "hospitality-settings-updated",
        handleHospitalityUpdated
      );
      window.removeEventListener(
        "rooms-header-settings-updated",
        handleRoomsHeaderUpdated
      );
    };
  }, []);

  const [bookingAlert, setBookingAlert] = useState<string | null>(null);
  const today = new Date().toLocaleDateString("en-CA");

  function searchRooms() {
    if (!checkIn || !checkOut) {
      setBookingAlert("Please select your check-in and check-out dates before searching.");
      return;
    }

    if (checkIn < today) {
      setBookingAlert("Check-in date cannot be in the past.");
      return;
    }

    if (checkOut <= checkIn) {
      setBookingAlert("Check-out date must be after your check-in date.");
      return;
    }

    const params = new URLSearchParams({
      checkIn,
      checkOut,
      guests,
    });

    window.location.href = `/rooms?${params.toString()}`;
  }

  return (
    <>
      <Navbar />

      <main>
        {/* HERO */}
        <HeroCarousel initialSlides={initialSlides} />

        {/* BOOKING SEARCH */}
        <section id="booking" className="relative z-20 -mt-1 bg-[#f8f6f1]">
          <div className="container-custom">
            <div className="grid gap-5 border-b border-[#ded5c8] py-8 sm:grid-cols-2 lg:grid-cols-[1.2fr_1.2fr_1fr_auto] lg:items-end">
              <div>
                <label className="mb-3 flex items-center gap-2 text-xs font-semibold tracking-widest text-[#777064]">
                  <CalendarDays size={16} />
                  CHECK-IN
                </label>

                <input
                  type="date"
                  min={today}
                  value={checkIn}
                  onChange={(event) => {
                    setCheckIn(event.target.value);

                    if (checkOut && event.target.value >= checkOut) {
                      setCheckOut("");
                    }
                  }}
                  className="w-full border-b border-[#ded5c8] bg-transparent py-3 text-sm text-[#4a382d]"
                />
              </div>

              <div>
                <label className="mb-3 flex items-center gap-2 text-xs font-semibold tracking-widest text-[#777064]">
                  <CalendarDays size={16} />
                  CHECK-OUT
                </label>

                <input
                  type="date"
                  min={checkIn || today}
                  value={checkOut}
                  onChange={(event) => setCheckOut(event.target.value)}
                  className="w-full border-b border-[#ded5c8] bg-transparent py-3 text-sm text-[#4a382d]"
                />
              </div>

              <div>
                <label className="mb-3 flex items-center gap-2 text-xs font-semibold tracking-widest text-[#777064]">
                  <Users size={16} />
                  GUESTS
                </label>

                <div className="relative">
                  <select
                    value={guests}
                    onChange={(event) => setGuests(event.target.value)}
                    className="w-full appearance-none border-b border-[#ded5c8] bg-transparent py-3 text-sm text-[#4a382d]"
                  >
                    <option value="1">1 Guest</option>
                    <option value="2">2 Guests</option>
                    <option value="3">3 Guests</option>
                    <option value="4">4 Guests</option>
                    <option value="5">5 Guests</option>
                    <option value="6">6 Guests</option>
                  </select>

                  <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 text-[#a58b72]"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={searchRooms}
                className="cursor-pointer rounded-lg flex items-center justify-center gap-3 bg-[#4a382d] px-7 py-4 text-sm text-white hover:bg-[#655043]"
              >
                Search Rooms
                <ArrowRight size={17} />
              </button>
            </div>
          </div>
        </section>

        {/* INTRODUCTION / THE ART OF HOSPITALITY */}
        <section id="experience" className="py-24 md:py-32">
          <div className="container-custom grid items-center gap-14 lg:grid-cols-2 lg:gap-24">
            <div className="relative">
              <img
                src={hospitality.image_url}
                alt="Elegant and comfortable hotel interior"
                className="h-[380px] w-full object-cover sm:h-[500px]"
              />

              {(hospitality.badge_line1 || hospitality.badge_line2) && (
                <div className="absolute -bottom-6 -right-3 bg-[#e9dfd1] px-7 py-6 sm:-right-6">
                  {hospitality.badge_line1 && (
                    <p className="font-serif text-3xl text-[#4a382d]">
                      {hospitality.badge_line1}
                    </p>
                  )}
                  {hospitality.badge_line2 && (
                    <p className="font-serif text-3xl italic text-[#a58b72]">
                      {hospitality.badge_line2}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="pt-5 lg:pt-0">
              {hospitality.eyebrow && (
                <p className="text-xs font-semibold tracking-[0.3em] text-[#a58b72]">
                  {hospitality.eyebrow}
                </p>
              )}

              {(hospitality.title_line1 || hospitality.title_line2) && (
                <h2 className="mt-6 text-4xl leading-tight text-[#4a382d] sm:text-5xl">
                  {hospitality.title_line1}
                  {hospitality.title_line1 && hospitality.title_line2 && <br />}
                  {hospitality.title_line2}
                </h2>
              )}

              {hospitality.paragraph1 && (
                <p className="mt-7 text-sm leading-8 text-[#777064]">
                  {hospitality.paragraph1}
                </p>
              )}

              {hospitality.paragraph2 && (
                <p className="mt-4 text-sm leading-8 text-[#777064]">
                  {hospitality.paragraph2}
                </p>
              )}

              {hospitality.button_text && (
                <Link
                  href={hospitality.button_link || "/experience"}
                  className="mt-8 inline-flex items-center gap-3 border-b border-[#a58b72] pb-2 text-sm font-semibold text-[#4a382d] transition-colors hover:text-[#a58b72]"
                >
                  {hospitality.button_text}
                  <ArrowRight size={17} />
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* ROOMS */}
        <section className="bg-[#eee7dc] py-24 md:py-28">
          <div className="container-custom">
            <div className="mb-12 flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div>
                <p
                  id="rooms"
                  className="scroll-mt-6 text-xs font-semibold tracking-[0.3em] text-[#a58b72]"
                >
                  {roomsHeader.eyebrow}
                </p>

                <h2 className="mt-4 text-4xl text-[#4a382d] sm:text-5xl">
                  {roomsHeader.title}
                </h2>

                <p className="mt-4 max-w-xl text-sm leading-7 text-[#777064]">
                  {roomsHeader.description}
                </p>
              </div>

              <Link
                href={roomsHeader.button_link || "/rooms"}
                className="cursor-pointer inline-flex items-center gap-2 text-sm font-semibold text-[#4a382d] hover:text-[#a58b72]"
              >
                {roomsHeader.button_text || "View All Rooms"}
                <ArrowRight size={17} />
              </Link>
            </div>

            {/* Display exactly 3 rooms (admin-selected featured rooms take priority) */}
            <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3 ">
              {(
                roomList.filter((r) => r.is_featured).length > 0
                  ? [
                      ...roomList.filter((r) => r.is_featured),
                      ...roomList.filter((r) => !r.is_featured),
                    ]
                  : roomList
              )
                .slice(0, 3)
                .map((room) => (
                <article
                  key={room.name}
                  className="group overflow-hidden bg-[#f8f6f1] overflow-hidden rounded-xl border border-[#d1c9be] "
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={room.images[0]}
                      alt={room.name}
                      className="h-[280px] w-full object-cover transition duration-700 group-hover:scale-105"
                    />

                    <div className="absolute bottom-4 left-4 bg-[#f8f6f1] px-4 py-2 text-xs text-[#4a382d]">
                      {room.size}
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-2xl text-[#4a382d]">{room.name}</h3>

                      <span className="flex items-center gap-1 pt-2 text-xs text-[#777064]">
                        <Users size={14} />
                        {room.guests}
                      </span>
                    </div>

                    <p className="mt-3 min-h-[48px] text-sm leading-6 text-[#777064]">
                      {room.description}
                    </p>

                    <div className="mt-6 flex items-end justify-between border-t border-[#ded5c8] pt-5">
                      <div>
                        <p className="text-xs text-[#777064]">Starting from</p>
                        <p className="mt-1 text-lg font-semibold text-[#4a382d]">
                          {formatPrice(room.price)}
                        </p>
                        <p className="mt-1 text-xs text-[#777064]">per night</p>
                      </div>

                      <Link
                        href={`/rooms/${room.slug}`}
                        className="cursor-pointer inline-flex items-center gap-2 text-sm font-semibold text-[#4a382d] hover:text-[#a58b72]"
                      >
                        Details
                        <ArrowRight size={16} />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURES: THE ARUNDRA SIGNATURE DIFFERENCE */}
        <section className="py-24 md:py-28">
          <div className="container-custom">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-semibold tracking-[0.3em] text-[#a58b72] uppercase">
                {difference.tagline || "VISION & BRAND PILLARS"}
              </p>

              <h2 className="mt-5 text-4xl text-[#4a382d] sm:text-5xl font-serif">
                {difference.title || "Redefining Modern Hospitality"}
              </h2>

              {difference.description && (
                <p className="mt-5 text-sm leading-7 text-[#777064]">
                  {difference.description}
                </p>
              )}
            </div>

            <div className="mt-16 grid gap-10 md:grid-cols-3">
              {(difference.items || []).map((item, idx) => (
                <div
                  key={idx}
                  className="border-t border-[#ded5c8] pt-7"
                >
                  <span className="text-sm tracking-widest text-[#a58b72] font-semibold">
                    {item.number || String(idx + 1).padStart(2, "0")}
                  </span>

                  <h3 className="mt-5 text-2xl text-[#4a382d] font-serif">{item.title}</h3>

                  <p className="mt-4 text-sm leading-7 text-[#777064]">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SPECIAL OFFER / ESCAPE SECTION */}
        <section id="offers" className="px-4 pb-24 md:px-8 md:pb-28">
          <div className="relative mx-auto max-w-[1440px] overflow-hidden bg-[#4a382d]">
            <img
              src={escape.image_url || DEFAULT_ESCAPE_SETTINGS.image_url}
              alt="A relaxing hotel retreat"
              className="absolute inset-0 h-full w-full object-cover"
            />

            <div className="absolute inset-0 bg-[#292722]/65" />

            <div className="container-custom relative z-10 py-20 text-center md:py-28">
              <Compass
                size={28}
                className="mx-auto text-[#e0c6a5]"
                strokeWidth={1.3}
              />

              <p className="mt-6 text-xs tracking-[0.3em] text-[#e0c6a5] uppercase">
                {escape.eyebrow || "YOUR SIGNATURE STAY, YOUR WAY"}
              </p>

              <h2 className="mx-auto mt-5 max-w-3xl text-4xl leading-tight text-white sm:text-5xl md:text-6xl font-serif">
                {escape.title_line1 || "Your Signature Stay,"}
                {escape.title_line2 && (
                  <>
                    <br />
                    <span className="italic">{escape.title_line2}</span>
                  </>
                )}
              </h2>

              {escape.description && (
                <p className="mx-auto mt-6 max-w-xl text-sm leading-7 text-white/75">
                  {escape.description}
                </p>
              )}

              <a
                href={escape.button_link || "/offers"}
                className="cursor-pointer rounded-lg mt-9 inline-flex items-center gap-3 bg-[#f8f6f1] px-8 py-4 text-sm font-medium text-[#4a382d] hover:bg-[#e9dfd1] transition shadow-md"
              >
                {escape.button_text || "Discover Bespoke Offers"}
                <ArrowRight size={17} />
              </a>
            </div>
          </div>
        </section>

        {/* WHY BOOK WITH US */}
        <section className="border-y border-[#ded5c8] bg-[#eee7dc] py-12">
          <div className="container-custom grid gap-8 sm:grid-cols-3 items-start">
            {(whyBook.items || DEFAULT_WHY_BOOK_SETTINGS.items).map(
              (item, idx) => (
                <div
                  key={idx}
                  className="flex items-start justify-center text-left"
                >
                  <div className="flex items-start gap-3.5 max-w-sm w-full">
                    {/* Fixed top logo/icon */}
                    <div className="shrink-0 flex items-center justify-center h-7 w-7 text-[#a58b72]">
                      {renderWhyBookIcon(item.icon, 26, "text-[#a58b72]")}
                    </div>

                    {/* Content: Title fixed at top, only description flows downwards */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-medium text-[#4a382d] leading-7">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-xs leading-relaxed text-[#777064]">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </section>
      </main>

      <Footer />

      {/* LUXURY RESERVATION NOTICE MODAL (Replaces native browser alert) */}
      {bookingAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl border border-[#ded5c8] bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#ded5c8] pb-4">
              <div className="flex items-center gap-2.5 text-[#a58b72]">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f4ede4] text-[#755b43]">
                  <CalendarDays size={18} />
                </div>
                <h3 className="text-base font-serif font-bold text-[#4a382d]">
                  Reservation Notice
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setBookingAlert(null)}
                className="cursor-pointer rounded-lg p-1.5 text-[#777064] hover:bg-[#f8f6f1] transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 text-xs leading-relaxed text-[#62594f]">
              {bookingAlert}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setBookingAlert(null)}
                className="cursor-pointer rounded-lg bg-[#4a382d] px-5 py-2.5 text-xs font-medium text-white hover:bg-[#655043] transition shadow-xs"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

