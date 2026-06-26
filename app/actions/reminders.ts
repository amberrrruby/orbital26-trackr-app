"use server";

import { requireUserOrRedirectLogin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  AddReminderError,
  ApplicationIdSchema,
  DeleteReminderError,
  GetRemindersError,
  GetRemindersByApplicationIdError,
  GetRemindersParamsSchema,
  ReminderSchema,
  Reminder,
  ReminderWithApplication,
  Result,
  returnSchemaValidationError,
  UpdateReminderError,
} from "@/lib/types";
import { revalidatePath } from "next/cache";

export async function getReminders(
  pageNumber: number = 0,
  pageSize: number = 5,
  group: "today" | "upcoming" | "overdue" | "all" = "all",
): Promise<
  Result<
    {
      reminders: ReminderWithApplication[];
      totalCount: number;
    },
    GetRemindersError
  >
> {
  const userId = await requireUserOrRedirectLogin();

  const parseResult = GetRemindersParamsSchema.safeParse({
    pageNumber,
    pageSize,
    group,
  });

  if (!parseResult.success) {
    return { ok: false, error: returnSchemaValidationError(parseResult) };
  }

  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);

  const remindAtFilter =
    group === "today"
      ? { gte: startOfToday, lte: endOfToday }
      : group === "overdue"
        ? { lt: startOfToday }
        : group === "upcoming"
          ? { gt: endOfToday }
          : undefined; // "all" — no filter

  // Hide future system-generated follow-up reminders until they become due
  // Custom follow-ups have no source key, so they remain visible in Upcoming
  const upcomingVisibilityFilter =
    group === "upcoming"
      ? {
          OR: [
            {
              type: "EVENT" as const,
            },
            {
              type: "FOLLOW_UP" as const,
              source: null,
            },
          ],
        }
      : {};

  try {
    const [reminders, totalCount] = (await prisma.$transaction([
      prisma.reminder.findMany({
        where: {
          userId,
          remindAt: remindAtFilter,
          ...upcomingVisibilityFilter,
        },
        orderBy: { remindAt: group === "overdue" ? "desc" : "asc" },
        skip: pageNumber * pageSize,
        take: pageSize,
        include: { application: true },
      }),
      prisma.reminder.count({
        where: {
          userId,
          remindAt: remindAtFilter,
          ...upcomingVisibilityFilter,
        },
      }),
    ])) as [ReminderWithApplication[], number];

    return { ok: true, value: { reminders, totalCount } };
  } catch {
    return { ok: false, error: { type: "FAILURE" } };
  }
}

export async function getRemindersByApplicationId(
  applicationId: string,
): Promise<Result<Reminder[], GetRemindersByApplicationIdError>> {
  const userId = await requireUserOrRedirectLogin();

  const parseResult = ApplicationIdSchema.safeParse({
    id: applicationId,
  });

  if (!parseResult.success) {
    return {
      ok: false,
      error: returnSchemaValidationError(parseResult),
    };
  }

  const startOfTomorrow = new Date();
  startOfTomorrow.setHours(24, 0, 0, 0);

  try {
    const reminders = await prisma.reminder.findMany({
      where: {
        applicationId: parseResult.data.id,
        userId,
        OR: [
          // Always show EVENT reminders
          {
            type: "EVENT",
          },
          // Always show custom FOLLOW_UP reminders
          {
            type: "FOLLOW_UP",
            source: null,
          },
          // Show system follow-ups only if its due date is today or earlier
          {
            type: "FOLLOW_UP",
            source: {
              not: null,
            },
            remindAt: {
              lt: startOfTomorrow,
            },
          },
        ],
      },
    });

    return { ok: true, value: reminders };
  } catch {
    return { ok: false, error: { type: "FAILURE" } };
  }
}

