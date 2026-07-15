import { render, screen, within } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { SummaryCard } from "@/app/(authenticated)/dashboard/page";
import { STATUS_COLORS } from "@/app/components/dashboard/constants";
import DonutChartComponent from "@/app/components/dashboard/DonutChartComponent";
import { STATUS_LABELS } from "@/lib/types";
import { Status } from "@/lib/generated/enums";

// Recharts measures DOM nodes internally; jsdom returns -1 for all dimensions.
// Mock the library to avoid noise and keep tests focused on our own rendering.
vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  PieChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="pie-chart">{children}</div>
  ),
  Pie: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="pie">{children}</div>
  ),
  Cell: () => <div data-testid="cell" />,
  Label: ({ value }: { value: number }) => (
    <div data-testid="pie-label">{value}</div>
  ),
  Tooltip: () => <div data-testid="tooltip" />,
}));

describe("SummaryCard", () => {
  const defaultProps = {
    title: "Total Tracked Applications",
    value: 42,
    subtitle: "All time",
  };

  it("renders the title", () => {
    render(<SummaryCard {...defaultProps} />);
    expect(screen.getByText("Total Tracked Applications")).toBeInTheDocument();
  });

  it("renders the value", () => {
    render(<SummaryCard {...defaultProps} />);
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("renders the subtitle", () => {
    render(<SummaryCard {...defaultProps} />);
    expect(screen.getByText("All time")).toBeInTheDocument();
  });

  it("renders zero value without crashing", () => {
    render(<SummaryCard {...defaultProps} value={0} />);
    expect(screen.getByText("0")).toBeInTheDocument();
  });
});

const statusBreakdown = [
  { status: Status.WISHLIST, count: 5 },
  { status: Status.APPLIED, count: 12 },
  { status: Status.OA_ASSESSMENT, count: 8 },
  { status: Status.INTERVIEW, count: 3 },
  { status: Status.OFFER, count: 1 },
  { status: Status.REJECTED, count: 6 },
];

const total = statusBreakdown.reduce((sum, s) => sum + s.count, 0);

function hexToRgb(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return `rgb(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255})`;
}

describe("DonutChartComponent", () => {
  describe("chart", () => {
    it("renders a PieChart", () => {
      render(
        <DonutChartComponent total={total} statusBreakdown={statusBreakdown} />,
      );
      expect(screen.getByTestId("pie-chart")).toBeInTheDocument();
    });

    it("renders the total in the centre label", () => {
      render(
        <DonutChartComponent total={total} statusBreakdown={statusBreakdown} />,
      );
      expect(screen.getByTestId("pie-label")).toHaveTextContent(String(total));
    });
  });

  describe("legend", () => {
    it("renders one legend item per status", () => {
      render(
        <DonutChartComponent total={total} statusBreakdown={statusBreakdown} />,
      );
      // Use the display labels as identifiers
      statusBreakdown.forEach(({ status }) => {
        expect(screen.getByText(STATUS_LABELS[status])).toBeInTheDocument();
      });
    });

    it("renders the correct count for each status", () => {
      render(
        <DonutChartComponent total={total} statusBreakdown={statusBreakdown} />,
      );
      statusBreakdown.forEach(({ count }) => {
        // counts are unique in our fixture so getByText is unambiguous
        expect(screen.getByText(String(count))).toBeInTheDocument();
      });
    });

    it("renders zero counts without crashing", () => {
      const allZero = statusBreakdown.map((s) => ({ ...s, count: 0 }));
      const { container } = render(
        <DonutChartComponent total={0} statusBreakdown={allZero} />,
      );
      const legend = container.querySelector(
        "[class*='legend']",
      ) as HTMLElement;
      const zeroCounts = within(legend!).getAllByText("0");
      expect(zeroCounts).toHaveLength(statusBreakdown.length);
    });

    it("applies the correct background colour to each legend dot", () => {
      const { container } = render(
        <DonutChartComponent total={total} statusBreakdown={statusBreakdown} />,
      );
      const dots = container.querySelectorAll("[class*='legendDot']");
      expect(dots).toHaveLength(statusBreakdown.length);
      dots.forEach((dot, i) => {
        expect((dot as HTMLElement).style.backgroundColor).toBe(
          hexToRgb(STATUS_COLORS[statusBreakdown[i].status]),
        );
      });
    });
  });
});
