import type { OffersSettings, OfferItem, GuaranteeItem } from "@/types/database";

export const DEFAULT_GUARANTEE_ITEMS: GuaranteeItem[] = [
  {
    icon: "ShieldCheck",
    title: "Best Rate Guarantee",
    description:
      "Direct booking ensures unmatched rates, with no hidden booking commissions or surcharges.",
  },
  {
    icon: "Award",
    title: "Priority Room Upgrades",
    description:
      "Complimentary room upgrades to superior city or pool view upon availability at check-in.",
  },
  {
    icon: "Clock",
    title: "Flexible Early & Late Access",
    description:
      "Extended check-in and late departure privileges exclusively for direct hotel guests.",
  },
  {
    icon: "PhoneCall",
    title: "24/7 Dedicated Concierge",
    description:
      "Direct personal assistance for custom itinerary planning, transfers, and dietary requests.",
  },
];

export const SUPPORTED_GUARANTEE_ICONS = [
  "ShieldCheck",
  "Award",
  "Clock",
  "PhoneCall",
  "Crown",
  "Heart",
  "Check",
  "Wifi",
  "Tag",
  "MapPin",
];

export const DEFAULT_OFFERS_ITEMS: OfferItem[] = [
  {
    id: "offer-1",
    title: "The Signature Urban Staycation",
    tagline: "Premier Pondok Indah Experience",
    badge: "Most Popular",
    category: "Staycation & Leisure",
    description:
      "Unwind in the quiet luxury of Pondok Indah with daily buffet breakfast, outdoor swimming pool relaxation, and late checkout privileges.",
    image:
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=85",
    image_path: null,
    price: "From IDR 1,250,000 / night",
    validity: "Valid until 31 December 2026",
    inclusions: [
      "Daily buffet breakfast for two at our halal restaurant",
      "Complimentary access to outdoor swimming pool and gym",
      "High-speed 100+ Mbps Wi-Fi in room and public areas",
      "Welcome signature mocktail upon arrival",
      "Late checkout privilege until 02:00 PM (subject to availability)",
    ],
    terms: "Requires a minimum 1-night stay. 100% non-smoking rooms apply.",
    promo_code: "SIGNATURE26",
    show_button: true,
    button_text: "Reserve This Offer",
    button_link: "/#booking",
    visible_on_homepage: true,
  },
  {
    id: "offer-2",
    title: "Romantic City Sanctuary",
    tagline: "Intimate Celebration Package",
    badge: "Honeymoon & Romance",
    category: "Celebration & Honeymoon",
    description:
      "An extraordinary journey for two designed with candlelit dinner arrangements, floral bath amenities, and panoramic city views.",
    image:
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=85",
    image_path: null,
    price: "From IDR 2,450,000 / night",
    validity: "Valid throughout 2026",
    inclusions: [
      "Romantic 4-course dinner for two at our signature dining",
      "Welcome sparkling beverage with artisanal chocolates",
      "Sensory botanical bath amenities in-suite",
      "Priority room upgrade to Deluxe King or Junior Suite",
      "Late checkout privilege until 03:00 PM",
    ],
    terms: "Valid for Deluxe King and Junior Suite categories. Cashless property policy applies.",
    promo_code: "ROMANCE",
    show_button: true,
    button_text: "Book Romance Package",
    button_link: "/#booking",
    visible_on_homepage: true,
  },
  {
    id: "offer-3",
    title: "Urban Wellness & Spa Awakening",
    tagline: "Mindful Health & Rejuvenation",
    badge: "Wellness",
    category: "Wellness & Spa",
    description:
      "Immerse yourself in full-service spa treatments, outdoor pool relaxation, and modern fitness amenities in South Jakarta.",
    image:
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=85",
    image_path: null,
    price: "From IDR 1,850,000 / night",
    validity: "Valid Monday to Thursday stays",
    inclusions: [
      "60-minute signature full-service spa ritual per guest",
      "Unlimited access to outdoor swimming pool and fitness center",
      "Healthy artisanal buffet breakfast and herbal infusions",
      "Complimentary valet parking throughout stay",
      "Express private check-in service",
    ],
    terms: "Applicable for weekday stays. Spa slots must be reserved 24 hours prior.",
    promo_code: "WELLNESS",
    show_button: true,
    button_text: "Claim Wellness Offer",
    button_link: "/#booking",
    visible_on_homepage: true,
  },
  {
    id: "offer-4",
    title: "Extended Residence Stay (Pay 4, Stay 5)",
    tagline: "Serviced Residence Long Stay Privileges",
    badge: "Extended Stay",
    category: "Extended Stay",
    description:
      "Experience refined extended living in Pondok Indah. Enjoy your fifth consecutive night complimentary along with housekeeping and laundry privileges.",
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=85",
    image_path: null,
    price: "Average IDR 1,150,000 / night",
    validity: "Valid until 31 December 2026",
    inclusions: [
      "Fifth consecutive night completely complimentary",
      "Daily housekeeping and regular laundry privileges",
      "100+ Mbps dedicated high-speed Wi-Fi and executive work desk",
      "15% exclusive privilege at our on-site halal dining",
      "Free on-site parking throughout your stay",
    ],
    terms: "Minimum 5 consecutive nights stay required. Cashless payment policy applies.",
    promo_code: "LONGSTAY5",
    show_button: true,
    button_text: "Reserve Extended Stay",
    button_link: "/#booking",
    visible_on_homepage: true,
  },
];

