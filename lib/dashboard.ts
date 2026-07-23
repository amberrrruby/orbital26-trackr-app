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

  const startOfTodayUTC = new Date(today);
  const endOfTodayUTC = new Date(today);
  endOfTodayUTC.setUTCHours(23, 59, 59, 999);

  const targetDates = eventReminderDays.map((days) => {
    const d = new Date(today);
    d.setUTCDate(d.getDate() + days);
    return d;
  });

  const remindersQuery = await prisma.reminder.findMany({
    where: {
      userId,
      OR: [
        // show all reminders once they are due or overdue
        // including system-generated follow-up reminders
        {
          remindAt: {
            lte: endOfTodayUTC,
          },
        },
        // upcoming alerts: EVENT reminders, manually created FOLLOW_UP reminders
        // system-generated FOLLOW_UP reminders remain hidden until their calculated due date
        // similar to Reminders page
        {
          remindAt: {
            in: targetDates,
            gt: endOfTodayUTC,
          },
          OR: [
            {
              type: "EVENT",
            },
            {
              type: "FOLLOW_UP",
              source: null,
            },
          ],
        },
      ],
    },
    include: { application: true },
  });

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
