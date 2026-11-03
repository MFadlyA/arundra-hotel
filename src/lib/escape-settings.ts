import type { EscapeSettings } from "@/types/database";

export const DEFAULT_ESCAPE_SETTINGS: EscapeSettings = {
  id: "default",
  eyebrow: "YOUR SIGNATURE STAY, YOUR WAY",
  title_line1: "Your Signature Stay,",
  title_line2: "Your Way",
  description:
    "Discover a refined living experience at Arundra Signature Residence Pondok Indah, where modern elegance meets comfort and personalized hospitality.",
  button_text: "Discover Bespoke Offers",
  button_link: "/offers",
  image_url:
    "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=2200&q=85",
  image_path: null,
};

export const SQL_ESCAPE_MIGRATION_SCRIPT = `-- ==============================================================================
-- ARUNDRA SIGNATURE HOTEL: ESCAPE SECTION (SPECIAL OFFER) SETTINGS TABLE
-- Run this in Supabase Dashboard -> SQL Editor
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.escape_settings (
  id text PRIMARY KEY DEFAULT 'default',
  eyebrow text NOT NULL DEFAULT 'YOUR SIGNATURE STAY, YOUR WAY',
  title_line1 text NOT NULL DEFAULT 'Your Signature Stay,',
  title_line2 text NOT NULL DEFAULT 'Your Way',
  description text NOT NULL DEFAULT 'Discover a refined living experience at Arundra Signature Residence Pondok Indah, where modern elegance meets comfort and personalized hospitality.',
  button_text text NOT NULL DEFAULT 'Discover Bespoke Offers',
  button_link text NOT NULL DEFAULT '/offers',
  image_url text NOT NULL DEFAULT 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=2200&q=85',
  image_path text,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- Seed initial row
INSERT INTO public.escape_settings (id)
VALUES ('default')
ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE public.escape_settings ENABLE ROW LEVEL SECURITY;

-- 1. Everyone can read escape settings (Public & Guests)
DROP POLICY IF EXISTS "Escape settings are viewable by everyone" ON public.escape_settings;
CREATE POLICY "Escape settings are viewable by everyone"
  ON public.escape_settings
  FOR SELECT
  USING (true);

-- 2. Only authenticated admins can update escape settings
DROP POLICY IF EXISTS "Only admins can update escape settings" ON public.escape_settings;
CREATE POLICY "Only admins can update escape settings"
  ON public.escape_settings
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 3. Only authenticated admins can insert escape settings
DROP POLICY IF EXISTS "Only admins can insert escape settings" ON public.escape_settings;
CREATE POLICY "Only admins can insert escape settings"
  ON public.escape_settings
  FOR INSERT
  WITH CHECK (public.is_admin());
`;

/**
 * Validates and sanitizes escape settings payload before saving.
 */
export function sanitizeEscapePayload(
  payload: Partial<EscapeSettings>
): Partial<EscapeSettings> {
  return {
    eyebrow:
      typeof payload.eyebrow === "string" && payload.eyebrow.trim()
        ? payload.eyebrow.trim()
        : DEFAULT_ESCAPE_SETTINGS.eyebrow,
    title_line1:
      typeof payload.title_line1 === "string" && payload.title_line1.trim()
        ? payload.title_line1.trim()
        : DEFAULT_ESCAPE_SETTINGS.title_line1,
    title_line2:
      typeof payload.title_line2 === "string" && payload.title_line2.trim()
        ? payload.title_line2.trim()
        : DEFAULT_ESCAPE_SETTINGS.title_line2,
    description:
      typeof payload.description === "string"
        ? payload.description.trim()
        : DEFAULT_ESCAPE_SETTINGS.description,
    button_text:
      typeof payload.button_text === "string" && payload.button_text.trim()
        ? payload.button_text.trim()
        : DEFAULT_ESCAPE_SETTINGS.button_text,
    button_link:
      typeof payload.button_link === "string" && payload.button_link.trim()
        ? payload.button_link.trim()
        : DEFAULT_ESCAPE_SETTINGS.button_link,
    image_url:
      typeof payload.image_url === "string" && payload.image_url.trim()
        ? payload.image_url.trim()
        : DEFAULT_ESCAPE_SETTINGS.image_url,
    image_path:
      typeof payload.image_path === "string" ? payload.image_path.trim() : null,
  };
}
