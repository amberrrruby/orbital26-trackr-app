"use server";

import { requireUserOrRedirectLogin } from "@/lib/auth";
import { Reminder } from "@/lib/generated/client";
import { prisma } from "@/lib/prisma";
import {
  AddReminderError,
  DeleteReminderError,
  EditReminderSchema,
  GetRemindersError,
  GetRemindersParamsSchema,
  ReminderSchema,
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
      reminders: Reminder[];
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

  try {
    const [reminders, totalCount] = (await prisma.$transaction([
      prisma.reminder.findMany({
        where: {
          userId,
          remindAt: remindAtFilter,
        },
        orderBy: { remindAt: group === "overdue" ? "desc" : "asc" },
        skip: pageNumber * pageSize,
        take: pageSize,
      }),
      prisma.reminder.count({ where: { userId, remindAt: remindAtFilter } }),
    ])) as [Reminder[], number];

    return { ok: true, value: { reminders, totalCount } };
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
    type: formData.get("type"),
    remindAt: formData.get("remindAt"),
    content: formData.get("content"),
  });
  if (!parseResult.success) {
    return {
      ok: false,
      error: returnSchemaValidationError(parseResult),
    };
  }
  const { applicationId, type, remindAt, content } = parseResult.data;

  // 3. Write DB record
  try {
    const reminder = await prisma.reminder.create({
      data: {
        applicationId,
        type,
        remindAt: new Date(remindAt),
        content,
        userId,
      },
    });
    revalidatePath(`/reminders`);
    return { ok: true, value: reminder.id };
  } catch (err) {
    console.log(err);
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

  const parseResult = EditReminderSchema.safeParse({
    type: formData.get("type"),
    remindAt: formData.get("remindAt"),
    content: formData.get("content"),
  });
  if (!parseResult.success) {
    return {
      ok: false,
      error: returnSchemaValidationError(parseResult),
    };
  }
  const { type, remindAt, content } = parseResult.data;

  try {
    const result = await prisma.reminder.updateMany({
      where: { id: reminderId, userId },
      data: {
        type,
        remindAt,
        content,
      },
    });
    if (result.count === 0) {
      return { ok: false, error: { type: "FAILURE" } };
    }
    // revalidatePath(`/reminders`);
    return { ok: true, value: undefined };
  } catch {
    return {
      ok: false,
      error: { type: "FAILURE" },
    };
  }
}

export async function deleteReminder(
  reminderId: string,
): Promise<Result<void, DeleteReminderError>> {
  const userId = await requireUserOrRedirectLogin();
  try {
    const { count } = await prisma.reminder.deleteMany({
      where: {
        id: reminderId,
        userId,
      },
    });
    if (count === 0) {
      return { ok: false, error: { type: "FAILURE" } };
    }
    revalidatePath(`/reminders`);
    return { ok: true, value: undefined };
  } catch {
    return {
      ok: false,
      error: { type: "FAILURE" },
    };
  }
}
