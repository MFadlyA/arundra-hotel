import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { getAdminClient } from "@/lib/supabase/admin";

async function getAuthenticatedAdmin() {
  const supabase = await createServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  // Check role from app_metadata
  if (user.app_metadata?.role === "admin") {
    return user;
  }

  // Check role from profiles table
  const { data: profile } = await (supabase.from("profiles") as any)
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role === "admin") {
    return user;
  }

  return null;
}

export async function DELETE(
  _request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const targetId = params.id;

    if (!targetId) {
      return NextResponse.json(
        { error: "Target member ID is required." },
        { status: 400 }
      );
    }

    // 1. Verify caller is an Arundra Admin
    const adminUser = await getAuthenticatedAdmin();
    if (!adminUser) {
      return NextResponse.json(
        { error: "Unauthorized. Admin privileges required." },
        { status: 403 }
      );
    }

    // 2. Prevent self-deletion
    if (targetId === adminUser.id) {
      return NextResponse.json(
        {
          error:
            "Self-deletion prohibited: You cannot delete your own active administrator account.",
        },
        { status: 400 }
      );
    }

    const adminClient = getAdminClient();
    if (!adminClient) {
      return NextResponse.json(
        { error: "Supabase service role key is not configured on the server." },
        { status: 500 }
      );
    }

    // 3. Fetch target user's role from profiles
    const { data: targetProfile } = await (adminClient.from("profiles") as any)
      .select("id, role, email, full_name")
      .eq("id", targetId)
      .maybeSingle();

    // 4. Also inspect auth.users metadata if available
    let targetAuthRole = "";
    try {
      const { data: authUserData } =
        await adminClient.auth.admin.getUserById(targetId);
      targetAuthRole = authUserData?.user?.app_metadata?.role || "";
    } catch {
      // Ignored if user not found in auth
    }

    // 5. ENFORCE PROTECTION: Admin accounts CANNOT be deleted
    if (targetProfile?.role === "admin" || targetAuthRole === "admin") {
      return NextResponse.json(
        {
          error:
            "Action prohibited: Arundra Administrator accounts cannot be deleted.",
        },
        { status: 403 }
      );
    }

    // 6. Delete user's profile record
    const { error: profileDeleteError } = await (
      adminClient.from("profiles") as any
    )
      .delete()
      .eq("id", targetId);

    if (profileDeleteError) {
      return NextResponse.json(
        {
          error: `Failed to delete profile: ${profileDeleteError.message}`,
        },
        { status: 500 }
      );
    }

    // 7. Delete user from auth.users (credential deletion)
    try {
      await adminClient.auth.admin.deleteUser(targetId);
    } catch (authErr) {
      console.warn("Non-fatal: auth user deletion warning:", authErr);
    }

    const identifier =
      targetProfile?.full_name || targetProfile?.email || "The member";

    return NextResponse.json({
      success: true,
      message: `${identifier} account has been permanently deleted.`,
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to delete user account.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