export const DEFAULT_OFFERS_SETTINGS: OffersSettings = {
  hero_eyebrow: "Exclusive Curations & Privileges",
  hero_title: "Exceptional Stays, Tailored for Wonder",
  hero_description:
    "Discover bespoke packages, seasonal staycations, and sensory wellness journeys crafted to elevate every moment of your stay at Arundra Signature Pondok Indah.",
  hero_image:
    "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1600&q=85",
  hero_image_path: null,
  guarantee_eyebrow: "THE ARUNDRA GUARANTEE",
  guarantee_title: "Direct Reservation Privileges",
  guarantee_description:
    "Every booking made through our official portal receives dedicated VIP hospitality attention.",
  guarantee_items: DEFAULT_GUARANTEE_ITEMS,
  offers_items: DEFAULT_OFFERS_ITEMS,
};

export const SQL_OFFERS_MIGRATION_SCRIPT = `-- ==============================================================================
-- OFFERS PAGE SETTINGS TABLE MIGRATION
-- Arundra Signature Hotel
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.offers_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  hero_eyebrow TEXT NOT NULL DEFAULT 'Exclusive Curations & Privileges',
  hero_title TEXT NOT NULL DEFAULT 'Exceptional Stays, Tailored for Wonder',
  hero_description TEXT NOT NULL DEFAULT 'Discover bespoke packages, seasonal staycations, and sensory wellness journeys crafted to elevate every moment of your stay at Arundra Signature Pondok Indah.',
  hero_image TEXT NOT NULL DEFAULT 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1600&q=85',
  hero_image_path TEXT,
  guarantee_eyebrow TEXT NOT NULL DEFAULT 'THE ARUNDRA GUARANTEE',
  guarantee_title TEXT NOT NULL DEFAULT 'Direct Reservation Privileges',
  guarantee_description TEXT NOT NULL DEFAULT 'Every booking made through our official portal receives dedicated VIP hospitality attention.',
  guarantee_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  offers_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by TEXT
);

-- Ensure guarantee columns exist if table was already created
ALTER TABLE public.offers_settings ADD COLUMN IF NOT EXISTS guarantee_eyebrow TEXT NOT NULL DEFAULT 'THE ARUNDRA GUARANTEE';
ALTER TABLE public.offers_settings ADD COLUMN IF NOT EXISTS guarantee_title TEXT NOT NULL DEFAULT 'Direct Reservation Privileges';
ALTER TABLE public.offers_settings ADD COLUMN IF NOT EXISTS guarantee_description TEXT NOT NULL DEFAULT 'Every booking made through our official portal receives dedicated VIP hospitality attention.';
ALTER TABLE public.offers_settings ADD COLUMN IF NOT EXISTS guarantee_items JSONB NOT NULL DEFAULT '[]'::jsonb;

-- Enable RLS
ALTER TABLE public.offers_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access
DROP POLICY IF EXISTS "Public can view offers settings" ON public.offers_settings;
CREATE POLICY "Public can view offers settings"
  ON public.offers_settings
  FOR SELECT
  USING (true);

-- Allow authenticated users / service role to update/insert
DROP POLICY IF EXISTS "Authenticated users can manage offers settings" ON public.offers_settings;
CREATE POLICY "Authenticated users can manage offers settings"
  ON public.offers_settings
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Insert default row if not exists
INSERT INTO public.offers_settings (id, offers_items, guarantee_items)
VALUES (
  'default',
  '${JSON.stringify(DEFAULT_OFFERS_ITEMS).replace(/'/g, "''")}'::jsonb,
  '${JSON.stringify(DEFAULT_GUARANTEE_ITEMS).replace(/'/g, "''")}'::jsonb
)
ON CONFLICT (id) DO NOTHING;
`;

