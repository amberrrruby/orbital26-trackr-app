import AnalyticsError from "@/app/(authenticated)/analytics/error";
import ApplicationTrendChart from "@/app/components/analytics/ApplicationTrendChart";
import ConversionMetricCard from "@/app/components/analytics/ConversionMetricCard";
import FunnelSection from "@/app/components/analytics/FunnelSection";
import InsightsCard from "@/app/components/analytics/InsightsCard";
import InsightsRow from "@/app/components/analytics/InsightsRow";
import ResumeResponseRateChart from "@/app/components/analytics/ResumeResponseRateChart";
import SourceBreakdownChart from "@/app/components/analytics/SourceBreakdownChart";
import { AnalyticsData } from "@/lib/analytics-types";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FileText } from "lucide-react";
import React from "react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/app/components/analytics/AnalyticsFunnelChart", () => ({
  default: () => <div data-testid="funnel-chart" />,
}));

vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  FunnelChart: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  Funnel: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  LabelList: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  LineChart: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  BarChart: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  Bar: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Cell: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Line: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
}));

describe("InsightsCard", () => {
  it("renders title and middle", () => {
    render(
      <InsightsCard
        icon={FileText} // just an icon to compile; since it's hardcoded, hence not tested
        title="Best source"
        middle="LinkedIn"
        bottom={null}
      />,
    );
    expect(screen.getByText("Best source")).toBeInTheDocument();
    expect(screen.getByText("LinkedIn")).toBeInTheDocument();
  });

  it("renders - when middle is null", () => {
    render(
      <InsightsCard
        icon={FileText}
        title="Best source"
        middle={null}
        bottom={null}
      />,
    );
    expect(screen.getByText("-")).toBeInTheDocument();
  });

  it("renders bottom when provided", () => {
    render(
      <InsightsCard
        icon={FileText}
        title="Best source"
        middle="LinkedIn"
        bottom="Response Rate: 36%"
      />,
    );
    expect(screen.getByText("Response Rate: 36%")).toBeInTheDocument();
  });

  it("omits bottom when not provided", () => {
    render(
      <InsightsCard
        icon={FileText}
        title="Best source"
        middle="LinkedIn"
        bottom={null}
      />,
    );
    expect(screen.queryByText(/response rate/i)).not.toBeInTheDocument();
  });
});

const baseData: Pick<
  AnalyticsData,
  | "bestPerformingSource"
  | "bestPerformingResume"
  | "biggestDropOffStage"
  | "conversionMetrics"
  | "rejectionRate"
> = {
  bestPerformingSource: { source: "LinkedIn", rate: 36 },
  bestPerformingResume: { id: "1", title: "Resume v3", rate: 60 },
  biggestDropOffStage: "submittedToProgressed",
  rejectionRate: 42,
  conversionMetrics: {
    submittedToProgressed: 35,
    oaToInterview: 68,
    interviewToOffer: null,
  },
};

describe("InsightsRow", () => {
  it("renders all four insight cards", () => {
    render(<InsightsRow data={baseData} />);
    expect(screen.getByText("Best performing source")).toBeInTheDocument();
    expect(screen.getByText("Best performing resume")).toBeInTheDocument();
    expect(screen.getByText("Biggest drop-off stage")).toBeInTheDocument();
    expect(screen.getByText("Rejection rate")).toBeInTheDocument();
  });

  it("handles null values across all cards", () => {
    render(
      <InsightsRow
        data={{
          bestPerformingSource: null,
          bestPerformingResume: null,
          biggestDropOffStage: null,
          rejectionRate: null,
          conversionMetrics: {
            submittedToProgressed: null,
            oaToInterview: null,
            interviewToOffer: null,
          },
        }}
      />,
    );
    expect(screen.getAllByText("-")).toHaveLength(4);
  });
});

