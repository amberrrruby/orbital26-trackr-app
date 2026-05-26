"use server";

import { prisma } from "@/lib/prisma";
import { requireUserOrRedirectLogin } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function deleteApplication(id: string) {
  const user = await requireUserOrRedirectLogin();

  if (!id) {
    return {
      error: "Application ID is required.",
    };
  }

  const result = await prisma.application.deleteMany({
    where: {
      id,
      userId: user,
    },
  });

  if (result.count === 0) {
    return {
      error:
        "Application not found or you do not have permission to delete it.",
    };
  }

  revalidatePath("/applications");

  return {
    success: true,
  };
}
