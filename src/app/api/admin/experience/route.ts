import { NextResponse } from "next/server";
import { revalidateCmsPath } from "@/lib/cms-cache";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { getAdminClient } from "@/lib/supabase/admin";
import {
  DEFAULT_EXPERIENCE_SETTINGS,
  sanitizeExperiencePayload,
} from "@/lib/experience-settings";
import type { ExperienceSettings } from "@/types/database";

export const dynamic = "force-dynamic";

async function getAuthenticatedAdmin() {
  const supabase = await createServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  // 1. Check tamper-proof app_metadata
  if (user.app_metadata?.role === "admin") {
    return user;
  }

  // 2. Check public.profiles table
  const { data: profile } = await (supabase.from("profiles") as any)
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role === "admin") {
    return user;
  }

  return null;
}

export async function GET() {
  try {
    const adminUser = await getAuthenticatedAdmin();
    if (!adminUser) {
      return NextResponse.json(
        { error: "Unauthorized. Admin privileges required." },
        { status: 403 }
      );
    }

    const adminClient = getAdminClient();
    if (!adminClient) {
      return NextResponse.json(
        { error: "Supabase service role key is not configured on the server." },
        { status: 500 }
      );
    }

    const { data, error } = await (adminClient.from("experience_settings") as any)
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
          message:
            "The experience_settings table does not exist in Supabase yet. Please execute the SQL migration script.",
        });
      }

      throw new Error(error.message);
    }

    if (!data) {
      // Auto-insert default settings if table exists but empty
      await (adminClient.from("experience_settings") as any)
        .insert({
          ...DEFAULT_EXPERIENCE_SETTINGS,
          updated_by: adminUser.id,
        })
        .select()
        .maybeSingle();

      return NextResponse.json({
        settings: DEFAULT_EXPERIENCE_SETTINGS,
        tableMissing: false,
      });
    }

    const mergedSettings: ExperienceSettings = {
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
    const msg =
      err instanceof Error ? err.message : "Failed to load experience settings.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const adminUser = await getAuthenticatedAdmin();
    if (!adminUser) {
      return NextResponse.json(
        { error: "Unauthorized. Admin privileges required." },
        { status: 403 }
      );
    }

    const adminClient = getAdminClient();
    if (!adminClient) {
      return NextResponse.json(
        { error: "Supabase service role key is not configured on the server." },
        { status: 500 }
      );
    }

    const rawPayload = await request.json().catch(() => ({}));
    const sanitized = sanitizeExperiencePayload(rawPayload);

    const updatePayload: Record<string, any> = {
      ...sanitized,
      hero_eyebrow: sanitized.location_badge || sanitized.hero_eyebrow,
      hero_title: sanitized.location_hotel_name || sanitized.hero_title,
      id: "default",
      updated_at: new Date().toISOString(),
      updated_by: adminUser.id,
    };

    let { data, error } = await (adminClient.from("experience_settings") as any)
      .upsert(updatePayload)
      .select("*")
      .single();

    // If native columns location_badge or location_hotel_name are not yet in the DB schema cache
    if (
      error &&
      (error.message?.includes("location_badge") ||
        error.message?.includes("location_hotel_name"))
    ) {
      const fallbackPayload = { ...updatePayload };
      delete fallbackPayload.location_badge;
      delete fallbackPayload.location_hotel_name;

      const retryRes = await (adminClient.from("experience_settings") as any)
        .upsert(fallbackPayload)
        .select("*")
        .single();

      if (!retryRes.error) {
        data = retryRes.data;
        error = null;
      } else {
        error = retryRes.error;
      }
    }

    if (error) {
      if (
        error.code === "PGRST205" ||
        error.message?.includes("does not exist") ||
        error.message?.includes("schema cache")
      ) {
        return NextResponse.json(
          {
            error:
              "The experience_settings table has not been created in Supabase yet. Please run the SQL migration script from the admin panel.",
            tableMissing: true,
          },
          { status: 400 }
        );
      }
      throw new Error(error.message);
    }

    const finalSettings = {
      ...DEFAULT_EXPERIENCE_SETTINGS,
      ...data,
      location_badge:
        data?.location_badge ||
        data?.hero_eyebrow ||
        sanitized.location_badge,
      location_hotel_name:
        data?.location_hotel_name ||
        data?.hero_title ||
        sanitized.location_hotel_name,
    };

    revalidateCmsPath({ tag: "experience-settings", path: "/experience" });

    return NextResponse.json({
      success: true,
      settings: finalSettings,
      message: "Experience page settings updated successfully!",
    });
  } catch (err: unknown) {
    const msg =
      err instanceof Error ? err.message : "Failed to save experience settings.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

