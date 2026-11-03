import { NextResponse } from "next/server";
import { revalidateCmsPath } from "@/lib/cms-cache";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { getAdminClient } from "@/lib/supabase/admin";
import {
  DEFAULT_HOSPITALITY_SETTINGS,
  sanitizeHospitalityPayload,
} from "@/lib/hospitality-settings";
import type { HospitalitySettings } from "@/types/database";

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

    const { data, error } = await (adminClient.from("hospitality_settings") as any)
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
          tableMissing: true,
          settings: DEFAULT_HOSPITALITY_SETTINGS,
          message:
            "The hospitality_settings table is not installed in the Supabase database. Please run the SQL migration in Supabase SQL Editor.",
        });
      }

      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      tableMissing: false,
      settings: data || DEFAULT_HOSPITALITY_SETTINGS,
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to retrieve hospitality settings.";
    return NextResponse.json({ error: message }, { status: 500 });
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

    const body = await request.json().catch(() => ({}));

    // Handle Reset Action
    if (body.action === "reset") {
      const resetPayload = {
        ...DEFAULT_HOSPITALITY_SETTINGS,
        updated_at: new Date().toISOString(),
        updated_by: adminUser.id,
      };

      const { data, error } = await (adminClient.from("hospitality_settings") as any)
        .upsert(resetPayload, { onConflict: "id" })
        .select()
        .single();

      if (error) {
        if (
          error.code === "PGRST205" ||
          error.message?.includes("does not exist") ||
          error.message?.includes("schema cache")
        ) {
          return NextResponse.json({
            tableMissing: true,
            settings: DEFAULT_HOSPITALITY_SETTINGS,
            error: "The hospitality_settings table does not exist in Supabase.",
          });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      revalidateCmsPath({ tag: ["hospitality-settings", "home-data"], path: "/" });

      return NextResponse.json({
        success: true,
        message: "Hospitality section settings have been reset to Arundra defaults.",
        settings: data,
      });
    }

    // Sanitize normal update payload
    const sanitized = sanitizeHospitalityPayload(body);
    const updatePayload: Partial<HospitalitySettings> = {
      ...sanitized,
      id: "default",
      updated_at: new Date().toISOString(),
      updated_by: adminUser.id,
    };

    const { data, error } = await (adminClient.from("hospitality_settings") as any)
      .upsert(updatePayload, { onConflict: "id" })
      .select()
      .single();

    if (error) {
      if (
        error.code === "PGRST205" ||
        error.message?.includes("does not exist") ||
        error.message?.includes("schema cache")
      ) {
        return NextResponse.json({
          tableMissing: true,
          settings: DEFAULT_HOSPITALITY_SETTINGS,
          error:
            "The hospitality_settings table does not exist in your Supabase database. Please run the SQL migration script.",
        });
      }

      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    revalidateCmsPath({ tag: ["hospitality-settings", "home-data"], path: "/" });

    return NextResponse.json({
      success: true,
      message: "Hospitality section settings saved successfully.",
      settings: data,
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to update hospitality settings.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
