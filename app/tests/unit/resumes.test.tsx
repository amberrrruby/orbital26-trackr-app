import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import ResumeGallery from "@/app/(authenticated)/resumes/ResumeGallery";
import { getResumesWithThumbnails } from "@/app/actions/resume";
import { useInfiniteScroll } from "react-infinite-scroll-component";
import type { Resume, Application } from "@/lib/generated/client";
import ResumeDetailsClient from "@/app/(authenticated)/resumes/[id]/ResumeDetailsClient";
import { useRouter } from "next/navigation";
import type { AggregateStats, ResumeWithThumbnail } from "@/lib/types";
import ResumeFormComponent from "@/app/components/ResumeFormComponent";
import { ToastProvider } from "@/app/components/Toast";

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock("@/app/actions/resume");
vi.mock("react-infinite-scroll-component");
vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const mockGetResumes = vi.mocked(getResumesWithThumbnails);
const mockUseInfiniteScroll = vi.mocked(useInfiniteScroll);

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

// Stub Modal to avoid testing its internals here
vi.mock("@/app/components/Modal", () => ({
  Modal: () => null,
}));

const mockUseRouter = vi.mocked(useRouter);
// const mockDeleteResume = vi.mocked(deleteResume);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeResumes(count: number): ResumeWithThumbnail[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `resume-${i}`,
    title: `Resume ${i}`,
    tags: [],
    notes: null,
    filePath: `/files/resume-${i}.pdf`,
    fileType: "application/pdf",
    thumbnailPath: "",
    thumbnailStatus: "pending",
    userId: `user-0`,
    createdAt: new Date(),
    updatedAt: new Date(),
    signedThumbnailUrl: null,
  }));
}

// For useInfiniteScroll
type InfiniteScrollReturn = ReturnType<typeof useInfiniteScroll>;

function stubInfiniteScroll(overrides: { isLoading?: boolean } = {}) {
  mockUseInfiniteScroll.mockReturnValue({
    sentinelRef: { current: null } as InfiniteScrollReturn["sentinelRef"],
    isLoading: overrides.isLoading ?? false,
  });
}

// For getResumesWithThumbnails
type GetResumesWithThumbnailsResult = Awaited<
  ReturnType<typeof getResumesWithThumbnails>
>;

function stubGetResumesWithThumbnails(
  resumes: ResumeWithThumbnail[] = [],
  totalCount = 0,
) {
  const result: GetResumesWithThumbnailsResult = {
    ok: true,
    value: { resumes, totalCount },
  };
  mockGetResumes.mockResolvedValue(result);
}

function makeResume(overrides: Partial<Resume> = {}): Resume {
  return {
    id: "resume-1",
    title: "Software Engineer Resume",
    tags: [],
    notes: null,
    filePath: "resumes/resume-1.pdf",
    fileType: "pdf",
    thumbnailPath: "",
    thumbnailStatus: "pending",
    userId: "user-1",
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function makeApplications(count: number): Application[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `app-${i}`,
    company: `Company ${i}`,
    role: `Role ${i}`,
    status: "APPLIED",
    resumeId: "resume-1",
    userId: "user-1",
    createdAt: new Date(),
    updatedAt: new Date(),
  })) as Application[];
}

function makeStats(overrides: Partial<AggregateStats> = {}): AggregateStats {
  return {
    WISHLIST: 0,
    APPLIED: 7,
    OA_ASSESSMENT: 0,
    INTERVIEW: 2,
    OFFER: 1,
    REJECTED: 0,
    TOTAL: 10,
    ...overrides,
  };
}

