import { createServerClient } from "@supabase/ssr";
import { unstable_cache, revalidatePath, revalidateTag } from "next/cache";
import { DEFAULT_FOOTER_SETTINGS } from "@/lib/footer-settings";
import { DEFAULT_EXPERIENCE_SETTINGS } from "@/lib/experience-settings";
import { DEFAULT_OFFERS_SETTINGS } from "@/lib/offers-settings";
import { DEFAULT_ROOMS, transformDbRoomToRoom, type Room } from "@/data/rooms";
import {
  DEFAULT_HERO_SLIDES,
  transformDbHeroSlideToSlide,
  type HeroSlide,
} from "@/data/hero-slides";
import { DEFAULT_DIFFERENCE_SETTINGS } from "@/lib/difference-settings";
import { DEFAULT_ESCAPE_SETTINGS } from "@/lib/escape-settings";
import { DEFAULT_WHY_BOOK_SETTINGS } from "@/lib/why-book-settings";
import { DEFAULT_HOSPITALITY_SETTINGS } from "@/lib/hospitality-settings";
import { DEFAULT_ROOMS_HEADER_SETTINGS } from "@/lib/rooms-header-settings";
import { DEFAULT_AUTH_PAGES_SETTINGS } from "@/lib/auth-pages-settings";
import type {
  Database,
  FooterSettings,
  ExperienceSettings,
  OffersSettings,
  DbRoom,
  DbHeroSlide,
  DifferenceSettings,
  EscapeSettings,
  WhyBookSettings,
  HospitalitySettings,
  RoomsHeaderSettings,
  AuthPagesSettings,
} from "@/types/database";

const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || "")
  .trim()
  .replace(/\/rest\/v1\/?$/, "")
  .replace(/\/+$/, "");
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

/**
 * Creates a stateless public client using the Supabase ANON key with empty cookies.
 * Safe for execution inside Next.js unstable_cache (does not touch request cookies).
 */
export function createPublicSsrClient() {
  return createServerClient<Database>(
    supabaseUrl || "https://placeholder-project.supabase.co",
    supabaseAnonKey || "placeholder-anon-key",
    {
      cookies: {
        getAll: () => [],
        setAll: () => {},
      },
    }
  );
}

/**
 * Cached fetcher for Footer & Hotel Info settings.
 * Revalidates in the background every 60s, or on-demand via revalidateTag("footer-settings").
 */
export const getCachedFooterSettings = unstable_cache(
  async (): Promise<FooterSettings> => {
    try {
      const supabase = createPublicSsrClient();
      const { data } = await (supabase.from("footer_settings") as any)
        .select("*")
        .eq("id", "default")
        .maybeSingle();

      if (data) {
        return data as FooterSettings;
      }
    } catch (err) {
      console.warn("Could not load cached footer settings:", err);
    }
    return DEFAULT_FOOTER_SETTINGS;
  },
  ["footer-settings"],
  {
    revalidate: 60,
    tags: ["footer-settings"],
  }
);

/**
 * Cached fetcher for Experience & Recreations page settings.
 * Revalidates in the background every 60s, or on-demand via revalidateTag("experience-settings").
 */
export const getCachedExperienceSettings = unstable_cache(
  async (): Promise<ExperienceSettings> => {
    try {
      const supabase = createPublicSsrClient();
      const { data } = await (supabase.from("experience_settings") as any)
        .select("*")
        .eq("id", "default")
        .maybeSingle();

      if (data) {
        return {
          ...DEFAULT_EXPERIENCE_SETTINGS,
          ...data,
          location_badge:
            data.location_badge ||
            data.hero_eyebrow ||
            DEFAULT_EXPERIENCE_SETTINGS.location_badge,
          location_hotel_name:
            data.location_hotel_name ||
            data.hero_title ||
            DEFAULT_EXPERIENCE_SETTINGS.location_hotel_name,
          location_address:
            data.location_address ||
            data.hero_description ||
            DEFAULT_EXPERIENCE_SETTINGS.location_address,
        };
      }
    } catch (err) {
      console.warn("Could not load cached experience settings:", err);
    }
    return DEFAULT_EXPERIENCE_SETTINGS;
  },
  ["experience-settings"],
  {
    revalidate: 60,
    tags: ["experience-settings"],
  }
);

/**
 * Cached fetcher for Offers & Bespoke packages page settings.
 * Revalidates in the background every 60s, or on-demand via revalidateTag("offers-settings").
 */
