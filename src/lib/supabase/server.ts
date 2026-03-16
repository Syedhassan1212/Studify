import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { env } from "@/lib/env";

export async function supabaseServer() {
  if (!env.supabaseUrl || !env.supabaseAnonKey) {
    throw new Error("Supabase environment variables are not configured.");
  }

  const cookieStore = await cookies();

  return createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll() {
        if (typeof (cookieStore as { getAll?: () => { name: string; value: string }[] }).getAll === "function") {
          return cookieStore.getAll();
        }
        if (typeof (cookieStore as { [Symbol.iterator]?: () => IterableIterator<[string, { value?: string }]> })[
          Symbol.iterator
        ] === "function") {
          return Array.from(cookieStore as Iterable<[string, { value?: string }]>).map(
            ([name, value]) => ({ name, value: value?.value ?? String(value) }),
          );
        }
        return [];
      },
      setAll(cookiesToSet) {
        if (typeof (cookieStore as { set?: (name: string, value: string, options?: unknown) => void }).set !== "function") {
          return;
        }
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // In RSC/SSR contexts cookies may be read-only; ignore set attempts.
        }
      },
    },
  });
}
