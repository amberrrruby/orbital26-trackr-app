"use server";

import { prisma } from "@/lib/prisma";
import { requireUserOrRedirectLogin } from "@/lib/auth";

export async function getApplications() {
  const user = await requireUserOrRedirectLogin();

  const applications = await prisma.application.findMany({
    where: {
      userId: user,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return applications;
}
