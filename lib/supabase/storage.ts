"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";

export async function uploadAsset(bucket: string, path: string, file: File) {
  const supabase = getSupabaseBrowserClient();
  return supabase.storage.from(bucket).upload(path, file, {
    upsert: false,
    cacheControl: "3600",
  });
}

export function getPublicAssetUrl(bucket: string, path: string) {
  const supabase = getSupabaseBrowserClient();
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}