function renderWithToast(ui: React.ReactElement) {
  return render(<ToastProvider>{ui}</ToastProvider>);
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("ResumeGallery", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    stubInfiniteScroll();
    stubGetResumesWithThumbnails();
  });

  // ── Empty state ─────────────────────────────────────────────────────────────

  describe("empty state", () => {
    it("renders no resume cards", () => {
      render(<ResumeGallery initialResumes={[]} totalCount={0} />);
      expect(screen.queryByRole("link")).not.toBeInTheDocument();
    });

    it("shows 0 / 0 resumes count", () => {
      render(<ResumeGallery initialResumes={[]} totalCount={0} />);
      expect(screen.getByText("0 / 0 resumes")).toBeInTheDocument();
    });

    it("does not show loading indicator", () => {
      render(<ResumeGallery initialResumes={[]} totalCount={0} />);
      expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
    });
  });

  // ── Ordering toggle ─────────────────────────────────────────────────────────

  describe("ordering toggle", () => {
    it("renders a button for each sortable field", () => {
      render(<ResumeGallery initialResumes={[]} totalCount={0} />);
      expect(
        screen.getByRole("button", { name: /Updated At/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /Created At/i }),
      ).toBeInTheDocument();
    });

    it("defaults to updatedAt desc", () => {
      render(<ResumeGallery initialResumes={[]} totalCount={0} />);
      // Active field label includes the direction suffix
      expect(
        screen.getByRole("button", { name: "Updated At (Desc)" }),
      ).toBeInTheDocument();
      // Inactive field has no suffix
      expect(
        screen.getByRole("button", { name: "Created At" }),
      ).toBeInTheDocument();
    });

    it("toggles to asc when the active sort button is clicked", async () => {
      render(<ResumeGallery initialResumes={[]} totalCount={0} />);
      fireEvent.click(screen.getByRole("button", { name: /Updated At/i }));
      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: "Updated At (Asc)" }),
        ).toBeInTheDocument();
      });
    });

    it("toggles back to desc on a second click of the active button", async () => {
      render(<ResumeGallery initialResumes={[]} totalCount={0} />);
      const btn = screen.getByRole("button", { name: /Updated At/i });
      fireEvent.click(btn); // → Asc
      await waitFor(() =>
        screen.getByRole("button", { name: "Updated At (Asc)" }),
      );
      fireEvent.click(screen.getByRole("button", { name: /Updated At/i })); // → Desc
      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: "Updated At (Desc)" }),
        ).toBeInTheDocument();
      });
    });

    it("switches active field and resets to desc when a different field is clicked", async () => {
      render(<ResumeGallery initialResumes={[]} totalCount={0} />);
      fireEvent.click(screen.getByRole("button", { name: /Created At/i }));
      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: "Created At (Desc)" }),
        ).toBeInTheDocument();
        // Previously active field loses its suffix
        expect(
          screen.getByRole("button", { name: "Updated At" }),
        ).toBeInTheDocument();
      });
    });

    it("calls getResumes with the new orderKey and order on sort change", async () => {
      render(<ResumeGallery initialResumes={[]} totalCount={0} />);
      fireEvent.click(screen.getByRole("button", { name: /Created At/i }));
      await waitFor(() => {
        expect(mockGetResumes).toHaveBeenCalledWith("createdAt", "desc", 0, 12);
      });
    });
  });

  // ── Resume count display ────────────────────────────────────────────────────

  describe("resume count display", () => {
    it("shows loaded / total count when all resumes are fetched", () => {
      const resumes = makeResumes(5);
      render(<ResumeGallery initialResumes={resumes} totalCount={5} />);
      expect(screen.getByText("5 / 5 resumes")).toBeInTheDocument();
    });

    it("does not show the count while more resumes remain", () => {
      // hasMore = true when initialResumes.length < totalCount
      const resumes = makeResumes(12);
      render(<ResumeGallery initialResumes={resumes} totalCount={50} />);
      expect(screen.queryByText(/\d+ \/ \d+ resumes/)).not.toBeInTheDocument();
    });

    it("does not show the count while loading", () => {
      stubInfiniteScroll({ isLoading: true });
      const resumes = makeResumes(5);
      render(<ResumeGallery initialResumes={resumes} totalCount={5} />);
      // isLoading=true suppresses the count even when hasMore=false
      expect(screen.queryByText(/\d+ \/ \d+ resumes/)).not.toBeInTheDocument();
      expect(screen.getByText("Loading...")).toBeInTheDocument();
    });

    it("renders the correct number of cards", () => {
      const resumes = makeResumes(4);
      render(<ResumeGallery initialResumes={resumes} totalCount={4} />);
      expect(screen.getAllByRole("link")).toHaveLength(4);
    });
  });
});

