import { NextResponse } from "next/server";
import { revalidateCmsPath } from "@/lib/cms-cache";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { DEFAULT_ROOMS } from "@/data/rooms";

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

export async function POST() {
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

    // Prepare default rows
    const defaultPayload = DEFAULT_ROOMS.map((r, idx) => ({
      slug: r.slug,
      name: r.name,
      description: r.description,
      full_description: r.fullDescription,
      price: r.price,
      guests: r.guests,
      size: r.size,
      bed: r.bed,
      cover_image: r.images[0],
      gallery_images: r.images.slice(1),
      amenities: r.amenities,
      is_published: true,
      is_featured: true,
      order_rank: idx + 1,
      updated_at: new Date().toISOString(),
    }));

    const { data, error } = await (adminClient.from("rooms") as any)
      .upsert(defaultPayload, { onConflict: "slug" })
      .select("*");

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
              "The rooms table is not installed in the Supabase database. Please run the SQL migration script first.",
          },
          { status: 400 }
        );
      }

      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    revalidateCmsPath({ tag: ["rooms", "home-data"], path: ["/", "/rooms"] });

    return NextResponse.json({
      success: true,
      rooms: data,
      message: "Default rooms successfully seeded into database!",
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to seed rooms.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
