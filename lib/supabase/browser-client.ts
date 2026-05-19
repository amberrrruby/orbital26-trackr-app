"use client";
import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { env } from "../env";

type SupabaseSchema = Record<string, never>;

let client: SupabaseClient<SupabaseSchema> | null = null;

export function getSupabaseBrowserClient(): SupabaseClient<SupabaseSchema> {
  if (client) {
    return client;
  }

  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
  const supabasePDK = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

  client = createBrowserClient<SupabaseSchema>(supabaseUrl, supabasePDK);
  return client;
}
