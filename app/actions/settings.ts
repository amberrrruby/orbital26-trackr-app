"use server";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import {
  requireUserOrRedirectLogin,
  sessionHasEmailLoginMethod,
} from "@/lib/auth";
import {
  ChangeCredentialsError,
  DeleteAccountError,
  EditProfileError,
  EditProfileSchema,
  EmailSchema,
  GetReminderSettingsError,
  PasswordSchema,
  ReminderSettings,
  ReminderSettingsSchema,
  Result,
  returnSchemaValidationError,
  UpdateReminderSettingsError,
} from "@/lib/types";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

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
  const hasEmailLoginMethod = await sessionHasEmailLoginMethod();
  if (!hasEmailLoginMethod) {
    return { ok: false, error: { type: "FAILURE" } };
  }
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

  return { ok: true, value: undefined };
}

export async function changeEmail(
  formData: FormData,
): Promise<Result<void, ChangeCredentialsError>> {
  await requireUserOrRedirectLogin();
  const supabase = await createSupabaseServerClient();
  const hasEmailLoginMethod = await sessionHasEmailLoginMethod();
  if (!hasEmailLoginMethod) {
    return { ok: false, error: { type: "FAILURE" } };
  }
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

  revalidatePath("layout");
  return { ok: true, value: undefined };
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

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { name },
    });
  } catch {
    return { ok: false, error: { type: "FAILURE" } };
  }

  revalidatePath("layout");
  revalidatePath("/settings/profile");
  // Only a boolean `true` here because the page only does one thing, which is edit profile information
  return { ok: true, value: undefined };
}

export async function getReminderSettings(): Promise<
  Result<ReminderSettings, GetReminderSettingsError>
> {
  const userId = await requireUserOrRedirectLogin();
  try {
    const userProfile = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!userProfile) {
      return { ok: false, error: { type: "FAILURE" } };
    }

    const parseResult = ReminderSettingsSchema.safeParse(userProfile.settings);

    if (!parseResult.success) {
      console.log("[ERROR] Reminder settings are not the expected shape:");
      console.log(parseResult.error.message);
      console.log("Settings, raw:");
      console.log(userProfile.settings);
      return { ok: false, error: { type: "FAILURE" } };
    }

    return { ok: true, value: parseResult.data };
  } catch {
    return { ok: false, error: { type: "FAILURE" } };
  }
}

export async function updateReminderSettings(
  formData: FormData,
): Promise<Result<void, UpdateReminderSettingsError>> {
  const userId = await requireUserOrRedirectLogin();

  const parseResult = ReminderSettingsSchema.safeParse({
    eventReminderDays: String(formData.get("eventReminderDays") ?? "")
      .split(",")
      .filter(Boolean)
      .map(Number),
    appliedFollowUpDays: Number(formData.get("appliedFollowUpDays")),
    assessmentFollowUpDays: Number(formData.get("assessmentFollowUpDays")),
    interviewFollowUpDays: Number(formData.get("interviewFollowUpDays")),
  });

  if (!parseResult.success) {
    return {
      ok: false,
      error: returnSchemaValidationError(parseResult),
    };
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        settings: parseResult.data,
      },
    });
    revalidatePath("/settings/profile");
    return { ok: true, value: undefined };
  } catch {
    return { ok: false, error: { type: "FAILURE" } };
  }
}
