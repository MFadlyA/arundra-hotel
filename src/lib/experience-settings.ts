import type {
  ExperienceSettings,
  RecreationItem,
  FacilityItem,
  NearbyPlaceItem,
} from "@/types/database";

export const DEFAULT_RECREATION_ITEMS: RecreationItem[] = [
  {
    id: "rec-1",
    title: "Pondok Indah Championship Golf",
    category: "Leisure & Sports",
    description:
      "Tee off at the renowned 18-hole championship golf course located just 1.8 km from the residence, surrounded by lush South Jakarta greenery.",
    image:
      "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&w=1200&q=85",
    image_path: null,
    badge: "Priority Access",
    timing: "Daily: 06:00 AM – 06:00 PM",
  },
  {
    id: "rec-2",
    title: "Full-Service Luxury Spa & Wellness",
    category: "Wellness & Spa",
    description:
      "Rejuvenate your senses with bespoke holistic massage therapies, aromatherapy, and calming body treatments guided by certified wellness specialists.",
    image:
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=85",
    image_path: null,
    badge: "Signature Spa",
    timing: "Daily: 09:00 AM – 10:00 PM",
  },
  {
    id: "rec-3",
    title: "Outdoor Swimming Pool & Sun Terrace",
    category: "Recreation & Pool",
    description:
      "Unwind at our serene outdoor swimming pool featuring dedicated adult and children sections, sun terrace loungers, and refreshing towel service.",
    image:
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=85",
    image_path: null,
    badge: "Resort Serenity",
    timing: "Daily: 06:00 AM – 09:00 PM",
  },
  {
    id: "rec-4",
    title: "On-site Halal Dining & Rooftop Lounge",
    category: "Culinary & Dining",
    description:
      "Savor our daily buffet breakfast and artisanal Indonesian-international specialties at our Halal-certified restaurant and panoramic rooftop bar.",
    image:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=85",
    image_path: null,
    badge: "Halal Certified",
    timing: "Daily: 06:00 AM – 11:00 PM",
  },
  {
    id: "rec-5",
    title: "Pondok Indah Lifestyle & Shopping Gateway",
    category: "Shopping & Lifestyle",
    description:
      "Explore South Jakarta’s premier destinations: The Collective Jakarta (197 m), Poins Mall, and the iconic Pondok Indah Mall (PIM).",
    image:
      "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=1200&q=85",
    image_path: null,
    badge: "Prime Location",
    timing: "Daily: 10:00 AM – 10:00 PM",
  },
  {
    id: "rec-6",
    title: "Technogym High-Performance Fitness Hub",
    category: "Health & Fitness",
    description:
      "Maintain your daily fitness routine with state-of-the-art cardiovascular and strength machines in our private, air-conditioned workout facility.",
    image:
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=85",
    image_path: null,
    badge: "Guest Facility",
    timing: "Daily: 06:00 AM – 10:00 PM",
  },
];

