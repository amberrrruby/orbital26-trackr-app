"use server";

import { prisma } from "@/lib/prisma";
import { requireUserOrRedirectLogin } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Status } from "@/lib/generated/browser";

const validStatuses = Object.values(Status);

export async function createApplication(formData: FormData) {
  const user = await requireUserOrRedirectLogin();

  const company = formData.get("company")?.toString().trim();
  const role = formData.get("role")?.toString().trim();
  const source = formData.get("source")?.toString().trim();
  const status = formData.get("status")?.toString().trim();
  const dateApplied = formData.get("dateApplied")?.toString();
  const notes = formData.get("notes")?.toString().trim();

  if (!company || !role || !dateApplied) {
    return {
      error: "Company, role and Date Applied are required.",
    };
  }

  if (status && !validStatuses.includes(status as Status)) {
    return {
      error: "Invalid application status.",
    };
  }

  await prisma.application.create({
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

  redirect("/applications");
}
