import { NextResponse } from "next/server";
import { revalidateCmsPath } from "@/lib/cms-cache";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { DEFAULT_HERO_SLIDES } from "@/data/hero-slides";

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

    const defaultPayload = DEFAULT_HERO_SLIDES.map((s, idx) => ({
      title: s.title,
      eyebrow: s.eyebrow || null,
      description: s.description,
      button_text: s.button,
      button_link: s.href,
      image_url: s.image,
      image_path: s.image_path || null,
      is_active: true,
      order_rank: idx + 1,
      updated_at: new Date().toISOString(),
    }));

    const { data, error } = await (adminClient.from("hero_slides") as any)
      .insert(defaultPayload)
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
              "The hero_slides table is not installed in the database. Please run the SQL migration script first.",
          },
          { status: 400 }
        );
      }

      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    revalidateCmsPath({ tag: ["hero-slides", "home-data"], path: "/" });

    return NextResponse.json({
      success: true,
      slides: data,
      message: "Default hero banners successfully seeded into database!",
    });
  } catch (err: unknown) {
    const msg =
      err instanceof Error ? err.message : "Failed to seed hero banners.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