describe("ConversionMetricCard", () => {
  it("renders label and value as percentage", () => {
    render(
      <ConversionMetricCard label="OA to Interview conversion" value={68} />,
    );
    expect(screen.getByText("OA to Interview conversion")).toBeInTheDocument();
    expect(screen.getByText("68%")).toBeInTheDocument();
  });

  it("renders - when value is null", () => {
    render(
      <ConversionMetricCard label="OA to Interview conversion" value={null} />,
    );
    expect(screen.getByText("-")).toBeInTheDocument();
  });
});

const funnelMetrics = {
  submitted: 100,
  progressedBeyondApplied: 35,
  reachedInterview: 18,
  reachedOffer: 4,
};

const conversionMetrics = {
  submittedToProgressed: 35,
  oaToInterview: 68,
  interviewToOffer: null,
};

describe("FunnelSection", () => {
  it("renders Funnel Metrics heading", () => {
    render(
      <FunnelSection
        funnelMetrics={funnelMetrics}
        conversionMetrics={conversionMetrics}
      />,
    );
    expect(screen.getByText("Funnel Metrics")).toBeInTheDocument();
  });

  it("renders a ConversionMetricCard for each conversion metric", () => {
    render(
      <FunnelSection
        funnelMetrics={funnelMetrics}
        conversionMetrics={conversionMetrics}
      />,
    );
    expect(screen.getByText("Submitted → Progressed")).toBeInTheDocument();
    expect(screen.getByText("OA/ Assessment → Interview")).toBeInTheDocument();
    expect(screen.getByText("Interview → Offer")).toBeInTheDocument();
  });

  it("renders - for null conversion metrics", () => {
    render(
      <FunnelSection
        funnelMetrics={funnelMetrics}
        conversionMetrics={conversionMetrics}
      />,
    );
    expect(screen.getByText("-")).toBeInTheDocument();
  });
});

const trend = [
  { weekStart: new Date("2025-01-01"), count: 5 },
  { weekStart: new Date("2025-01-08"), count: 8 },
];

describe("ApplicationTrendChart", () => {
  it("renders without crashing with valid data", () => {
    expect(() => render(<ApplicationTrendChart data={trend} />)).not.toThrow();
  });

  it("renders without crashing with empty data", () => {
    expect(() => render(<ApplicationTrendChart data={[]} />)).not.toThrow();
  });
});

const sourceData = [
  { source: "LinkedIn", rate: 36 },
  { source: "Referral", rate: 52 },
];

describe("SourceBreakdownChart", () => {
  it("renders without crashing with valid data", () => {
    expect(() =>
      render(<SourceBreakdownChart data={sourceData} />),
    ).not.toThrow();
  });

  it("renders without crashing with empty data", () => {
    expect(() => render(<SourceBreakdownChart data={[]} />)).not.toThrow();
  });
});

const resumeData = [
  { title: "Resume v3", responseRate: 60, applicationCount: 10 },
  { title: "Resume v2", responseRate: 40, applicationCount: 5 },
];

describe("ResumeResponseRateChart", () => {
  it("renders without crashing with valid data", () => {
    expect(() =>
      render(<ResumeResponseRateChart data={resumeData} />),
    ).not.toThrow();
  });

  it("renders without crashing with empty data", () => {
    expect(() => render(<ResumeResponseRateChart data={[]} />)).not.toThrow();
  });
});

describe("AnalyticsError", () => {
  it("renders error message", () => {
    render(<AnalyticsError error={new Error()} reset={() => {}} />);
    expect(screen.getByText("Failed to load analytics")).toBeInTheDocument();
    expect(screen.getByText(/internal error/i)).toBeInTheDocument();
  });

  it("calls reset when retry button is clicked", async () => {
    const reset = vi.fn();
    render(<AnalyticsError error={new Error()} reset={reset} />);
    await userEvent.click(screen.getByRole("button", { name: /retry/i }));
    expect(reset).toHaveBeenCalledOnce();
  });
});
