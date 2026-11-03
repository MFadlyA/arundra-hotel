import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database, DbRoom } from "@/types/database";

const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim().replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "");
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

function getPublicClient() {
  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes("your-project-id")) {
    return null;
  }
  return createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey);
}

export type Room = {
  id?: string;
  slug: string;
  name: string;
  description: string;
  fullDescription: string;
  price: number;
  guests: number;
  size: number;
  bed: string;
  images: string[];
  cover_image_path?: string | null;
  gallery_image_paths?: string[];
  amenities: string[];
  is_published?: boolean;
  is_featured?: boolean;
  order_rank?: number;
};

export const DEFAULT_ROOMS: Room[] = [
  {
    id: "seed-basic-twin-room",
    slug: "basic-twin-room",
    name: "Basic Twin Room",
    description: "Thoughtfully designed twin room featuring serene earth-tone decor and functional comfort.",
    fullDescription:
      "Experience the warm modern elegance of Arundra Signature in our Basic Twin Room. Perfect for business travelers or friends visiting South Jakarta, featuring two plush twin beds, dedicated work desk, wooden wardrobe, electric kettle, and high-speed Wi-Fi.",
    price: 935000,
    guests: 2,
    size: 22,
    bed: "2 Twin Beds",
    images: [
      "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1400&q=85",
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1000&q=85",
    ],
    cover_image_path: null,
    gallery_image_paths: [],
    amenities: [
      "Air Conditioning",
      "High-Speed Wi-Fi",
      "Smart TV",
      "Work Desk",
      "Wooden Wardrobe",
      "Electric Kettle",
      "En-Suite Shower",
      "Complimentary Toiletries",
    ],
    is_published: true,
    is_featured: true,
    order_rank: 1,
  },
  {
    id: "seed-budget-double-room",
    slug: "budget-double-room",
    name: "Budget Double Room",
    description: "Comfortable and cozy double room tailored for effortless relaxation and rest.",
    fullDescription:
      "Designed for effortless relaxation and rest, the Budget Double Room offers quiet luxury with a comfortable full double bed, flat-screen TV, coffee/tea maker, electric kettle, and private bathroom with toiletries.",
    price: 985000,
    guests: 2,
    size: 22,
    bed: "1 Full Double Bed",
    images: [
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1400&q=85",
      "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1000&q=85",
    ],
    cover_image_path: null,
    gallery_image_paths: [],
    amenities: [
      "Air Conditioning",
      "High-Speed Wi-Fi",
      "Flat-Screen TV",
      "Coffee & Tea Maker",
      "Electric Kettle",
      "Private Bathroom",
      "Complimentary Toiletries",
      "Work Desk",
    ],
    is_published: true,
    is_featured: true,
    order_rank: 2,
  },
  {
    id: "seed-superior-room",
    slug: "superior-room",
    name: "Superior Room",
    description: "Refined urban comfort with scenic city or refreshing courtyard pool views.",
    fullDescription:
      "The Superior Room combines functional elegance with delightful views of the Pondok Indah city skyline or courtyard pool. Enjoy premium bedding, in-room safe, writing desk, electric kettle, complimentary toiletries, and slippers.",
    price: 1150000,
    guests: 2,
    size: 22,
    bed: "1 Full Bed or 2 Twin Beds",
    images: [
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1400&q=85",
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1000&q=85",
    ],
    cover_image_path: null,
    gallery_image_paths: [],
    amenities: [
      "Air Conditioning",
      "High-Speed Wi-Fi",
      "Smart TV",
      "Writing Desk",
      "In-Room Safe",
      "Electric Kettle",
      "Complimentary Slippers & Toiletries",
      "City or Pool View",
    ],
    is_published: true,
    is_featured: true,
    order_rank: 3,
  },
  {
    id: "seed-deluxe-king-room",
    slug: "deluxe-king-room",
    name: "Deluxe King Room",
    description: "Spacious luxury room with separate seating area and private balcony in select units.",
    fullDescription:
      "Indulge in extra space and quiet luxury in our Deluxe King Room. Features an expansive king bed, separate seating area, mini-refrigerator, 100+ Mbps Wi-Fi, satellite Smart TV, premium bath amenities, and a private balcony in select units.",
    price: 1450000,
    guests: 2,
    size: 28,
    bed: "1 King Bed",
    images: [
      "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1400&q=85",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1000&q=85",
    ],
    cover_image_path: null,
    gallery_image_paths: [],
    amenities: [
      "Air Conditioning",
      "100+ Mbps Wi-Fi",
      "Satellite Smart TV",
      "Mini Refrigerator",
      "Separate Seating Area",
      "Private Balcony (Select Units)",
      "Premium Bath Amenities",
      "Coffee & Tea Station",
    ],
    is_published: true,
    is_featured: false,
    order_rank: 4,
  },
  {
    id: "seed-junior-suite",
    slug: "junior-suite",
    name: "Junior Suite",
    description: "Our flagship suite offering panoramic city views, separate living & dining spaces.",
    fullDescription:
      "The premier residential suite at Arundra Signature Pondok Indah. Boasting 36 square meters of refined luxury, panoramic South Jakarta city views, separate living and dining area, modern chandelier lighting, executive work desk, and spacious en-suite bathroom.",
    price: 1950000,
    guests: 3,
    size: 36,
    bed: "1 King Bed",
    images: [
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1400&q=85",
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1000&q=85",
    ],
    cover_image_path: null,
    gallery_image_paths: [],
    amenities: [
      "Air Conditioning",
      "100+ Mbps Wi-Fi",
      "Panoramic City View",
      "Separate Living & Dining Area",
      "Executive Work Desk",
      "Modern Chandelier Lighting",
      "Mini Refrigerator",
      "Spacious En-Suite Bathroom",
      "Luxury Bathrobes & Slippers",
    ],
    is_published: true,
    is_featured: false,
    order_rank: 5,
  },
];