export const getCachedOffersSettings = unstable_cache(
  async (): Promise<OffersSettings> => {
    try {
      const supabase = createPublicSsrClient();
      const { data } = await (supabase.from("offers_settings") as any)
        .select("*")
        .eq("id", "default")
        .maybeSingle();

      if (data) {
        return {
          ...DEFAULT_OFFERS_SETTINGS,
          ...data,
          guarantee_eyebrow:
            data.guarantee_eyebrow || DEFAULT_OFFERS_SETTINGS.guarantee_eyebrow,
          guarantee_title:
            data.guarantee_title || DEFAULT_OFFERS_SETTINGS.guarantee_title,
          guarantee_description:
            data.guarantee_description ||
            DEFAULT_OFFERS_SETTINGS.guarantee_description,
          guarantee_items:
            Array.isArray(data.guarantee_items) && data.guarantee_items.length > 0
              ? data.guarantee_items
              : DEFAULT_OFFERS_SETTINGS.guarantee_items,
          offers_items:
            Array.isArray(data.offers_items) && data.offers_items.length > 0
              ? data.offers_items
              : DEFAULT_OFFERS_SETTINGS.offers_items,
        };
      }
    } catch (err) {
      console.warn("Could not load cached offers settings:", err);
    }
    return DEFAULT_OFFERS_SETTINGS;
  },
  ["offers-settings"],
  {
    revalidate: 60,
    tags: ["offers-settings"],
  }
);

/**
 * Cached fetcher for Rooms & Suites section header on the Home Page.
 * Revalidates in the background every 60s, or on-demand via revalidateTag("rooms-header-settings").
 */
export const getCachedRoomsHeaderSettings = unstable_cache(
  async (): Promise<RoomsHeaderSettings> => {
    try {
      const supabase = createPublicSsrClient();
      const { data } = await (supabase.from("rooms_header_settings") as any)
        .select("*")
        .eq("id", "default")
        .maybeSingle();

      if (data) {
        return data as RoomsHeaderSettings;
      }
    } catch (err) {
      console.warn("Could not load cached rooms header settings:", err);
    }
    return DEFAULT_ROOMS_HEADER_SETTINGS;
  },
  ["rooms-header-settings"],
  {
    revalidate: 60,
    tags: ["rooms-header-settings", "home-data"],
  }
);

/**
 * Cached fetcher for Home page public CMS sections.
 * Revalidates in the background every 60s, or on-demand via revalidateTag("home-data").
 */
export const getCachedHomeData = unstable_cache(
  async (): Promise<{
    rooms: Room[];
    difference: DifferenceSettings;
    escape: EscapeSettings;
    whyBook: WhyBookSettings;
    hospitality: HospitalitySettings;
    slides: HeroSlide[];
    roomsHeader: RoomsHeaderSettings;
  }> => {
    try {
      const supabase = createPublicSsrClient();

      const [
        roomsRes,
        diffRes,
        escapeRes,
        whyBookRes,
        hospRes,
        slidesRes,
        roomsHeaderRes,
      ] = await Promise.all([
        (supabase.from("rooms") as any)
          .select("*")
          .eq("is_published", true)
          .order("order_rank", { ascending: true }),
        (supabase.from("difference_settings") as any)
          .select("*")
          .eq("id", "default")
          .maybeSingle(),
        (supabase.from("escape_settings") as any)
          .select("*")
          .eq("id", "default")
          .maybeSingle(),
        (supabase.from("why_book_settings") as any)
          .select("*")
          .eq("id", "default")
          .maybeSingle(),
        (supabase.from("hospitality_settings") as any)
          .select("*")
          .eq("id", "default")
          .maybeSingle(),
        (supabase.from("hero_slides") as any)
          .select("*")
          .eq("is_active", true)
          .order("order_rank", { ascending: true }),
        (supabase.from("rooms_header_settings") as any)
          .select("*")
          .eq("id", "default")
          .maybeSingle(),
      ]);

      const rooms =
        roomsRes.data && roomsRes.data.length > 0
          ? (roomsRes.data as DbRoom[]).map(transformDbRoomToRoom)
          : DEFAULT_ROOMS;

      const difference =
        (diffRes.data as DifferenceSettings) || DEFAULT_DIFFERENCE_SETTINGS;
      const escape =
        (escapeRes.data as EscapeSettings) || DEFAULT_ESCAPE_SETTINGS;
      const whyBook =
        (whyBookRes.data as WhyBookSettings) || DEFAULT_WHY_BOOK_SETTINGS;
      const hospitality =
        (hospRes.data as HospitalitySettings) || DEFAULT_HOSPITALITY_SETTINGS;

      const slides =
        slidesRes.data && slidesRes.data.length > 0
          ? (slidesRes.data as DbHeroSlide[]).map(transformDbHeroSlideToSlide)
          : DEFAULT_HERO_SLIDES;

      const roomsHeader =
        (roomsHeaderRes.data as RoomsHeaderSettings) ||
        DEFAULT_ROOMS_HEADER_SETTINGS;

      return {
        rooms,
        difference,
        escape,
        whyBook,
        hospitality,
        slides,
        roomsHeader,
      };
    } catch (err) {
      console.warn("Could not load cached home data:", err);
      return {
        rooms: DEFAULT_ROOMS,
        difference: DEFAULT_DIFFERENCE_SETTINGS,
        escape: DEFAULT_ESCAPE_SETTINGS,
        whyBook: DEFAULT_WHY_BOOK_SETTINGS,
        hospitality: DEFAULT_HOSPITALITY_SETTINGS,
        slides: DEFAULT_HERO_SLIDES,
        roomsHeader: DEFAULT_ROOMS_HEADER_SETTINGS,
      };
    }
  },
  ["home-data"],
  {
    revalidate: 60,
    tags: [
      "home-data",
      "rooms",
      "hero-slides",
      "difference-settings",
      "escape-settings",
      "why-book-settings",
      "hospitality-settings",
      "rooms-header-settings",
    ],
  }
);

