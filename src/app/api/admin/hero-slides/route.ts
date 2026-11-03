import { NextResponse } from "next/server";
import { revalidateCmsPath } from "@/lib/cms-cache";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { getAdminClient } from "@/lib/supabase/admin";
import type { DbHeroSlide } from "@/types/database";

export const dynamic = "force-dynamic";

async function getAuthenticatedAdmin() {
  const supabase = await createServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;

  if (user.app_metadata?.role === "admin") return user;

  const { data: profile } = await (supabase.from("profiles") as any)
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role === "admin") return user;

  return null;
}

export async function GET() {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json(
        { error: "Unauthorized. Admin privileges required." },
        { status: 403 }
      );
    }

    const adminClient = getAdminClient();
    if (!adminClient) {
      return NextResponse.json(
        { error: "Supabase service role key is not configured." },
        { status: 500 }
      );
    }

    const { data, error } = await (adminClient.from("hero_slides") as any)
      .select("*")
      .order("order_rank", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) {
      if (
        error.code === "PGRST205" ||
        error.message?.includes("does not exist") ||
        error.message?.includes("schema cache")
      ) {
        return NextResponse.json({
          tableMissing: true,
          slides: [],
          message: "The hero_slides table is not installed in Supabase.",
        });
      }

      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      tableMissing: false,
      slides: data || [],
    });
  } catch (err: unknown) {
    const msg =
      err instanceof Error ? err.message : "Failed to load hero slides.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json(
        { error: "Unauthorized. Admin privileges required." },
        { status: 403 }
      );
    }

    const adminClient = getAdminClient();
    if (!adminClient) {
      return NextResponse.json(
        { error: "Supabase service role key is not configured." },
        { status: 500 }
      );
    }

    const body = await request.json().catch(() => ({}));

    const title = String(body.title || "").trim();
    if (!title) {
      return NextResponse.json(
        { error: "Banner promo title is required." },
        { status: 400 }
      );
    }

    const image_url = String(body.image_url || "").trim();
    if (!image_url) {
      return NextResponse.json(
        { error: "A banner image URL or uploaded photo is required." },
        { status: 400 }
      );
    }

    const description = String(body.description || "").trim();
    const eyebrow = body.eyebrow ? String(body.eyebrow).trim() : null;
    const button_text = body.button_text
      ? String(body.button_text).trim()
      : "Explore Our Rooms";
    const button_link = body.button_link
      ? String(body.button_link).trim()
      : "#rooms";

    // Auto-compute order rank if not provided
    let order_rank = Number(body.order_rank);
    if (isNaN(order_rank) || order_rank <= 0) {
      const { data: countData } = await (adminClient.from("hero_slides") as any)
        .select("order_rank")
        .order("order_rank", { ascending: false })
        .limit(1);

      order_rank =
        countData && countData.length > 0
          ? Number(countData[0].order_rank || 0) + 1
          : 1;
    }

    const newSlide: Partial<DbHeroSlide> = {
      title,
      eyebrow,
      description,
      button_text,
      button_link,
      image_url,
      image_path: body.image_path || null,
      is_active: body.is_active !== false,
      order_rank,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await (adminClient.from("hero_slides") as any)
      .insert(newSlide)
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
              "The hero_slides table is not installed in the Supabase database. Please run the SQL migration in Supabase SQL Editor.",
          },
          { status: 400 }
        );
      }

      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    revalidateCmsPath({ tag: ["hero-slides", "home-data"], path: "/" });

    return NextResponse.json({
      success: true,
      slide: data,
      message: `Hero banner '${title.split("\n")[0]}' created successfully!`,
    });
  } catch (err: unknown) {
    const msg =
      err instanceof Error ? err.message : "Failed to create hero banner.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