export const DEFAULT_FACILITY_ITEMS: FacilityItem[] = [
  {
    id: "fac-1",
    name: "Outdoor Swimming Pool & Sun Terrace",
    tagline: "Wellness & Recreation",
    description:
      "Featuring dedicated Adult and Kids swimming sections, comfortable poolside sun loungers, and towel service set within a serene earth-tone courtyard.",
    image:
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=85",
    image_path: null,
    hours: "06:00 AM – 09:00 PM",
    features: [
      "Adult & Kids Sections",
      "Sun Terrace Loungers",
      "Plush Towel Service",
      "Courtyard Garden Ambience",
    ],
  },
  {
    id: "fac-2",
    name: "On-Site Halal Restaurant & Rooftop Bar",
    tagline: "Dining & Refreshments",
    description:
      "Serving daily buffet breakfast from 06:00 to 10:00 WIB, followed by an all-day dining menu of authentic Indonesian and international Halal cuisines, plus an open-air rooftop bar and lounge.",
    image:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=85",
    image_path: null,
    hours: "06:00 AM – 11:00 PM",
    features: [
      "Daily Buffet Breakfast (06:00–10:00 WIB)",
      "100% Halal-Certified Kitchen",
      "Rooftop City Views",
      "Lounge Bar Refreshments",
    ],
  },
  {
    id: "fac-3",
    name: "Technogym High-Performance Fitness Hub",
    tagline: "Wellness & Recreation",
    description:
      "Equipped with advanced Technogym cardio trainers, free weights, and stretching zones to ensure your workout regimen continues uninterrupted.",
    image:
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=85",
    image_path: null,
    hours: "06:00 AM – 10:00 PM",
    features: [
      "Technogym Treadmills & Cardio",
      "Free Weights & Dumbbells",
      "Stretching & Yoga Mats",
      "Chilled Water & Towels",
    ],
  },
  {
    id: "fac-4",
    name: "Full-Service Luxury Spa",
    tagline: "Wellness & Recreation",
    description:
      "A quiet sanctuary offering traditional Indonesian body massage, reflexology, and revitalizing spa rituals designed to melt away city fatigue.",
    image:
      "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&w=1200&q=85",
    image_path: null,
    hours: "09:00 AM – 10:00 PM",
    features: [
      "Private Treatment Rooms",
      "Certified Spa Therapists",
      "Aromatherapy Essential Oils",
      "Couples Treatment Suite",
    ],
  },
  {
    id: "fac-5",
    name: "Meeting Rooms & Conference Space",
    tagline: "Business & Events",
    description:
      "Flexible meeting and conference facilities tailored for corporate workshops, business presentations, and private gatherings with ultra-fast 100+ Mbps Wi-Fi.",
    image:
      "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=85",
    image_path: null,
    hours: "On Reservation",
    features: [
      "High-Speed 100+ Mbps Wi-Fi",
      "Audio-Visual Projection",
      "Executive Boardroom Setup",
      "Bespoke Coffee Break Catering",
    ],
  },
  {
    id: "fac-6",
    name: "24-Hour Guest Services & Front Desk",
    tagline: "Guest Services",
    description:
      "Dedicated front-desk team providing private express check-in/out, concierge service, luggage storage, multilingual staff, daily housekeeping, laundry, and on-call doctor.",
    image:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=85",
    image_path: null,
    hours: "24/7 Front Desk & Concierge",
    features: [
      "24-Hour Front Desk & Concierge",
      "Private Express Check-in/Check-out",
      "Daily Housekeeping & Laundry",
      "24-Hour On-Call Doctor & Security",
    ],
  },
  {
    id: "fac-7",
    name: "On-Site Free Parking & Valet Service",
    tagline: "Parking & Mobility",
    description:
      "Complimentary secure self-parking and professional valet assistance for hotel guests, with airport shuttle transport available upon request.",
    image:
      "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1200&q=85",
    image_path: null,
    hours: "24/7 Access & Valet Service",
    features: [
      "Free On-Site Self-Parking",
      "Complimentary Valet Parking",
      "Paid Airport Shuttle Service",
      "24-Hour Security & CCTV",
    ],
  },
];

export const DEFAULT_NEARBY_ITEMS: NearbyPlaceItem[] = [
  {
    id: "near-1",
    name: "RS Pondok Indah",
    category: "Healthcare",
    distance: "224 m (3 mins walk)",
    description:
      "Premier multi-specialty tertiary hospital renowned for exceptional medical care, located just steps across the street from the residence.",
    image:
      "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80",
    image_path: null,
  },
  {
    id: "near-2",
    name: "The Collective Jakarta",
    category: "Shopping & Lifestyle",
    distance: "197 m (2 mins walk)",
    description:
      "Chic neighborhood lifestyle hub featuring specialty coffee shops, artisanal bakeries, and casual dining directly adjacent to the property.",
    image:
      "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=800&q=80",
    image_path: null,
  },
  {
    id: "near-3",
    name: "Plaza Simatupang",
    category: "Shopping & Lifestyle",
    distance: "427 m (~5 mins walk)",
    description:
      "Prominent South Jakarta commercial complex with convenience stores, cafes, and business offices within short walking distance.",
    image:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
    image_path: null,
  },
  {
    id: "near-4",
    name: "Poins Mall",
    category: "Shopping & Lifestyle",
    distance: "612 m (~8 mins walk)",
    description:
      "Established shopping center offering diverse retail options, culinary choices, electronics, and direct access to Lebak Bulus transit hub.",
    image:
      "https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?auto=format&fit=crop&w=800&q=80",
    image_path: null,
  },
  {
    id: "near-5",
    name: "MRT Lebak Bulus Grab Station",
    category: "Public Transit",
    distance: "763 m (~11 mins walk)",
    description:
      "Direct Jakarta MRT terminus providing rapid, congestion-free transit to Blok M, Senayan, and the Sudirman-Thamrin CBD.",
    image:
      "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80",
    image_path: null,
  },
  {
    id: "near-6",
    name: "Nusantara Eye Clinic",
    category: "Healthcare",
    distance: "1.4 km (~4 mins drive)",
    description:
      "Specialized ophthalmology center providing advanced vision care and consultations in the South Jakarta medical district.",
    image:
      "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80",
    image_path: null,
  },
  {
    id: "near-7",
    name: "Pondok Indah Golf Course",
    category: "Shopping & Lifestyle",
    distance: "1.8 km (~5 mins drive)",
    description:
      "World-class 18-hole championship golf course nestled in lush tropical landscaping, host to prestigious international tournaments.",
    image:
      "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&w=800&q=80",
    image_path: null,
  },
  {
    id: "near-8",
    name: "Pondok Indah Mall (PIM 1, 2 & 3)",
    category: "Shopping & Lifestyle",
    distance: "3.2 km (~8 mins drive)",
    description:
      "South Jakarta's iconic luxury retail and entertainment landmark, offering flagship international designer boutiques, cinema, and fine dining.",
    image:
      "https://images.unsplash.com/photo-1567449303078-57ad995bd301?auto=format&fit=crop&w=800&q=80",
    image_path: null,
  },
];

