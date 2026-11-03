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

    // Fetch existing room to detect replaced images for cleanup
    const { data: existingRoom } = await (adminClient.from("rooms") as any)
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (!existingRoom) {
      return NextResponse.json(
        { error: "Room record not found." },
        { status: 404 }
      );
    }

    // Cleanup replaced cover image if different path
    if (
      body.cover_image_path &&
      existingRoom.cover_image_path &&
      body.cover_image_path !== existingRoom.cover_image_path
    ) {
      adminClient.storage
        .from("hotel-assets")
        .remove([existingRoom.cover_image_path])
        .catch((err) => console.warn("Could not delete old cover image:", err));
    }

    // Detect removed gallery image paths to clean up
    if (Array.isArray(body.removed_gallery_paths) && body.removed_gallery_paths.length > 0) {
      adminClient.storage
        .from("hotel-assets")
        .remove(body.removed_gallery_paths)
        .catch((err) => console.warn("Could not delete removed gallery images:", err));
    }

    const updatePayload: Partial<DbRoom> = {
      name: body.name !== undefined ? String(body.name).trim() : existingRoom.name,
      slug: body.slug !== undefined ? slugify(String(body.slug).trim() || existingRoom.slug) : existingRoom.slug,
      description: body.description !== undefined ? String(body.description).trim() : existingRoom.description,
      full_description: body.full_description !== undefined ? String(body.full_description).trim() : existingRoom.full_description,
      price: body.price !== undefined ? Number(body.price) : existingRoom.price,
      guests: body.guests !== undefined ? Number(body.guests) : existingRoom.guests,
      size: body.size !== undefined ? Number(body.size) : existingRoom.size,
      bed: body.bed !== undefined ? String(body.bed).trim() : existingRoom.bed,
      cover_image: body.cover_image !== undefined ? String(body.cover_image).trim() : existingRoom.cover_image,
      cover_image_path: body.cover_image_path !== undefined ? body.cover_image_path : existingRoom.cover_image_path,
      gallery_images: Array.isArray(body.gallery_images) ? body.gallery_images : existingRoom.gallery_images,
      gallery_image_paths: Array.isArray(body.gallery_image_paths) ? body.gallery_image_paths : existingRoom.gallery_image_paths,
      amenities: Array.isArray(body.amenities) ? body.amenities : existingRoom.amenities,
      is_published: body.is_published !== undefined ? Boolean(body.is_published) : existingRoom.is_published,
      is_featured: body.is_featured !== undefined ? Boolean(body.is_featured) : existingRoom.is_featured,
      order_rank: body.order_rank !== undefined ? Number(body.order_rank) : existingRoom.order_rank,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await (adminClient.from("rooms") as any)
      .update(updatePayload)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    revalidateCmsPath({
      tag: ["rooms", "home-data", data?.slug ? `room-${data.slug}` : ""].filter(Boolean),
      path: ["/", "/rooms", data?.slug ? `/rooms/${data.slug}` : ""].filter(Boolean),
    });

    return NextResponse.json({
      success: true,
      room: data,
      message: `Room '${data.name}' updated successfully!`,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to update room.";
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

    // Fetch room to clean up stored images
    const { data: room } = await (adminClient.from("rooms") as any)
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (!room) {
      return NextResponse.json(
        { error: "Room record not found." },
        { status: 404 }
      );
    }

    // Collect all storage paths to purge
    const filesToPurge: string[] = [];
    if (room.cover_image_path) filesToPurge.push(room.cover_image_path);
    if (Array.isArray(room.gallery_image_paths)) {
      filesToPurge.push(...room.gallery_image_paths.filter(Boolean));
    }

    if (filesToPurge.length > 0) {
      adminClient.storage
        .from("hotel-assets")
        .remove(filesToPurge)
        .catch((err) => console.warn("Failed to remove room images from storage:", err));
    }

    const { error } = await (adminClient.from("rooms") as any)
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    revalidateCmsPath({
      tag: ["rooms", "home-data", room?.slug ? `room-${room.slug}` : ""].filter(Boolean),
      path: ["/", "/rooms", room?.slug ? `/rooms/${room.slug}` : ""].filter(Boolean),
    });

    return NextResponse.json({
      success: true,
      message: `Room '${room.name}' and all associated media were successfully removed.`,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to delete room.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
