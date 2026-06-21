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
import { getReminderSettings } from "./settings";

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
}): Promise<void> {
  try {
    await prisma.timelineEvent.create({
      data: {
        applicationId,
        userId,
        type: "APPLICATION_CREATED",
        eventDate,
        status,
        description: `Application created with status: ${formatStatus(status)}`,
      },
    });
  } catch (err) {
    console.log(
      "[ERROR] from createApplicationCreatedTimelineEvent: no return",
    );
    console.log(err);
  }
}

// Status changes are recorded on the timeline only
// Automatic reminders are intentionally not created here, as the date a status changes may differ from the actual event date
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
}): Promise<void> {
  // Assuming user validation is already done, since the only use place of this function is in `createApplication`. Skipping user validation.
  try {
    await prisma.timelineEvent.create({
      data: {
        applicationId,
        userId,
        type: "STATUS_CHANGED",
        eventDate,
        status: toStatus,
        description: `Status changed from ${formatStatus(fromStatus)} to ${formatStatus(toStatus)}`,
      },
    });

    // Reminder creation was removed from this function.
    // Follow-up reminders are now triggered by the corresponding date fields
    // inside createOrUpdateImportantDateTimelineEvent()
  } catch (err) {
    console.log("[ERROR] from createStatusChangeTimelineEvent: no return");
    console.log(err);
  }
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

function followUpDescription(sourceKey: SourceKey): string | undefined {
  const descriptions: Partial<Record<SourceKey, string>> = {
    DATE_APPLIED: "Follow up on application status",
    OA_ASSESSMENT_DATE: "Follow up after OA/ Assessment",
    INTERVIEW_DATE: "Follow up after interview",
  };

  return descriptions[sourceKey];
}

// This function is the source of automatic reminder triggers
// Reminders are based on the actual dates entered by the user
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

  if (
    existingTimelineEvent &&
    existingTimelineEvent.eventDate.getTime() === eventDate.getTime()
  ) {
    return;
  }

  if (existingTimelineEvent) {
    await prisma.timelineEvent.update({
      where: {
        id: existingTimelineEvent.id,
      },
      data: {
        eventDate,
        description: importantDateDescription(sourceKey),
      },
    });
  } else {
    // Return was here. Now it's shifted down to ensure that a reminder is created only after a TimelineEvent is correctly created (if not, error interrupts execution before moving on to creating / updating reminder).
    // UPDATE: no return update
    await prisma.timelineEvent.create({
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

  const userSettingsResult = await getReminderSettings();
  if (!userSettingsResult.ok) {
    console.log(
      `[ERROR] from createOrUpdateImportantDateTimelineEvent: getReminderSettings failed`,
    );
    return;
  }
  const userSettings = userSettingsResult.value;
  console.log("user settings:");
  console.log(userSettings);

  async function createOrUpdateReminder({
    type,
    remindAt,
    offsetDays,
    content,
  }: {
    type: "EVENT" | "FOLLOW_UP";
    remindAt: Date;
    offsetDays: number;
    content: string;
  }) {
    const existingReminder = await prisma.reminder.findFirst({
      // TODO: might fix? if user behaves, this should only return the one and only one reminder with the following sourceKey.
      where: {
        applicationId,
        userId,
        source: sourceKey,
        type,
      },
    });

    if (existingReminder) {
      await prisma.reminder.updateMany({
        where: {
          id: existingReminder.id,
          userId,
        },
        data: {
          remindAt,
          offsetDays,
          content,
        },
      });
    } else {
      await prisma.reminder.create({
        data: {
          applicationId,
          userId,
          type,
          source: sourceKey,
          remindAt,
          offsetDays,
          content,
        },
      });
    }
  }

  // OA, Interview and Offer Expiry create an event reminder on the actual entered date
  // Date Applied only generates a follow-up reminder
  if (sourceKey !== "DATE_APPLIED") {
    await createOrUpdateReminder({
      type: "EVENT",
      remindAt: new Date(eventDate),
      offsetDays: 0,
      content: importantDateDescription(sourceKey),
    });
  }

  let offset: number | null = null;

  switch (sourceKey) {
    case "DATE_APPLIED": {
      offset = userSettings.appliedFollowUpDays;
      break;
    }
    case "OA_ASSESSMENT_DATE": {
      offset = userSettings.assessmentFollowUpDays;
      break;
    }
    case "INTERVIEW_DATE": {
      offset = userSettings.interviewFollowUpDays;
      break;
    }
    case "OFFER_EXPIRY_DATE": {
      break;
    }
    default: {
      console.log(
        `[ERROR?] from createOrUpdateImportantDateTimelineEvent: received UNKNOWN source key ${sourceKey}`,
      );
      return;
    }
  }

  const followUpContent = followUpDescription(sourceKey);

  // Create a separate FOLLOW_UP reminder relative to the entered date
  // Only when it's calculated date is today or later
  // This is separate from the EVENT reminder on the actual event date
  if (offset !== null && followUpContent !== undefined) {
    const followUpDate = new Date(eventDate);
    followUpDate.setDate(followUpDate.getDate() + offset);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await createOrUpdateReminder({
      type: "FOLLOW_UP",
      remindAt: followUpDate,
      offsetDays: offset,
      content: followUpContent,
    });
  }
}
