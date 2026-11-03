import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { DEFAULT_ROOMS, transformDbRoomToRoom } from "@/data/rooms";
import type { DbRoom } from "@/types/database";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;
    const supabase = await createServerClient();

    const { data, error } = await (supabase.from("rooms") as any)
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (error || !data) {
      const fallback = DEFAULT_ROOMS.find((r) => r.slug === slug);
      if (fallback) {
        return NextResponse.json({ room: fallback, fromFallback: true });
      }
      return NextResponse.json({ error: "Room not found." }, { status: 404 });
    }

    return NextResponse.json({
      room: transformDbRoomToRoom(data as DbRoom),
      fromFallback: false,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to load room.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
