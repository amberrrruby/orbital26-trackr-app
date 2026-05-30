"use server";

import { requireUserOrRedirectLogin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import {
  ChangeCredentialsError,
  EmailSchema,
  PasswordSchema,
  Result,
  returnSchemaValidationError,
} from "@/lib/types";
import { redirect } from "next/navigation";

export async function changePasswordAction(
  formData: FormData,
): Promise<Result<void, ChangeCredentialsError>> {
  await requireUserOrRedirectLogin();
  const supabase = await createSupabaseServerClient();
  const parseResult = PasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parseResult.success) {
    return {
      ok: false,
      error: returnSchemaValidationError(parseResult),
    };
  }

  const {
    data: { password },
  } = parseResult;

  const { error } = await supabase.auth.updateUser({ password: password });

  if (error) {
    return { ok: false, error: { type: "FAILURE" } };
  }

  redirect(`/settings/account?success=password-updated`);
}

export async function changeEmailAction(
  formData: FormData,
): Promise<Result<void, ChangeCredentialsError>> {
  await requireUserOrRedirectLogin();
  const supabase = await createSupabaseServerClient();
  const parseResult = EmailSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parseResult.success) {
    return {
      ok: false,
      error: returnSchemaValidationError(parseResult),
    };
  }

  const {
    data: { email },
  } = parseResult;

  const { error } = await supabase.auth.updateUser({ email: email });

  if (error) {
    return { ok: false, error: { type: "FAILURE" } };
  }

  redirect(`/settings/account?success=email-updated`);
}
