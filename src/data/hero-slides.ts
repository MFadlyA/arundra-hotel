import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database, DbHeroSlide } from "@/types/database";

const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || "")
  .trim()
  .replace(/\/rest\/v1\/?$/, "")
  .replace(/\/+$/, "");
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

function getPublicClient() {
  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes("your-project-id")) {
    return null;
  }
  return createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey);
}

export type HeroSlide = {
  id?: string;
  image: string;
  image_path?: string | null;
  eyebrow?: string;
  title: string;
  description: string;
  button: string;
  href: string;
  is_active?: boolean;
  order_rank?: number;
};

export const DEFAULT_HERO_SLIDES: HeroSlide[] = [
  {
    id: "default-slide-1",
    image:
      "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=2000&q=85",
    image_path: null,
    eyebrow: "YOUR SIGNATURE STAY, YOUR WAY",
    title: "Where Modern Elegance\nMeets Warm Serenity.",
    description:
      "Discover a refined living experience at Arundra Signature Residence Pondok Indah, where modern elegance meets comfort and personalized hospitality.",
    button: "Explore Our Rooms",
    href: "/rooms",
    is_active: true,
    order_rank: 1,
  },
  {
    id: "default-slide-2",
    image:
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=2000&q=85",
    image_path: null,
    eyebrow: "PONDOK INDAH, SOUTH JAKARTA",
    title: "Tranquil Luxury &\nStrategic Connectivity.",
    description:
      "Prestigious address on Jl. Metro Pondok Indah No. 27, moments from RS Pondok Indah (224 m), MRT Lebak Bulus, and Pondok Indah Mall.",
    button: "Discover Bespoke Offers",
    href: "/offers",
    is_active: true,
    order_rank: 2,
  },
  {
    id: "default-slide-3",
    image:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=2000&q=85",
    image_path: null,
    eyebrow: "PENGALAMAN MENGINAP ISTIMEWA",
    title: "Your Signature Stay,\nYour Way.",
    description:
      "Whether visiting for business, an extended stay, or a weekend getaway, experience quiet luxury and personalized four-star hospitality.",
    button: "Discover Our Experience",
    href: "/experience",
    is_active: true,
    order_rank: 3,
  },
];

export function transformDbHeroSlideToSlide(dbSlide: DbHeroSlide): HeroSlide {
  return {
    id: dbSlide.id,
    image: dbSlide.image_url,
    image_path: dbSlide.image_path,
    eyebrow: dbSlide.eyebrow || "",
    title: dbSlide.title,
    description: dbSlide.description,
    button: dbSlide.button_text || "Explore Our Rooms",
    href: dbSlide.button_link || "#rooms",
    is_active: dbSlide.is_active,
    order_rank: dbSlide.order_rank,
  };
}

/**
 * Fetch all active hero slides from database (with fallback to DEFAULT_HERO_SLIDES)
 */
export async function getHeroSlides(): Promise<HeroSlide[]> {
  try {
    const supabase = getPublicClient();
    if (!supabase) return DEFAULT_HERO_SLIDES;

    const { data, error } = await (supabase.from("hero_slides") as any)
      .select("*")
      .eq("is_active", true)
      .order("order_rank", { ascending: true })
      .order("created_at", { ascending: true });

    if (error || !data || data.length === 0) {
      return DEFAULT_HERO_SLIDES;
    }

    return (data as DbHeroSlide[]).map(transformDbHeroSlideToSlide);
  } catch (err) {
    console.warn("Could not query dynamic hero slides, using fallback:", err);
    return DEFAULT_HERO_SLIDES;
  }
}

export const SQL_HERO_SLIDES_MIGRATION_SCRIPT = `-- ==============================================================================
-- RUN THIS IN SUPABASE DASHBOARD -> SQL EDITOR
-- ARUNDRA SIGNATURE HOTEL: HERO CAROUSEL BANNER CMS TABLE & POLICIES
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.hero_slides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  eyebrow text,
  description text NOT NULL,
  button_text text NOT NULL DEFAULT 'Explore Our Rooms',
  button_link text NOT NULL DEFAULT '#rooms',
  image_url text NOT NULL,
  image_path text,
  is_active boolean NOT NULL DEFAULT true,
  order_rank integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_hero_slides_is_active ON public.hero_slides(is_active);
CREATE INDEX IF NOT EXISTS idx_hero_slides_order_rank ON public.hero_slides(order_rank);

ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active hero slides" ON public.hero_slides;
CREATE POLICY "Public can view active hero slides"
  ON public.hero_slides FOR SELECT USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "Admins can insert hero slides" ON public.hero_slides;
CREATE POLICY "Admins can insert hero slides"
  ON public.hero_slides FOR INSERT WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update hero slides" ON public.hero_slides;
CREATE POLICY "Admins can update hero slides"
  ON public.hero_slides FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete hero slides" ON public.hero_slides;
CREATE POLICY "Admins can delete hero slides"
  ON public.hero_slides FOR DELETE USING (public.is_admin());

-- Seed initial 3 hero slides if table is empty
INSERT INTO public.hero_slides (title, eyebrow, description, button_text, button_link, image_url, is_active, order_rank)
SELECT
  'Where Modern Elegance\nMeets Warm Serenity.',
  'YOUR SIGNATURE STAY, YOUR WAY',
  'Discover a refined living experience at Arundra Signature Residence Pondok Indah, where modern elegance meets comfort and personalized hospitality.',
  'Explore Our Rooms',
  '/rooms',
  'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=2000&q=85',
  true,
  1
WHERE NOT EXISTS (SELECT 1 FROM public.hero_slides LIMIT 1);

INSERT INTO public.hero_slides (title, eyebrow, description, button_text, button_link, image_url, is_active, order_rank)
SELECT
  'Tranquil Luxury &\nStrategic Connectivity.',
  'PONDOK INDAH, SOUTH JAKARTA',
  'Prestigious address on Jl. Metro Pondok Indah No. 27, moments from RS Pondok Indah (224 m), MRT Lebak Bulus, and Pondok Indah Mall.',
  'Discover Bespoke Offers',
  '/offers',
  'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=2000&q=85',
  true,
  2
WHERE NOT EXISTS (SELECT 1 FROM public.hero_slides WHERE order_rank = 2 LIMIT 1);

INSERT INTO public.hero_slides (title, eyebrow, description, button_text, button_link, image_url, is_active, order_rank)
SELECT
  'Your Signature Stay,\nYour Way.',
  'PENGALAMAN MENGINAP ISTIMEWA',
  'Whether visiting for business, an extended stay, or a weekend getaway, experience quiet luxury and personalized four-star hospitality.',
  'Discover Our Experience',
  '/experience',
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=2000&q=85',
  true,
  3
WHERE NOT EXISTS (SELECT 1 FROM public.hero_slides WHERE order_rank = 3 LIMIT 1);
`;
