"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { EmailSchema, PasswordSchema } from "@/lib/types";
import { redirect } from "next/navigation";

export async function changePasswordAction(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const parseResult = PasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parseResult.success) {
    // Should make it a error message instead of a thrown error.
    // UI issue - deferred for now...
    throw new Error("Invalid form data");
  }

  const {
    data: { password },
  } = parseResult;

  const { error } = await supabase.auth.updateUser({ password: password });

  if (error) {
    throw new Error(error.message);
  }

  redirect(`/settings/account?success=password-updated`);
}

export async function changeEmailAction(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const parseResult = EmailSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parseResult.success) {
    throw new Error("Invalid form data");
  }

  const {
    data: { email },
  } = parseResult;

  const { error } = await supabase.auth.updateUser({ email: email });

  if (error) {
    throw new Error(error.message);
  }

  redirect(`/settings/account?success=email-updated`);
}
