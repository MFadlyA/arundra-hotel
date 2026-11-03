import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseUrl = rawUrl.trim().replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "");
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  if (
    !supabaseUrl ||
    !supabaseAnonKey ||
    supabaseUrl.includes("your-project-id") ||
    supabaseAnonKey.includes("your-anon-key") ||
    supabaseAnonKey.trim().length < 20
  ) {
    return supabaseResponse;
  }

  const supabase = createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh auth token and get verified user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Enforce server-side route protection for /admin portal
  if (request.nextUrl.pathname.startsWith("/admin")) {
    if (!user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", "/admin");
      return NextResponse.redirect(loginUrl);
    }

    // Verify admin role via tamper-proof app_metadata or profiles table
    const appRole = (user.app_metadata?.role as string) || "";
    if (appRole !== "admin") {
      const { data: profile } = (await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()) as { data: { role?: string } | null };

      if (profile?.role !== "admin") {
        const homeUrl = new URL("/", request.url);
        homeUrl.searchParams.set("error", "unauthorized");
        return NextResponse.redirect(homeUrl);
      }
    }
  }

  return supabaseResponse;
}
