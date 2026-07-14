import {
  describe,
  it,
  expect,
  vi,
  beforeAll,
  beforeEach,
  afterEach,
} from "vitest";
import {
  addManualTimelineEvent,
  createOrUpdateImportantDateTimelineEvent,
  deleteTimelineEvent,
  getTimelineEvents,
  updateManualTimelineEvent,
} from "@/app/actions/timeline";
import { prisma } from "@/lib/prisma";
import { requireUserOrRedirectLogin } from "@/lib/auth";
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
function makeFormData(fields: Record<string, string>): FormData {
  const fd = new FormData();
  Object.entries(fields).forEach(([k, v]) => fd.append(k, v));
  return fd;
}

async function seedApplication(userId: string) {
  return prisma.application.create({
    data: {
      userId,
      company: "Acme Corp",
      role: "Software Engineer",
      status: "APPLIED",
      source: "JOB_SEARCH_PLATFORM",
    },
  });
}

async function seedManualTimelineEvent(
  userId: string,
  applicationId: string,
  overrides: Partial<{
    eventDate: Date;
    description: string;
    type:
      | "MANUAL"
      | "STATUS_CHANGED"
      | "APPLICATION_CREATED"
      | "IMPORTANT_DATE";
  }> = {},
) {
  return prisma.timelineEvent.create({
    data: {
      userId,
      applicationId,
      type: overrides.type ?? "MANUAL",
      eventDate: overrides.eventDate ?? new Date(),
      description: overrides.description ?? "Test event",
    },
  });
}

function daysFromToday(offset: number): Date {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + offset);
  return d;
}

afterEach(async () => {
  await prisma.timelineEvent.deleteMany({ where: { userId: OTHER_USER_ID } });
  await prisma.application.deleteMany({ where: { userId: OTHER_USER_ID } });
  await prisma.reminder.deleteMany({ where: { userId: TEST_USER_ID } });
});

