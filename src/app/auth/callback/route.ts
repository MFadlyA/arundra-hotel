import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;

  if (code) {
    try {
      const supabase = await createClient();
      const { data } = await supabase.auth.exchangeCodeForSession(code);

      // If user has phone in metadata, guarantee it is saved to profiles
      if (data?.user) {
        const metaPhone =
          data.user.user_metadata?.phone ||
          data.user.user_metadata?.phone_number;

        if (metaPhone) {
          await (supabase.from("profiles") as any)
            .update({ phone: String(metaPhone).trim() })
            .eq("id", data.user.id);
        }
      }
    } catch (err) {
      console.error("Error exchanging code for session:", err);
    }
  }

  // Redirect user to the login page with verification success flag
  return NextResponse.redirect(`${origin}/login?verified=true`);
}
