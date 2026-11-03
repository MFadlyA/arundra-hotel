"use client";

import { usePathname } from "next/navigation";
import { useFooterSettings } from "@/context/FooterContext";
import { DEFAULT_FOOTER_SETTINGS } from "@/lib/footer-settings";

export default function HangingTag() {
  const pathname = usePathname();
  const { settings } = useFooterSettings();

  // Exclude hanging tag on My Profile & Settings (/profile) and Admin Portal (/admin)
  if (
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/profile")
  ) {
    return null;
  }

  // Clean WhatsApp number
  const rawNumber = settings.whatsapp || DEFAULT_FOOTER_SETTINGS.whatsapp || "+62 21 5088 XXXX";
  const cleanNumber = rawNumber.replace(/[^0-9]/g, "") || "622150880000";

  // Pre-filled WhatsApp inquiry message
  const defaultMessage = encodeURIComponent(
    `Hello Arundra Signature Pondok Indah, I would like to inquire about hotel stays and reservations at Jl. Metro Pondok Indah No. 27.`
  );

  const whatsappUrl = `https://wa.me/${cleanNumber}?text=${defaultMessage}`;

  return (
    <aside
      aria-label="Arundra Signature Concierge WhatsApp Hanging Tag"
      className="fixed bottom-5 right-4 z-40 sm:bottom-7 sm:right-7 select-none animate-in fade-in slide-in-from-bottom-4 duration-500"
    >
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        title={`Chat with Arundra Signature Pondok Indah Concierge (${rawNumber})`}
        className="group flex items-center gap-2.5 no-underline transition-transform duration-200 active:scale-95"
      >
        {/* Pill callout box (matches user reference "Need Help? Chat with us") */}
        <div className="flex items-center rounded-lg border border-[#ded5c8] bg-white/95 px-3.5 py-2 backdrop-blur-xs shadow-[0_8px_20px_-4px_rgba(74,56,45,0.18)] transition-all duration-300 group-hover:border-[#c4a477] group-hover:bg-white group-hover:shadow-[0_12px_26px_-4px_rgba(74,56,45,0.26)]">
          <span className="text-xs sm:text-[13px] tracking-tight text-[#5a5247]">
            Need Help?{" "}
            <strong className="font-semibold text-[#4a382d]">
              Chat with us
            </strong>
          </span>
        </div>

        {/* Circular WhatsApp Button in Luxury Arundra Gold */}
        <div className="relative flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#c89d4d] via-[#b88c3a] to-[#9d7426] text-white shadow-[0_8px_20px_-3px_rgba(184,140,58,0.45)] transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_10px_24px_-2px_rgba(184,140,58,0.65)]">
          {/* Subtle animated ambient pulse ring */}
          <span className="absolute -inset-1 rounded-full bg-[#b88c3a]/30 animate-ping opacity-40 duration-1000 pointer-events-none" />

          {/* WhatsApp SVG Icon */}
          <svg
            viewBox="0 0 24 24"
            className="relative h-6 w-6 sm:h-6.5 sm:w-6.5 fill-current transition-transform duration-300 group-hover:scale-110"
            aria-hidden="true"
          >
            <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm.01 1.67c2.2 0 4.26.86 5.82 2.41a8.16 8.16 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.42 0-2.82-.37-4.06-1.08l-.29-.17-3.12.82.83-3.04-.19-.3A8.17 8.17 0 0 1 3.8 11.91c0-4.54 3.7-8.24 8.25-8.24zm4.52 11.53c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.25-.75-.67-1.25-1.5-1.4-1.75-.14-.25-.02-.39.11-.51.11-.11.25-.29.37-.44.13-.14.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.87.85-.87 2.08s.89 2.41 1.01 2.58c.13.17 1.75 2.67 4.24 3.75.59.26 1.06.41 1.42.53.6.19 1.14.16 1.57.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.15-1.18-.06-.1-.23-.16-.48-.28z" />
          </svg>
        </div>
      </a>
    </aside>
  );
}
