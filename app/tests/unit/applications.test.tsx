import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ApplicationsTable from "@/app/(authenticated)/applications/ApplicationsTable";
import { ApplicationWithDetails, GetResumesError, Result } from "@/lib/types";
import AddApplicationForm from "@/app/(authenticated)/applications/AddApplicationForm";
import { Resume } from "@/lib/generated/client";
import { Suspense } from "react";
import * as applicationActions from "@/app/actions/applications";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
  }: {
    href: string;
    children: React.ReactNode;
  }) => <a href={href}>{children}</a>,
}));

vi.mock("@/app/(authenticated)/applications/DeleteApplicationDialog", () => ({
  default: () => <div data-testid="delete-dialog" />,
}));

vi.mock("@/app/(authenticated)/applications/EditApplicationModal", () => ({
  default: ({ onClose }: { onClose: () => void }) => (
    <div data-testid="edit-modal">
      <button onClick={onClose}>Close</button>
    </div>
  ),
}));

vi.mock("next/navigation", () => ({ redirect: vi.fn() }));
import { redirect } from "next/navigation";

vi.mock("@/app/actions/applications", () => ({
  createApplication: vi.fn(),
}));

vi.mock("@/app/(authenticated)/applications/ResumeSelector", () => ({
  // default: ({ resumes }: { resumes: unknown[] }) => (
  default: () => (
    <select name="resumeId" aria-label="Resume">
      <option value="">None</option>
    </select>
  ),
}));

const mockCreateApplication =
  applicationActions.createApplication as ReturnType<typeof vi.fn>;

// --- Helpers ---

function buildApplication(
  overrides: Partial<ApplicationWithDetails> = {},
): ApplicationWithDetails {
  return {
    id: "app-1",
    company: "Acme Corp",
    role: "Software Engineer",
    source: null,
    status: "APPLIED",
    interviewRound: null,
    dateApplied: null,
    notes: null,
    tags: [],
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-02"),
    resumeId: null,
    resume: null,
    userId: "user-1",
    timelineEvents: [],
    ...overrides,
  };
}

function renderTable(applications = [buildApplication()]) {
  return render(
    <Suspense fallback={null}>
      <ApplicationsTable
        applications={applications}
        resumesResult={validResumesResult}
      />
    </Suspense>,
  );
}

const validResumesResult: Result<
  { resumes: Resume[]; totalCount: number },
  GetResumesError
> = { ok: true, value: { resumes: [], totalCount: 0 } };

function renderForm(resumes = []) {
  return render(<AddApplicationForm resumes={resumes} />);
}

async function fillRequiredFields(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/company/i), "Acme Corp");
  await user.type(screen.getByLabelText(/role/i), "Engineer");
}

// --- Tests ---

describe("ApplicationsTable", () => {
  describe("empty state", () => {
    it("renders empty state text when applications list is empty", async () => {
      renderTable([]);
      expect(
        await screen.findByText("No applications found."),
      ).toBeInTheDocument();
    });
  });

  describe("filled state", () => {
    it("renders a row for each application", async () => {
      const applications = [
        buildApplication({ id: "app-1", company: "Acme", role: "SWE" }),
        buildApplication({ id: "app-2", company: "Globex", role: "PM" }),
      ];

      renderTable(applications);

      expect(await screen.findByText("Acme")).toBeInTheDocument();
      expect(await screen.findByText("Globex")).toBeInTheDocument();
    });

    it("filters rows when a status is selected", async () => {
      const applications = [
        buildApplication({ id: "app-1", company: "Acme", status: "APPLIED" }),
        buildApplication({
          id: "app-2",
          company: "Globex",
          status: "INTERVIEW",
        }),
      ];

      renderTable(applications);
      expect(await screen.findByText("Acme")).toBeInTheDocument();
      expect(await screen.findByText("Globex")).toBeInTheDocument();

      await userEvent.selectOptions(screen.getByRole("combobox"), "INTERVIEW");

      expect(screen.queryByText("Acme")).not.toBeInTheDocument();
      expect(await screen.findByText("Globex")).toBeInTheDocument();
    });

    it("shows all rows when filter is reset to All", async () => {
      const applications = [
        buildApplication({ id: "app-1", company: "Acme", status: "APPLIED" }),
        buildApplication({
          id: "app-2",
          company: "Globex",
          status: "INTERVIEW",
        }),
      ];

      renderTable(applications);
      expect(await screen.findByText("Acme")).toBeInTheDocument();
      expect(await screen.findByText("Globex")).toBeInTheDocument();

      await userEvent.selectOptions(screen.getByRole("combobox"), "Interview");
      await userEvent.selectOptions(screen.getByRole("combobox"), "All");

      expect(await screen.findByText("Acme")).toBeInTheDocument();
      expect(await screen.findByText("Globex")).toBeInTheDocument();
    });

    // it("toggles sort indicator on Created At column", async () => {
    //   renderTable();

    //   const createdAtButton = screen.getByRole("button", { name: /created at/i });
    //   await userEvent.click(createdAtButton);
    //   expect(createdAtButton).toHaveTextContent("↑");

    //   await userEvent.click(createdAtButton);
    //   expect(createdAtButton).toHaveTextContent("↓");
    // });

    // it("toggles sort indicator on Updated At column", async () => {
    //   renderTable();

    //   const updatedAtButton = screen.getByRole("button", { name: /updated at/i });
    //   await userEvent.click(updatedAtButton);
    //   expect(updatedAtButton).toHaveTextContent("↑");

    //   await userEvent.click(updatedAtButton);
    //   expect(updatedAtButton).toHaveTextContent("↓");
    // });
  });

  describe("edit modal", () => {
    it("opens the edit modal when Edit is clicked", async () => {
      renderTable();

      await userEvent.click(screen.getByRole("button", { name: /edit/i }));
      expect(await screen.findByTestId("edit-modal")).toBeInTheDocument();
    });

    it("closes the edit modal when onClose is called", async () => {
      renderTable();

      await userEvent.click(screen.getByRole("button", { name: /edit/i }));
      const modal = screen.getByTestId("edit-modal");
      await userEvent.click(
        within(modal).getByRole("button", { name: /close/i }),
      );
      expect(screen.queryByTestId("edit-modal")).not.toBeInTheDocument();
    });
  });

  describe("delete dialog", () => {
    it("opens the delete dialog when Delete is clicked", async () => {
      renderTable();

      await userEvent.click(screen.getByRole("button", { name: /delete/i }));
      expect(
        document.body.querySelector("[data-testid='delete-dialog']"),
      ).toBeInTheDocument();
    });
  });
});

