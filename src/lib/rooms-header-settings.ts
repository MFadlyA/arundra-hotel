import type { RoomsHeaderSettings } from "@/types/database";

export const DEFAULT_ROOMS_HEADER_SETTINGS: RoomsHeaderSettings = {
  id: "default",
  eyebrow: "YOUR PRIVATE RETREAT",
  title: "Rooms & Serviced Residences",
  description:
    "High-standard living spaces blending modern aesthetics and functional comfort across 5 premier room tiers.",
  button_text: "View All Rooms",
  button_link: "/rooms",
};

export function sanitizeRoomsHeaderPayload(
  payload: Partial<RoomsHeaderSettings>
): RoomsHeaderSettings {
  return {
    id: "default",
    eyebrow:
      typeof payload.eyebrow === "string" && payload.eyebrow.trim().length > 0
        ? payload.eyebrow.trim()
        : DEFAULT_ROOMS_HEADER_SETTINGS.eyebrow,
    title:
      typeof payload.title === "string" && payload.title.trim().length > 0
        ? payload.title.trim()
        : DEFAULT_ROOMS_HEADER_SETTINGS.title,
    description:
      typeof payload.description === "string" &&
      payload.description.trim().length > 0
        ? payload.description.trim()
        : DEFAULT_ROOMS_HEADER_SETTINGS.description,
    button_text:
      typeof payload.button_text === "string" &&
      payload.button_text.trim().length > 0
        ? payload.button_text.trim()
        : DEFAULT_ROOMS_HEADER_SETTINGS.button_text,
    button_link:
      typeof payload.button_link === "string" &&
      payload.button_link.trim().length > 0
        ? payload.button_link.trim()
        : DEFAULT_ROOMS_HEADER_SETTINGS.button_link,
  };
}

export const SQL_ROOMS_HEADER_MIGRATION_SCRIPT = `-- ==============================================================================
-- ARUNDRA SIGNATURE HOTEL: HOMEPAGE ROOMS & SUITES SECTION HEADLINE SETTINGS
-- Run this in Supabase Dashboard -> SQL Editor
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.rooms_header_settings (
  id text PRIMARY KEY DEFAULT 'default',
  eyebrow text NOT NULL DEFAULT 'YOUR PRIVATE RETREAT',
  title text NOT NULL DEFAULT 'Rooms & Serviced Residences',
  description text NOT NULL DEFAULT 'High-standard living spaces blending modern aesthetics and functional comfort across 5 premier room tiers.',
  button_text text NOT NULL DEFAULT 'View All Rooms',
  button_link text NOT NULL DEFAULT '/rooms',
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- Seed initial row
INSERT INTO public.rooms_header_settings (id)
VALUES ('default')
ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE public.rooms_header_settings ENABLE ROW LEVEL SECURITY;

-- 1. Everyone can read rooms header settings (Public & Guests)
DROP POLICY IF EXISTS "Rooms header settings are viewable by everyone" ON public.rooms_header_settings;
CREATE POLICY "Rooms header settings are viewable by everyone"
  ON public.rooms_header_settings
  FOR SELECT
  USING (true);

-- 2. Only authenticated admins can update rooms header settings
DROP POLICY IF EXISTS "Only admins can update rooms header settings" ON public.rooms_header_settings;
CREATE POLICY "Only admins can update rooms header settings"
  ON public.rooms_header_settings
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 3. Only authenticated admins can insert rooms header settings
DROP POLICY IF EXISTS "Only admins can insert rooms header settings" ON public.rooms_header_settings;
CREATE POLICY "Only admins can insert rooms header settings"
  ON public.rooms_header_settings
  FOR INSERT
  WITH CHECK (public.is_admin());
`;

