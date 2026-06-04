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
  OrderType,
  ReminderSchema,
  Result,
  returnSchemaValidationError,
  SortableField,
  UpdateReminderError,
} from "@/lib/types";

export async function getReminders(
  orderKey: SortableField = "updatedAt",
  order: OrderType = "desc",
  pageNumber: number = 0,
  pageSize: number = 12,
): Promise<
  Result<{ reminders: Reminder[]; totalCount: number }, GetRemindersError>
> {
  const user = await requireUserOrRedirectLogin();

  const parseResult = GetRemindersParamsSchema.safeParse({
    orderKey,
    order,
    pageNumber,
    pageSize,
  });

  if (!parseResult.success) {
    return {
      ok: false,
      error: returnSchemaValidationError(parseResult),
    };
  }

  try {
    const [reminders, totalCount] = (await prisma.$transaction([
      prisma.reminder.findMany({
        where: { userId: user },
        orderBy: { [orderKey]: order },
        skip: pageNumber * pageSize,
        take: pageSize,
      }),
      prisma.reminder.count({ where: { userId: user } }),
    ])) as [Reminder[], number];
    return { ok: true, value: { reminders, totalCount } };
  } catch {
    return {
      ok: false,
      error: { type: "FAILURE" },
    };
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
        remindAt,
        content,
        userId,
      },
    });
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
    // revalidatePath(`/reminders`);
    return { ok: true, value: undefined };
  } catch {
    return {
      ok: false,
      error: { type: "FAILURE" },
    };
  }
}
