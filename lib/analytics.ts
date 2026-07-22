import { prisma } from "@/lib/prisma";
import { AnalyticsData, ConversionMetrics } from "./analytics-types";
import { Source } from "./generated/enums";
import { SOURCE_OPTIONS } from "./types";
import { Prisma } from "./generated/client";

// No Result<T, E> return - everything is read only, and if something fails, almost everything fails together. `error.tsx` is used to handle that. Or maybe I'm just lazy.
export async function getAnalyticsData(userId: string): Promise<AnalyticsData> {
  // ---------------------------------------------------------------------------
  // Best Performing Resume
  // ---------------------------------------------------------------------------
  const bestPerformingResumeRows = await prisma.$queryRaw<
    {
      id: string;
      title: string;
      rate: Prisma.Decimal;
    }[]
  >`
    WITH ar AS (
      SELECT
        rs.id    AS id,
        rs.title AS title,
        AVG(CASE
          WHEN ap.status IN ('REJECTED', 'APPLIED', 'WISHLIST') THEN 0
          ELSE 1
        END) AS rate
      FROM public."Resume" AS rs
      JOIN public."Application" AS ap
        ON ap."resumeId" = rs.id
        AND ap."userId" = ${userId}
      WHERE rs."userId" = ${userId}
      GROUP BY rs.id, rs.title
    )
    SELECT id, title, rate
    FROM ar
    ORDER BY rate DESC
    LIMIT 1
  `;
  const bestPerformingResume = bestPerformingResumeRows[0] ?? null;

  // ---------------------------------------------------------------------------
  // Funnel + Conversion Metrics
  //
  // "stageFromEvents"  — first time each app reached each stage via TimelineEvent
  // "appToStageDate"   — fallback: if an app has no events but current status
  //                      implies a stage (e.g. created directly at INTERVIEW),
  //                      use createdAt as a stand-in timestamp.
  //                      Only includes submitted apps (status != WISHLIST).
  // ---------------------------------------------------------------------------
  const funnelRows = await prisma.$queryRaw<
    {
      submitted: bigint;
      progressed_beyond_applied: bigint;
      reached_oa: bigint; // needed as OA→Interview denominator
      reached_interview: bigint;
      reached_offer: bigint;
      oa_to_interview_num: bigint; // reached Interview after OA (ordered)
      interview_to_offer_num: bigint; // reached both Interview and Offer (no order constraint)
    }[]
  >`
    WITH "stageFromEvents" AS (
      SELECT
        "applicationId",
        MIN("eventDate") FILTER (WHERE status = 'APPLIED') AS reached_applied,
        
        -- OA evidence can come from either:
        -- 1. the application reaching OA_ASSESSMENT status, or
        -- 2. the user recording an OA/Assessment date.
        -- This is important because some applications may be created directly at Interview
        -- while still having an OA/Assessment date filled in.
        MIN("eventDate") FILTER (
          WHERE (
            type IN ('APPLICATION_CREATED', 'STATUS_CHANGED')
            AND status = 'OA_ASSESSMENT'
          )
          OR (
            type = 'IMPORTANT_DATE'
            AND "sourceKey" = 'OA_ASSESSMENT_DATE'
          )
        ) AS reached_oa,

        -- Interview evidence comes from status-based timeline events.
        -- Interview does NOT imply OA, because some applications skip OA/Assessment.
        MIN("eventDate") FILTER (
          WHERE type IN ('APPLICATION_CREATED', 'STATUS_CHANGED')
            AND status = 'INTERVIEW')     
        AS reached_interview,

        MIN("eventDate") FILTER (
        WHERE type IN ('APPLICATION_CREATED', 'STATUS_CHANGED')
          AND status = 'OFFER'
        ) AS reached_offer
      FROM public."TimelineEvent"
      WHERE "userId" = ${userId}
      GROUP BY "applicationId"
    ),
    "appToStageDate" AS (
      SELECT
        a.id AS "applicationId",
        COALESCE(e.reached_applied,   CASE WHEN a.status != 'WISHLIST'     THEN a."createdAt" END) AS reached_applied,
        COALESCE(e.reached_oa,        CASE WHEN a.status = 'OA_ASSESSMENT' THEN a."createdAt" END) AS reached_oa,
        COALESCE(e.reached_interview, CASE WHEN a.status = 'INTERVIEW'     THEN a."createdAt" END) AS reached_interview,
        COALESCE(e.reached_offer,     CASE WHEN a.status = 'OFFER'         THEN a."createdAt" END) AS reached_offer
      FROM public."Application" a
      LEFT JOIN "stageFromEvents" e ON e."applicationId" = a.id
      WHERE a."userId" = ${userId}
        AND a.status != 'WISHLIST'
    ),
    "submitted" AS (
      SELECT COUNT(*) AS count
      FROM public."Application"
      WHERE "userId" = ${userId}
        AND status != 'WISHLIST'
    )
    SELECT
      (SELECT count FROM "submitted")                                                                  AS submitted,
      COUNT(*) FILTER (WHERE reached_oa        IS NOT NULL
                          OR reached_interview  IS NOT NULL
                          OR reached_offer      IS NOT NULL)                                           AS progressed_beyond_applied,
      COUNT(*) FILTER (WHERE reached_oa        IS NOT NULL)                                            AS reached_oa,
      COUNT(*) FILTER (WHERE reached_interview IS NOT NULL)                                            AS reached_interview,
      COUNT(*) FILTER (WHERE reached_offer     IS NOT NULL)                                            AS reached_offer,
      -- OA->Interview: ordering matters per spec
      -- Among applications with OA/ Assessment evidence, how many also reached Interview?
      -- Users may record dates after creating/ updating the application.
      COUNT(*) FILTER (WHERE reached_oa IS NOT NULL
                         AND reached_interview IS NOT NULL)                                           AS oa_to_interview_num,
      -- Interview->Offer: no ordering constraint per spec (furthest stage wins)
      COUNT(*) FILTER (WHERE reached_interview IS NOT NULL
                         AND reached_offer     IS NOT NULL)                                            AS interview_to_offer_num
    FROM "appToStageDate"
  `;

  const f = funnelRows[0];
  const submitted = Number(f.submitted);
  const reachedOa = Number(f.reached_oa);
  const reachedInt = Number(f.reached_interview);
  const progressed = Number(f.progressed_beyond_applied);

  const funnelMetrics = {
    submitted,
    progressedBeyondApplied: Number(f.progressed_beyond_applied),
    reachedInterview: reachedInt,
    reachedOffer: Number(f.reached_offer),
  };

  const conversionMetrics = {
    submittedToProgressed: submitted === 0 ? null : progressed / submitted,
    // denominator: reached OA
    oaToInterview:
      reachedOa === 0 ? null : Number(f.oa_to_interview_num) / reachedOa,
    // denominator: reached Interview
    interviewToOffer:
      reachedInt === 0 ? null : Number(f.interview_to_offer_num) / reachedInt,
  };

  const entries = (
    Object.entries(conversionMetrics) as [
      keyof ConversionMetrics,
      number | null,
    ][]
  ).filter(([, v]) => v !== null) as [keyof ConversionMetrics, number][];

  const biggestDropOffStage =
    entries.length === 0
      ? null
      : entries.reduce((min, curr) => (curr[1]! < min[1]! ? curr : min))[0];

  // ---------------------------------------------------------------------------
  // Rejection Rate
  // Denominator reuses `submitted` from above.
  // ---------------------------------------------------------------------------
  const rejectionRows = await prisma.application.groupBy({
    by: ["status"],
    where: { userId, status: "REJECTED" },
    _count: { _all: true },
  });
  const rejectedCount = rejectionRows[0]?._count._all ?? 0;
  const rejectionRate = submitted === 0 ? null : rejectedCount / submitted;

  // ---------------------------------------------------------------------------
  // Application Trend (applications per week, past 4 weeks)
  // COALESCE: dateApplied is nullable, fall back to createdAt.
  // generate_series ensures zero-count weeks are included.
  // ---------------------------------------------------------------------------
  const trendRows = await prisma.$queryRaw<
    {
      week_start: Date;
      count: bigint;
    }[]
  >`
    WITH weeks AS (
      SELECT generate_series(
        date_trunc('week', NOW() - INTERVAL '4 weeks'),
        date_trunc('week', NOW()),
        INTERVAL '1 week'
      ) AS week_start
    )
    SELECT
      weeks.week_start,
      COUNT(a.id) AS count
    FROM weeks
    LEFT JOIN public."Application" a
      ON  date_trunc('week', COALESCE(a."dateApplied", a."createdAt")) = weeks.week_start
      AND a."userId" = ${userId}
    GROUP BY weeks.week_start
    ORDER BY weeks.week_start
  `;

  const trend = trendRows.map((r) => ({
    weekStart: r.week_start,
    count: Number(r.count),
  }));

  // ---------------------------------------------------------------------------
  // Source Breakdown
  // Rate = (apps that ever reached OA/Interview/Offer) / (total apps) per source.
  // Uses TimelineEvent to avoid counting REJECTED-from-Applied as progressed.
  // ---------------------------------------------------------------------------
  const sourceQuery = await prisma.$queryRaw<
    {
      source: Source;
      rate: Prisma.Decimal;
    }[]
  >`
    WITH "progressed" AS (
      SELECT DISTINCT "applicationId"
      FROM public."TimelineEvent"
      WHERE type IN ('APPLICATION_CREATED', 'STATUS_CHANGED')
        AND "userId" = ${userId}
        AND status IN ('OA_ASSESSMENT', 'INTERVIEW', 'OFFER')
    )
    SELECT
      ap.source AS source,
      COUNT(pr."applicationId") * 1.0 / COUNT(ap.id)        AS rate
    FROM public."Application" ap
    LEFT JOIN "progressed" pr ON pr."applicationId" = ap.id
    WHERE ap."userId" = ${userId}
    GROUP BY ap.source
    ORDER BY rate DESC
  `;

  const sourceBreakdown = sourceQuery.map(({ source, rate }) => ({
    source: SOURCE_OPTIONS[source],
    rate: Number(rate),
  }));

  // ---------------------------------------------------------------------------
  // Resume Response Rate
  // Same "progressed" definition as source breakdown.
  // Only includes applications with a resume attached.
  // ---------------------------------------------------------------------------
  const resumeResponseRateQuery = await prisma.$queryRaw<
    {
      title: string;
      applicationCount: bigint;
      responseRate: Prisma.Decimal;
    }[]
  >`
    WITH "progressed" AS (
      SELECT DISTINCT "applicationId"
      FROM public."TimelineEvent"
      WHERE type IN ('APPLICATION_CREATED', 'STATUS_CHANGED')
        AND "userId" = ${userId}
        AND status IN ('OA_ASSESSMENT', 'INTERVIEW', 'OFFER')
    )
    SELECT
      rs.title,
      COUNT(ap.id) AS "applicationCount",
      COUNT(pr."applicationId") * 1.0 / COUNT(ap.id) AS "responseRate"
    FROM public."Application" AS ap
    LEFT JOIN public."Resume"  AS rs ON rs.id = ap."resumeId"
    LEFT JOIN "progressed"     AS pr ON pr."applicationId" = ap.id
    WHERE ap."userId"   = ${userId}
      AND ap."resumeId" IS NOT NULL
    GROUP BY rs.id, rs.title
    ORDER BY "responseRate" DESC
    LIMIT 5
  `;

  const toPercent = (n: number | null) => (n === null ? null : n * 100);
  const decToPercentNN = (n: Prisma.Decimal) => n.toNumber() * 100;

  return {
    bestPerformingSource: sourceBreakdown[0]
      ? { ...sourceBreakdown[0], rate: sourceBreakdown[0].rate * 100 }
      : null,
    bestPerformingResume: bestPerformingResume
      ? {
          ...bestPerformingResume,
          rate: decToPercentNN(bestPerformingResume.rate),
        }
      : null,
    biggestDropOffStage,
    rejectionRate: toPercent(rejectionRate),

    funnelMetrics,
    conversionMetrics: {
      submittedToProgressed: toPercent(conversionMetrics.submittedToProgressed),
      oaToInterview: toPercent(conversionMetrics.oaToInterview),
      interviewToOffer: toPercent(conversionMetrics.interviewToOffer),
    },

    trend,
    sourceBreakdown: sourceBreakdown.map((r) => ({ ...r, rate: r.rate * 100 })),
    resumeResponseRate: resumeResponseRateQuery.map((r) => ({
      ...r,
      applicationCount: Number(r.applicationCount),
      responseRate: decToPercentNN(r.responseRate),
    })),
  };
}
