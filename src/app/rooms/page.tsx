import Link from "next/link";
import { ArrowRight, Users } from "lucide-react";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { formatPrice } from "@/data/rooms";
import { getCachedRooms } from "@/lib/cms-cache";

export const revalidate = 60;

export default async function RoomsPage() {
  const allRooms = await getCachedRooms();

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#f8f6f1]">
        <section className="bg-[#eee7dc] py-16 md:py-24">
          <div className="container-custom">
            <p className="text-xs font-semibold tracking-[0.3em] text-[#a58b72]">
              FIND YOUR PERFECT STAY
            </p>

            <h1 className="mt-5 text-4xl text-[#4a382d] sm:text-6xl">
              Rooms & Suites
            </h1>

            <p className="mt-5 max-w-xl text-sm leading-7 text-[#777064]">
              Explore our room selections and discover a comfortable space
              for your next stay.
            </p>
          </div>
        </section>

        <section className="container-custom py-14 md:py-20">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {allRooms.map((room) => (
              <article
                key={room.slug}
                className="overflow-hidden border border-[#ded5c8] bg-white"
              >
                <Link href={`/rooms/${room.slug}`}>
                  <img
                    src={room.images[0]}
                    alt={room.name}
                    className="h-[270px] w-full object-cover"
                  />
                </Link>

                <div className="p-6">
                  <h2 className="text-2xl text-[#4a382d]">
                    {room.name}
                  </h2>

                  <p className="mt-3 min-h-[48px] text-sm leading-6 text-[#777064]">
                    {room.description}
                  </p>

                  <div className="mt-5 flex items-center justify-between border-t border-[#ded5c8] pt-5">
                    <div>
                      <p className="text-xs text-[#777064]">
                        Starting from
                      </p>

                      <p className="mt-1 font-semibold text-[#4a382d]">
                        {formatPrice(room.price)}
                      </p>

                      <p className="mt-1 text-xs text-[#777064]">
                        per night
                      </p>
                    </div>

                    <span className="flex items-center gap-1 text-xs text-[#777064]">
                      <Users size={15} />
                      {room.guests} guests
                    </span>
                  </div>

                  <Link
                    href={`/rooms/${room.slug}`}
                    className="cursor-pointer mt-6 flex items-center justify-center gap-2 bg-[#4a382d] px-5 py-3.5 text-sm text-white hover:bg-[#655043]"
                  >
                    View Details
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
