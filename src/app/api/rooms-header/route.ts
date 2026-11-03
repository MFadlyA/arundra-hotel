import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { DEFAULT_ROOMS_HEADER_SETTINGS } from "@/lib/rooms-header-settings";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createServerClient();
    const { data, error } = await (supabase.from("rooms_header_settings") as any)
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
          settings: DEFAULT_ROOMS_HEADER_SETTINGS,
          tableMissing: true,
        });
      }

      console.warn("Error fetching rooms header settings from Supabase:", error.message);
      return NextResponse.json({
        settings: DEFAULT_ROOMS_HEADER_SETTINGS,
        tableMissing: false,
      });
    }

    if (!data) {
      const adminClient = getAdminClient();
      if (adminClient) {
        await (adminClient.from("rooms_header_settings") as any)
          .insert(DEFAULT_ROOMS_HEADER_SETTINGS)
          .select()
          .maybeSingle();
      }

      return NextResponse.json({
        settings: DEFAULT_ROOMS_HEADER_SETTINGS,
        tableMissing: false,
      });
    }

    return NextResponse.json({
      settings: data,
      tableMissing: false,
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error
        ? err.message
        : "Failed to load rooms header settings.";
    console.error("Public rooms header route error:", message);

    return NextResponse.json({
      settings: DEFAULT_ROOMS_HEADER_SETTINGS,
      tableMissing: false,
    });
  }
}

