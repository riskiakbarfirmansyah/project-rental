import { createClient } from "@supabase/supabase-js";

/**
 * Supabase Admin client untuk dipakai di Server (API Routes, Server Actions).
 * Menggunakan service_role key — JANGAN pernah di-expose ke browser.
 * Dipakai untuk: upload file ke Storage, operasi admin, bypass RLS.
 */
export function createServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error(
      "Missing env: NEXT_PUBLIC_SUPABASE_URL. Pastikan sudah di-set di Vercel Dashboard > Settings > Environment Variables."
    );
  }
  if (!serviceRoleKey) {
    throw new Error(
      "Missing env: SUPABASE_SERVICE_ROLE_KEY. Pastikan sudah di-set di Vercel Dashboard > Settings > Environment Variables."
    );
  }

  return createClient(supabaseUrl, serviceRoleKey);
}
