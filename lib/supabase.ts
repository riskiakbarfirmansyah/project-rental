import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase client untuk dipakai di Client Components (browser).
 * Menggunakan anon/publishable key — aman untuk di-expose ke browser.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}
