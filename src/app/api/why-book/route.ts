import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { DEFAULT_WHY_BOOK_SETTINGS } from "@/lib/why-book-settings";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createServerClient();
    const { data, error } = await (supabase.from("why_book_settings") as any)
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
          settings: DEFAULT_WHY_BOOK_SETTINGS,
          tableMissing: true,
        });
      }

      console.warn("Error fetching why book settings from Supabase:", error.message);
      return NextResponse.json({
        settings: DEFAULT_WHY_BOOK_SETTINGS,
        tableMissing: false,
      });
    }

    if (!data) {
      // If table exists but row is missing, try to auto-seed using admin client
      const adminClient = getAdminClient();
      if (adminClient) {
        await (adminClient.from("why_book_settings") as any)
          .insert(DEFAULT_WHY_BOOK_SETTINGS)
          .select()
          .maybeSingle();
      }

      return NextResponse.json({
        settings: DEFAULT_WHY_BOOK_SETTINGS,
        tableMissing: false,
      });
    }

    return NextResponse.json({
      settings: data,
      tableMissing: false,
    });
  } catch (err: unknown) {
    console.error("Failed to load why book settings:", err);
    return NextResponse.json({
      settings: DEFAULT_WHY_BOOK_SETTINGS,
      tableMissing: false,
    });
  }
}
