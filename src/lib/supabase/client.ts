import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

function cleanSupabaseUrl(url: string): string {
  return url.trim().replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "");
}

const cleanedUrl = cleanSupabaseUrl(supabaseUrl);

export function isSupabaseConfigured(): boolean {
  return Boolean(
    cleanedUrl &&
      supabaseAnonKey &&
      !cleanedUrl.includes("your-project-id") &&
      !supabaseAnonKey.includes("your-anon-key") &&
      supabaseAnonKey.trim().length > 20
  );
}

export function createClient() {
  return createBrowserClient<Database>(
    cleanedUrl || "https://placeholder-project.supabase.co",
    supabaseAnonKey || "placeholder-anon-key"
  );
}
