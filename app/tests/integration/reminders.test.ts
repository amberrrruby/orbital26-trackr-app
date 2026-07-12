import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { requireUserOrRedirectLogin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  addReminder,
  deleteReminder,
  getReminders,
  updateReminder,
} from "@/app/actions/reminders";
import { SourceKey } from "@/lib/generated/enums";
import { env } from "@/lib/env";

// --- Mocks ---
vi.mock("@/lib/auth", () => ({
  requireUserOrRedirectLogin: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

// --- Helpers ---

const TEST_USER_ID = env.TEST_USER_ID;
const OTHER_USER_ID = "00000000-0000-0000-0000-000000000000";

function mockAuth(userId: string) {
  vi.mocked(requireUserOrRedirectLogin).mockResolvedValue(userId);
}

// ISO date string offset from today
function daysFromToday(offset: number): Date {
  const d = new Date();
  d.setHours(12, 0, 0, 0); // noon to avoid timezone boundary issues
  d.setDate(d.getDate() + offset);
  return d;
}

async function seedReminder(
  userId: string,
  overrides: Partial<{
    remindAt: Date;
    type: "EVENT" | "FOLLOW_UP";
    source: SourceKey | null;
    content: string;
  }> = {},
) {
  return prisma.reminder.create({
    data: {
      userId,
      type: overrides.type ?? "EVENT",
      remindAt: overrides.remindAt ?? daysFromToday(1),
      source: overrides.source ?? null,
      content: overrides.content ?? "Test reminder",
    },
    include: { application: true },
  });
}

function makeFormData(fields: Record<string, string>): FormData {
  const fd = new FormData();
  Object.entries(fields).forEach(([k, v]) => fd.append(k, v));
  return fd;
}

afterEach(async () => {
  await prisma.reminder.deleteMany({ where: { userId: TEST_USER_ID } });
  await prisma.reminder.deleteMany({ where: { userId: OTHER_USER_ID } });
});

// --- Tests ---

describe("Reminders", () => {
  describe("getReminders", () => {
    beforeEach(async () => {
      mockAuth(TEST_USER_ID);
      await prisma.reminder.deleteMany({ where: { userId: TEST_USER_ID } });
    });

    describe("group filtering", () => {
      it("returns only today's reminders when group is 'today'", async () => {
        const today = await seedReminder(TEST_USER_ID, {
          remindAt: daysFromToday(0),
        });
        await seedReminder(TEST_USER_ID, { remindAt: daysFromToday(1) });
        await seedReminder(TEST_USER_ID, { remindAt: daysFromToday(-1) });

        const result = await getReminders(0, 10, "today");

        expect(result.ok).toBe(true);
        if (!result.ok) return;
        expect(result.value.reminders.map((r) => r.id)).toEqual([today.id]);
      });

      it("returns only overdue reminders when group is 'overdue'", async () => {
        const overdue = await seedReminder(TEST_USER_ID, {
          remindAt: daysFromToday(-1),
        });
        await seedReminder(TEST_USER_ID, { remindAt: daysFromToday(0) });
        await seedReminder(TEST_USER_ID, { remindAt: daysFromToday(1) });

        const result = await getReminders(0, 10, "overdue");

        expect(result.ok).toBe(true);
        if (!result.ok) return;
        expect(result.value.reminders.map((r) => r.id)).toEqual([overdue.id]);
      });

      it("returns all reminders regardless of date when group is 'all'", async () => {
        await Promise.all([
          seedReminder(TEST_USER_ID, { remindAt: daysFromToday(-1) }),
          seedReminder(TEST_USER_ID, { remindAt: daysFromToday(0) }),
          seedReminder(TEST_USER_ID, { remindAt: daysFromToday(1) }),
        ]);

        const result = await getReminders(0, 10, "all");

        expect(result.ok).toBe(true);
        if (!result.ok) return;
        expect(result.value.reminders).toHaveLength(3);
        expect(result.value.totalCount).toBe(3);
      });
    });

    describe("upcoming visibility filter", () => {
      it("excludes system-generated FOLLOW_UP reminders from 'upcoming'", async () => {
        await seedReminder(TEST_USER_ID, {
          remindAt: daysFromToday(1),
          type: "FOLLOW_UP",
          source: "INTERVIEW_DATE",
        });

        const result = await getReminders(0, 10, "upcoming");

        expect(result.ok).toBe(true);
        if (!result.ok) return;
        expect(result.value.reminders).toHaveLength(0);
      });

      it("includes custom FOLLOW_UP reminders (source: null) in 'upcoming'", async () => {
        const custom = await seedReminder(TEST_USER_ID, {
          remindAt: daysFromToday(1),
          type: "FOLLOW_UP",
          source: null,
        });

        const result = await getReminders(0, 10, "upcoming");

        expect(result.ok).toBe(true);
        if (!result.ok) return;
        expect(result.value.reminders.map((r) => r.id)).toContain(custom.id);
      });

      it("includes EVENT reminders in 'upcoming'", async () => {
        const event = await seedReminder(TEST_USER_ID, {
          remindAt: daysFromToday(1),
          type: "EVENT",
        });

        const result = await getReminders(0, 10, "upcoming");

        expect(result.ok).toBe(true);
        if (!result.ok) return;
        expect(result.value.reminders.map((r) => r.id)).toContain(event.id);
      });
    });

    describe("user isolation", () => {
      it("does not return reminders belonging to another user", async () => {
        await seedReminder(OTHER_USER_ID, { remindAt: daysFromToday(0) });
        await seedReminder(TEST_USER_ID, { remindAt: daysFromToday(0) });

        const result = await getReminders(0, 10, "all");

        expect(result.ok).toBe(true);
        if (!result.ok) return;
        expect(result.value.reminders).toHaveLength(1);
        expect(result.value.reminders[0].userId).toBe(TEST_USER_ID);
      });
    });

    describe("pagination", () => {
      it("respects pageSize and pageNumber and returns correct totalCount", async () => {
        await Promise.all(
          Array.from([1, 2, 3, 4, 5], (_, i) =>
            seedReminder(TEST_USER_ID, { remindAt: daysFromToday(i + 1) }),
          ),
        );

        const result = await getReminders(1, 2, "upcoming");

        expect(result.ok).toBe(true);
        if (!result.ok) return;
        expect(result.value.reminders).toHaveLength(2);
        expect(result.value.totalCount).toBe(5);
      });
    });

    describe("schema validation", () => {
      it("returns a schema validation error on invalid params", async () => {
        // @ts-expect-error intentionally invalid
        const result = await getReminders(0, 10, "invalid-group");

        expect(result.ok).toBe(false);
        if (result.ok) return;
        expect(result.error.type).toBe("VALIDATION");
      });
    });
  });

  describe("addReminder", () => {
    beforeEach(async () => {
      mockAuth(TEST_USER_ID);
      await prisma.reminder.deleteMany({ where: { userId: TEST_USER_ID } });
    });

    it("creates a reminder and returns the new id on valid input", async () => {
      const formData = makeFormData({
        reminderType: "EVENT",
        remindAt: "2026-07-01",
        source: "",
        content: "Follow up with recruiter",
      });

      const result = await addReminder(formData);

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      const created = await prisma.reminder.findUnique({
        where: { id: result.value },
      });
      expect(created).not.toBeNull();
      expect(created!.userId).toBe(TEST_USER_ID);
    });

    it("creates a reminder without an applicationId when omitted", async () => {
      const formData = makeFormData({
        reminderType: "EVENT",
        remindAt: "2026-07-01",
        source: "",
        content: "Standalone reminder",
      });

      const result = await addReminder(formData);

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      const created = await prisma.reminder.findUnique({
        where: { id: result.value },
      });
      expect(created!.applicationId).toBeNull();
    });

    it("returns a schema validation error on invalid input", async () => {
      const formData = makeFormData({
        reminderType: "EVENT",
        remindAt: "not-a-date",
        source: "",
        content: "x",
      });

      const result = await addReminder(formData);

      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.error.type).toBe("VALIDATION");
    });
  });

  describe("updateReminder", () => {
    beforeEach(async () => {
      mockAuth(TEST_USER_ID);
      await prisma.reminder.deleteMany({ where: { userId: TEST_USER_ID } });
    });

    it("updates the reminder and returns ok", async () => {
      const reminder = await seedReminder(TEST_USER_ID, {
        remindAt: daysFromToday(1),
        content: "Original content",
      });

      const formData = makeFormData({
        reminderType: "EVENT",
        remindAt: "2026-08-01",
        source: "",
        content: "Updated content",
      });

      const result = await updateReminder(reminder.id, formData);

      expect(result.ok).toBe(true);
      const updated = await prisma.reminder.findUnique({
        where: { id: reminder.id },
      });
      expect(updated!.content).toBe("Updated content");
      expect(updated!.remindAt).toEqual(new Date("2026-08-01"));
    });

    it("returns FAILURE when reminder does not belong to the user", async () => {
      const reminder = await seedReminder(OTHER_USER_ID, {
        remindAt: daysFromToday(1),
      });

      const formData = makeFormData({
        reminderType: "EVENT",
        remindAt: "2026-08-01",
        source: "",
        content: "Attempted update",
      });

      const result = await updateReminder(reminder.id, formData);

      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.error.type).toBe("FAILURE");
    });

    it("returns a schema validation error on invalid input", async () => {
      const reminder = await seedReminder(TEST_USER_ID, {
        remindAt: daysFromToday(1),
      });

      const formData = makeFormData({
        reminderType: "INVALID_TYPE",
        remindAt: "2026-08-01",
        source: "",
        content: "x",
      });

      const result = await updateReminder(reminder.id, formData);

      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.error.type).toBe("VALIDATION");
    });
  });

  describe("deleteReminder", () => {
    beforeEach(async () => {
      mockAuth(TEST_USER_ID);
      await prisma.reminder.deleteMany({ where: { userId: TEST_USER_ID } });
    });

    it("deletes the reminder and returns ok", async () => {
      const reminder = await seedReminder(TEST_USER_ID, {
        remindAt: daysFromToday(1),
      });

      const result = await deleteReminder(reminder.id);

      expect(result.ok).toBe(true);
      const deleted = await prisma.reminder.findUnique({
        where: { id: reminder.id },
      });
      expect(deleted).toBeNull();
    });

    it("returns FAILURE when reminder does not belong to the user", async () => {
      const reminder = await seedReminder(OTHER_USER_ID, {
        remindAt: daysFromToday(1),
      });

      const result = await deleteReminder(reminder.id);

      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.error.type).toBe("FAILURE");
      const stillExists = await prisma.reminder.findUnique({
        where: { id: reminder.id },
      });
      expect(stillExists).not.toBeNull();
    });
  });
});
