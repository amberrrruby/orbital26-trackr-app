// This is the bridge between the app server and the auth backend.
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { env } from "../env";

export async function createSupabaseServerClient() {
  const supabaseURL = env.NEXT_PUBLIC_SUPABASE_URL;
  const supabasePDK = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;
  const cookieStore = await cookies();

  return createServerClient(supabaseURL, supabasePDK, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          console.warn(
            "setAll called from a Server Component — cookies cannot be set. Ensure middleware is refreshing the session.",
          );
        }
      },
    },
  });
}