/**
 * Cached fetcher for published Rooms catalog.
 */
export const getCachedRooms = unstable_cache(
  async (): Promise<Room[]> => {
    try {
      const supabase = createPublicSsrClient();
      const { data, error } = await (supabase.from("rooms") as any)
        .select("*")
        .eq("is_published", true)
        .order("order_rank", { ascending: true });

      if (error || !data || data.length === 0) {
        return DEFAULT_ROOMS;
      }
      return (data as DbRoom[]).map(transformDbRoomToRoom);
    } catch (err) {
      console.warn("Could not load cached rooms:", err);
      return DEFAULT_ROOMS;
    }
  },
  ["rooms-catalog"],
  {
    revalidate: 60,
    tags: ["rooms"],
  }
);

/**
 * Cached fetcher for an individual room by slug.
 */
export const getCachedRoomBySlug = (slug: string) =>
  unstable_cache(
    async (): Promise<Room | undefined> => {
      try {
        const supabase = createPublicSsrClient();
        const { data, error } = await (supabase.from("rooms") as any)
          .select("*")
          .eq("slug", slug)
          .maybeSingle();

        if (error || !data) {
          return DEFAULT_ROOMS.find((r) => r.slug === slug);
        }
        return transformDbRoomToRoom(data as DbRoom);
      } catch (err) {
        console.warn(`Could not load cached room ${slug}:`, err);
        return DEFAULT_ROOMS.find((r) => r.slug === slug);
      }
    },
    ["room-detail", slug],
    {
      revalidate: 60,
      tags: ["rooms", `room-${slug}`],
    }
  )();

/**
 * Cached fetcher for Login & Register Auth pages settings.
 * Revalidates in the background every 60s, or on-demand via revalidateTag("auth-pages-settings").
 */
export const getCachedAuthPagesSettings = unstable_cache(
  async (): Promise<AuthPagesSettings> => {
    try {
      const supabase = createPublicSsrClient();
      const { data } = await (supabase.from("auth_pages_settings") as any)
        .select("*")
        .eq("id", "default")
        .maybeSingle();

      if (data) {
        return {
          ...DEFAULT_AUTH_PAGES_SETTINGS,
          ...data,
        };
      }
    } catch (err) {
      console.warn("Could not load cached auth pages settings:", err);
    }
    return DEFAULT_AUTH_PAGES_SETTINGS;
  },
  ["auth-pages-settings"],
  {
    revalidate: 60,
    tags: ["auth-pages-settings"],
  }
);

/**
 * On-demand cache invalidation helper for Admin CMS actions.
 * Safely purges Next.js data cache tags and path caches across Next.js versions.
 */
export function revalidateCmsPath({
  tag,
  path,
}: {
  tag?: string | string[];
  path?: string | string[];
}) {
  try {
    if (tag) {
      const tags = Array.isArray(tag) ? tag : [tag];
      for (const t of tags) {
        try {
          revalidateTag(t, { expire: 0 });
        } catch {
          try {
            (revalidateTag as any)(t);
          } catch {}
        }
      }
    }
    if (path) {
      const paths = Array.isArray(path) ? path : [path];
      for (const p of paths) {
        try {
          revalidatePath(p);
        } catch {}
      }
    }
  } catch (err) {
    console.warn("Revalidation warning:", err);
  }
}