describe("ResumeDetailsClient", () => {
  const defaultProps = {
    resume: makeResume(),
    signedFileUrl: "https://example.com/signed/resume-1.pdf",
    signedThumbnailUrl: "", // TODO: add if tested with mock
    statsResult: { ok: true, value: makeStats() } as const,
    recentApplicationsResult: { ok: true, value: makeApplications(2) } as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseRouter.mockReturnValue({
      push: vi.fn(),
    } as unknown as ReturnType<typeof useRouter>); // TS sorcery that I don't get how and why
  });

  // ── Recent Applications ───────────────────────────────────────────────────

  describe("recent applications", () => {
    it("shows empty message when no applications are linked", () => {
      renderWithToast(
        <ResumeDetailsClient
          {...defaultProps}
          recentApplicationsResult={{ ok: true, value: [] }}
        />,
      );
      expect(
        screen.getByText("No applications linked yet."),
      ).toBeInTheDocument();
    });

    it("renders each application's company and role", () => {
      const apps = makeApplications(2);
      renderWithToast(
        <ResumeDetailsClient
          {...defaultProps}
          recentApplicationsResult={{ ok: true, value: apps }}
        />,
      );

      // TODO: more fine-grained assertions?
      expect(screen.getByText("Company 0")).toBeInTheDocument();
      expect(screen.getByText("Role 0")).toBeInTheDocument();
      expect(screen.getByText("Company 1")).toBeInTheDocument();
      expect(screen.getByText("Role 1")).toBeInTheDocument();
    });

    it("renders the status chip for each application", () => {
      const apps = makeApplications(2);
      renderWithToast(
        <ResumeDetailsClient
          {...defaultProps}
          recentApplicationsResult={{ ok: true, value: apps }}
        />,
      );
      expect(screen.getAllByText("APPLIED")).toHaveLength(2);
    });

    it("shows error message when applications fail to load", () => {
      renderWithToast(
        <ResumeDetailsClient
          {...defaultProps}
          recentApplicationsResult={{ ok: false, error: { type: "FAILURE" } }}
        />,
      );
      expect(
        screen.getByText("Failed to load applications."),
      ).toBeInTheDocument();
    });
  });

  // ── Stats ─────────────────────────────────────────────────────────────────

  describe("stats", () => {
    it("shows empty message when TOTAL is 0", () => {
      renderWithToast(
        <ResumeDetailsClient
          {...defaultProps}
          statsResult={{
            ok: true,
            value: makeStats({
              TOTAL: 0,
              APPLIED: 0,
              INTERVIEW: 0,
              OFFER: 0,
              WISHLIST: 0,
              OA_ASSESSMENT: 0,
              REJECTED: 0,
            }),
          }}
        />,
      );
      // Both recent-apps and stats sections can show this text; use getAllByText
      expect(
        screen.getAllByText("No applications linked yet.").length,
      ).toBeGreaterThanOrEqual(1);
    });

    it("renders APPLIED, INTERVIEW, OFFER counts", () => {
      renderWithToast(<ResumeDetailsClient {...defaultProps} />);
      expect(screen.getByText("7")).toBeInTheDocument(); // APPLIED
      expect(screen.getByText("2")).toBeInTheDocument(); // INTERVIEW
      expect(screen.getByText("1")).toBeInTheDocument(); // OFFER
    });

    it("renders the correct success percentage", () => {
      // (1 / 10) * 100 = 10.0%
      renderWithToast(<ResumeDetailsClient {...defaultProps} />);
      expect(screen.getByText("10.0%")).toBeInTheDocument();
    });

    it("shows error message when stats fail to load", () => {
      renderWithToast(
        <ResumeDetailsClient
          {...defaultProps}
          statsResult={{ ok: false, error: { type: "FAILURE" } }}
        />,
      );
      expect(screen.getByText("Failed to load stats.")).toBeInTheDocument();
    });
  });

  // ── Signed URL ────────────────────────────────────────────────────────────

  describe("signed URL", () => {
    it("renders a hyperlink to the signed URL", () => {
      renderWithToast(<ResumeDetailsClient {...defaultProps} />);
      const link = screen.getByRole("link", {
        name: /software engineer resume/i,
      });
      expect(link).toHaveAttribute(
        "href",
        "https://example.com/signed/resume-1.pdf",
      );
      expect(link).toHaveAttribute("target", "_blank");
    });

    it("shows fallback message when signed file URL is undefined", () => {
      renderWithToast(
        <ResumeDetailsClient {...defaultProps} signedFileUrl={undefined} />,
      );
      expect(
        screen.getByText(
          "Failed to generate signed URL. Please refresh and try again.",
        ),
      ).toBeInTheDocument();
      // No file link rendered
      expect(
        screen.queryByRole("link", { name: /software engineer resume/i }),
      ).not.toBeInTheDocument();
    });
  });
});

describe("`/resumes/new` form", () => {
  it("shows an error when submitting without selecting a file", async () => {
    renderWithToast(<ResumeFormComponent userId="user-1" />);

    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: "My Resume" },
    });

    fireEvent.submit(
      screen.getByRole("button", { name: /add resume/i }).closest("form")!,
    );

    expect(
      await screen.findByText(/please select a file/i),
    ).toBeInTheDocument();
  });
});

describe("`resumes/[id]/edit form", () => {
  const push = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseRouter.mockReturnValue({
      push,
    } as unknown as ReturnType<typeof useRouter>); // TS sorcery type s**t that I don't get how and why
  });

  it("prefills the form with the existing resume", () => {
    const resume = makeResume({
      title: "Backend Resume",
      tags: ["backend", "golang"],
      notes: "For infra roles",
    });

    renderWithToast(
      <ResumeFormComponent
        userId="user-1"
        resume={resume}
        signedUrl="https://example.com/file.pdf"
      />,
    );

    expect(screen.getByDisplayValue("Backend Resume")).toBeInTheDocument();

    expect(screen.getByDisplayValue("backend, golang")).toBeInTheDocument();

    expect(screen.getByDisplayValue("For infra roles")).toBeInTheDocument();
  });

  it("shows a link to the current uploaded file", () => {
    renderWithToast(
      <ResumeFormComponent
        userId="user-1"
        resume={makeResume()}
        signedUrl="https://example.com/file.pdf"
      />,
    );

    const link = screen.getByRole("link", {
      name: /view current file/i,
    });

    expect(link).toHaveAttribute("href", "https://example.com/file.pdf");
  });

  it("returns to the resume details page when Cancel is clicked", () => {
    renderWithToast(
      <ResumeFormComponent
        userId="user-1"
        resume={makeResume()}
        signedUrl="https://example.com/file.pdf"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(push).toHaveBeenCalledWith("/resumes/resume-1");
  });

  it("shows the Save Changes button in edit mode", () => {
    renderWithToast(
      <ResumeFormComponent
        userId="user-1"
        resume={makeResume()}
        signedUrl="https://example.com/file.pdf"
      />,
    );

    expect(
      screen.getByRole("button", { name: /save changes/i }),
    ).toBeInTheDocument();
  });
});
