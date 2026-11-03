import { NextResponse } from "next/server";
import { revalidateCmsPath } from "@/lib/cms-cache";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { DEFAULT_EXPERIENCE_SETTINGS } from "@/lib/experience-settings";

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

    const resetPayload = {
      ...DEFAULT_EXPERIENCE_SETTINGS,
      id: "default",
      updated_at: new Date().toISOString(),
      updated_by: admin.id,
    };

    const { data, error } = await (adminClient.from("experience_settings") as any)
      .upsert(resetPayload)
      .select("*")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    revalidateCmsPath({ tag: "experience-settings", path: "/experience" });

    return NextResponse.json({
      success: true,
      settings: data,
      message: "Experience page settings successfully reset to hotel defaults!",
    });
  } catch (err: unknown) {
    const msg =
      err instanceof Error ? err.message : "Failed to reset experience settings.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

