import { NextResponse } from "next/server";
import { revalidateCmsPath } from "@/lib/cms-cache";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { getAdminClient } from "@/lib/supabase/admin";

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

    // Mode 1: Bulk set featured room IDs
    if (Array.isArray(body.featuredRoomIds)) {
      const ids: string[] = body.featuredRoomIds.filter(Boolean);
      if (ids.length > 3) {
        return NextResponse.json(
          { error: "Maximum 3 rooms can be featured on the homepage." },
          { status: 400 }
        );
      }

      // 1. Unfeature all rooms
      await (adminClient.from("rooms") as any)
        .update({ is_featured: false, updated_at: new Date().toISOString() })
        .neq("id", "00000000-0000-0000-0000-000000000000");

      // 2. Feature selected rooms
      if (ids.length > 0) {
        const { error: featErr } = await (adminClient.from("rooms") as any)
          .update({ is_featured: true, updated_at: new Date().toISOString() })
          .in("id", ids);

        if (featErr) throw new Error(featErr.message);
      }

      const { data: updatedRooms } = await (adminClient.from("rooms") as any)
        .select("*")
        .order("order_rank", { ascending: true });

      revalidateCmsPath({ tag: ["rooms", "home-data"], path: ["/", "/rooms"] });

      return NextResponse.json({
        success: true,
        rooms: updatedRooms || [],
        message: "Homepage featured rooms updated successfully!",
      });
    }

    // Mode 2: Toggle single room
    const { roomId, is_featured } = body;
    if (!roomId) {
      return NextResponse.json(
        { error: "roomId is required." },
        { status: 400 }
      );
    }

    if (is_featured) {
      // Check count of currently featured rooms (excluding this one)
      const { data: currentlyFeatured } = await (adminClient.from("rooms") as any)
        .select("id")
        .eq("is_featured", true)
        .neq("id", roomId);

      if (currentlyFeatured && currentlyFeatured.length >= 3) {
        return NextResponse.json(
          {
            error:
              "Maximum 3 rooms can be featured on the homepage. Please unfeature another room first.",
          },
          { status: 400 }
        );
      }
    }

    const { data: updatedRoom, error: updateErr } = await (adminClient.from("rooms") as any)
      .update({
        is_featured: Boolean(is_featured),
        updated_at: new Date().toISOString(),
      })
      .eq("id", roomId)
      .select("*")
      .single();

    if (updateErr) throw new Error(updateErr.message);

    revalidateCmsPath({ tag: ["rooms", "home-data"], path: ["/", "/rooms"] });

    return NextResponse.json({
      success: true,
      room: updatedRoom,
      message: updatedRoom.is_featured
        ? `'${updatedRoom.name}' is now featured on the homepage!`
        : `'${updatedRoom.name}' removed from homepage features.`,
    });
  } catch (err: unknown) {
    const msg =
      err instanceof Error ? err.message : "Failed to update featured rooms.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
