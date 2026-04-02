import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/database.types";

function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error("Missing Supabase environment variables.");
  }

  return { url, anonKey };
}

export function createSupabaseClient() {
  const { url, anonKey } = getSupabaseEnv();
  return createClient<Database>(url, anonKey);
}