export const DEFAULT_EXPERIENCE_SETTINGS: ExperienceSettings = {
  id: "default",

  // Hero section
  hero_eyebrow: "CURATED LEISURE & PRESTIGE",
  hero_title: "Unrivaled Experiences\nat Arundra Signature",
  hero_description:
    "Beyond luxurious accommodations, immerse yourself in hand-crafted recreations, world-class amenities, and an inspiring South Jakarta destination curated for your delight.",
  hero_image:
    "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=2000&q=85",
  hero_image_path: null,

  // 1. Variety of Recreations
  recreations_eyebrow: "VARIETY OF RECREATIONS",
  recreations_title: "Designed for Rest, Wellness & Productivity",
  recreations_description:
    "From refreshing poolside sessions to rejuvenating spa therapies and nearby championship golf, enjoy our curated collection of recreations.",
  recreations_items: DEFAULT_RECREATION_ITEMS,

  // 2. Our Facilities
  facilities_eyebrow: "OUR FACILITIES",
  facilities_title: "Comprehensive Facilities for Discerning Guests",
  facilities_description:
    "Every space at Arundra Signature Pondok Indah is crafted to support both business productivity and lifestyle relaxation with warm, quiet luxury.",
  facilities_items: DEFAULT_FACILITY_ITEMS,

  // 3. Location & Nearby Places
  location_eyebrow: "LOCATION & NEARBY PLACES",
  location_title: "At the Heart of South Jakarta's Prestige",
  location_description:
    "Located in the prestigious Pondok Indah corridor, our prime location provides effortless transit to premier healthcare, upscale shopping, MRT stations, and business hubs.",
  location_badge: "Prestigious Pondok Indah Corridor",
  location_hotel_name: "Arundra Signature Pondok Indah",
  location_address:
    "Jl. Metro Pondok Indah No. 27, RT.15/RW.13, Kel. Pondok Pinang, Kec. Kebayoran Lama, Jakarta Selatan, DKI Jakarta 12310, Indonesia",
  location_maps_url:
    "https://maps.google.com/?q=Jl.+Metro+Pondok+Indah+No.+27,+Jakarta+Selatan",
  location_embed_url:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3965.856627685608!2d106.7761005758778!3d-6.282570361494924!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f1c7908b8b09%3A0x7d6b38c29b71a257!2sJl.%20Metro%20Pondok%20Indah%20No.27%2C%20RT.15%2FRW.13%2C%20Pondok%20Pinang%2C%20Kec.%20Kebayoran%20Lama%2C%20Kota%20Jakarta%20Selatan%2C%20Daerah%20Khusus%20Ibukota%20Jakarta%2012310!5e0!3m2!1sen!2sid!4v1700000000000!5m2!1sen!2sid",
  location_airport_distance: "~38 mins to Halim (HLP) • ~42 mins to Soekarno-Hatta (CGK)",
  location_check_in_info:
    "Check-in: 14:00 – 23:59 WIB • Check-out: Before 12:00 WIB • Cashless Property",
  nearby_items: DEFAULT_NEARBY_ITEMS,
};

