import type { HospitalitySettings } from "@/types/database";

export const DEFAULT_HOSPITALITY_SETTINGS: HospitalitySettings = {
  id: "default",
  badge_line1: "Modern",
  badge_line2: "elegance.",
  eyebrow: "THE ARUNDRA EXPERIENCE",
  title_line1: "Your Signature Stay,",
  title_line2: "Your Way",
  paragraph1:
    "Discover a refined living experience at Arundra Signature Residence Pondok Indah, where modern elegance meets comfort and personalized hospitality.",
  paragraph2:
    "Whether you are visiting for business, a weekend getaway, an extended stay, or a special occasion, Arundra Signature welcomes you to experience a distinctive blend of comfort, style, and hospitality.",
  button_text: "Discover Our Experience",
  button_link: "/experience",
  image_url:
    "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1200&q=85",
  image_path: null,
};

export const SQL_HOSPITALITY_MIGRATION_SCRIPT = `-- ==============================================================================
-- ARUNDRA SIGNATURE HOTEL: EXPERIENCE INTRO & GATEWAY SETTINGS
-- Run this in Supabase Dashboard -> SQL Editor
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.hospitality_settings (
  id text PRIMARY KEY DEFAULT 'default',
  badge_line1 text NOT NULL DEFAULT 'Modern',
  badge_line2 text NOT NULL DEFAULT 'elegance.',
  eyebrow text NOT NULL DEFAULT 'THE ARUNDRA EXPERIENCE',
  title_line1 text NOT NULL DEFAULT 'Your Signature Stay,',
  title_line2 text NOT NULL DEFAULT 'Your Way',
  paragraph1 text NOT NULL DEFAULT 'Discover a refined living experience at Arundra Signature Residence Pondok Indah, where modern elegance meets comfort and personalized hospitality.',
  paragraph2 text NOT NULL DEFAULT 'Whether you are visiting for business, a weekend getaway, an extended stay, or a special occasion, Arundra Signature welcomes you to experience a distinctive blend of comfort, style, and hospitality.',
  button_text text NOT NULL DEFAULT 'Discover Our Experience',
  button_link text NOT NULL DEFAULT '/experience',
  image_url text NOT NULL DEFAULT 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1200&q=85',
  image_path text,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- Seed initial row
INSERT INTO public.hospitality_settings (id)
VALUES ('default')
ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE public.hospitality_settings ENABLE ROW LEVEL SECURITY;

-- 1. Everyone can read hospitality settings (Public & Guests)
DROP POLICY IF EXISTS "Hospitality settings are viewable by everyone" ON public.hospitality_settings;
CREATE POLICY "Hospitality settings are viewable by everyone"
  ON public.hospitality_settings
  FOR SELECT
  USING (true);

-- 2. Only authenticated admins can update hospitality settings
DROP POLICY IF EXISTS "Only admins can update hospitality settings" ON public.hospitality_settings;
CREATE POLICY "Only admins can update hospitality settings"
  ON public.hospitality_settings
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 3. Only authenticated admins can insert hospitality settings
DROP POLICY IF EXISTS "Only admins can insert hospitality settings" ON public.hospitality_settings;
CREATE POLICY "Only admins can insert hospitality settings"
  ON public.hospitality_settings
  FOR INSERT
  WITH CHECK (public.is_admin());
`;

/**
 * Validates and sanitizes hospitality settings payload before saving.
 */
export function sanitizeHospitalityPayload(
  payload: Partial<HospitalitySettings>
): Partial<HospitalitySettings> {
  return {
    badge_line1:
      typeof payload.badge_line1 === "string" && payload.badge_line1.trim()
        ? payload.badge_line1.trim()
        : DEFAULT_HOSPITALITY_SETTINGS.badge_line1,
    badge_line2:
      typeof payload.badge_line2 === "string" && payload.badge_line2.trim()
        ? payload.badge_line2.trim()
        : DEFAULT_HOSPITALITY_SETTINGS.badge_line2,
    eyebrow:
      typeof payload.eyebrow === "string" && payload.eyebrow.trim()
        ? payload.eyebrow.trim()
        : DEFAULT_HOSPITALITY_SETTINGS.eyebrow,
    title_line1:
      typeof payload.title_line1 === "string" && payload.title_line1.trim()
        ? payload.title_line1.trim()
        : DEFAULT_HOSPITALITY_SETTINGS.title_line1,
    title_line2:
      typeof payload.title_line2 === "string" && payload.title_line2.trim()
        ? payload.title_line2.trim()
        : DEFAULT_HOSPITALITY_SETTINGS.title_line2,
    paragraph1:
      typeof payload.paragraph1 === "string" && payload.paragraph1.trim()
        ? payload.paragraph1.trim()
        : DEFAULT_HOSPITALITY_SETTINGS.paragraph1,
    paragraph2:
      typeof payload.paragraph2 === "string" && payload.paragraph2.trim()
        ? payload.paragraph2.trim()
        : DEFAULT_HOSPITALITY_SETTINGS.paragraph2,
    button_text:
      typeof payload.button_text === "string" && payload.button_text.trim()
        ? payload.button_text.trim()
        : DEFAULT_HOSPITALITY_SETTINGS.button_text,
    button_link:
      typeof payload.button_link === "string" && payload.button_link.trim()
        ? payload.button_link.trim()
        : DEFAULT_HOSPITALITY_SETTINGS.button_link,
    image_url:
      typeof payload.image_url === "string" && payload.image_url.trim()
        ? payload.image_url.trim()
        : DEFAULT_HOSPITALITY_SETTINGS.image_url,
    image_path:
      typeof payload.image_path === "string" ? payload.image_path.trim() : null,
  };
}
