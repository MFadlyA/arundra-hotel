import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { DEFAULT_ROOMS, transformDbRoomToRoom } from "@/data/rooms";
import type { DbRoom } from "@/types/database";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createServerClient();
    const { data, error } = await (supabase.from("rooms") as any)
      .select("*")
      .eq("is_published", true)
      .order("order_rank", { ascending: true });

    if (error) {
      if (
        error.code === "PGRST205" ||
        error.message?.includes("does not exist") ||
        error.message?.includes("schema cache")
      ) {
        return NextResponse.json({
          rooms: DEFAULT_ROOMS,
          tableMissing: true,
        });
      }

      console.warn("Error fetching rooms from Supabase:", error.message);
      return NextResponse.json({
        rooms: DEFAULT_ROOMS,
        tableMissing: false,
      });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({
        rooms: DEFAULT_ROOMS,
        tableMissing: false,
      });
    }

    const transformed = (data as DbRoom[]).map(transformDbRoomToRoom);
    return NextResponse.json({
      rooms: transformed,
      tableMissing: false,
    });
  } catch (err: unknown) {
    console.error("Failed to load rooms:", err);
    return NextResponse.json({
      rooms: DEFAULT_ROOMS,
      tableMissing: false,
    });
  }
}