export const SQL_EXPERIENCE_MIGRATION_SCRIPT = `-- ==============================================================================
-- ARUNDRA SIGNATURE HOTEL: EXPERIENCE PAGE SETTINGS TABLE
-- Run this in Supabase Dashboard -> SQL Editor
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.experience_settings (
  id text PRIMARY KEY DEFAULT 'default',

  -- Hero Section
  hero_eyebrow text NOT NULL DEFAULT 'CURATED LEISURE & PRESTIGE',
  hero_title text NOT NULL DEFAULT 'Unrivaled Experiences at Arundra Signature',
  hero_description text NOT NULL DEFAULT 'Beyond luxurious accommodations, immerse yourself in hand-crafted recreations, world-class amenities, and an inspiring destination where every moment is thoughtfully curated for your delight.',
  hero_image text NOT NULL DEFAULT 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=2000&q=85',
  hero_image_path text,

  -- 1. Variety of Recreations
  recreations_eyebrow text NOT NULL DEFAULT 'VARIETY OF RECREATIONS',
  recreations_title text NOT NULL DEFAULT 'Designed for Rest, Leisure & Wonder',
  recreations_description text NOT NULL DEFAULT 'From championship golf to full-service spa rituals and exquisite halal dining, explore our curated recreations in prestigious Pondok Indah.',
  recreations_items jsonb NOT NULL DEFAULT '[]'::jsonb,

  -- 2. Our Facilities
  facilities_eyebrow text NOT NULL DEFAULT 'OUR FACILITIES',
  facilities_title text NOT NULL DEFAULT 'World-Class Amenities for Discerning Guests',
  facilities_description text NOT NULL DEFAULT 'Every space at Arundra Signature Pondok Indah is an architectural homage to elegance, offering state-of-the-art facilities crafted for effortless comfort and indulgence.',
  facilities_items jsonb NOT NULL DEFAULT '[]'::jsonb,

  -- 3. Location & Nearby Places
  location_eyebrow text NOT NULL DEFAULT 'LOCATION & NEARBY PLACES',
  location_title text NOT NULL DEFAULT 'Prestigious Pondok Indah Corridor',
  location_description text NOT NULL DEFAULT 'Strategically situated in South Jakarta''s prestigious Pondok Indah corridor, offering seamless connectivity to premier healthcare, shopping malls, golf courses, and MRT transit.',
  location_badge text DEFAULT 'Prestigious South Jakarta Corridor',
  location_hotel_name text DEFAULT 'Arundra Signature Pondok Indah',
  location_address text NOT NULL DEFAULT 'Jl. Metro Pondok Indah No. 27, RT.15/RW.13, Kel. Pondok Pinang, Kec. Kebayoran Lama, Jakarta Selatan, DKI Jakarta 12310, Indonesia',
  location_maps_url text NOT NULL DEFAULT 'https://maps.google.com/?q=Jl.+Metro+Pondok+Indah+No.+27+Jakarta+Selatan',
  location_embed_url text DEFAULT 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3965.867969850259!2d106.777014!3d-6.281075!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f1c37b3f9b8b%3A0x6b7c53d9e03d4c3a!2sJl.%20Metro%20Pondok%20Indah%20No.27%2C%20Pondok%20Pinang%2C%20Kebayoran%20Lama%2C%20Jakarta%20Selatan!5e0!3m2!1sen!2sid!4v1700000000000!5m2!1sen!2sid',
  location_airport_distance text NOT NULL DEFAULT '~38 mins to Halim (HLP) • ~42 mins to Soekarno-Hatta (CGK)',
  location_check_in_info text NOT NULL DEFAULT 'Check-in: 14:00 - 23:59 WIB • Check-out: 12:00 WIB • Cashless Property',
  nearby_items jsonb NOT NULL DEFAULT '[]'::jsonb,

  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- Seed initial row
INSERT INTO public.experience_settings (id)
VALUES ('default')
ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE public.experience_settings ENABLE ROW LEVEL SECURITY;

-- 1. Everyone can read experience settings (Public & Guests)
DROP POLICY IF EXISTS "Experience settings are viewable by everyone" ON public.experience_settings;
CREATE POLICY "Experience settings are viewable by everyone"
  ON public.experience_settings
  FOR SELECT
  USING (true);

-- 2. Only authenticated admins can update experience settings
DROP POLICY IF EXISTS "Only admins can update experience settings" ON public.experience_settings;
CREATE POLICY "Only admins can update experience settings"
  ON public.experience_settings
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 3. Only authenticated admins can insert experience settings
DROP POLICY IF EXISTS "Only admins can insert experience settings" ON public.experience_settings;
CREATE POLICY "Only admins can insert experience settings"
  ON public.experience_settings
  FOR INSERT
  WITH CHECK (public.is_admin());
`;

