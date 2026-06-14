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
// import { Application } from "@/lib/generated/client";
import {
  createApplicationCreatedTimelineEvent,
  createStatusChangeTimelineEvent,
  createOrUpdateImportantDateTimelineEvent,
} from "./timeline";
import { revalidatePath } from "next/cache";

export async function createApplication(
  formData: FormData,
): Promise<Result<string, CreateApplicationError>> {
  console.log(formData);
  const userId = await requireUserOrRedirectLogin();

  const parseResult = ApplicationSchema.safeParse({
    company: formData.get("company"),
    role: formData.get("role"),
    source: formData.get("source"),
    status: formData.get("status"),
    resumeId: formData.get("resumeId"),
    dateApplied: formData.get("dateApplied") || undefined,
    oaAssessmentDate: formData.get("oaAssessmentDate") || undefined,
    interviewDate: formData.get("interviewDate") || undefined,
    offerExpiryDate: formData.get("offerExpiryDate") || undefined,
    notes: formData.get("notes"),
  });

  if (!parseResult.success) {
    console.log(`haiya parse error ${parseResult.error.message}`);
    return {
      ok: false,
      error: returnSchemaValidationError(parseResult),
    };
  }

  const {
    company,
    role,
    source,
    status,
    resumeId,
    dateApplied,
    oaAssessmentDate,
    interviewDate,
    offerExpiryDate,
    notes,
  } = parseResult.data;

  try {
    const application = await prisma.application.create({
      data: {
        company,
        role,
        source: source ?? "",
        status,
        ...(dateApplied ? { dateApplied } : {}),
        ...(resumeId ? { resumeId } : {}),
        notes: notes,
        userId,
      },
    });

    await createApplicationCreatedTimelineEvent({
      applicationId: application.id,
      userId,
      status: application.status,
      eventDate: application.createdAt,
    });

    if (dateApplied) {
      await createOrUpdateImportantDateTimelineEvent({
        applicationId: application.id,
        userId,
        sourceKey: "DATE_APPLIED",
        eventDate: dateApplied,
      });
    }

    if (oaAssessmentDate) {
      await createOrUpdateImportantDateTimelineEvent({
        applicationId: application.id,
        userId,
        sourceKey: "OA_ASSESSMENT_DATE",
        eventDate: oaAssessmentDate,
      });
    }

    if (interviewDate) {
      await createOrUpdateImportantDateTimelineEvent({
        applicationId: application.id,
        userId,
        sourceKey: "INTERVIEW_DATE",
        eventDate: interviewDate,
      });
    }

    if (offerExpiryDate) {
      await createOrUpdateImportantDateTimelineEvent({
        applicationId: application.id,
        userId,
        sourceKey: "OFFER_EXPIRY_DATE",
        eventDate: offerExpiryDate,
      });
    }

    return { ok: true, value: application.id };
  } catch {
    return { ok: false, error: { type: "FAILURE" } };
  }
}

export async function getApplications(): Promise<
  Result<ApplicationWithDetails[], GetApplicationsError>
> {
  const userId = await requireUserOrRedirectLogin();

  try {
    const applications = await prisma.application.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        resume: true,
      },
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
  console.log(formData);
  const userId = await requireUserOrRedirectLogin();

  const parseResult = EditApplicationSchema.safeParse({
    id: formData.get("id"),
    company: formData.get("company"),
    role: formData.get("role"),
    source: formData.get("source"),
    status: formData.get("status"),
    resumeId: formData.get("resumeId") || undefined,
    dateApplied: formData.get("dateApplied") || undefined,
    oaAssessmentDate: formData.get("oaAssessmentDate") || undefined,
    interviewDate: formData.get("interviewDate") || undefined,
    offerExpiryDate: formData.get("offerExpiryDate") || undefined,
    notes: formData.get("notes"),
  });

  if (!parseResult.success) {
    console.log(`haiya parse error ${parseResult.error.message}`);
    return {
      ok: false,
      error: returnSchemaValidationError(parseResult),
    };
  }

  const {
    id,
    company,
    role,
    source,
    status,
    resumeId,
    dateApplied,
    oaAssessmentDate,
    interviewDate,
    offerExpiryDate,
    notes,
  } = parseResult.data;

  try {
    const existingApplication = await prisma.application.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingApplication) {
      return { ok: false, error: { type: "FAILURE" } };
    }

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
        ...(resumeId ? { resumeId } : {}),
        notes: notes,
      },
    });

    if (result.count === 0) {
      return { ok: false, error: { type: "FAILURE" } };
    }

    if (existingApplication.status !== status) {
      await createStatusChangeTimelineEvent({
        applicationId: id,
        userId,
        fromStatus: existingApplication.status,
        toStatus: status,
        eventDate: new Date(),
      });
    }

    if (dateApplied) {
      await createOrUpdateImportantDateTimelineEvent({
        applicationId: id,
        userId,
        sourceKey: "DATE_APPLIED",
        eventDate: dateApplied,
      });
    }

    if (oaAssessmentDate) {
      await createOrUpdateImportantDateTimelineEvent({
        applicationId: id,
        userId,
        sourceKey: "OA_ASSESSMENT_DATE",
        eventDate: oaAssessmentDate,
      });
    }

    if (interviewDate) {
      await createOrUpdateImportantDateTimelineEvent({
        applicationId: id,
        userId,
        sourceKey: "INTERVIEW_DATE",
        eventDate: interviewDate,
      });
    }

    if (offerExpiryDate) {
      await createOrUpdateImportantDateTimelineEvent({
        applicationId: id,
        userId,
        sourceKey: "OFFER_EXPIRY_DATE",
        eventDate: offerExpiryDate,
      });
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
