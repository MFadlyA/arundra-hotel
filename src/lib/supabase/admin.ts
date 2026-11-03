import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * Server-only Supabase Admin Client using the SERVICE_ROLE key.
 * This client bypasses Row Level Security (RLS) and is strictly used
 * on the backend for trusted operations like creating verified admin users.
 * NEVER expose this or import it into client-side components.
 */
export function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
