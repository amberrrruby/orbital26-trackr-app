import { prisma } from "@/lib/prisma";
import { getAnalyticsData } from "@/lib/analytics";
import { Status } from "@/lib/types";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { Source } from "@/lib/generated/enums";
import { env } from "@/lib/env";

// ---------------------------------------------------------------------------
// Seed helpers
// ---------------------------------------------------------------------------

const TEST_USER_ID = env.TEST_USER_ID;
const OTHER_USER_ID = "00000000-0000-0000-0000-000000000000";

async function seedApp(overrides: {
  status: string;
  source: Source;
  resumeId?: string;
  dateApplied?: Date;
}) {
  return prisma.application.create({
    data: {
      company: "Test Co",
      role: "Engineer",
      userId: TEST_USER_ID,
      status: overrides.status as Status,
      source: overrides.source,
      resumeId: overrides.resumeId,
      dateApplied: overrides.dateApplied,
    },
  });
}

async function seedStatusChange(
  applicationId: string,
  status: string,
  eventDate: Date,
) {
  return prisma.timelineEvent.create({
    data: {
      type: "STATUS_CHANGED",
      status: status as Status,
      eventDate,
      description: `Status changed to ${status}`,
      applicationId,
      userId: TEST_USER_ID,
    },
  });
}

// ---------------------------------------------------------------------------
// Teardown — delete only records owned by the test user
// ---------------------------------------------------------------------------

