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
import { revalidatePath } from "next/cache";

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
    const application = prisma.timelineEvent.findFirst({
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
