"use server";

import { prisma } from "@/lib/prisma";
import { requireUserOrRedirectLogin } from "@/lib/auth";
import {
  ApplicationIdSchema,
  ApplicationSchema,
  CreateApplicationError,
  DeleteApplicationError,
  EditApplicationSchema,
  GetApplicationsError,
  GetApplicationByIdError,
  Result,
  returnSchemaValidationError,
  UpdateApplicationError,
  ApplicationWithDetails,
} from "@/lib/types";
import { Application } from "@/lib/generated/client";
import { revalidatePath } from "next/cache";

export async function createApplication(
  formData: FormData,
): Promise<Result<string, CreateApplicationError>> {
  const userId = await requireUserOrRedirectLogin();

  const parseResult = ApplicationSchema.safeParse({
    company: formData.get("company"),
    role: formData.get("role"),
    source: formData.get("source"),
    status: formData.get("status"),
    dateApplied: formData.get("dateApplied") || undefined,
    notes: formData.get("notes"),
  });

  if (!parseResult.success) {
    return {
      ok: false,
      error: returnSchemaValidationError(parseResult),
    };
  }

  const { company, role, source, status, dateApplied, notes } =
    parseResult.data;

  try {
    const application = await prisma.application.create({
      data: {
        company,
        role,
        source: source ?? "",
        status,
        ...(dateApplied ? { dateApplied } : {}),
        notes: notes,
        userId,
      },
    });
    return { ok: true, value: application.id };
  } catch {
    return { ok: false, error: { type: "FAILURE" } };
  }
}

export async function getApplications(): Promise<
  Result<Application[], GetApplicationsError>
> {
  const userId = await requireUserOrRedirectLogin();

  try {
    const applications = await prisma.application.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    return { ok: true, value: applications };
  } catch {
    return { ok: false, error: { type: "FAILURE" } };
  }
}

export async function getApplicationById(
  id: string,
): Promise<Result<ApplicationWithDetails | null, GetApplicationByIdError>> {
  const userId = await requireUserOrRedirectLogin();

  const parseResult = ApplicationIdSchema.safeParse({ id });

  if (!parseResult.success) {
    return {
      ok: false,
      error: returnSchemaValidationError(parseResult),
    };
  }

  try {
    const application = await prisma.application.findFirst({
      where: {
        id: parseResult.data.id,
        userId,
      },
      include: {
        resume: true,
      },
    });
    return { ok: true, value: application };
  } catch {
    return { ok: false, error: { type: "FAILURE" } };
  }
}

export async function updateApplication(
  formData: FormData,
): Promise<Result<void, UpdateApplicationError>> {
  const userId = await requireUserOrRedirectLogin();

  const parseResult = EditApplicationSchema.safeParse({
    id: formData.get("id"),
    company: formData.get("company"),
    role: formData.get("role"),
    source: formData.get("source"),
    status: formData.get("status"),
    dateApplied: formData.get("dateApplied") || undefined,
    notes: formData.get("notes"),
  });

  if (!parseResult.success) {
    return {
      ok: false,
      error: returnSchemaValidationError(parseResult),
    };
  }

  const { id, company, role, source, status, dateApplied, notes } =
    parseResult.data;

  try {
    const result = await prisma.application.updateMany({
      where: {
        id,
        userId,
      },
      data: {
        company,
        role,
        source: source ?? "",
        status,
        ...(dateApplied ? { dateApplied } : {}),
        notes: notes,
      },
    });
    if (result.count === 0) {
      return { ok: false, error: { type: "FAILURE" } };
    }
    revalidatePath(`/applications`);
    return { ok: true, value: undefined };
  } catch {
    return { ok: false, error: { type: "FAILURE" } };
  }
}

export async function deleteApplication(
  id: string,
): Promise<Result<void, DeleteApplicationError>> {
  const userId = await requireUserOrRedirectLogin();

  try {
    const result = await prisma.application.deleteMany({
      where: { id, userId },
    });
    if (result.count === 0) {
      return { ok: false, error: { type: "FAILURE" } };
    }
    revalidatePath(`/applications`);
    return { ok: true, value: undefined };
  } catch {
    return { ok: false, error: { type: "FAILURE" } };
  }
}