async function cleanup() {
  await prisma.timelineEvent.deleteMany({ where: { userId: TEST_USER_ID } });
  await prisma.application.deleteMany({ where: { userId: TEST_USER_ID } });
  await prisma.resume.deleteMany({ where: { userId: TEST_USER_ID } });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

beforeEach(async () => {
  await cleanup();
});

afterAll(async () => {
  await cleanup();
  await prisma.$disconnect();
});

describe("getAnalyticsData", () => {
  // -------------------------------------------------------------------------
  describe("funnelMetrics - submitted", () => {
    it("counts apps with status != WISHLIST", async () => {
      await seedApp({ status: "APPLIED", source: "JOB_SEARCH_PLATFORM" });
      await seedApp({ status: "INTERVIEW", source: "JOB_SEARCH_PLATFORM" });
      await seedApp({ status: "WISHLIST", source: "JOB_SEARCH_PLATFORM" }); // should not count

      const { funnelMetrics } = await getAnalyticsData(TEST_USER_ID);
      expect(funnelMetrics.submitted).toBe(2);
    });
  });

  // -------------------------------------------------------------------------
  describe("funnelMetrics - progressedBeyondApplied", () => {
    it("counts apps with OA / Interview / Offer timeline event", async () => {
      const app = await seedApp({
        status: "REJECTED",
        source: "JOB_SEARCH_PLATFORM",
      });
      await seedStatusChange(app.id, "APPLIED", new Date("2026-07-09"));
      await seedStatusChange(app.id, "INTERVIEW", new Date("2026-07-09"));

      const { funnelMetrics } = await getAnalyticsData(TEST_USER_ID);
      expect(funnelMetrics.progressedBeyondApplied).toBe(1);
    });

    it("does not count APPLIED -> REJECTED (no OA / Interview / Offer event)", async () => {
      const app = await seedApp({
        status: "REJECTED",
        source: "JOB_SEARCH_PLATFORM",
      });
      await seedStatusChange(app.id, "APPLIED", new Date("2026-07-09"));
      await seedStatusChange(app.id, "REJECTED", new Date("2026-07-10"));

      const { funnelMetrics } = await getAnalyticsData(TEST_USER_ID);
      expect(funnelMetrics.progressedBeyondApplied).toBe(0);
    });
  });

  // -------------------------------------------------------------------------
  describe("funnelMetrics - fallback for apps with no timeline events", () => {
    it("app created directly at INTERVIEW counts in reachedInterview", async () => {
      // No timeline events seeded — only current status
      await seedApp({ status: "INTERVIEW", source: "JOB_SEARCH_PLATFORM" });

      const { funnelMetrics } = await getAnalyticsData(TEST_USER_ID);
      expect(funnelMetrics.submitted).toBe(1);
      expect(funnelMetrics.progressedBeyondApplied).toBe(1);
      expect(funnelMetrics.reachedInterview).toBe(1);
      expect(funnelMetrics.reachedOffer).toBe(0);
    });

    it("app created directly at OFFER counts in reachedOffer", async () => {
      await seedApp({ status: "OFFER", source: "JOB_SEARCH_PLATFORM" });

      const { funnelMetrics } = await getAnalyticsData(TEST_USER_ID);
      expect(funnelMetrics.reachedOffer).toBe(1);
    });
  });

  // -------------------------------------------------------------------------
  describe("conversionMetrics", () => {
    it("returns null when denominator is zero", async () => {
      // No apps at all
      const { conversionMetrics } = await getAnalyticsData(TEST_USER_ID);
      expect(conversionMetrics.oaToInterview).toBeNull();
      expect(conversionMetrics.interviewToOffer).toBeNull();
    });

    it("oaToInterview: only counts Interview after OA (ordered)", async () => {
      // App 1: OA then Interview (should count)
      const app1 = await seedApp({
        status: "INTERVIEW",
        source: "JOB_SEARCH_PLATFORM",
      });
      await seedStatusChange(app1.id, "OA_ASSESSMENT", new Date("2026-07-09"));
      await seedStatusChange(app1.id, "INTERVIEW", new Date("2026-07-19"));

      // App 2: Interview then OA (should not count)
      const app2 = await seedApp({
        status: "OA_ASSESSMENT",
        source: "JOB_SEARCH_PLATFORM",
      });
      await seedStatusChange(app2.id, "INTERVIEW", new Date("2026-07-09"));
      await seedStatusChange(app2.id, "OA_ASSESSMENT", new Date("2026-07-19"));

      const { conversionMetrics } = await getAnalyticsData(TEST_USER_ID);
      // 1 out of 2 apps that reached OA
      expect(conversionMetrics.oaToInterview).toBeCloseTo(50.0);
    });

    it("interviewToOffer: no ordering constraint", async () => {
      // App: Interview -> OA -> Offer (non-standard order)
      const app = await seedApp({
        status: "OFFER",
        source: "JOB_SEARCH_PLATFORM",
      });
      await seedStatusChange(app.id, "INTERVIEW", new Date("2026-07-09"));
      await seedStatusChange(app.id, "OA_ASSESSMENT", new Date("2026-07-10"));
      await seedStatusChange(app.id, "OFFER", new Date("2026-07-19"));

      const { conversionMetrics } = await getAnalyticsData(TEST_USER_ID);
      expect(conversionMetrics.interviewToOffer).toBeCloseTo(100.0);
    });
  });

  // -------------------------------------------------------------------------
  describe("rejectionRate", () => {
    it("computes rejected / submitted", async () => {
      await seedApp({ status: "REJECTED", source: "JOB_SEARCH_PLATFORM" });
      await seedApp({ status: "REJECTED", source: "JOB_SEARCH_PLATFORM" });
      await seedApp({ status: "APPLIED", source: "JOB_SEARCH_PLATFORM" });

      const { rejectionRate } = await getAnalyticsData(TEST_USER_ID);
      expect(rejectionRate).toBeCloseTo((2 / 3) * 100);
    });

    it("returns null when submitted is zero", async () => {
      const { rejectionRate } = await getAnalyticsData(TEST_USER_ID);
      expect(rejectionRate).toBeNull();
    });
  });

  // -------------------------------------------------------------------------
  describe("sourceBreakdown + bestPerformingSource", () => {
    // it("NULL source bucketed as Unknown", async () => {
    //   await seedApp({ status: "APPLIED", source: undefined });

    //   const { sourceBreakdown } = await getAnalyticsData(TEST_USER_ID);
    //   expect(sourceBreakdown.some(r => r.source === "Unknown")).toBe(true);
    // });

    it("bestPerformingSource is the highest-rate source", async () => {
      // LinkedIn: 1 progressed out of 1
      const app1 = await seedApp({
        status: "INTERVIEW",
        source: "JOB_SEARCH_PLATFORM",
      });
      await seedStatusChange(app1.id, "INTERVIEW", new Date("2026-07-09"));

      // Indeed: 0 progressed out of 1
      await seedApp({ status: "APPLIED", source: "COMPANY_WEBSITE" });

      const { bestPerformingSource } = await getAnalyticsData(TEST_USER_ID);
      expect(bestPerformingSource?.source).toBe("Job Search Platform");
    });
  });

  // -------------------------------------------------------------------------
  describe("trend", () => {
    it("always returns 5 buckets (including zero-count weeks)", async () => {
      // No applications seeded
      const { trend } = await getAnalyticsData(TEST_USER_ID);
      expect(trend).toHaveLength(5);
      trend.forEach((r) => expect(r.count).toBe(0));
    });

    it("falls back to createdAt when dateApplied is null", async () => {
      // dateApplied omitted - should still appear in trend via createdAt
      await seedApp({ status: "APPLIED", source: "JOB_SEARCH_PLATFORM" }); // dateApplied defaults to undefined

      const { trend } = await getAnalyticsData(TEST_USER_ID);
      const total = trend.reduce((sum, r) => sum + r.count, 0);
      expect(total).toBe(1);
    });
  });

  describe("resume response rate", () => {
    it("returns at most 5 resumes ordered by response rate descending", async () => {
      // seed 6 resumes, only the first has a progressed application
      for (let i = 0; i < 6; i++) {
        const resume = await prisma.resume.create({
          data: {
            title: `Resume ${i}`,
            filePath: `/path/${i}`,
            fileType: "pdf",
            thumbnailPath: `/thumb/${i}`,
            thumbnailStatus: "ready",
            userId: TEST_USER_ID,
          },
        });
        const app = await seedApp({
          status: i === 0 ? "INTERVIEW" : "APPLIED",
          resumeId: resume.id,
          source: "JOB_SEARCH_PLATFORM",
        });
        if (i === 0) {
          await seedStatusChange(app.id, "INTERVIEW", new Date("2026-07-09"));
        }
      }

      const { resumeResponseRate } = await getAnalyticsData(TEST_USER_ID);
      expect(resumeResponseRate.length).toBeLessThanOrEqual(5);
      expect(resumeResponseRate[0].title).toBe("Resume 0");
    });

    it("returns correct applicationCount and responseRate", async () => {
      const resume = await prisma.resume.create({
        data: {
          title: "Test Resume",
          filePath: "/path/test",
          fileType: "pdf",
          thumbnailPath: "/thumb/test",
          thumbnailStatus: "ready",
          userId: TEST_USER_ID,
        },
      });

      // 1 progressed
      const progressed = await seedApp({
        status: "INTERVIEW",
        source: "JOB_SEARCH_PLATFORM",
        resumeId: resume.id,
      });
      await seedStatusChange(
        progressed.id,
        "INTERVIEW",
        new Date("2026-07-01"),
      );

      // 2 not progressed
      await seedApp({
        status: "APPLIED",
        source: "JOB_SEARCH_PLATFORM",
        resumeId: resume.id,
      });
      await seedApp({
        status: "APPLIED",
        source: "JOB_SEARCH_PLATFORM",
        resumeId: resume.id,
      });

      const { resumeResponseRate } = await getAnalyticsData(TEST_USER_ID);
      const row = resumeResponseRate.find((r) => r.title === "Test Resume");

      expect(row).toBeDefined();
      expect(Number(row!.applicationCount)).toBe(3);
      expect(row!.responseRate).toBeCloseTo((1 / 3) * 100); // converted to percentage
    });
  });

  describe("bestPerformingResume", () => {
    it("returns the resume with the highest response rate", async () => {
      const resume1 = await prisma.resume.create({
        data: {
          title: "Strong Resume",
          filePath: "/path/1",
          fileType: "pdf",
          thumbnailPath: "/thumb/1",
          thumbnailStatus: "ready",
          userId: TEST_USER_ID,
        },
      });
      const resume2 = await prisma.resume.create({
        data: {
          title: "Weak Resume",
          filePath: "/path/2",
          fileType: "pdf",
          thumbnailPath: "/thumb/2",
          thumbnailStatus: "ready",
          userId: TEST_USER_ID,
        },
      });

      // resume1: 1 progressed out of 1
      const app1 = await seedApp({
        status: "INTERVIEW",
        source: "JOB_SEARCH_PLATFORM",
        resumeId: resume1.id,
      });
      await seedStatusChange(app1.id, "INTERVIEW", new Date("2026-07-01"));

      // resume2: 0 progressed out of 1
      await seedApp({
        status: "APPLIED",
        source: "JOB_SEARCH_PLATFORM",
        resumeId: resume2.id,
      });

      const { bestPerformingResume } = await getAnalyticsData(TEST_USER_ID);
      expect(bestPerformingResume?.title).toBe("Strong Resume");
      expect(bestPerformingResume?.rate).toBeCloseTo(100.0);
    });

    it("returns null when no resumes exist", async () => {
      const { bestPerformingResume } = await getAnalyticsData(TEST_USER_ID);
      expect(bestPerformingResume).toBeNull();
    });
  });

  describe("biggestDropOffStage", () => {
    it("returns the key with the lowest conversion rate", async () => {
      // submittedToProgressed: 1/4 = 0.25  <-- biggest drop-off
      // oaToInterview: 1/1 = 1.0
      // interviewToOffer: 1/1 = 1.0
      for (let i = 0; i < 3; i++) {
        await seedApp({ status: "APPLIED", source: "JOB_SEARCH_PLATFORM" });
      }
      const app = await seedApp({
        status: "OFFER",
        source: "JOB_SEARCH_PLATFORM",
      });
      await seedStatusChange(app.id, "OA_ASSESSMENT", new Date("2026-07-01"));
      await seedStatusChange(app.id, "INTERVIEW", new Date("2026-07-05"));
      await seedStatusChange(app.id, "OFFER", new Date("2026-07-09"));

      const { biggestDropOffStage } = await getAnalyticsData(TEST_USER_ID);
      expect(biggestDropOffStage).toBe("submittedToProgressed");
    });

    it("returns null when all conversion metrics are null", async () => {
      const { biggestDropOffStage } = await getAnalyticsData(TEST_USER_ID);
      expect(biggestDropOffStage).toBeNull();
    });
  });

  describe("conversionMetrics - submittedToProgressed", () => {
    it("computes progressed / submitted", async () => {
      const app = await seedApp({
        status: "INTERVIEW",
        source: "JOB_SEARCH_PLATFORM",
      });
      await seedStatusChange(app.id, "INTERVIEW", new Date("2026-07-01"));
      await seedApp({ status: "APPLIED", source: "JOB_SEARCH_PLATFORM" });
      await seedApp({ status: "APPLIED", source: "JOB_SEARCH_PLATFORM" });

      const { conversionMetrics } = await getAnalyticsData(TEST_USER_ID);
      expect(conversionMetrics.submittedToProgressed).toBeCloseTo(
        (1 / 3) * 100,
      );
    });
  });

  describe("funnelMetrics - reachedOffer via TimelineEvent", () => {
    it("counts app that reached Offer then was Rejected", async () => {
      const app = await seedApp({
        status: "REJECTED",
        source: "JOB_SEARCH_PLATFORM",
      });
      await seedStatusChange(app.id, "OFFER", new Date("2026-07-01"));
      await seedStatusChange(app.id, "REJECTED", new Date("2026-07-09"));

      const { funnelMetrics } = await getAnalyticsData(TEST_USER_ID);
      expect(funnelMetrics.reachedOffer).toBe(1);
    });
  });

  describe("user isolation", () => {
    it("does not include another user's applications", async () => {
      await prisma.application.create({
        data: {
          company: "Other Co",
          role: "Engineer",
          userId: OTHER_USER_ID,
          status: "INTERVIEW",
          source: "JOB_SEARCH_PLATFORM",
        },
      });

      const { funnelMetrics } = await getAnalyticsData(TEST_USER_ID);
      expect(funnelMetrics.submitted).toBe(0);

      await prisma.application.deleteMany({ where: { userId: OTHER_USER_ID } });
    });
  });
});
