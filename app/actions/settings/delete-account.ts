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

export async function deleteAccountAction(): Promise<
  Result<void, DeleteAccountError>
> {
  const res = await requireUser();
  if (!res.ok) {
    return res;
  }
  const { value: userId } = res;

  // Replaced with DB cascade on delete
  // await prisma.user.delete({ where: { id: userId } });
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

  if (error) {
    return { ok: false, error: { type: "UNKNOWN", message: error.message } };
  }

  redirect(`/login`);
}
