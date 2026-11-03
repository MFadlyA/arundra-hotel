import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Maximize,
  Users,
} from "lucide-react";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import RoomGallery from "@/components/RoomGallery";
import RoomCacheSaver from "@/components/RoomCacheSaver";
import { formatPrice } from "@/data/rooms";
import { getCachedRoomBySlug } from "@/lib/cms-cache";

type RoomDetailsPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const revalidate = 60;

export default async function RoomDetailsPage({
  params,
}: RoomDetailsPageProps) {
  const { slug } = await params;
  const room = await getCachedRoomBySlug(slug);

  if (!room) {
    notFound();
  }

  const bookingParams = new URLSearchParams({
    room: room.slug,
  });

  return (
    <>
      <RoomCacheSaver room={room} />
      <Navbar />

      <main className="min-h-screen bg-[#f8f6f1]">
        {/* BREADCRUMB */}
        <section className="border-b border-[#ded5c8]">
          <div className="container-custom py-5">
            <Link
              href="/#rooms"
              className="inline-flex items-center gap-2 text-sm text-[#777064] hover:text-[#4a382d]"
            >
              <ArrowLeft size={16} />
              Back to Rooms & Suites
            </Link>
          </div>
        </section>

        {/* ROOM HEADING */}
        <section className="container-custom pb-8 pt-12 md:pt-16">
          <p className="text-xs font-semibold tracking-[0.3em] text-[#a58b72]">
            ACCOMMODATION
          </p>

          <div className="mt-4 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <h1 className="text-4xl text-[#4a382d] sm:text-5xl">
                {room.name}
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-[#777064]">
                {room.description}
              </p>
            </div>

            <div className="flex flex-wrap gap-6 text-sm text-[#777064]">
              <span className="flex items-center gap-2">
                <Users size={16} className="text-[#a58b72]" />
                Up to {room.guests} guests
              </span>

              <span className="flex items-center gap-2">
                <Maximize size={16} className="text-[#a58b72]" />
                {room.size} m²
              </span>
            </div>
          </div>
        </section>

        {/* GALLERY */}
        <section className="container-custom pb-16">
          <RoomGallery images={room.images} name={room.name} />
        </section>

        {/* ROOM DETAILS & BOOKING CTA */}
        <section className="container-custom grid gap-12 pb-24 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div>
              <h2 className="text-2xl text-[#4a382d]">
                Room Overview
              </h2>

              <p className="mt-4 text-sm leading-8 text-[#777064]">
                {room.fullDescription}
              </p>
            </div>

            <div className="mt-12 border-t border-[#ded5c8] pt-10">
              <h2 className="text-2xl text-[#4a382d]">
                Room Amenities
              </h2>

              <p className="mt-3 text-sm text-[#777064]">
                Everything you need for a comfortable stay.
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {room.amenities.map((amenity) => (
                  <div
                    key={amenity}
                    className="flex items-center gap-3 text-sm text-[#62594f]"
                  >
                    <Check size={17} className="text-[#a58b72]" />
                    {amenity}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* BOOKING CARD */}
          <aside className="h-fit border border-[#ded5c8] bg-white p-6 sm:p-8 md:sticky md:top-8">
            <p className="text-xs font-semibold tracking-[0.2em] text-[#a58b72]">
              MAKE IT YOUR STAY
            </p>

            <h2 className="mt-4 text-3xl text-[#4a382d]">
              Reserve This Room
            </h2>

            <div className="mt-6 border-b border-[#ded5c8] pb-6">
              <p className="text-sm text-[#777064]">Starting from</p>

              <p className="mt-2 text-3xl font-semibold text-[#4a382d]">
                {formatPrice(room.price)}
              </p>

              <p className="mt-1 text-xs text-[#777064]">per night</p>
            </div>

            <div className="mt-6 space-y-4 text-sm text-[#62594f]">
              <div className="flex items-center justify-between gap-3">
                <span>Room size</span>
                <span>{room.size} m²</span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <span>Maximum guests</span>
                <span>{room.guests} guests</span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <span>Bed</span>
                <span>{room.bed}</span>
              </div>
            </div>

            <Link
              href={`/booking?${bookingParams.toString()}`}
              className="cursor-pointer rounded-lg mt-8 flex w-full items-center justify-center gap-3 bg-[#4a382d] px-5 py-4 text-sm font-medium text-white hover:bg-[#655043]"
            >
              Continue Booking
              <ArrowRight size={17} />
            </Link>

            <p className="mt-4 text-center text-xs leading-6 text-[#777064]">
              Select your dates and guest details on the next page.
            </p>
          </aside>
        </section>
      </main>

      <Footer />
    </>
  );
}
