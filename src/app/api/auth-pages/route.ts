import { NextResponse } from "next/server";
import { getCachedAuthPagesSettings } from "@/lib/cms-cache";
import { DEFAULT_AUTH_PAGES_SETTINGS } from "@/lib/auth-pages-settings";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const settings = await getCachedAuthPagesSettings();
    return NextResponse.json({ settings });
  } catch (err: unknown) {
    console.error("Public auth pages settings fetch error:", err);
    return NextResponse.json({ settings: DEFAULT_AUTH_PAGES_SETTINGS });
  }
}

