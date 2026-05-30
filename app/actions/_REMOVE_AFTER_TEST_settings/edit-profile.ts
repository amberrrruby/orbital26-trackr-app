"use server";

import { requireUserOrRedirectLogin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  EditProfileError,
  EditProfileSchema,
  Result,
  returnSchemaValidationError,
} from "@/lib/types";
import { redirect } from "next/navigation";

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
