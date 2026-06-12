"use server";

import { requireUserOrRedirectLogin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  GetTimelineEventsError,
  AddTimelineEventError,
  UpdateTimelineEventError,
  DeleteTimelineEventError,
  ManualTimelineEventSchema,
  EditManualTimelineEventSchema,
  TimelineEventIdSchema,
  TimelineEventWithApplication,
  returnSchemaValidationError,
  Result,
} from "@/lib/types";
import { Status, SourceKey } from "@/lib/generated/client";
import { revalidatePath } from "next/cache";
import { getImplicitTags } from "next/dist/server/lib/implicit-tags";

export async function getTimelineEvents(
  applicationId: string,
): Promise<Result<TimelineEventWithApplication[], GetTimelineEventsError>> {
  const userId = await requireUserOrRedirectLogin();

  const parseResult = ManualTimelineEventSchema.pick({
    applicationId: true,
  }).safeParse({ applicationId });

  if (!parseResult.success) {
    return {
      ok: false,
      error: returnSchemaValidationError(parseResult),
    };
  }

  try {
    const timelineEvents = await prisma.timelineEvent.findMany({
      where: {
        applicationId: parseResult.data.applicationId,
        userId,
      },
      include: {
        application: true,
      },
      orderBy: {
        eventDate: "asc",
      },
    });
    return { ok: true, value: timelineEvents };
  } catch {
    return { ok: false, error: { type: "FAILURE" } };
  }
}

export async function addManualTimelineEvent(
  formData: FormData,
): Promise<Result<string, AddTimelineEventError>> {
  const userId = await requireUserOrRedirectLogin();

  const parseResult = ManualTimelineEventSchema.safeParse({
    applicationId: formData.get("applicationId"),
    eventDate: formData.get("eventDate"),
    description: formData.get("description"),
  });

  if (!parseResult.success) {
    return {
      ok: false,
      error: returnSchemaValidationError(parseResult),
    };
  }

  const { applicationId, eventDate, description } = parseResult.data;

  try {
    const application = await prisma.application.findFirst({
      where: {
        id: applicationId,
        userId,
      },
    });

    if (!application) {
      return { ok: false, error: { type: "FAILURE" } };
    }

    const timelineEvent = await prisma.timelineEvent.create({
      data: {
        applicationId,
        userId,
        type: "MANUAL",
        eventDate: new Date(eventDate),
        description,
      },
    });
    revalidatePath(`/applications/${applicationId}`);
    return { ok: true, value: timelineEvent.id };
  } catch {
    return { ok: false, error: { type: "FAILURE" } };
  }
}

export async function updateManualTimelineEvent(
  formData: FormData,
): Promise<Result<void, UpdateTimelineEventError>> {
  const userId = await requireUserOrRedirectLogin();

  const parseResult = EditManualTimelineEventSchema.safeParse({
    id: formData.get("id"),
    applicationId: formData.get("applicationId"),
    eventDate: formData.get("eventDate"),
    description: formData.get("description"),
  });

  if (!parseResult.success) {
    return {
      ok: false,
      error: returnSchemaValidationError(parseResult),
    };
  }

  const { id, applicationId, eventDate, description } = parseResult.data;

  try {
    const result = await prisma.timelineEvent.updateMany({
      where: {
        id,
        applicationId,
        userId,
        type: "MANUAL",
      },
      data: {
        eventDate: new Date(eventDate),
        description,
      },
    });

    if (result.count === 0) {
      return { ok: false, error: { type: "FAILURE" } };
    }
    revalidatePath(`/applications/${applicationId}`);
    return { ok: true, value: undefined };
  } catch {
    return { ok: false, error: { type: "FAILURE" } };
  }
}

export async function deleteManualTimelineEvent(
  id: string,
): Promise<Result<void, DeleteTimelineEventError>> {
  const userId = await requireUserOrRedirectLogin();

  const parseResult = TimelineEventIdSchema.safeParse({ id });

  if (!parseResult.success) {
    return { ok: false, error: { type: "FAILURE" } };
  }

  try {
    const timelineEvent = await prisma.timelineEvent.findFirst({
      where: {
        id: parseResult.data.id,
        userId,
        type: "MANUAL",
      },
    });

    if (!timelineEvent) {
      return { ok: false, error: { type: "FAILURE" } };
    }

    await prisma.timelineEvent.delete({
      where: {
        id: timelineEvent.id,
      },
    });
    revalidatePath(`/applications/${timelineEvent.applicationId}`);
    return { ok: true, value: undefined };
  } catch {
    return { ok: false, error: { type: "FAILURE" } };
  }
}

function formatStatus(status: Status): string {
  const statusLabels: Record<Status, string> = {
    WISHLIST: "Wishlist",
    APPLIED: "Applied",
    OA_ASSESSMENT: "OA/ Assessment",
    INTERVIEW: "Interview",
    OFFER: "Offer",
    REJECTED: "Rejected",
  };
  return statusLabels[status];
}

export async function createApplicationCreatedTimelineEvent({
  applicationId,
  userId,
  status,
  eventDate,
}: {
  applicationId: string;
  userId: string;
  status: Status;
  eventDate: Date;
}) {
  return prisma.timelineEvent.create({
    data: {
      applicationId,
      userId,
      type: "APPLICATION_CREATED",
      eventDate,
      status,
      description: `Application created with status: ${formatStatus(status)}`,
    },
  });
}

export async function createStatusChangeTimelineEvent({
  applicationId,
  userId,
  fromStatus,
  toStatus,
  eventDate,
}: {
  applicationId: string;
  userId: string;
  fromStatus: Status;
  toStatus: Status;
  eventDate: Date;
}) {
  return prisma.timelineEvent.create({
    data: {
      applicationId,
      userId,
      type: "STATUS_CHANGED",
      eventDate,
      status: toStatus,
      description: `Status changed from ${formatStatus(fromStatus)} to ${formatStatus(toStatus)}`,
    },
  });
}

function importantDateDescription(sourceKey: SourceKey): string {
  const descriptions: Record<SourceKey, string> = {
    DATE_APPLIED: "Applied",
    OA_ASSESSMENT_DATE: "OA/Assessment",
    INTERVIEW_DATE: "Interview",
    OFFER_EXPIRY_DATE: "Offer expiry",
  };
  return descriptions[sourceKey];
}

export async function createOrUpdateImportantDateTimelineEvent({
  applicationId,
  userId,
  sourceKey,
  eventDate,
}: {
  applicationId: string;
  userId: string;
  sourceKey: SourceKey;
  eventDate: Date;
}) {
  const existingTimelineEvent = await prisma.timelineEvent.findFirst({
    where: {
      applicationId,
      userId,
      type: "IMPORTANT_DATE",
      sourceKey,
    },
  });

  if (existingTimelineEvent) {
    return prisma.timelineEvent.update({
      where: {
        id: existingTimelineEvent.id,
      },
      data: {
        eventDate,
        description: importantDateDescription(sourceKey),
      },
    });
  }

  return prisma.timelineEvent.create({
    data: {
      applicationId,
      userId,
      type: "IMPORTANT_DATE",
      sourceKey,
      eventDate,
      description: importantDateDescription(sourceKey),
    },
  });
}