/**
 * Validates and sanitizes experience settings payload before saving.
 */
export function sanitizeExperiencePayload(
  payload: Partial<ExperienceSettings>
): Partial<ExperienceSettings> {
  const sanitizeRecreations = (items: unknown): RecreationItem[] => {
    if (!Array.isArray(items)) return DEFAULT_EXPERIENCE_SETTINGS.recreations_items;
    const list: RecreationItem[] = [];
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      if (!it || typeof it !== "object") continue;
      const title = String((it as any).title || "").trim();
      if (!title) continue;
      list.push({
        id: String((it as any).id || `rec-${i + 1}`),
        title,
        category: String((it as any).category || "Leisure").trim(),
        description: String((it as any).description || "").trim(),
        image: String((it as any).image || DEFAULT_RECREATION_ITEMS[0].image).trim(),
        image_path:
          typeof (it as any).image_path === "string"
            ? (it as any).image_path.trim()
            : null,
        badge: (it as any).badge ? String((it as any).badge).trim() : undefined,
        timing: (it as any).timing ? String((it as any).timing).trim() : undefined,
        visible_on_homepage: (it as any).visible_on_homepage !== false,
      });
    }
    return list.length > 0 ? list : DEFAULT_EXPERIENCE_SETTINGS.recreations_items;
  };

  const sanitizeFacilities = (items: unknown): FacilityItem[] => {
    if (!Array.isArray(items)) return DEFAULT_EXPERIENCE_SETTINGS.facilities_items;
    const list: FacilityItem[] = [];
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      if (!it || typeof it !== "object") continue;
      const name = String((it as any).name || "").trim();
      if (!name) continue;
      const rawFeatures = (it as any).features;
      const features = Array.isArray(rawFeatures)
        ? rawFeatures.map((f: unknown) => String(f).trim()).filter(Boolean)
        : [];
      list.push({
        id: String((it as any).id || `fac-${i + 1}`),
        name,
        tagline: String((it as any).tagline || "").trim(),
        description: String((it as any).description || "").trim(),
        image: String((it as any).image || DEFAULT_FACILITY_ITEMS[0].image).trim(),
        image_path:
          typeof (it as any).image_path === "string"
            ? (it as any).image_path.trim()
            : null,
        hours: String((it as any).hours || "Daily Access").trim(),
        features,
        visible_on_homepage: (it as any).visible_on_homepage !== false,
      });
    }
    return list.length > 0 ? list : DEFAULT_EXPERIENCE_SETTINGS.facilities_items;
  };

  const sanitizeNearby = (items: unknown): NearbyPlaceItem[] => {
    if (!Array.isArray(items)) return DEFAULT_EXPERIENCE_SETTINGS.nearby_items;
    const list: NearbyPlaceItem[] = [];
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      if (!it || typeof it !== "object") continue;
      const name = String((it as any).name || "").trim();
      if (!name) continue;
      list.push({
        id: String((it as any).id || `near-${i + 1}`),
        name,
        category: String((it as any).category || "Attraction").trim(),
        distance: String((it as any).distance || "").trim(),
        description: String((it as any).description || "").trim(),
        image: String((it as any).image || DEFAULT_NEARBY_ITEMS[0].image).trim(),
        image_path:
          typeof (it as any).image_path === "string"
            ? (it as any).image_path.trim()
            : null,
        visible_on_homepage: (it as any).visible_on_homepage !== false,
      });
    }
    return list.length > 0 ? list : DEFAULT_EXPERIENCE_SETTINGS.nearby_items;
  };

  return {
    hero_eyebrow:
      typeof payload.hero_eyebrow === "string" && payload.hero_eyebrow.trim()
        ? payload.hero_eyebrow.trim()
        : DEFAULT_EXPERIENCE_SETTINGS.hero_eyebrow,
    hero_title:
      typeof payload.hero_title === "string" && payload.hero_title.trim()
        ? payload.hero_title.trim()
        : DEFAULT_EXPERIENCE_SETTINGS.hero_title,
    hero_description:
      typeof payload.hero_description === "string" && payload.hero_description.trim()
        ? payload.hero_description.trim()
        : DEFAULT_EXPERIENCE_SETTINGS.hero_description,
    hero_image:
      typeof payload.hero_image === "string" && payload.hero_image.trim()
        ? payload.hero_image.trim()
        : DEFAULT_EXPERIENCE_SETTINGS.hero_image,
    hero_image_path:
      typeof payload.hero_image_path === "string" ? payload.hero_image_path.trim() : null,

    recreations_eyebrow:
      typeof payload.recreations_eyebrow === "string" && payload.recreations_eyebrow.trim()
        ? payload.recreations_eyebrow.trim()
        : DEFAULT_EXPERIENCE_SETTINGS.recreations_eyebrow,
    recreations_title:
      typeof payload.recreations_title === "string" && payload.recreations_title.trim()
        ? payload.recreations_title.trim()
        : DEFAULT_EXPERIENCE_SETTINGS.recreations_title,
    recreations_description:
      typeof payload.recreations_description === "string" && payload.recreations_description.trim()
        ? payload.recreations_description.trim()
        : DEFAULT_EXPERIENCE_SETTINGS.recreations_description,
    recreations_items: sanitizeRecreations(payload.recreations_items),

    facilities_eyebrow:
      typeof payload.facilities_eyebrow === "string" && payload.facilities_eyebrow.trim()
        ? payload.facilities_eyebrow.trim()
        : DEFAULT_EXPERIENCE_SETTINGS.facilities_eyebrow,
    facilities_title:
      typeof payload.facilities_title === "string" && payload.facilities_title.trim()
        ? payload.facilities_title.trim()
        : DEFAULT_EXPERIENCE_SETTINGS.facilities_title,
    facilities_description:
      typeof payload.facilities_description === "string" && payload.facilities_description.trim()
        ? payload.facilities_description.trim()
        : DEFAULT_EXPERIENCE_SETTINGS.facilities_description,
    facilities_items: sanitizeFacilities(payload.facilities_items),

    location_eyebrow:
      typeof payload.location_eyebrow === "string" && payload.location_eyebrow.trim()
        ? payload.location_eyebrow.trim()
        : DEFAULT_EXPERIENCE_SETTINGS.location_eyebrow,
    location_title:
      typeof payload.location_title === "string" && payload.location_title.trim()
        ? payload.location_title.trim()
        : DEFAULT_EXPERIENCE_SETTINGS.location_title,
    location_description:
      typeof payload.location_description === "string" && payload.location_description.trim()
        ? payload.location_description.trim()
        : DEFAULT_EXPERIENCE_SETTINGS.location_description,
    location_badge:
      typeof payload.location_badge === "string" && payload.location_badge.trim()
        ? payload.location_badge.trim()
        : DEFAULT_EXPERIENCE_SETTINGS.location_badge,
    location_hotel_name:
      typeof payload.location_hotel_name === "string" && payload.location_hotel_name.trim()
        ? payload.location_hotel_name.trim()
        : DEFAULT_EXPERIENCE_SETTINGS.location_hotel_name,
    location_address:
      typeof payload.location_address === "string" && payload.location_address.trim()
        ? payload.location_address.trim()
        : DEFAULT_EXPERIENCE_SETTINGS.location_address,
    location_maps_url:
      typeof payload.location_maps_url === "string" && payload.location_maps_url.trim()
        ? payload.location_maps_url.trim()
        : DEFAULT_EXPERIENCE_SETTINGS.location_maps_url,
    location_embed_url:
      typeof payload.location_embed_url === "string" && payload.location_embed_url.trim()
        ? payload.location_embed_url.trim()
        : DEFAULT_EXPERIENCE_SETTINGS.location_embed_url,
    location_airport_distance:
      typeof payload.location_airport_distance === "string" && payload.location_airport_distance.trim()
        ? payload.location_airport_distance.trim()
        : DEFAULT_EXPERIENCE_SETTINGS.location_airport_distance,
    location_check_in_info:
      typeof payload.location_check_in_info === "string" && payload.location_check_in_info.trim()
        ? payload.location_check_in_info.trim()
        : DEFAULT_EXPERIENCE_SETTINGS.location_check_in_info,
    nearby_items: sanitizeNearby(payload.nearby_items),
  };
}
