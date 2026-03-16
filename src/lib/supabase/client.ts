import { createBrowserClient } from "@supabase/ssr";
import { env } from "@/lib/env";

export function supabaseBrowser() {
  if (!env.supabaseUrl || !env.supabaseAnonKey) {
    throw new Error("Supabase environment variables are not configured.");
  }

  return createBrowserClient(env.supabaseUrl, env.supabaseAnonKey);
}
