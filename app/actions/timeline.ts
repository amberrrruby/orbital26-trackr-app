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
import { addReminder } from "./reminders";

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

    // TODO: might change to conditionally do a DB PATCH call, if date has passed "today", and reminders are not needed
    const reminderResult = await prisma.reminder.updateMany({
      where: { id, userId },
      data: {
        remindAt: new Date(eventDate),
        content: description,
      },
    });

    if (reminderResult.count === 0) {
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

export async function createStatusChangeTimelineEvent({
  applicationId,
  company,
  role,
  userId,
  fromStatus,
  toStatus,
  eventDate,
}: {
  applicationId: string;
  company: string;
  role: string;
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

    const userSettingsResult = await getReminderSettings();
    if (!userSettingsResult.ok) {
      console.log(
        `[ERROR] from createStatusChangeTimelineEvent: getReminderSettings failed`,
      );
      return;
    }
    const userSettings = userSettingsResult.value;
    console.log("user settings:");
    console.log(userSettings);

    let offset;
    let source;
    switch (toStatus) {
      case "APPLIED": {
        offset = userSettings.appliedFollowUpDays;
        source = "DATE_APPLIED";
        break;
      }
      case "OA_ASSESSMENT": {
        offset = userSettings.assessmentFollowUpDays;
        source = "OA_ASSESSMENT_DATE";
        break;
      }
      case "INTERVIEW": {
        offset = userSettings.interviewFollowUpDays;
        source = "INTERVIEW_DATE";
        break;
      }
      case "REJECTED":
      case "WISHLIST":
      case "OFFER":
        console.log(
          `[LOG] from createStatusChangeTimelineEvent: received status change to ${toStatus}, not handled`,
        );
        break;
      default:
        console.log(
          `[ERROR] from createStatusChangeTimelineEvent: received UNKNOWN status change to ${toStatus}`,
        );
        return;
    }

    if (offset && source) {
      // Ugly parameter-shaping to match `addReminder`. Since this is the only place that called so,
      // no refactor is done...
      const formData = new FormData();
      formData.set("applicationId", applicationId);
      formData.set("reminderType", "FOLLOW_UP");

      const remindAt = new Date(eventDate);
      remindAt.setDate(remindAt.getDate() + offset);
      formData.set("remindAt", remindAt.toISOString());

      formData.set("offsetDays", String(offset));
      formData.set("source", source);
      formData.set("content", `Follow up on application: ${company} - ${role}`);

      await addReminder(formData);
    }
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

  const existingReminder = await prisma.reminder.findFirst({
    // TODO: might fix? if user behaves, this should only return the one and only one reminder with the following sourceKey.
    where: {
      applicationId,
      userId,
      source: sourceKey,
    },
  });

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

  let offset;
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
    default: {
      console.log(
        `[ERROR?] from createOrUpdateImportantDateTimelineEvent: received UNKNOWN source key ${sourceKey}`,
      );
      return;
    }
  }
  const remindDate: Date = eventDate;
  remindDate.setDate(remindDate.getDate() + offset);

  if (existingReminder) {
    // TODO: raw call, error bubbled and unhandled for now
    await prisma.reminder.updateMany({
      where: {
        id: existingReminder.id,
        userId,
      },
      data: {
        remindAt: remindDate,
        offsetDays: offset,
      },
    });
  } else {
    // Directly inlined here with no wrapper. Might violate responsibility organization, but this is the only place it's called, if a wrapped helper is ever written.
    await prisma.reminder.create({
      data: {
        applicationId,
        type: "EVENT",
        remindAt: remindDate,
        offsetDays: offset,
        source: sourceKey,
        content: importantDateDescription(sourceKey),
        userId,
      },
    });
  }
}
