"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/src/types/database";
import { getSupabaseBrowserEnv } from "./env";

export function createClientSupabase() {
  const { url, anonKey } = getSupabaseBrowserEnv();

  if (!url || !anonKey) {
    throw new Error("Supabase browser environment variables are missing.");
  }

  return createBrowserClient<Database>(url, anonKey);
}

