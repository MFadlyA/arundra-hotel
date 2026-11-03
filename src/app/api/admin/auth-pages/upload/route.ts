import { NextResponse } from "next/server";
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

function sanitizeFileName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9.]/g, "-")
    .replace(/-+/g, "-");
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

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const subfolder = (formData.get("folder") as string) || "auth";

    if (!file) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }

    const validMimes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/avif",
    ];
    if (!validMimes.includes(file.type)) {
      return NextResponse.json(
        {
          error:
            "Invalid file type. Only JPG, PNG, WEBP, and AVIF images are permitted.",
        },
        { status: 400 }
      );
    }

    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "Image file exceeds the 5MB size limit." },
        { status: 400 }
      );
    }

    const fileExt = file.name.split(".").pop() || "jpg";
    const baseName = sanitizeFileName(
      file.name.substring(0, file.name.lastIndexOf(".")) || "auth-hero"
    );
    const uniqueId =
      Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
    const storagePath = `${subfolder}/${baseName}-${uniqueId}.${fileExt}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await adminClient.storage
      .from("hotel-assets")
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      return NextResponse.json(
        { error: `Storage upload failed: ${uploadError.message}` },
        { status: 500 }
      );
    }

    const {
      data: { publicUrl },
    } = adminClient.storage.from("hotel-assets").getPublicUrl(storagePath);

    return NextResponse.json({
      success: true,
      publicUrl,
      storagePath,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Upload failed.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