export async function addReminder(
  formData: FormData,
): Promise<Result<string, AddReminderError>> {
  const userId = await requireUserOrRedirectLogin();
  const parseResult = ReminderSchema.safeParse({
    applicationId: formData.get("applicationId"),
    type: formData.get("reminderType"),
    remindAt: formData.get("remindAt"),
    offsetDays: formData.get("offsetDays"),
    source: formData.get("source"),
    content: formData.get("content"),
  });
  if (!parseResult.success) {
    console.log(`[dbg] addReminder parseResult fail`);
    console.log(parseResult.error.message);
    return {
      ok: false,
      error: returnSchemaValidationError(parseResult),
    };
  }
  const { applicationId, type, remindAt, offsetDays, source, content } =
    parseResult.data;

  // 3. Write DB record
  try {
    const reminder = await prisma.reminder.create({
      data: {
        ...(applicationId != null && { applicationId }),
        type,
        remindAt: new Date(remindAt),
        ...(offsetDays != null && { offsetDays }),
        ...(source != null && { source }),
        content,
        userId,
      },
    });
    revalidatePath(`/reminders`);

    if (applicationId) {
      revalidatePath(`/applications/${applicationId}`);
    }
    return { ok: true, value: reminder.id };
  } catch {
    return {
      ok: false,
      error: { type: "FAILURE" },
    };
  }
}

export async function updateReminder(
  reminderId: string,
  formData: FormData,
): Promise<Result<void, UpdateReminderError>> {
  const userId = await requireUserOrRedirectLogin();

  const parseResult = ReminderSchema.safeParse({
    applicationId: formData.get("applicationId"),
    type: formData.get("reminderType"),
    remindAt: formData.get("remindAt"),
    offsetDays: formData.get("offsetDays"),
    source: formData.get("source"),
    content: formData.get("content"),
  });
  if (!parseResult.success) {
    return {
      ok: false,
      error: returnSchemaValidationError(parseResult),
    };
  }
  const { applicationId, type, remindAt, offsetDays, source, content } =
    parseResult.data;

  try {
    const result = await prisma.reminder.updateMany({
      where: { id: reminderId, userId },
      data: {
        applicationId,
        type,
        remindAt: new Date(remindAt),
        ...(offsetDays != null && { offsetDays }),
        ...(source != null && { source }),
        content,
      },
    });
    if (result.count === 0) {
      return { ok: false, error: { type: "FAILURE" } };
    }
    revalidatePath(`/reminders`);

    if (applicationId) {
      revalidatePath(`/applications/${applicationId}`);
    }
    return { ok: true, value: undefined };
  } catch {
    return {
      ok: false,
      error: { type: "FAILURE" },
    };
  }
}

// Dismissing a reminder removes it without recording a timeline event
export async function deleteReminder(
  reminderId: string,
): Promise<Result<void, DeleteReminderError>> {
  const userId = await requireUserOrRedirectLogin();
  try {
    const reminder = await prisma.reminder.findFirst({
      where: {
        id: reminderId,
        userId,
      },
    });

    if (!reminder) {
      return { ok: false, error: { type: "FAILURE" } };
    }

    await prisma.reminder.delete({
      where: {
        id: reminderId,
      },
    });

    revalidatePath(`/reminders`);

    if (reminder.applicationId) {
      revalidatePath(`/applications/${reminder.applicationId}`);
    }

    return { ok: true, value: undefined };
  } catch {
    return {
      ok: false,
      error: { type: "FAILURE" },
    };
  }
}

export async function completeReminder(
  reminderId: string,
): Promise<Result<void, DeleteReminderError>> {
  const userId = await requireUserOrRedirectLogin();

  try {
    const reminder = await prisma.reminder.findFirst({
      where: {
        id: reminderId,
        userId,
      },
    });

    if (!reminder) {
      return { ok: false, error: { type: "FAILURE" } };
    }

    // Log only completed follow-up reminders and custom reminders
    // Date-triggered EVENT reminders are not logged onto the timeline
    // They already exist as a separate IMPORTANT_DATE timeline event
    const shouldLogCompletion =
      reminder.type === "FOLLOW_UP" ||
      (reminder.type === "EVENT" && reminder.source === null);

    await prisma.$transaction(async (tx) => {
      if (reminder.applicationId && shouldLogCompletion) {
        await tx.timelineEvent.create({
          data: {
            type: "REMINDER_COMPLETED",
            eventDate: new Date(),
            applicationId: reminder.applicationId,
            userId,
            description: `Completed reminder: ${reminder.content ?? "Reminder"}`,
          },
        });
      }

      await tx.reminder.delete({
        where: {
          id: reminder.id,
        },
      });
    });

    revalidatePath("/reminders");

    if (reminder.applicationId) {
      revalidatePath(`/applications/${reminder.applicationId}`);
    }

    return { ok: true, value: undefined };
  } catch {
    return {
      ok: false,
      error: { type: "FAILURE" },
    };
  }
}
