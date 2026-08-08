import { createClient } from "@supabase/supabase-js";

/**
 * Supabase Admin client untuk dipakai di Server (API Routes, Server Actions).
 * Menggunakan service_role key — JANGAN pernah di-expose ke browser.
 * Dipakai untuk: upload file ke Storage, operasi admin, bypass RLS.
 */
export function createServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
