import type { WhyBookSettings, WhyBookItem } from "@/types/database";

export const SUPPORTED_WHY_BOOK_ICONS = [
  { id: "ShieldCheck", label: "ShieldCheck (Secure & Protected)" },
  { id: "Check", label: "Check (Thoughtful & Verified Service)" },
  { id: "MapPin", label: "MapPin (Welcoming & Prime Location)" },
  { id: "Crown", label: "Crown (Luxury & Prestige)" },
  { id: "Clock", label: "Clock (24/7 Service & Flexibility)" },
  { id: "Heart", label: "Heart (Warm & Caring Hospitality)" },
  { id: "Coffee", label: "Coffee (Artisanal Dining & Breakfast)" },
  { id: "BedDouble", label: "BedDouble (Refined Comfort & Rest)" },
  { id: "Award", label: "Award (Five-Star Excellence)" },
  { id: "Phone", label: "Phone (Attentive Guest Support)" },
  { id: "Wifi", label: "Wifi (Complimentary High-Speed Wi-Fi)" },
  { id: "Compass", label: "Compass (Curated City Exploration)" },
] as const;

export const DEFAULT_WHY_BOOK_ITEMS: WhyBookItem[] = [
  {
    icon: "ShieldCheck",
    title: "Best Rate Guarantee",
    description: "Direct booking ensures unmatched rates with no hidden surcharges",
  },
  {
    icon: "Check",
    title: "Personalized Hospitality",
    description: "Intuitive, warm service tailored to the privacy and unique preferences of every guest",
  },
  {
    icon: "MapPin",
    title: "Prestigious Pondok Indah Address",
    description: "Jl. Metro Pondok Indah No. 27, moments from RS Pondok Indah, MRT, and shopping hubs",
  },
];

export const DEFAULT_WHY_BOOK_SETTINGS: WhyBookSettings = {
  id: "default",
  items: DEFAULT_WHY_BOOK_ITEMS,
};

export const SQL_WHY_BOOK_MIGRATION_SCRIPT = `-- ==============================================================================
-- ARUNDRA SIGNATURE HOTEL: WHY BOOK WITH US (TRUST BADGES) SETTINGS TABLE
-- Run this in Supabase Dashboard -> SQL Editor
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.why_book_settings (
  id text PRIMARY KEY DEFAULT 'default',
  items jsonb NOT NULL DEFAULT '[
    {
      "icon": "ShieldCheck",
      "title": "Best Rate Guarantee",
      "description": "Direct booking ensures unmatched rates with no hidden surcharges"
    },
    {
      "icon": "Check",
      "title": "Personalized Hospitality",
      "description": "Intuitive, warm service tailored to the privacy and unique preferences of every guest"
    },
    {
      "icon": "MapPin",
      "title": "Prestigious Pondok Indah Address",
      "description": "Jl. Metro Pondok Indah No. 27, moments from RS Pondok Indah, MRT, and shopping hubs"
    }
  ]'::jsonb,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- Seed initial default row
INSERT INTO public.why_book_settings (id)
VALUES ('default')
ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE public.why_book_settings ENABLE ROW LEVEL SECURITY;

-- 1. Everyone can read why book settings (Public & Guests)
DROP POLICY IF EXISTS "Why book settings are viewable by everyone" ON public.why_book_settings;
CREATE POLICY "Why book settings are viewable by everyone"
  ON public.why_book_settings
  FOR SELECT
  USING (true);

-- 2. Only authenticated admins can update why book settings
DROP POLICY IF EXISTS "Only admins can update why book settings" ON public.why_book_settings;
CREATE POLICY "Only admins can update why book settings"
  ON public.why_book_settings
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 3. Only authenticated admins can insert why book settings
DROP POLICY IF EXISTS "Only admins can insert why book settings" ON public.why_book_settings;
CREATE POLICY "Only admins can insert why book settings"
  ON public.why_book_settings
  FOR INSERT
  WITH CHECK (public.is_admin());
`;

/**
 * Validates and sanitizes why_book settings payload before saving.
 */
export function sanitizeWhyBookPayload(
  payload: Partial<WhyBookSettings>
): Partial<WhyBookSettings> {
  const sanitizeItems = (items: unknown): WhyBookItem[] => {
    if (!Array.isArray(items)) return DEFAULT_WHY_BOOK_ITEMS;
    return items
      .filter((item) => item && typeof item === "object")
      .map((item) => ({
        icon:
          typeof item.icon === "string" && item.icon.trim()
            ? item.icon.trim() === "Sparkles"
              ? "Crown"
              : item.icon.trim()
            : "Crown",
        title: typeof item.title === "string" ? item.title.trim() : "",
        description:
          typeof item.description === "string" ? item.description.trim() : "",
      }))
      .filter((item) => item.title.length > 0);
  };

  return {
    items: sanitizeItems(payload.items),
  };
}
