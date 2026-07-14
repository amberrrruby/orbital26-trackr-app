import { DashboardData } from "./dashboard-types";
import { Status } from "./generated/enums";
import { prisma } from "./prisma";
import { ReminderSettings, STATUS_LABELS } from "./types";

// No Result<T, E> return - everything is read only, and if something fails, almost everything fails together. `error.tsx` is used to handle that. Or maybe I'm just lazy.
export async function getDashboardData(userId: string): Promise<DashboardData> {
  const totalTracked = await prisma.application.count({
    where: { userId },
  });

  const totalActive = await prisma.application.count({
    where: {
      userId,
      status: { in: [Status.APPLIED, Status.OA_ASSESSMENT, Status.INTERVIEW] },
    },
  });

  const statusBreakdownQuery = await prisma.application.groupBy({
    by: ["status"],
    where: { userId },
    _count: { _all: true },
  });

  const STATUS_ORDER = Object.keys(STATUS_LABELS);

  const statusBreakdown = STATUS_ORDER.map((status) => ({
    status: STATUS_LABELS[status],
    count:
      statusBreakdownQuery.find((r) => r.status === status)?._count._all ?? 0,
  }));

  const recentApplications = await prisma.application.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    take: 5,
  });

  const { settings } = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
  });

  const { eventReminderDays } = settings as ReminderSettings;

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const targetDates = eventReminderDays.map((days) => {
    const d = new Date(today);
    d.setUTCDate(d.getDate() + days);
    return d;
  });

  const remindersQuery = await prisma.reminder.findMany({
    where: {
      userId,
      OR: [
        { remindAt: { in: targetDates } }, // those that go off at i days
        { remindAt: { lte: today } }, // those that went off today or before
      ],
    },
  });

  const startOfTodayUTC = new Date(today);
  const endOfTodayUTC = new Date(today);
  endOfTodayUTC.setUTCHours(23, 59, 59, 999);

  const reminders = {
    overdue: remindersQuery.filter((r) => r.remindAt < startOfTodayUTC),
    today: remindersQuery.filter(
      (r) => r.remindAt >= startOfTodayUTC && r.remindAt <= endOfTodayUTC,
    ),
    upcoming: remindersQuery.filter((r) => r.remindAt > endOfTodayUTC),
  };

  const attentionCount = remindersQuery.length;

  return {
    totalTracked,
    totalActive,
    attentionCount,
    statusBreakdown,
    recentApplications,
    reminders,
  };
}
