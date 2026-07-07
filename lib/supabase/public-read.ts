import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/** Cookieless Supabase client for public published content (enables ISR). */
export function createPublicReadClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }
  return createSupabaseClient(url, key);
}
