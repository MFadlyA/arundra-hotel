import { NextResponse } from "next/server";
import { revalidateCmsPath } from "@/lib/cms-cache";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { getAdminClient } from "@/lib/supabase/admin";
import {
  DEFAULT_OFFERS_SETTINGS,
  sanitizeOffersPayload,
} from "@/lib/offers-settings";
import type { OffersSettings } from "@/types/database";

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

    const { data, error } = await (adminClient.from("offers_settings") as any)
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
          message:
            "The offers_settings table does not exist in Supabase yet. Please execute the SQL migration script.",
        });
      }

      throw new Error(error.message);
    }

    if (!data) {
      // Auto-insert default settings if table exists but empty
      await (adminClient.from("offers_settings") as any)
        .insert({
          ...DEFAULT_OFFERS_SETTINGS,
          updated_by: adminUser.id,
        })
        .select()
        .maybeSingle();

      return NextResponse.json({
        settings: DEFAULT_OFFERS_SETTINGS,
        tableMissing: false,
      });
    }

    const mergedSettings: OffersSettings = {
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
    const msg =
      err instanceof Error ? err.message : "Failed to load offers settings.";
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
    const sanitized = sanitizeOffersPayload(rawPayload);

    const updatePayload: Record<string, any> = {
      ...sanitized,
      id: "default",
      updated_at: new Date().toISOString(),
      updated_by: adminUser.id,
    };

    let { data, error } = await (adminClient.from("offers_settings") as any)
      .upsert(updatePayload)
      .select("*")
      .single();

    if (
      error &&
      (error.message?.includes("guarantee") ||
        error.message?.includes("column"))
    ) {
      const fallbackPayload = { ...updatePayload };
      delete fallbackPayload.guarantee_eyebrow;
      delete fallbackPayload.guarantee_title;
      delete fallbackPayload.guarantee_description;
      delete fallbackPayload.guarantee_items;

      const retryRes = await (adminClient.from("offers_settings") as any)
        .upsert(fallbackPayload)
        .select("*")
        .single();

      if (!retryRes.error) {
        data = retryRes.data;
        error = null;
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
              "The offers_settings table has not been created in Supabase yet. Please run the SQL migration script from the admin panel.",
            tableMissing: true,
          },
          { status: 400 }
        );
      }
      throw new Error(error.message);
    }

    const finalSettings = {
      ...DEFAULT_OFFERS_SETTINGS,
      ...data,
      guarantee_eyebrow:
        data?.guarantee_eyebrow || sanitized.guarantee_eyebrow || DEFAULT_OFFERS_SETTINGS.guarantee_eyebrow,
      guarantee_title:
        data?.guarantee_title || sanitized.guarantee_title || DEFAULT_OFFERS_SETTINGS.guarantee_title,
      guarantee_description:
        data?.guarantee_description || sanitized.guarantee_description || DEFAULT_OFFERS_SETTINGS.guarantee_description,
      guarantee_items:
        Array.isArray(data?.guarantee_items) && data.guarantee_items.length > 0
          ? data.guarantee_items
          : sanitized.guarantee_items,
    };

    revalidateCmsPath({ tag: "offers-settings", path: "/offers" });

    return NextResponse.json({
      success: true,
      settings: finalSettings,
      message: "Offers page settings updated successfully!",
    });
  } catch (err: unknown) {
    const msg =
      err instanceof Error ? err.message : "Failed to save offers settings.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

