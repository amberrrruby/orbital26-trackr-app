"use server";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import { requireUserOrRedirectLogin } from "@/lib/auth";
import {
  ChangeCredentialsError,
  DeleteAccountError,
  EditProfileError,
  EditProfileSchema,
  EmailSchema,
  PasswordSchema,
  Result,
  returnSchemaValidationError,
} from "@/lib/types";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { prisma } from "@/lib/prisma";

const supabaseAdmin = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
);

export async function deleteAccount(): Promise<
  Result<void, DeleteAccountError>
> {
  const userId = await requireUserOrRedirectLogin();

  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

  if (error) {
    return { ok: false, error: { type: "FAILURE" } };
  }

  redirect(`/`);
}

export async function changePassword(
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

export async function changeEmail(
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

export async function editProfile(
  formData: FormData,
): Promise<Result<void, EditProfileError>> {
  const userId = await requireUserOrRedirectLogin();
  const parseResult = EditProfileSchema.safeParse({
    name: formData.get("name"),
  });

  if (!parseResult.success) {
    return {
      ok: false,
      error: returnSchemaValidationError(parseResult),
    };
  }

  const {
    data: { name },
  } = parseResult;

  await prisma.user.update({
    where: { id: userId },
    data: { name },
  });

  // Only a boolean `true` here because the page only does one thing, which is edit profile information
  redirect(`/settings/profile?success=true`);
}
