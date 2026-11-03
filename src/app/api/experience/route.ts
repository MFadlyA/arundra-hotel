import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { DEFAULT_EXPERIENCE_SETTINGS } from "@/lib/experience-settings";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createServerClient();
    const { data, error } = await (supabase.from("experience_settings") as any)
      .select("*")
      .eq("id", "default")
      .maybeSingle();

    if (error) {
      if (
        error.code === "PGRST205" ||
        error.message?.includes("does not exist") ||
        error.message?.includes("schema cache")
      ) {
        return NextResponse.json({
          settings: DEFAULT_EXPERIENCE_SETTINGS,
          tableMissing: true,
        });
      }

      console.warn("Error fetching experience settings from Supabase:", error.message);
      return NextResponse.json({
        settings: DEFAULT_EXPERIENCE_SETTINGS,
        tableMissing: false,
      });
    }

    if (!data) {
      const adminClient = getAdminClient();
      if (adminClient) {
        await (adminClient.from("experience_settings") as any)
          .insert(DEFAULT_EXPERIENCE_SETTINGS)
          .select()
          .maybeSingle();
      }

      return NextResponse.json({
        settings: DEFAULT_EXPERIENCE_SETTINGS,
        tableMissing: false,
      });
    }

    // Merge defaults in case array fields are empty or columns missing
    const mergedSettings = {
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
      recreations_items:
        Array.isArray(data.recreations_items) && data.recreations_items.length > 0
          ? data.recreations_items
          : DEFAULT_EXPERIENCE_SETTINGS.recreations_items,
      facilities_items:
        Array.isArray(data.facilities_items) && data.facilities_items.length > 0
          ? data.facilities_items
          : DEFAULT_EXPERIENCE_SETTINGS.facilities_items,
      nearby_items:
        Array.isArray(data.nearby_items) && data.nearby_items.length > 0
          ? data.nearby_items
          : DEFAULT_EXPERIENCE_SETTINGS.nearby_items,
    };

    return NextResponse.json({
      settings: mergedSettings,
      tableMissing: false,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("Experience GET endpoint exception:", msg);
    return NextResponse.json({
      settings: DEFAULT_EXPERIENCE_SETTINGS,
      tableMissing: false,
    });
  }
}

