import { createClient } from "@supabase/supabase-js";

/**
 * Creates a Supabase client using the service-role key.
 * This bypasses RLS and should ONLY be used in server-side actions
 * that require admin-level DB access (e.g. creating auth users).
 * Never expose this client or its key to the browser.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set."
    );
  }
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
