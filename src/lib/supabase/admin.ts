import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/src/types/database";
import { getSupabaseServerEnv } from "./env";

export function createAdminSupabase() {
  const { url, serviceRoleKey } = getSupabaseServerEnv();

  if (!url || !serviceRoleKey) {
    return null;
  }

  return createClient<Database>(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

