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
    const folder = (formData.get("folder") as string) || "rooms";

    if (!file) {
      return NextResponse.json(
        { error: "No image file provided." },
        { status: 400 }
      );
    }

    // Allowed image types
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/avif",
      "image/gif",
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error:
            "Invalid file format. Please upload JPG, PNG, WEBP, AVIF, or GIF.",
        },
        { status: 400 }
      );
    }

    // Limit size: 10MB
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File size exceeds the 10MB limit." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const sanitizedName = sanitizeFileName(file.name);
    const storagePath = `${folder}/${Date.now()}-${sanitizedName}`;

    // Upload to 'hotel-assets' bucket
    const { data: uploadData, error: uploadError } = await adminClient.storage
      .from("hotel-assets")
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return NextResponse.json(
        { error: `Upload failed: ${uploadError.message}` },
        { status: 500 }
      );
    }

    // Retrieve public URL
    const {
      data: { publicUrl },
    } = adminClient.storage.from("hotel-assets").getPublicUrl(storagePath);

    return NextResponse.json({
      success: true,
      publicUrl,
      storagePath,
      name: file.name,
      size: file.size,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Image upload failed.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
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
    const storagePath = body.storagePath as string | undefined;

    if (!storagePath) {
      return NextResponse.json(
        { error: "storagePath is required." },
        { status: 400 }
      );
    }

    const { error } = await adminClient.storage
      .from("hotel-assets")
      .remove([storagePath]);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Image successfully removed from storage.",
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to delete image.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
