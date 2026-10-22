// Browser Supabase client for the read-only Phase 2 data source.
// Reads VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY from .env (see .env.example).
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) {
    console.error(
      "[supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Paste both into .env at the project root (see .env.example) and restart the dev server.",
    );
    throw new Error("Supabase environment variables are not configured");
  }
  client ??= createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  return client;
}