export const rooms = DEFAULT_ROOMS;

export function transformDbRoomToRoom(dbRoom: DbRoom): Room {
  const gallery = Array.isArray(dbRoom.gallery_images)
    ? dbRoom.gallery_images
    : [];

  return {
    id: dbRoom.id,
    slug: dbRoom.slug,
    name: dbRoom.name,
    description: dbRoom.description,
    fullDescription: dbRoom.full_description,
    price: Number(dbRoom.price) || 0,
    guests: dbRoom.guests,
    size: dbRoom.size,
    bed: dbRoom.bed,
    images: [dbRoom.cover_image, ...gallery.filter(Boolean)],
    cover_image_path: dbRoom.cover_image_path,
    gallery_image_paths: Array.isArray(dbRoom.gallery_image_paths)
      ? dbRoom.gallery_image_paths
      : [],
    amenities: Array.isArray(dbRoom.amenities) ? dbRoom.amenities : [],
    is_published: dbRoom.is_published,
    is_featured: Boolean(dbRoom.is_featured),
    order_rank: dbRoom.order_rank,
  };
}

/**
 * Fetch all published rooms from database (with fallback to DEFAULT_ROOMS)
 */
export async function getRooms(): Promise<Room[]> {
  try {
    const supabase = getPublicClient();
    if (!supabase) return DEFAULT_ROOMS;

    const { data, error } = await (supabase.from("rooms") as any)
      .select("*")
      .eq("is_published", true)
      .order("order_rank", { ascending: true });

    if (error || !data || data.length === 0) {
      return DEFAULT_ROOMS;
    }

    return (data as DbRoom[]).map(transformDbRoomToRoom);
  } catch (err) {
    console.warn("Could not query dynamic rooms table, using fallback:", err);
    return DEFAULT_ROOMS;
  }
}

/**
 * Fetch a single room by slug (with fallback to DEFAULT_ROOMS)
 */
