import { NextResponse } from "next/server";
import { revalidateCmsPath } from "@/lib/cms-cache";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { DEFAULT_AUTH_PAGES_SETTINGS } from "@/lib/auth-pages-settings";

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

    const payload = {
      ...DEFAULT_AUTH_PAGES_SETTINGS,
      id: "default",
      updated_at: new Date().toISOString(),
      updated_by: admin.id,
    };

    const { data, error } = await (adminClient.from("auth_pages_settings") as any)
      .upsert(payload, { onConflict: "id" })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    revalidateCmsPath({
      tag: "auth-pages-settings",
      path: ["/login", "/register", "/admin"],
    });

    return NextResponse.json({
      success: true,
      settings: data || payload,
      message: "Login & Register pages restored to factory defaults.",
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Reset failed.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

