"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { ChangePasswordError, Result } from "@/lib/types";
import { redirect } from "next/navigation";

export async function changePasswordAction(
  _: unknown,
  formData: FormData,
): Promise<Result<void, ChangePasswordError>> {
  const supabase = await createSupabaseServerClient();
  const newPassword = formData.get("password");

  if (typeof newPassword !== "string" || !newPassword) {
    return {
      ok: false,
      error: { type: "UNKNOWN", message: "Missing password" },
    };
  }

  const { error } = await supabase.auth.updateUser({ password: newPassword });

  if (error) {
    return {
      ok: false,
      error: { type: "UNKNOWN", message: error.message },
    };
  }

  redirect(`/settings?success=password-updated`);
}
