import type { FooterSettings, FooterLink } from "@/types/database";

export const DEFAULT_EXPLORE_LINKS: FooterLink[] = [
  { label: "Rooms & Suites", url: "/#rooms" },
  { label: "Our Experience", url: "/#experience" },
  { label: "Special Offers", url: "/#offers" },
  { label: "Sign In", url: "/login" },
];

export const DEFAULT_FOOTER_SETTINGS: FooterSettings = {
  id: "default",
  brand_name: "Arundra Signature",
  brand_tagline: "HOTEL & RESIDENCE",
  description:
    "A 4-star luxury hotel & serviced residence in prestigious Pondok Indah, South Jakarta, where modern elegance meets warm, personalized service.",
  address: "Jl. Metro Pondok Indah No. 27, RT.15/RW.13, Kel. Pondok Pinang, Kec. Kebayoran Lama, Jakarta Selatan, DKI Jakarta 12310, Indonesia",
  email: "reservation@arundrasignature.com",
  phone: "+62 21 5088 XXXX",
  whatsapp: "+62 21 5088 XXXX",
  check_in_time: "14:00",
  check_out_time: "12:00",
  explore_links: DEFAULT_EXPLORE_LINKS,
  instagram_url: "https://instagram.com",
  facebook_url: "https://facebook.com",
  tiktok_url: "",
  youtube_url: "",
  copyright_text: "Arundra Signature Pondok Indah. All rights reserved.",
  bottom_note: "KBLI: 55110 • NIB: 0402260021756 • CHSE Certified",
};

export const SQL_FOOTER_MIGRATION_SCRIPT = `-- ==============================================================================
-- ARUNDRA SIGNATURE HOTEL: FOOTER & HOTEL INFO SETTINGS TABLE
-- Run this in Supabase Dashboard -> SQL Editor
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.footer_settings (
  id text PRIMARY KEY DEFAULT 'default',
  brand_name text NOT NULL DEFAULT 'Arundra Signature',
  brand_tagline text NOT NULL DEFAULT 'HOTEL & RESIDENCE',
  description text NOT NULL DEFAULT 'A 4-star luxury hotel & serviced residence in prestigious Pondok Indah, South Jakarta, where modern elegance meets warm, personalized service.',
  address text NOT NULL DEFAULT 'Jl. Metro Pondok Indah No. 27, RT.15/RW.13, Kel. Pondok Pinang, Kec. Kebayoran Lama, Jakarta Selatan, DKI Jakarta 12310, Indonesia',
  email text NOT NULL DEFAULT 'reservation@arundrasignature.com',
  phone text NOT NULL DEFAULT '+62 21 5088 XXXX',
  whatsapp text DEFAULT '+62 21 5088 XXXX',
  check_in_time text DEFAULT '14:00',
  check_out_time text DEFAULT '12:00',
  explore_links jsonb NOT NULL DEFAULT '[
    {"label": "Rooms & Suites", "url": "/#rooms"},
    {"label": "Our Experience", "url": "/#experience"},
    {"label": "Special Offers", "url": "/#offers"},
    {"label": "Sign In", "url": "/login"}
  ]'::jsonb,
  instagram_url text DEFAULT 'https://instagram.com',
  facebook_url text DEFAULT 'https://facebook.com',
  tiktok_url text DEFAULT '',
  youtube_url text DEFAULT '',
  copyright_text text NOT NULL DEFAULT 'Arundra Signature Pondok Indah. All rights reserved.',
  bottom_note text NOT NULL DEFAULT 'KBLI: 55110 • NIB: 0402260021756 • CHSE Certified',
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- Seed initial row
INSERT INTO public.footer_settings (id)
VALUES ('default')
ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE public.footer_settings ENABLE ROW LEVEL SECURITY;

-- 1. Everyone can read footer settings (Public & Guests)
DROP POLICY IF EXISTS "Footer settings are viewable by everyone" ON public.footer_settings;
CREATE POLICY "Footer settings are viewable by everyone"
  ON public.footer_settings
  FOR SELECT
  USING (true);

-- 2. Only authenticated admins can update footer settings
DROP POLICY IF EXISTS "Only admins can update footer settings" ON public.footer_settings;
CREATE POLICY "Only admins can update footer settings"
  ON public.footer_settings
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 3. Only authenticated admins can insert footer settings
DROP POLICY IF EXISTS "Only admins can insert footer settings" ON public.footer_settings;
CREATE POLICY "Only admins can insert footer settings"
  ON public.footer_settings
  FOR INSERT
  WITH CHECK (public.is_admin());
`;

/**
 * Validates and sanitizes footer payload before saving.
 */
export function sanitizeFooterPayload(
  payload: Partial<FooterSettings>
): Partial<FooterSettings> {
  const sanitizeLinks = (links: unknown): FooterLink[] => {
    if (!Array.isArray(links)) return DEFAULT_EXPLORE_LINKS;
    return links
      .filter((item): item is { label?: string; url?: string } => Boolean(item && typeof item === "object"))
      .map((item) => ({
        label: String(item.label || "").trim(),
        url: String(item.url || "").trim(),
      }))
      .filter((item) => item.label.length > 0 && item.url.length > 0);
  };

  return {
    brand_name: payload.brand_name?.trim() || DEFAULT_FOOTER_SETTINGS.brand_name,
    brand_tagline:
      payload.brand_tagline?.trim() || DEFAULT_FOOTER_SETTINGS.brand_tagline,
    description:
      payload.description?.trim() || DEFAULT_FOOTER_SETTINGS.description,
    address: payload.address?.trim() || DEFAULT_FOOTER_SETTINGS.address,
    email: payload.email?.trim() || DEFAULT_FOOTER_SETTINGS.email,
    phone: payload.phone?.trim() || DEFAULT_FOOTER_SETTINGS.phone,
    whatsapp: payload.whatsapp?.trim() || "",
    check_in_time: payload.check_in_time?.trim() || "14:00",
    check_out_time: payload.check_out_time?.trim() || "12:00",
    explore_links: sanitizeLinks(payload.explore_links),
    instagram_url: payload.instagram_url?.trim() || "",
    facebook_url: payload.facebook_url?.trim() || "",
    tiktok_url: payload.tiktok_url?.trim() || "",
    youtube_url: payload.youtube_url?.trim() || "",
    copyright_text:
      payload.copyright_text?.trim() || DEFAULT_FOOTER_SETTINGS.copyright_text,
    bottom_note:
      payload.bottom_note?.trim() || DEFAULT_FOOTER_SETTINGS.bottom_note,
  };
}