describe("Timeline Events", () => {
  describe("getTimelineEvents", () => {
    let appA: Awaited<ReturnType<typeof seedApplication>>;

    beforeAll(() => {
      mockAuth(TEST_USER_ID);
    });

    beforeEach(async () => {
      await prisma.timelineEvent.deleteMany({
        where: { userId: TEST_USER_ID },
      });
      await prisma.application.deleteMany({ where: { userId: TEST_USER_ID } });
      appA = await seedApplication(TEST_USER_ID);
    });

    it("returns all timeline events for an application belonging to the user", async () => {
      await seedManualTimelineEvent(TEST_USER_ID, appA.id, {
        description: "First",
      });
      await seedManualTimelineEvent(TEST_USER_ID, appA.id, {
        description: "Second",
      });

      const result = await getTimelineEvents(appA.id);

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value).toHaveLength(2);
      expect(result.value.every((e) => e.applicationId === appA.id)).toBe(true);
    });

    it("returns an empty array when the application has no events", async () => {
      const result = await getTimelineEvents(appA.id);

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value).toHaveLength(0);
    });

    it("does not return events belonging to another user's application", async () => {
      const appB = await seedApplication(OTHER_USER_ID);
      await seedManualTimelineEvent(OTHER_USER_ID, appB.id);

      const result = await getTimelineEvents(appB.id);

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value).toHaveLength(0);
    });

    it("returns a schema validation error on invalid applicationId", async () => {
      const result = await getTimelineEvents("not-a-cuid2");

      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.error.type).toBe("VALIDATION");
    });
  });

  describe("addManualTimelineEvent", () => {
    let appA: Awaited<ReturnType<typeof seedApplication>>;

    beforeAll(() => {
      mockAuth(TEST_USER_ID);
    });

    beforeEach(async () => {
      await prisma.timelineEvent.deleteMany({
        where: { userId: TEST_USER_ID },
      });
      await prisma.application.deleteMany({ where: { userId: TEST_USER_ID } });
      appA = await seedApplication(TEST_USER_ID);
    });

    it("creates a timeline event and returns the new id on valid input", async () => {
      const formData = makeFormData({
        applicationId: appA.id,
        eventDate: "2026-07-01",
        description: "Had a call with the recruiter",
      });

      const result = await addManualTimelineEvent(formData);

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      const created = await prisma.timelineEvent.findUnique({
        where: { id: result.value },
      });
      expect(created).not.toBeNull();
      expect(created!.userId).toBe(TEST_USER_ID);
      expect(created!.type).toBe("MANUAL");
    });

    it("returns FAILURE when the application does not belong to the user", async () => {
      const appB = await seedApplication(OTHER_USER_ID);

      const formData = makeFormData({
        applicationId: appB.id,
        eventDate: "2026-07-01",
        description: "Attempted event",
      });

      const result = await addManualTimelineEvent(formData);

      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.error.type).toBe("FAILURE");
    });

    it("returns a schema validation error on invalid input", async () => {
      const formData = makeFormData({
        applicationId: appA.id,
        eventDate: "not-a-date",
        description: "x",
      });

      const result = await addManualTimelineEvent(formData);

      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.error.type).toBe("VALIDATION");
    });
  });

  describe("updateManualTimelineEvent", () => {
    let appA: Awaited<ReturnType<typeof seedApplication>>;

    beforeAll(() => {
      mockAuth(TEST_USER_ID);
    });

    beforeEach(async () => {
      await prisma.timelineEvent.deleteMany({
        where: { userId: TEST_USER_ID },
      });
      await prisma.application.deleteMany({ where: { userId: TEST_USER_ID } });
      appA = await seedApplication(TEST_USER_ID);
    });

    it("updates the event and returns ok", async () => {
      const event = await seedManualTimelineEvent(TEST_USER_ID, appA.id, {
        description: "Original description",
      });

      const formData = makeFormData({
        id: event.id,
        applicationId: appA.id,
        eventDate: "2026-08-01",
        description: "Updated description",
      });

      const result = await updateManualTimelineEvent(formData);

      expect(result.ok).toBe(true);
      const updated = await prisma.timelineEvent.findUnique({
        where: { id: event.id },
      });
      expect(updated!.description).toBe("Updated description");
    });

    it("returns FAILURE when the event does not belong to the user", async () => {
      const appB = await seedApplication(OTHER_USER_ID);
      const event = await seedManualTimelineEvent(OTHER_USER_ID, appB.id);

      const formData = makeFormData({
        id: event.id,
        applicationId: appB.id,
        eventDate: "2026-08-01",
        description: "Attempted update",
      });

      const result = await updateManualTimelineEvent(formData);

      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.error.type).toBe("FAILURE");
    });

    it("returns FAILURE when attempting to update a non-MANUAL event", async () => {
      const event = await seedManualTimelineEvent(TEST_USER_ID, appA.id, {
        type: "STATUS_CHANGED",
        description: "Status changed to Applied",
      });

      const formData = makeFormData({
        id: event.id,
        applicationId: appA.id,
        eventDate: "2026-08-01",
        description: "Attempted update",
      });

      const result = await updateManualTimelineEvent(formData);

      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.error.type).toBe("FAILURE");
    });

    it("returns a schema validation error on invalid input", async () => {
      const event = await seedManualTimelineEvent(TEST_USER_ID, appA.id);

      const formData = makeFormData({
        id: event.id,
        applicationId: appA.id,
        eventDate: "not-a-date",
        description: "x",
      });

      const result = await updateManualTimelineEvent(formData);

      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.error.type).toBe("VALIDATION");
    });
  });

  describe("deleteTimelineEvent", () => {
    let appA: Awaited<ReturnType<typeof seedApplication>>;

    beforeAll(() => {
      mockAuth(TEST_USER_ID);
    });

    beforeEach(async () => {
      await prisma.timelineEvent.deleteMany({
        where: { userId: TEST_USER_ID },
      });
      await prisma.application.deleteMany({ where: { userId: TEST_USER_ID } });
      appA = await seedApplication(TEST_USER_ID);
    });

    it("deletes the event and returns ok", async () => {
      const event = await seedManualTimelineEvent(TEST_USER_ID, appA.id);

      const result = await deleteTimelineEvent(event.id);

      expect(result.ok).toBe(true);
      const deleted = await prisma.timelineEvent.findUnique({
        where: { id: event.id },
      });
      expect(deleted).toBeNull();
    });

    it("returns FAILURE when the event does not belong to the user", async () => {
      const appB = await seedApplication(OTHER_USER_ID);
      const event = await seedManualTimelineEvent(OTHER_USER_ID, appB.id);

      const result = await deleteTimelineEvent(event.id);

      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.error.type).toBe("FAILURE");
      const stillExists = await prisma.timelineEvent.findUnique({
        where: { id: event.id },
      });
      expect(stillExists).not.toBeNull();
    });

    it("deletes a non-MANUAL event belonging to the user", async () => {
      const event = await seedManualTimelineEvent(TEST_USER_ID, appA.id, {
        type: "APPLICATION_CREATED",
        description: "Application created",
      });

      // Auto-generated timeline events are now allowed to be deleted
      // This supports cleanup of noisy generated events
      // For example, repeated status changes created while testing Kanban drag-and-drop
      const result = await deleteTimelineEvent(event.id);

      expect(result.ok).toBe(true);
      const deleted = await prisma.timelineEvent.findUnique({
        where: { id: event.id },
      });

      expect(deleted).toBeNull();
    });
  });

  describe("createOrUpdateImportantDateTimelineEvent", () => {
    let appA: Awaited<ReturnType<typeof seedApplication>>;

    beforeAll(() => {
      mockAuth(TEST_USER_ID);
    });

    beforeEach(async () => {
      await prisma.reminder.deleteMany({ where: { userId: TEST_USER_ID } });
      await prisma.timelineEvent.deleteMany({
        where: { userId: TEST_USER_ID },
      });
      await prisma.application.deleteMany({ where: { userId: TEST_USER_ID } });
      appA = await seedApplication(TEST_USER_ID);
    });

    describe("timeline event", () => {
      it("creates a new IMPORTANT_DATE event when none exists", async () => {
        const eventDate = daysFromToday(7);

        await createOrUpdateImportantDateTimelineEvent({
          applicationId: appA.id,
          userId: TEST_USER_ID,
          sourceKey: "INTERVIEW_DATE",
          eventDate,
          currentStatus: "INTERVIEW",
        });

        const event = await prisma.timelineEvent.findFirst({
          where: {
            applicationId: appA.id,
            userId: TEST_USER_ID,
            type: "IMPORTANT_DATE",
            sourceKey: "INTERVIEW_DATE",
          },
        });
        expect(event).not.toBeNull();
        expect(event!.eventDate.getTime()).toBe(eventDate.getTime());
      });

      it("updates the existing event when the date changes", async () => {
        const original = daysFromToday(7);
        const updated = daysFromToday(14);

        await createOrUpdateImportantDateTimelineEvent({
          applicationId: appA.id,
          userId: TEST_USER_ID,
          sourceKey: "INTERVIEW_DATE",
          eventDate: original,
          currentStatus: "INTERVIEW",
        });

        await createOrUpdateImportantDateTimelineEvent({
          applicationId: appA.id,
          userId: TEST_USER_ID,
          sourceKey: "INTERVIEW_DATE",
          eventDate: updated,
          currentStatus: "INTERVIEW",
        });

        const events = await prisma.timelineEvent.findMany({
          where: {
            applicationId: appA.id,
            userId: TEST_USER_ID,
            type: "IMPORTANT_DATE",
            sourceKey: "INTERVIEW_DATE",
          },
        });
        expect(events).toHaveLength(1);
        expect(events[0].eventDate.getTime()).toBe(updated.getTime());
      });

      it("skips the timeline update when the date is unchanged", async () => {
        const eventDate = daysFromToday(7);

        await createOrUpdateImportantDateTimelineEvent({
          applicationId: appA.id,
          userId: TEST_USER_ID,
          sourceKey: "INTERVIEW_DATE",
          eventDate,
          currentStatus: "INTERVIEW",
        });

        const before = await prisma.timelineEvent.findFirst({
          where: {
            applicationId: appA.id,
            type: "IMPORTANT_DATE",
            sourceKey: "INTERVIEW_DATE",
          },
        });

        await createOrUpdateImportantDateTimelineEvent({
          applicationId: appA.id,
          userId: TEST_USER_ID,
          sourceKey: "INTERVIEW_DATE",
          eventDate,
          currentStatus: "INTERVIEW",
        });

        const after = await prisma.timelineEvent.findFirst({
          where: {
            applicationId: appA.id,
            type: "IMPORTANT_DATE",
            sourceKey: "INTERVIEW_DATE",
          },
        });

        expect(after!.updatedAt.getTime()).toBe(before!.updatedAt.getTime());
      });
    });

    describe("EVENT reminder", () => {
      it("creates an EVENT reminder for OA_ASSESSMENT_DATE", async () => {
        const eventDate = daysFromToday(7);

        await createOrUpdateImportantDateTimelineEvent({
          applicationId: appA.id,
          userId: TEST_USER_ID,
          sourceKey: "OA_ASSESSMENT_DATE",
          eventDate,
          currentStatus: "OA_ASSESSMENT",
        });

        const reminder = await prisma.reminder.findFirst({
          where: {
            applicationId: appA.id,
            userId: TEST_USER_ID,
            type: "EVENT",
            source: "OA_ASSESSMENT_DATE",
          },
        });
        expect(reminder).not.toBeNull();
        expect(reminder!.remindAt.getTime()).toBe(eventDate.getTime());
      });

      it("creates an EVENT reminder for INTERVIEW_DATE", async () => {
        const eventDate = daysFromToday(7);

        await createOrUpdateImportantDateTimelineEvent({
          applicationId: appA.id,
          userId: TEST_USER_ID,
          sourceKey: "INTERVIEW_DATE",
          eventDate,
          currentStatus: "INTERVIEW",
        });

        const reminder = await prisma.reminder.findFirst({
          where: {
            applicationId: appA.id,
            userId: TEST_USER_ID,
            type: "EVENT",
            source: "INTERVIEW_DATE",
          },
        });
        expect(reminder).not.toBeNull();
        expect(reminder!.remindAt.getTime()).toBe(eventDate.getTime());
      });

      it("creates an EVENT reminder for OFFER_EXPIRY_DATE", async () => {
        const eventDate = daysFromToday(7);

        await createOrUpdateImportantDateTimelineEvent({
          applicationId: appA.id,
          userId: TEST_USER_ID,
          sourceKey: "OFFER_EXPIRY_DATE",
          eventDate,
          currentStatus: "OFFER",
        });

        const reminder = await prisma.reminder.findFirst({
          where: {
            applicationId: appA.id,
            userId: TEST_USER_ID,
            type: "EVENT",
            source: "OFFER_EXPIRY_DATE",
          },
        });
        expect(reminder).not.toBeNull();
        expect(reminder!.remindAt.getTime()).toBe(eventDate.getTime());
      });

      it("does not create an EVENT reminder for DATE_APPLIED", async () => {
        await createOrUpdateImportantDateTimelineEvent({
          applicationId: appA.id,
          userId: TEST_USER_ID,
          sourceKey: "DATE_APPLIED",
          eventDate: daysFromToday(0),
          currentStatus: "APPLIED",
        });

        const reminder = await prisma.reminder.findFirst({
          where: {
            applicationId: appA.id,
            userId: TEST_USER_ID,
            type: "EVENT",
            source: "DATE_APPLIED",
          },
        });
        expect(reminder).toBeNull();
      });

      it("updates the existing EVENT reminder when called again with a new date", async () => {
        const original = daysFromToday(7);
        const updated = daysFromToday(14);

        await createOrUpdateImportantDateTimelineEvent({
          applicationId: appA.id,
          userId: TEST_USER_ID,
          sourceKey: "INTERVIEW_DATE",
          eventDate: original,
          currentStatus: "INTERVIEW",
        });

        await createOrUpdateImportantDateTimelineEvent({
          applicationId: appA.id,
          userId: TEST_USER_ID,
          sourceKey: "INTERVIEW_DATE",
          eventDate: updated,
          currentStatus: "INTERVIEW",
        });

        const reminders = await prisma.reminder.findMany({
          where: {
            applicationId: appA.id,
            userId: TEST_USER_ID,
            type: "EVENT",
            source: "INTERVIEW_DATE",
          },
        });
        expect(reminders).toHaveLength(1);
        expect(reminders[0].remindAt.getTime()).toBe(updated.getTime());
      });
    });

    describe("FOLLOW_UP reminder", () => {
      it("creates a FOLLOW_UP reminder when follow-up date is in the future", async () => {
        const eventDate = daysFromToday(0); // today, so follow-up is 7 days out

        await createOrUpdateImportantDateTimelineEvent({
          applicationId: appA.id,
          userId: TEST_USER_ID,
          sourceKey: "INTERVIEW_DATE",
          eventDate,
          currentStatus: "INTERVIEW",
        });

        const reminder = await prisma.reminder.findFirst({
          where: {
            applicationId: appA.id,
            userId: TEST_USER_ID,
            type: "FOLLOW_UP",
            source: "INTERVIEW_DATE",
          },
        });
        expect(reminder).not.toBeNull();
        const expectedFollowUp = daysFromToday(7);
        expect(reminder!.remindAt.getTime()).toBe(expectedFollowUp.getTime());
      });

      it("skips the FOLLOW_UP reminder when overdue and status has moved past the relevant stage", async () => {
        const eventDate = daysFromToday(-14); // 14 days ago, follow-up is 7 days overdue

        await createOrUpdateImportantDateTimelineEvent({
          applicationId: appA.id,
          userId: TEST_USER_ID,
          sourceKey: "INTERVIEW_DATE",
          eventDate,
          currentStatus: "OFFER", // moved past INTERVIEW
        });

        const reminder = await prisma.reminder.findFirst({
          where: {
            applicationId: appA.id,
            userId: TEST_USER_ID,
            type: "FOLLOW_UP",
            source: "INTERVIEW_DATE",
          },
        });
        expect(reminder).toBeNull();
      });

      it("creates the FOLLOW_UP reminder when overdue but status is still relevant", async () => {
        const eventDate = daysFromToday(-14); // 14 days ago, follow-up is 7 days overdue

        await createOrUpdateImportantDateTimelineEvent({
          applicationId: appA.id,
          userId: TEST_USER_ID,
          sourceKey: "INTERVIEW_DATE",
          eventDate,
          currentStatus: "INTERVIEW", // still in the relevant stage
        });

        const reminder = await prisma.reminder.findFirst({
          where: {
            applicationId: appA.id,
            userId: TEST_USER_ID,
            type: "FOLLOW_UP",
            source: "INTERVIEW_DATE",
          },
        });
        expect(reminder).not.toBeNull();
      });

      it("does not create a FOLLOW_UP reminder for OFFER_EXPIRY_DATE", async () => {
        await createOrUpdateImportantDateTimelineEvent({
          applicationId: appA.id,
          userId: TEST_USER_ID,
          sourceKey: "OFFER_EXPIRY_DATE",
          eventDate: daysFromToday(7),
          currentStatus: "OFFER",
        });

        const reminder = await prisma.reminder.findFirst({
          where: {
            applicationId: appA.id,
            userId: TEST_USER_ID,
            type: "FOLLOW_UP",
            source: "OFFER_EXPIRY_DATE",
          },
        });
        expect(reminder).toBeNull();
      });

      it("updates the existing FOLLOW_UP reminder when called again with a new date", async () => {
        const original = daysFromToday(0);
        const updated = daysFromToday(7);

        await createOrUpdateImportantDateTimelineEvent({
          applicationId: appA.id,
          userId: TEST_USER_ID,
          sourceKey: "INTERVIEW_DATE",
          eventDate: original,
          currentStatus: "INTERVIEW",
        });

        await createOrUpdateImportantDateTimelineEvent({
          applicationId: appA.id,
          userId: TEST_USER_ID,
          sourceKey: "INTERVIEW_DATE",
          eventDate: updated,
          currentStatus: "INTERVIEW",
        });

        const reminders = await prisma.reminder.findMany({
          where: {
            applicationId: appA.id,
            userId: TEST_USER_ID,
            type: "FOLLOW_UP",
            source: "INTERVIEW_DATE",
          },
        });
        expect(reminders).toHaveLength(1);
        const expectedFollowUp = daysFromToday(14); // updated + 7 days offset
        expect(reminders[0].remindAt.getTime()).toBe(
          expectedFollowUp.getTime(),
        );
      });
    });
  });
});
