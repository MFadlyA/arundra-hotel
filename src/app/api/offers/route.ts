import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { DEFAULT_OFFERS_SETTINGS } from "@/lib/offers-settings";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createServerClient();
    const { data, error } = await (supabase.from("offers_settings") as any)
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
          settings: DEFAULT_OFFERS_SETTINGS,
          tableMissing: true,
        });
      }

      console.warn("Error fetching offers settings from Supabase:", error.message);
      return NextResponse.json({
        settings: DEFAULT_OFFERS_SETTINGS,
        tableMissing: false,
      });
    }

    if (!data) {
      const adminClient = getAdminClient();
      if (adminClient) {
        await (adminClient.from("offers_settings") as any)
          .insert(DEFAULT_OFFERS_SETTINGS)
          .select()
          .maybeSingle();
      }

      return NextResponse.json({
        settings: DEFAULT_OFFERS_SETTINGS,
        tableMissing: false,
      });
    }

    const mergedSettings = {
      ...DEFAULT_OFFERS_SETTINGS,
      ...data,
      guarantee_eyebrow: data.guarantee_eyebrow || DEFAULT_OFFERS_SETTINGS.guarantee_eyebrow,
      guarantee_title: data.guarantee_title || DEFAULT_OFFERS_SETTINGS.guarantee_title,
      guarantee_description: data.guarantee_description || DEFAULT_OFFERS_SETTINGS.guarantee_description,
      guarantee_items:
        Array.isArray(data.guarantee_items) && data.guarantee_items.length > 0
          ? data.guarantee_items
          : DEFAULT_OFFERS_SETTINGS.guarantee_items,
      offers_items:
        Array.isArray(data.offers_items) && data.offers_items.length > 0
          ? data.offers_items
          : DEFAULT_OFFERS_SETTINGS.offers_items,
    };

    return NextResponse.json({
      settings: mergedSettings,
      tableMissing: false,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("Offers GET endpoint exception:", msg);
    return NextResponse.json({
      settings: DEFAULT_OFFERS_SETTINGS,
      tableMissing: false,
    });
  }
}

