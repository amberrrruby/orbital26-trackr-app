"use server";

import { requireUserOrRedirectLogin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { EditProfileSchema } from "@/lib/types";
import { redirect } from "next/navigation";

export async function editProfileAction(formData: FormData) {
  const userId = await requireUserOrRedirectLogin();
  const parseResult = EditProfileSchema.safeParse({
    name: formData.get("name"),
  });

  if (!parseResult.success) {
    throw new Error("Invalid form data");
  }

  const { data } = parseResult;

  await prisma.user.update({
    where: { id: userId },
    data: { name: data.name },
  });

  // Only a boolean `true` here because the page only does one thing, which is edit profile information
  redirect(`/settings/profile?success=true`);
}
