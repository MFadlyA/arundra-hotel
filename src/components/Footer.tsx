"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  MapPin,
  Mail,
  Phone,
  Clock,
  MessageCircle,
} from "lucide-react";
import { useFooterSettings } from "@/context/FooterContext";

export default function Footer() {
  const { settings } = useFooterSettings();

  // Format clean WhatsApp number link
  const cleanWhatsAppNumber = settings.whatsapp
    ? settings.whatsapp.replace(/[^0-9]/g, "")
    : "";

  return (
    <footer id="contact" className="bg-[#292722] text-white">
      <div className="container-custom grid gap-10 py-14 md:grid-cols-3">
        {/* BRAND & DESCRIPTION */}
        <div>
          <h2 className="text-3xl tracking-[0.12em] font-serif">
            {settings.brand_name || "Arundra Signature"}
          </h2>

          <p className="mt-2 text-[10px] tracking-[0.35em] text-[#c4aa8c] font-medium">
            {settings.brand_tagline || "HOTEL & RESIDENCE"}
          </p>

          <p className="mt-5 max-w-sm text-sm leading-7 text-white/60">
            {settings.description ||
              "4-Star luxury hotel & serviced residence in prestigious Pondok Indah, South Jakarta, where modern elegance meets warm, personalized service."}
          </p>

          {/* SOCIAL MEDIA LINKS */}
          {(settings.instagram_url ||
            settings.facebook_url ||
            settings.tiktok_url ||
            settings.youtube_url) && (
            <div className="mt-6 flex items-center gap-3">
              {settings.instagram_url && (
                <a
                  href={settings.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cursor-pointer flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-white/70 hover:bg-[#c4aa8c] hover:text-[#292722] transition-colors"
                  title="Instagram"
                  aria-label="Instagram"
                >
                  <svg
                    className="h-4 w-4 fill-current"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
              )}

              {settings.facebook_url && (
                <a
                  href={settings.facebook_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cursor-pointer flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-white/70 hover:bg-[#c4aa8c] hover:text-[#292722] transition-colors"
                  title="Facebook"
                  aria-label="Facebook"
                >
                  <svg
                    className="h-4 w-4 fill-current"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.5 5H18V0h-3.808C10.592 0 9 1.583 9 4.615V8z" />
                  </svg>
                </a>
              )}

              {settings.tiktok_url && (
                <a
                  href={settings.tiktok_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cursor-pointer flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-white/70 hover:bg-[#c4aa8c] hover:text-[#292722] transition-colors"
                  title="TikTok"
                  aria-label="TikTok"
                >
                  <svg
                    className="h-4 w-4 fill-current"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.49 6.3 6.3 0 0 0 1.86-4.49V8.52a8.27 8.27 0 0 0 4.84 1.55v-3.38z" />
                  </svg>
                </a>
              )}

              {settings.youtube_url && (
                <a
                  href={settings.youtube_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cursor-pointer flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-white/70 hover:bg-[#c4aa8c] hover:text-[#292722] transition-colors"
                  title="YouTube"
                  aria-label="YouTube"
                >
                  <svg
                    className="h-4 w-4 fill-current"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </a>
              )}
            </div>
          )}
        </div>

        {/* EXPLORE NAVIGATION LINKS */}
        <div>
          <h3 className="text-xl font-medium tracking-wide">Explore</h3>

          <nav
            aria-label="Footer Navigation"
            className="mt-5 flex flex-col gap-3 text-sm text-white/60"
          >
            {settings.explore_links && settings.explore_links.length > 0 ? (
              settings.explore_links.map((link, idx) => (
                <Link
                  key={`${link.label}-${idx}`}
                  href={link.url}
                  className="cursor-pointer hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              ))
            ) : (
              <>
                <Link href="/#rooms" className="cursor-pointer hover:text-white">
                  Rooms & Suites
                </Link>
                <Link
                  href="/#experience"
                  className="cursor-pointer hover:text-white"
                >
                  Our Experience
                </Link>
                <Link href="/#offers" className="cursor-pointer hover:text-white">
                  Special Offers
                </Link>
                <Link href="/login" className="cursor-pointer hover:text-white">
                  Sign In
                </Link>
              </>
            )}
          </nav>
        </div>

        {/* GET IN TOUCH & HOTEL INFO */}
        <div>
          <h3 className="text-xl font-medium tracking-wide">Get in Touch</h3>

          <div className="mt-5 space-y-3.5 text-sm leading-6 text-white/60">
            {/* ADDRESS */}
            <div className="flex items-start gap-2.5">
              <MapPin size={16} className="mt-1 shrink-0 text-[#c4aa8c]" />
              <p className="text-white/80">
                {settings.address ||
                  "Jl. Metro Pondok Indah No. 27, RT.15/RW.13, Kel. Pondok Pinang, Kec. Kebayoran Lama, Jakarta Selatan, DKI Jakarta 12310, Indonesia"}
              </p>
            </div>

            {/* EMAIL */}
            {settings.email && (
              <div className="flex items-center gap-2.5">
                <Mail size={16} className="shrink-0 text-[#c4aa8c]" />
                <a
                  href={`mailto:${settings.email}`}
                  className="cursor-pointer hover:text-white transition-colors underline-offset-2 hover:underline"
                >
                  {settings.email}
                </a>
              </div>
            )}

            {/* PHONE */}
            {settings.phone && (
              <div className="flex items-center gap-2.5">
                <Phone size={16} className="shrink-0 text-[#c4aa8c]" />
                <a
                  href={`tel:${settings.phone.replace(/[^0-9+]/g, "")}`}
                  className="cursor-pointer hover:text-white transition-colors"
                >
                  {settings.phone}
                </a>
              </div>
            )}

            {/* WHATSAPP */}
            {cleanWhatsAppNumber && (
              <div className="flex items-center gap-2.5">
                <MessageCircle size={16} className="shrink-0 text-[#25D366]" />
                <a
                  href={`https://wa.me/${cleanWhatsAppNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cursor-pointer text-[#25D366] hover:text-[#20ba59] transition-colors"
                >
                  Chat via WhatsApp
                </a>
              </div>
            )}

            {/* CHECK-IN / CHECK-OUT HOURS */}
            {(settings.check_in_time || settings.check_out_time) && (
              <div className="flex items-center gap-2.5 pt-1 text-xs text-white/50">
                <Clock size={15} className="shrink-0 text-[#c4aa8c]" />
                <span>
                  Check-in: {settings.check_in_time || "14:00"} • Check-out:{" "}
                  {settings.check_out_time || "12:00"}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* BOTTOM LEGAL / COPYRIGHT */}
      <div className="border-t border-white/10">
        <div className="container-custom flex flex-col justify-between gap-3 py-5 text-xs text-white/40 sm:flex-row">
          <p>
            © {new Date().getFullYear()}{" "}
            {settings.copyright_text ||
              "Arundra Signature Pondok Indah. All rights reserved."}
          </p>
          <p>
            {settings.bottom_note ||
              "KBLI: 55110 • NIB: 0402260021756 • CHSE Certified"}
          </p>
        </div>
      </div>
    </footer>
  );
}
