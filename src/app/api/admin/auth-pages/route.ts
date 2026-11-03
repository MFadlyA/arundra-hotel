import { NextResponse } from "next/server";
import { revalidateCmsPath } from "@/lib/cms-cache";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { getAdminClient } from "@/lib/supabase/admin";
import {
  DEFAULT_AUTH_PAGES_SETTINGS,
  sanitizeAuthPagesPayload,
} from "@/lib/auth-pages-settings";
import type { AuthPagesSettings } from "@/types/database";

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

    const { data, error } = await (adminClient.from("auth_pages_settings") as any)
      .select("*")
      .eq("id", "default")
      .maybeSingle();

    if (error) {
      if (
        error.code === "PGRST205" ||
        error.code === "42P01" ||
        error.message?.includes("does not exist") ||
        error.message?.includes("schema cache")
      ) {
        return NextResponse.json({
          tableMissing: true,
          settings: DEFAULT_AUTH_PAGES_SETTINGS,
          message:
            "The auth_pages_settings table is not created in Supabase yet. Please run the SQL migration in Supabase SQL Editor.",
        });
      }

      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      tableMissing: false,
      settings: data || DEFAULT_AUTH_PAGES_SETTINGS,
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error
        ? err.message
        : "Failed to retrieve auth pages settings.";
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

    const body = await request.json();
    const sanitized = sanitizeAuthPagesPayload(body);

    const payloadToSave = {
      ...sanitized,
      id: "default",
      updated_at: new Date().toISOString(),
      updated_by: adminUser.id,
    };

    const { data, error } = await (adminClient.from("auth_pages_settings") as any)
      .upsert(payloadToSave, { onConflict: "id" })
      .select()
      .single();

    if (error) {
      if (
        error.code === "PGRST205" ||
        error.code === "42P01" ||
        error.message?.includes("does not exist") ||
        error.message?.includes("schema cache")
      ) {
        return NextResponse.json(
          {
            tableMissing: true,
            error:
              "The auth_pages_settings table does not exist in Supabase yet. Please run the migration script first.",
          },
          { status: 404 }
        );
      }

      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Invalidate cached Next.js tags & paths for Login & Register
    revalidateCmsPath({
      tag: "auth-pages-settings",
      path: ["/login", "/register", "/admin"],
    });

    return NextResponse.json({
      success: true,
      settings: (data as AuthPagesSettings) || payloadToSave,
      message: "Login & Register pages settings saved and published successfully.",
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error
        ? err.message
        : "Failed to update auth pages settings.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