export function sanitizeOffersPayload(payload: Partial<OffersSettings>): OffersSettings {
  const sanitizeInclusions = (items: unknown): string[] => {
    if (!Array.isArray(items)) return [];
    return items
      .map((it) => (typeof it === "string" ? it.trim() : ""))
      .filter((it) => it.length > 0);
  };

  const sanitizeGuarantee = (items: unknown): GuaranteeItem[] => {
    if (!Array.isArray(items)) return DEFAULT_GUARANTEE_ITEMS;
    const list: GuaranteeItem[] = [];
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      if (!it || typeof it !== "object") continue;
      const row = it as Record<string, unknown>;
      list.push({
        icon: String(row.icon || DEFAULT_GUARANTEE_ITEMS[i]?.icon || "ShieldCheck").trim(),
        title: String(row.title || "").trim(),
        description: String(row.description || "").trim(),
      });
    }
    return list.length > 0 ? list : DEFAULT_GUARANTEE_ITEMS;
  };

  const sanitizeOffers = (items: unknown): OfferItem[] => {
    if (!Array.isArray(items)) return DEFAULT_OFFERS_ITEMS;
    const list: OfferItem[] = [];
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      if (!it || typeof it !== "object") continue;
      const row = it as Record<string, unknown>;
      list.push({
        id: String(row.id || `offer-${Date.now()}-${i}`),
        title: String(row.title || "Untitled Offer").trim(),
        tagline: String(row.tagline || "").trim(),
        badge: String(row.badge || "Special Offer").trim(),
        category: String(row.category || "General").trim(),
        description: String(row.description || "").trim(),
        image: String(
          row.image ||
            "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=85"
        ).trim(),
        image_path: typeof row.image_path === "string" ? row.image_path.trim() : null,
        price: String(row.price || "").trim(),
        validity: String(row.validity || "").trim(),
        inclusions: sanitizeInclusions(row.inclusions),
        terms: typeof row.terms === "string" ? row.terms.trim() : "",
        promo_code: typeof row.promo_code === "string" ? row.promo_code.trim() : "",
        show_button: row.show_button !== false,
        button_text: String(row.button_text || "Reserve This Offer").trim(),
        button_link: String(row.button_link || "/#booking").trim(),
        visible_on_homepage: row.visible_on_homepage !== false,
      });
    }
    return list.length > 0 ? list : DEFAULT_OFFERS_ITEMS;
  };

  return {
    hero_eyebrow:
      typeof payload.hero_eyebrow === "string" && payload.hero_eyebrow.trim()
        ? payload.hero_eyebrow.trim()
        : DEFAULT_OFFERS_SETTINGS.hero_eyebrow,
    hero_title:
      typeof payload.hero_title === "string" && payload.hero_title.trim()
        ? payload.hero_title.trim()
        : DEFAULT_OFFERS_SETTINGS.hero_title,
    hero_description:
      typeof payload.hero_description === "string" && payload.hero_description.trim()
        ? payload.hero_description.trim()
        : DEFAULT_OFFERS_SETTINGS.hero_description,
    hero_image:
      typeof payload.hero_image === "string" && payload.hero_image.trim()
        ? payload.hero_image.trim()
        : DEFAULT_OFFERS_SETTINGS.hero_image,
    hero_image_path:
      typeof payload.hero_image_path === "string" ? payload.hero_image_path.trim() : null,
    guarantee_eyebrow:
      typeof payload.guarantee_eyebrow === "string" && payload.guarantee_eyebrow.trim()
        ? payload.guarantee_eyebrow.trim()
        : DEFAULT_OFFERS_SETTINGS.guarantee_eyebrow,
    guarantee_title:
      typeof payload.guarantee_title === "string" && payload.guarantee_title.trim()
        ? payload.guarantee_title.trim()
        : DEFAULT_OFFERS_SETTINGS.guarantee_title,
    guarantee_description:
      typeof payload.guarantee_description === "string" && payload.guarantee_description.trim()
        ? payload.guarantee_description.trim()
        : DEFAULT_OFFERS_SETTINGS.guarantee_description,
    guarantee_items: sanitizeGuarantee(payload.guarantee_items),
    offers_items: sanitizeOffers(payload.offers_items),
  };
}

