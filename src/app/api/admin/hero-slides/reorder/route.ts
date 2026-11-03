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

    // Mode 1: Swap with adjacent item via direction: "up" | "down"
    if (body.slideId && (body.direction === "up" || body.direction === "down")) {
      const { data: allSlides, error: fetchErr } = await (adminClient.from("hero_slides") as any)
        .select("id, order_rank")
        .order("order_rank", { ascending: true })
        .order("created_at", { ascending: true });

      if (fetchErr) throw new Error(fetchErr.message);

      const currentIndex = allSlides.findIndex((s: any) => s.id === body.slideId);
      if (currentIndex === -1) {
        return NextResponse.json({ error: "Slide not found." }, { status: 404 });
      }

      const targetIndex = body.direction === "up" ? currentIndex - 1 : currentIndex + 1;
      if (targetIndex < 0 || targetIndex >= allSlides.length) {
        return NextResponse.json({
          success: true,
          message: "Already at the boundary.",
        });
      }

      const currentItem = allSlides[currentIndex];
      const targetItem = allSlides[targetIndex];

      // Swap ranks
      const currentRank = currentItem.order_rank;
      const targetRank = targetItem.order_rank;

      const safeRank = currentRank === targetRank ? (body.direction === "up" ? targetRank - 1 : targetRank + 1) : targetRank;

      await (adminClient.from("hero_slides") as any)
        .update({ order_rank: safeRank, updated_at: new Date().toISOString() })
        .eq("id", currentItem.id);

      await (adminClient.from("hero_slides") as any)
        .update({ order_rank: currentRank, updated_at: new Date().toISOString() })
        .eq("id", targetItem.id);

      const { data: updatedSlides } = await (adminClient.from("hero_slides") as any)
        .select("*")
        .order("order_rank", { ascending: true });

      revalidateCmsPath({ tag: ["hero-slides", "home-data"], path: "/" });

      return NextResponse.json({
        success: true,
        slides: updatedSlides || [],
        message: "Banner sequence reordered successfully!",
      });
    }

    // Mode 2: Bulk array update
    if (Array.isArray(body.slides)) {
      for (const item of body.slides) {
        if (item.id && typeof item.order_rank === "number") {
          await (adminClient.from("hero_slides") as any)
            .update({ order_rank: item.order_rank, updated_at: new Date().toISOString() })
            .eq("id", item.id);
        }
      }

      const { data: updatedSlides } = await (adminClient.from("hero_slides") as any)
        .select("*")
        .order("order_rank", { ascending: true });

      revalidateCmsPath({ tag: ["hero-slides", "home-data"], path: "/" });

      return NextResponse.json({
        success: true,
        slides: updatedSlides || [],
        message: "Banner sequence updated successfully!",
      });
    }

    return NextResponse.json(
      { error: "Invalid reorder payload." },
      { status: 400 }
    );
  } catch (err: unknown) {
    const msg =
      err instanceof Error ? err.message : "Failed to reorder hero banners.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
