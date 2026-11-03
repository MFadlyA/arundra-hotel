"use client";

import { useState, useCallback, useEffect } from "react";
import { ChevronLeft, ChevronRight, Image as ImageIcon } from "lucide-react";

interface RoomGalleryProps {
  name: string;
  images: string[];
}

export default function RoomGallery({ name, images }: RoomGalleryProps) {
  const validImages =
    Array.isArray(images) && images.length > 0
      ? images.filter(Boolean)
      : [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1400&q=85",
        ];

  const [activeIndex, setActiveIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const total = validImages.length;

  // The 2 right thumbnail photos dynamically advance along with activeIndex
  const rightIndex1 = total > 1 ? (activeIndex + 1) % total : 0;
  const rightIndex2 = total > 2 ? (activeIndex + 2) % total : rightIndex1;

  const handlePrev = useCallback(() => {
    setActiveIndex((current) => (current - 1 + total) % total);
  }, [total]);

  const handleNext = useCallback(() => {
    setActiveIndex((current) => (current + 1) % total);
  }, [total]);

  // Touch swipe support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;
    if (diff > 45) {
      handleNext();
    } else if (diff < -45) {
      handlePrev();
    }
    setTouchStart(null);
  };

  // Keyboard navigation when user is on the page
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (total <= 1) return;
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [total, handlePrev, handleNext]);

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {/* LEFT COLUMN: INTERACTIVE CAROUSEL */}
      <div
        className="group relative overflow-hidden md:row-span-2 bg-[#eee7dc] select-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Render all slides with smooth crossfade */}
        {validImages.map((img, idx) => (
          <div
            key={idx}
            className={`transition-opacity duration-500 ease-in-out ${
              idx === activeIndex
                ? "opacity-100 relative z-10"
                : "opacity-0 absolute inset-0 pointer-events-none"
            }`}
          >
            <img
              src={img}
              alt={`${name} view ${idx + 1}`}
              className="h-[300px] w-full object-cover sm:h-[450px] md:h-full md:min-h-[500px]"
            />
          </div>
        ))}

        {/* Counter Badge */}
        {total > 1 && (
          <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white backdrop-blur-md shadow-xs pointer-events-none">
            <ImageIcon size={13} className="text-[#e0c49a]" />
            <span>
              Photo {activeIndex + 1} of {total}
            </span>
          </div>
        )}

        {/* Carousel Navigation Buttons */}
        {total > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous photo"
              className="cursor-pointer absolute left-3 top-1/2 z-20 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm transition-all hover:bg-[#4a382d] hover:scale-105 active:scale-95 shadow-md opacity-90 sm:opacity-0 sm:group-hover:opacity-100"
            >
              <ChevronLeft size={22} />
            </button>

            <button
              type="button"
              onClick={handleNext}
              aria-label="Next photo"
              className="cursor-pointer absolute right-3 top-1/2 z-20 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm transition-all hover:bg-[#4a382d] hover:scale-105 active:scale-95 shadow-md opacity-90 sm:opacity-0 sm:group-hover:opacity-100"
            >
              <ChevronRight size={22} />
            </button>

            {/* Bottom Dots Indicator */}
            <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center items-center px-4 pointer-events-none">
              <div className="flex items-center gap-1.5 rounded-full bg-black/45 backdrop-blur-sm px-3 py-1.5 pointer-events-auto">
                {validImages.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveIndex(idx)}
                    aria-label={`Go to slide ${idx + 1}`}
                    className={`cursor-pointer h-1.5 rounded-full transition-all duration-300 ${
                      idx === activeIndex
                        ? "w-6 bg-[#e0c49a] shadow-xs"
                        : "w-1.5 bg-white/50 hover:bg-white/80"
                    }`}
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* RIGHT COLUMN: 2 THUMBNAIL PHOTOS THAT DYNAMICALLY CYCLE */}
      <div className="grid grid-cols-2 gap-3">
        {/* Right Thumbnail 1 */}
        <div
          onClick={() => total > 1 && setActiveIndex(rightIndex1)}
          className="relative overflow-hidden cursor-pointer group/thumb bg-[#eee7dc]"
          title={`Click to view Photo ${rightIndex1 + 1} on main display`}
        >
          <img
            key={`thumb-1-${rightIndex1}`}
            src={validImages[rightIndex1]}
            alt={`${name} view ${rightIndex1 + 1}`}
            className="h-[180px] w-full object-cover sm:h-[220px] transition-transform duration-500 ease-out group-hover/thumb:scale-105"
          />

          <div className="absolute top-2.5 right-2.5 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-xs opacity-80 group-hover/thumb:opacity-100 transition-opacity">
            Photo {rightIndex1 + 1}
          </div>

          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center">
            <span className="rounded-full bg-black/65 px-3 py-1 text-xs text-white backdrop-blur-xs shadow-xs">
              View Photo →
            </span>
          </div>
        </div>

        {/* Right Thumbnail 2 */}
        <div
          onClick={() => total > 2 && setActiveIndex(rightIndex2)}
          className="relative overflow-hidden cursor-pointer group/thumb bg-[#eee7dc]"
          title={`Click to view Photo ${rightIndex2 + 1} on main display`}
        >
          <img
            key={`thumb-2-${rightIndex2}`}
            src={validImages[rightIndex2]}
            alt={`${name} view ${rightIndex2 + 1}`}
            className="h-[180px] w-full object-cover sm:h-[220px] transition-transform duration-500 ease-out group-hover/thumb:scale-105"
          />

          <div className="absolute top-2.5 right-2.5 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-xs opacity-80 group-hover/thumb:opacity-100 transition-opacity">
            Photo {rightIndex2 + 1}
          </div>

          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center">
            <span className="rounded-full bg-black/65 px-3 py-1 text-xs text-white backdrop-blur-xs shadow-xs">
              View Photo →
            </span>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN BOTTOM: ORIGINAL QUOTE BOX */}
      <div className="flex items-center justify-center bg-[#eee7dc] p-6 text-center sm:p-10">
        <div>
          <p className="font-serif text-3xl text-[#4a382d]">
            A space to unwind.
          </p>

          <p className="mt-3 text-sm leading-6 text-[#777064]">
            Thoughtful comfort, refined interiors, and a relaxing atmosphere.
          </p>
        </div>
      </div>
    </div>
  );
}
