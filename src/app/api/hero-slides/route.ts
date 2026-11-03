import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { DEFAULT_HERO_SLIDES, transformDbHeroSlideToSlide } from "@/data/hero-slides";
import type { DbHeroSlide } from "@/types/database";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createServerClient();
    const { data, error } = await (supabase.from("hero_slides") as any)
      .select("*")
      .eq("is_active", true)
      .order("order_rank", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) {
      if (
        error.code === "PGRST205" ||
        error.message?.includes("does not exist") ||
        error.message?.includes("schema cache")
      ) {
        return NextResponse.json({
          slides: DEFAULT_HERO_SLIDES,
          tableMissing: true,
        });
      }

      console.warn("Error fetching hero slides from Supabase:", error.message);
      return NextResponse.json({
        slides: DEFAULT_HERO_SLIDES,
        tableMissing: false,
      });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({
        slides: DEFAULT_HERO_SLIDES,
        tableMissing: false,
      });
    }

    const transformed = (data as DbHeroSlide[]).map(transformDbHeroSlideToSlide);
    return NextResponse.json({
      slides: transformed,
      tableMissing: false,
    });
  } catch (err: unknown) {
    console.error("Failed to load hero slides:", err);
    return NextResponse.json({
      slides: DEFAULT_HERO_SLIDES,
      tableMissing: false,
    });
  }
}
