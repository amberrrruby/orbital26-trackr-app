import { prisma } from "@/lib/prisma";
import { getDashboardData } from "@/lib/dashboard";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { env } from "@/lib/env";

const TEST_USER_ID = env.TEST_USER_ID;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function seedReminder(remindAt: Date) {
  return prisma.reminder.create({
    data: {
      type: "EVENT",
      remindAt,
      userId: TEST_USER_ID,
    },
  });
}

async function setUserReminderDays(days: number[]) {
  await prisma.user.update({
    where: { id: TEST_USER_ID },
    data: { settings: { eventReminderDays: days } },
  });
}

// ---------------------------------------------------------------------------
// Teardown
// ---------------------------------------------------------------------------

async function cleanup() {
  await prisma.reminder.deleteMany({ where: { userId: TEST_USER_ID } });
  await prisma.user.update({
    where: { id: TEST_USER_ID },
    data: {
      settings: {
        eventReminderDays: [3, 1],
        appliedFollowUpDays: 7,
        interviewFollowUpDays: 7,
        assessmentFollowUpDays: 7,
      },
    },
  });
}

beforeEach(async () => {
  await cleanup();
});

afterAll(async () => {
  await cleanup();
  await prisma.$disconnect();
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("getDashboardData", () => {
  describe("reminder partitioning", () => {
    it("partitions overdue, today, and upcoming correctly", async () => {
      const now = new Date();

      // Overdue: yesterday UTC midnight
      const yesterday = new Date(now);
      yesterday.setUTCDate(yesterday.getUTCDate() - 1);
      yesterday.setUTCHours(0, 0, 0, 0);

      // Today: today UTC midnight
      const todayMidnight = new Date(now);
      todayMidnight.setUTCHours(0, 0, 0, 0);

      // Upcoming: tomorrow UTC midnight (matches eventReminderDays: [1])
      const tomorrow = new Date(now);
      tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
      tomorrow.setUTCHours(0, 0, 0, 0);

      await seedReminder(yesterday);
      await seedReminder(todayMidnight);
      await seedReminder(tomorrow);
      await setUserReminderDays([1]);

      const seeded = await prisma.reminder.findMany({
        where: { userId: TEST_USER_ID },
      });

      const { reminders } = await getDashboardData(TEST_USER_ID);

      expect(reminders.overdue).toHaveLength(1);
      expect(reminders.today).toHaveLength(1);
      expect(reminders.upcoming).toHaveLength(1);
    });

    it("places nothing in upcoming when no reminders match targetDates", async () => {
      // eventReminderDays: [3] but no reminder seeded at today+3
      await setUserReminderDays([3]);

      const { reminders } = await getDashboardData(TEST_USER_ID);

      expect(reminders.upcoming).toHaveLength(0);
    });
  });

  describe("eventReminderDays fan-out", () => {
    it("fetches reminders at all offsets in eventReminderDays", async () => {
      const now = new Date();
      now.setUTCHours(0, 0, 0, 0);

      const plus1 = new Date(now);
      plus1.setUTCDate(plus1.getUTCDate() + 1);

      const plus3 = new Date(now);
      plus3.setUTCDate(plus3.getUTCDate() + 3);

      const plus7 = new Date(now); // not in eventReminderDays — should not appear
      plus7.setUTCDate(plus7.getUTCDate() + 7);

      await seedReminder(plus1);
      await seedReminder(plus3);
      await seedReminder(plus7);
      await setUserReminderDays([1, 3]);

      const { reminders } = await getDashboardData(TEST_USER_ID);

      expect(reminders.upcoming).toHaveLength(2);
      expect(reminders.upcoming.map((r) => r.remindAt.toISOString())).toEqual(
        expect.arrayContaining([plus1.toISOString(), plus3.toISOString()]),
      );
    });
  });
});