export async function getRoomBySlugAsync(
  slug: string
): Promise<Room | undefined> {
  try {
    const supabase = getPublicClient();
    if (!supabase) return DEFAULT_ROOMS.find((r) => r.slug === slug);

    const { data, error } = await (supabase.from("rooms") as any)
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (error || !data) {
      return DEFAULT_ROOMS.find((r) => r.slug === slug);
    }

    return transformDbRoomToRoom(data as DbRoom);
  } catch (err) {
    console.warn(`Error querying room ${slug}, using fallback:`, err);
    return DEFAULT_ROOMS.find((r) => r.slug === slug);
  }
}

/**
 * Synchronous room lookup (matches DEFAULT_ROOMS)
 */
export function getRoomBySlug(slug: string): Room | undefined {
  return DEFAULT_ROOMS.find((room) => room.slug === slug);
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(price);
}

export const SQL_ROOMS_MIGRATION_SCRIPT = `-- ==============================================================================
-- RUN THIS IN SUPABASE DASHBOARD -> SQL EDITOR
-- ARUNDRA SIGNATURE HOTEL: ROOMS & SUITES CMS TABLE & STORAGE POLICIES
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text NOT NULL,
  full_description text NOT NULL,
  price numeric NOT NULL DEFAULT 0,
  guests integer NOT NULL DEFAULT 2,
  size integer NOT NULL DEFAULT 30,
  bed text NOT NULL DEFAULT '1 King Bed',
  cover_image text NOT NULL,
  cover_image_path text,
  gallery_images jsonb NOT NULL DEFAULT '[]'::jsonb,
  gallery_image_paths jsonb NOT NULL DEFAULT '[]'::jsonb,
  amenities jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_published boolean NOT NULL DEFAULT true,
  is_featured boolean NOT NULL DEFAULT false,
  order_rank integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure column exists if table was created previously
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_rooms_slug ON public.rooms(slug);
CREATE INDEX IF NOT EXISTS idx_rooms_is_published ON public.rooms(is_published);
CREATE INDEX IF NOT EXISTS idx_rooms_is_featured ON public.rooms(is_featured);
CREATE INDEX IF NOT EXISTS idx_rooms_order_rank ON public.rooms(order_rank);

ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view published rooms" ON public.rooms;
CREATE POLICY "Public can view published rooms"
  ON public.rooms FOR SELECT USING (is_published = true OR public.is_admin());

DROP POLICY IF EXISTS "Admins can insert rooms" ON public.rooms;
CREATE POLICY "Admins can insert rooms"
  ON public.rooms FOR INSERT WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update rooms" ON public.rooms;
CREATE POLICY "Admins can update rooms"
  ON public.rooms FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete rooms" ON public.rooms;
CREATE POLICY "Admins can delete rooms"
  ON public.rooms FOR DELETE USING (public.is_admin());

-- Seed initial 5 rooms
INSERT INTO public.rooms (slug, name, description, full_description, price, guests, size, bed, cover_image, gallery_images, amenities, is_published, is_featured, order_rank)
VALUES
(
  'basic-twin-room',
  'Basic Twin Room',
  'Thoughtfully designed twin room featuring serene earth-tone decor and functional comfort.',
  'Experience the warm modern elegance of Arundra Signature in our Basic Twin Room. Perfect for business travelers or friends visiting South Jakarta, featuring two plush twin beds, dedicated work desk, wooden wardrobe, electric kettle, and high-speed Wi-Fi.',
  935000,
  2,
  22,
  '2 Twin Beds',
  'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1400&q=85',
  '["https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1000&q=85", "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1000&q=85"]'::jsonb,
  '["Air Conditioning", "High-Speed Wi-Fi", "Smart TV", "Work Desk", "Wooden Wardrobe", "Electric Kettle", "En-Suite Shower", "Complimentary Toiletries"]'::jsonb,
  true,
  true,
  1
),
(
  'budget-double-room',
  'Budget Double Room',
  'Comfortable and cozy double room tailored for effortless relaxation and rest.',
  'Designed for effortless relaxation and rest, the Budget Double Room offers quiet luxury with a comfortable full double bed, flat-screen TV, coffee/tea maker, electric kettle, and private bathroom with toiletries.',
  985000,
  2,
  22,
  '1 Full Double Bed',
  'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1400&q=85',
  '["https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1000&q=85", "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1000&q=85"]'::jsonb,
  '["Air Conditioning", "High-Speed Wi-Fi", "Flat-Screen TV", "Coffee & Tea Maker", "Electric Kettle", "Private Bathroom", "Complimentary Toiletries", "Work Desk"]'::jsonb,
  true,
  true,
  2
),
(
  'superior-room',
  'Superior Room',
  'Refined urban comfort with scenic city or refreshing courtyard pool views.',
  'The Superior Room combines functional elegance with delightful views of the Pondok Indah city skyline or courtyard pool. Enjoy premium bedding, in-room safe, writing desk, electric kettle, complimentary toiletries, and slippers.',
  1150000,
  2,
  22,
  '1 Full Bed or 2 Twin Beds',
  'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1400&q=85',
  '["https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1000&q=85", "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1000&q=85"]'::jsonb,
  '["Air Conditioning", "High-Speed Wi-Fi", "Smart TV", "Writing Desk", "In-Room Safe", "Electric Kettle", "Complimentary Slippers & Toiletries", "City or Pool View"]'::jsonb,
  true,
  true,
  3
),
(
  'deluxe-king-room',
  'Deluxe King Room',
  'Spacious luxury room with separate seating area and private balcony in select units.',
  'Indulge in extra space and quiet luxury in our Deluxe King Room. Features an expansive king bed, separate seating area, mini-refrigerator, 100+ Mbps Wi-Fi, satellite Smart TV, premium bath amenities, and a private balcony in select units.',
  1450000,
  2,
  28,
  '1 King Bed',
  'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1400&q=85',
  '["https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1000&q=85", "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1000&q=85"]'::jsonb,
  '["Air Conditioning", "100+ Mbps Wi-Fi", "Satellite Smart TV", "Mini Refrigerator", "Separate Seating Area", "Private Balcony (Select Units)", "Premium Bath Amenities", "Coffee & Tea Station"]'::jsonb,
  true,
  false,
  4
),
(
  'junior-suite',
  'Junior Suite',
  'Our flagship suite offering panoramic city views, separate living & dining spaces.',
  'The premier residential suite at Arundra Signature Pondok Indah. Boasting 36 square meters of refined luxury, panoramic South Jakarta city views, separate living and dining area, modern chandelier lighting, executive work desk, and spacious en-suite bathroom.',
  1950000,
  3,
  36,
  '1 King Bed',
  'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1400&q=85',
  '["https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1000&q=85", "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1000&q=85"]'::jsonb,
  '["Air Conditioning", "100+ Mbps Wi-Fi", "Panoramic City View", "Separate Living & Dining Area", "Executive Work Desk", "Modern Chandelier Lighting", "Mini Refrigerator", "Spacious En-Suite Bathroom", "Luxury Bathrobes & Slippers"]'::jsonb,
  true,
  false,
  5
)
ON CONFLICT (slug) DO NOTHING;

-- Storage Policies for 'hotel-assets' bucket
DROP POLICY IF EXISTS "Public can view hotel assets" ON storage.objects;
CREATE POLICY "Public can view hotel assets"
ON storage.objects FOR SELECT USING (bucket_id = 'hotel-assets');

DROP POLICY IF EXISTS "Admins can upload hotel assets" ON storage.objects;
CREATE POLICY "Admins can upload hotel assets"
ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'hotel-assets' AND (public.is_admin()));

DROP POLICY IF EXISTS "Admins can update hotel assets" ON storage.objects;
CREATE POLICY "Admins can update hotel assets"
ON storage.objects FOR UPDATE USING (bucket_id = 'hotel-assets' AND (public.is_admin()));

DROP POLICY IF EXISTS "Admins can delete hotel assets" ON storage.objects;
CREATE POLICY "Admins can delete hotel assets"
ON storage.objects FOR DELETE USING (bucket_id = 'hotel-assets' AND (public.is_admin()));
`;