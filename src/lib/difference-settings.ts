import type { DifferenceSettings, DifferenceItem } from "@/types/database";

export const DEFAULT_DIFFERENCE_ITEMS: DifferenceItem[] = [
  {
    number: "01",
    title: "High-Standard Living Spaces",
    description:
      "Deliver high-standard living spaces that seamlessly blend modern aesthetics with functional comfort.",
  },
  {
    number: "02",
    title: "Intuitive, Warm Hospitality",
    description:
      "Provide intuitive, warm hospitality tailored to the privacy and unique preferences of every guest.",
  },
  {
    number: "03",
    title: "Strategic Connectivity",
    description:
      "Offer strategic connectivity and comprehensive amenities that support both business productivity and lifestyle relaxation.",
  },
];

export const DEFAULT_DIFFERENCE_SETTINGS: DifferenceSettings = {
  id: "default",
  tagline: "VISION & BRAND PILLARS",
  title: "Redefining Modern Hospitality",
  description:
    "To be South Jakarta’s premier four-star hospitality and residence destination, redefining modern elegance through warm, personalized service.",
  items: DEFAULT_DIFFERENCE_ITEMS,
};

export const SQL_DIFFERENCE_MIGRATION_SCRIPT = `-- ==============================================================================
-- ARUNDRA SIGNATURE HOTEL: THE DIFFERENCE SECTION SETTINGS TABLE
-- Run this in Supabase Dashboard -> SQL Editor
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.difference_settings (
  id text PRIMARY KEY DEFAULT 'default',
  tagline text NOT NULL DEFAULT 'VISION & BRAND PILLARS',
  title text NOT NULL DEFAULT 'Redefining Modern Hospitality',
  description text NOT NULL DEFAULT 'To be South Jakarta’s premier four-star hospitality and residence destination, redefining modern elegance through warm, personalized service.',
  items jsonb NOT NULL DEFAULT '[
    {
      "number": "01",
      "title": "High-Standard Living Spaces",
      "description": "Deliver high-standard living spaces that seamlessly blend modern aesthetics with functional comfort."
    },
    {
      "number": "02",
      "title": "Intuitive, Warm Hospitality",
      "description": "Provide intuitive, warm hospitality tailored to the privacy and unique preferences of every guest."
    },
    {
      "number": "03",
      "title": "Strategic Connectivity",
      "description": "Offer strategic connectivity and comprehensive amenities that support both business productivity and lifestyle relaxation."
    }
  ]'::jsonb,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- Seed initial row
INSERT INTO public.difference_settings (id)
VALUES ('default')
ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE public.difference_settings ENABLE ROW LEVEL SECURITY;

-- 1. Everyone can read difference settings (Public & Guests)
DROP POLICY IF EXISTS "Difference settings are viewable by everyone" ON public.difference_settings;
CREATE POLICY "Difference settings are viewable by everyone"
  ON public.difference_settings
  FOR SELECT
  USING (true);

-- 2. Only authenticated admins can update difference settings
DROP POLICY IF EXISTS "Only admins can update difference settings" ON public.difference_settings;
CREATE POLICY "Only admins can update difference settings"
  ON public.difference_settings
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 3. Only authenticated admins can insert difference settings
DROP POLICY IF EXISTS "Only admins can insert difference settings" ON public.difference_settings;
CREATE POLICY "Only admins can insert difference settings"
  ON public.difference_settings
  FOR INSERT
  WITH CHECK (public.is_admin());
`;

/**
 * Validates and sanitizes difference settings payload before saving.
 */
export function sanitizeDifferencePayload(
  payload: Partial<DifferenceSettings>
): Partial<DifferenceSettings> {
  const sanitizeItems = (items: unknown): DifferenceItem[] => {
    if (!Array.isArray(items)) return DEFAULT_DIFFERENCE_ITEMS;
    return items
      .filter((item) => item && typeof item === "object")
      .map((item, idx) => ({
        number:
          typeof item.number === "string" && item.number.trim()
            ? item.number.trim()
            : String(idx + 1).padStart(2, "0"),
        title: typeof item.title === "string" ? item.title.trim() : "",
        description:
          typeof item.description === "string" ? item.description.trim() : "",
      }))
      .filter((item) => item.title.length > 0);
  };

  return {
    tagline:
      typeof payload.tagline === "string" && payload.tagline.trim()
        ? payload.tagline.trim()
        : DEFAULT_DIFFERENCE_SETTINGS.tagline,
    title:
      typeof payload.title === "string" && payload.title.trim()
        ? payload.title.trim()
        : DEFAULT_DIFFERENCE_SETTINGS.title,
    description:
      typeof payload.description === "string"
        ? payload.description.trim()
        : DEFAULT_DIFFERENCE_SETTINGS.description,
    items: sanitizeItems(payload.items),
  };
}
