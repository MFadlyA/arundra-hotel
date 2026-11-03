import { NextResponse } from "next/server";
import { revalidateCmsPath } from "@/lib/cms-cache";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { getAdminClient } from "@/lib/supabase/admin";
import {
  DEFAULT_FOOTER_SETTINGS,
  sanitizeFooterPayload,
} from "@/lib/footer-settings";
import type { FooterSettings } from "@/types/database";

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

    const { data, error } = await (adminClient.from("footer_settings") as any)
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
          settings: DEFAULT_FOOTER_SETTINGS,
          message:
            "The footer_settings table is not installed in the Supabase database. Please run the SQL migration in Supabase SQL Editor.",
        });
      }

      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    revalidateCmsPath({ tag: "footer-settings", path: "/" });

    return NextResponse.json({
      tableMissing: false,
      settings: data || DEFAULT_FOOTER_SETTINGS,
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to retrieve footer settings.";
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
    const sanitized = sanitizeFooterPayload(body);

    const updatePayload: Partial<FooterSettings> = {
      ...sanitized,
      id: "default",
      updated_at: new Date().toISOString(),
      updated_by: adminUser.id,
    };

    // Upsert into footer_settings table
    const { data, error } = await (adminClient.from("footer_settings") as any)
      .upsert(updatePayload, { onConflict: "id" })
      .select("*")
      .single();

    if (error) {
      if (
        error.code === "PGRST205" ||
        error.message?.includes("does not exist") ||
        error.message?.includes("schema cache")
      ) {
        return NextResponse.json(
          {
            tableMissing: true,
            error:
              "The footer_settings table is not installed in the Supabase database. Please execute the migration SQL in Supabase SQL Editor.",
          },
          { status: 400 }
        );
      }

      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    revalidateCmsPath({ tag: "footer-settings", path: "/" });

    return NextResponse.json({
      success: true,
      settings: data,
      message: "Hotel footer and contact details updated successfully!",
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to update footer settings.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
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

    if (body.action === "reset") {
      const resetPayload: Partial<FooterSettings> = {
        ...DEFAULT_FOOTER_SETTINGS,
        id: "default",
        updated_at: new Date().toISOString(),
        updated_by: adminUser.id,
      };

      const { data, error } = await (adminClient.from("footer_settings") as any)
        .upsert(resetPayload, { onConflict: "id" })
        .select("*")
        .single();

      if (error) {
        if (
          error.code === "PGRST205" ||
          error.message?.includes("does not exist") ||
          error.message?.includes("schema cache")
        ) {
          return NextResponse.json(
            {
              tableMissing: true,
              error:
                "The footer_settings table is not installed in the Supabase database. Please execute the migration SQL in Supabase SQL Editor.",
            },
            { status: 400 }
          );
        }

        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        settings: data,
        message: "Footer settings have been reset to original Arundra defaults.",
      });
    }

    return NextResponse.json({ error: "Invalid action requested." }, { status: 400 });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to execute footer action.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
