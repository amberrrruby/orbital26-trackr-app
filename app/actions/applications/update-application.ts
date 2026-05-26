"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUserOrRedirectLogin } from "@/lib/auth";
import { Status } from "@/lib/generated/browser";

const validStatuses = Object.values(Status);

export async function updateApplication(formData: FormData) {
  const user = await requireUserOrRedirectLogin();

  const id = formData.get("id")?.toString().trim();
  const company = formData.get("company")?.toString().trim();
  const role = formData.get("role")?.toString().trim();
  const source = formData.get("source")?.toString().trim();
  const status = formData.get("status")?.toString().trim();
  const dateApplied = formData.get("dateApplied")?.toString();
  const notes = formData.get("notes")?.toString().trim();

  if (!company || !role || !dateApplied) {
    return {
      error: "Company, Role and Date Applied are required.",
    };
  }

  if (status && !validStatuses.includes(status as Status)) {
    return {
      error: "Invalid application status.",
    };
  }

  const result = await prisma.application.updateMany({
    where: {
      id,
      userId: user,
    },
    data: {
      company,
      role,
      source: source || null,
      status: status ? (status as Status) : Status.APPLIED,
      dateApplied: new Date(dateApplied),
      notes: notes || null,
      userId: user,
    },
  });

  if (result.count === 0) {
    return {
      error: "Application not found or you have no permission to edit it.",
    };
  }

  revalidatePath("/applications");

  return {
    success: true,
  };
}
