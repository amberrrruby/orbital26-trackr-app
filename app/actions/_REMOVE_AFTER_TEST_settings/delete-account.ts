"use server";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import { requireUser } from "@/lib/auth";
import { DeleteAccountError, Result } from "@/lib/types";
import { redirect } from "next/navigation";

const supabaseAdmin = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
);

export async function deleteAccount(): Promise<
  Result<void, DeleteAccountError>
> {
  const res = await requireUser();
  if (!res.ok) {
    return res;
  }
  const { value: userId } = res;

  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

  if (error) {
    return { ok: false, error: { type: "FAILURE" } };
  }

  redirect(`/`);
}