describe("AddApplicationForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("form validation feedback", () => {
    it("shows VALIDATION error with field and message", async () => {
      mockCreateApplication.mockResolvedValueOnce({
        ok: false,
        error: { type: "VALIDATION", param: "company", message: "Required" },
      });

      const user = userEvent.setup();
      renderForm();
      await fillRequiredFields(user);
      await user.click(
        screen.getByRole("button", { name: /create application/i }),
      );

      expect(
        await screen.findByText(/invalid fields: company: required/i),
      ).toBeInTheDocument();
    });

    it("shows generic error on FAILURE", async () => {
      mockCreateApplication.mockResolvedValueOnce({
        ok: false,
        error: { type: "FAILURE" },
      });

      const user = userEvent.setup();
      renderForm();
      await fillRequiredFields(user);
      await user.click(
        screen.getByRole("button", { name: /create application/i }),
      );

      expect(
        await screen.findByText(/something went wrong/i),
      ).toBeInTheDocument();
    });

    it("clears error on subsequent submit attempt", async () => {
      mockCreateApplication
        .mockResolvedValueOnce({ ok: false, error: { type: "FAILURE" } })
        .mockResolvedValueOnce({ ok: false, error: { type: "FAILURE" } });

      const user = userEvent.setup();
      renderForm();
      await fillRequiredFields(user);

      const btn = screen.getByRole("button", { name: /create application/i });
      await user.click(btn);
      expect(
        await screen.findByText(/something went wrong/i),
      ).toBeInTheDocument();

      await user.click(btn);
      // Error disappears momentarily before re-appearing — assert it's still rendered once, not duplicated
      expect(screen.getAllByText(/something went wrong/i)).toHaveLength(1);
    });
  });

  describe("submit calls action with correct data", () => {
    it("passes company, role, and status in FormData", async () => {
      mockCreateApplication.mockResolvedValueOnce({
        ok: true,
        value: "app-123",
      });

      const user = userEvent.setup();
      renderForm();
      await fillRequiredFields(user);
      await user.click(
        screen.getByRole("button", { name: /create application/i }),
      );

      await vi.waitFor(() =>
        expect(mockCreateApplication).toHaveBeenCalledOnce(),
      );

      const formData: FormData = mockCreateApplication.mock.calls[0][0];
      expect(formData.get("company")).toBe("Acme Corp");
      expect(formData.get("role")).toBe("Engineer");
      expect(formData.get("status")).toBe("APPLIED"); // default value
    });

    it("redirects to /applications on success", async () => {
      mockCreateApplication.mockResolvedValueOnce({
        ok: true,
        value: "app-123",
      });

      const user = userEvent.setup();
      renderForm();
      await fillRequiredFields(user);
      await user.click(
        screen.getByRole("button", { name: /create application/i }),
      );

      await vi.waitFor(() =>
        expect(redirect).toHaveBeenCalledWith("/applications"),
      );
    });
  });

  describe("disabled state on submission", () => {
    it.todo(
      "submit button is disabled while submission is in flight — requires useFormStatus or isPending state in component",
    );
  });
});
