import { NextResponse } from "next/server";
import { revalidateCmsPath } from "@/lib/cms-cache";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { getAdminClient } from "@/lib/supabase/admin";
import type { DbRoom } from "@/types/database";

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

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
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

    const { data, error } = await (adminClient.from("rooms") as any)
      .select("*")
      .order("order_rank", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      if (
        error.code === "PGRST205" ||
        error.message?.includes("does not exist") ||
        error.message?.includes("schema cache")
      ) {
        return NextResponse.json({
          tableMissing: true,
          rooms: [],
          message:
            "The rooms table is not installed in the Supabase database. Please run the SQL migration.",
        });
      }

      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      tableMissing: false,
      rooms: data || [],
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to load rooms.";
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

    // Required fields check
    const name = String(body.name || "").trim();
    if (!name) {
      return NextResponse.json(
        { error: "Room name is required." },
        { status: 400 }
      );
    }

    const slug = slugify(body.slug?.trim() || name);
    if (!slug) {
      return NextResponse.json(
        { error: "Room slug could not be determined." },
        { status: 400 }
      );
    }

    const cover_image = String(body.cover_image || "").trim();
    if (!cover_image) {
      return NextResponse.json(
        { error: "A cover image URL or uploaded file is required." },
        { status: 400 }
      );
    }

    // Check slug collision
    const { data: existing } = await (adminClient.from("rooms") as any)
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: `A room with slug '${slug}' already exists. Please choose another name or slug.` },
        { status: 400 }
      );
    }

    const newRoom: Partial<DbRoom> = {
      slug,
      name,
      description: String(body.description || "").trim(),
      full_description: String(body.full_description || body.description || "").trim(),
      price: Number(body.price) || 0,
      guests: Number(body.guests) || 2,
      size: Number(body.size) || 30,
      bed: String(body.bed || "1 King Bed").trim(),
      cover_image,
      cover_image_path: body.cover_image_path || null,
      gallery_images: Array.isArray(body.gallery_images)
        ? body.gallery_images.filter(Boolean)
        : [],
      gallery_image_paths: Array.isArray(body.gallery_image_paths)
        ? body.gallery_image_paths.filter(Boolean)
        : [],
      amenities: Array.isArray(body.amenities)
        ? body.amenities.filter(Boolean)
        : [],
      is_published: body.is_published !== false,
      is_featured: Boolean(body.is_featured),
      order_rank: Number(body.order_rank) || 0,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await (adminClient.from("rooms") as any)
      .insert(newRoom)
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
              "The rooms table is not installed in the Supabase database. Please run the SQL migration in Supabase SQL Editor.",
          },
          { status: 400 }
        );
      }

      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    revalidateCmsPath({ tag: ["rooms", "home-data"], path: ["/", "/rooms"] });

    return NextResponse.json({
      success: true,
      room: data,
      message: `Room '${name}' created successfully!`,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to create room.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
