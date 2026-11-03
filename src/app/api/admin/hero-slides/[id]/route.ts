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

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
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

    // Fetch existing slide
    const { data: existingSlide } = await (adminClient.from("hero_slides") as any)
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (!existingSlide) {
      return NextResponse.json(
        { error: "Banner slide record not found." },
        { status: 404 }
      );
    }

    // Clean up replaced image if different path
    if (
      body.image_path &&
      existingSlide.image_path &&
      body.image_path !== existingSlide.image_path
    ) {
      adminClient.storage
        .from("hotel-assets")
        .remove([existingSlide.image_path])
        .catch((err) => console.warn("Could not delete old banner image:", err));
    }

    const updatePayload: Partial<DbHeroSlide> = {
      title: body.title !== undefined ? String(body.title).trim() : existingSlide.title,
      eyebrow: body.eyebrow !== undefined ? (body.eyebrow ? String(body.eyebrow).trim() : null) : existingSlide.eyebrow,
      description: body.description !== undefined ? String(body.description).trim() : existingSlide.description,
      button_text: body.button_text !== undefined ? String(body.button_text).trim() : existingSlide.button_text,
      button_link: body.button_link !== undefined ? String(body.button_link).trim() : existingSlide.button_link,
      image_url: body.image_url !== undefined ? String(body.image_url).trim() : existingSlide.image_url,
      image_path: body.image_path !== undefined ? body.image_path : existingSlide.image_path,
      is_active: body.is_active !== undefined ? Boolean(body.is_active) : existingSlide.is_active,
      order_rank: body.order_rank !== undefined ? Number(body.order_rank) : existingSlide.order_rank,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await (adminClient.from("hero_slides") as any)
      .update(updatePayload)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    revalidateCmsPath({ tag: ["hero-slides", "home-data"], path: "/" });

    return NextResponse.json({
      success: true,
      slide: data,
      message: `Hero banner '${data.title.split("\n")[0]}' updated successfully!`,
    });
  } catch (err: unknown) {
    const msg =
      err instanceof Error ? err.message : "Failed to update hero banner.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
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

    const { data: slide } = await (adminClient.from("hero_slides") as any)
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (!slide) {
      return NextResponse.json(
        { error: "Hero banner record not found." },
        { status: 404 }
      );
    }

    // Clean up stored image
    if (slide.image_path) {
      adminClient.storage
        .from("hotel-assets")
        .remove([slide.image_path])
        .catch((err) =>
          console.warn("Failed to remove banner image from storage:", err)
        );
    }

    const { error } = await (adminClient.from("hero_slides") as any)
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    revalidateCmsPath({ tag: ["hero-slides", "home-data"], path: "/" });

    return NextResponse.json({
      success: true,
      message: `Hero banner '${slide.title.split("\n")[0]}' was deleted successfully.`,
    });
  } catch (err: unknown) {
    const msg =
      err instanceof Error ? err.message : "Failed to delete hero banner.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
