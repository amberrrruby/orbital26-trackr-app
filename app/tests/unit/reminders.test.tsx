import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ReminderCard from "@/app/(authenticated)/reminders/ReminderCard";
import * as reminderActions from "@/app/actions/reminders";
import { ReminderWithApplication } from "@/lib/types";

import ReminderModal from "@/app/(authenticated)/reminders/ReminderModal";
import { Application } from "@/lib/generated/client";
import { act } from "react";
import { ToastProvider } from "@/app/components/Toast";

// --- Mocks ---

const mockRefresh = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mockRefresh }),
}));
vi.mock("next/link", () => ({
  default: ({
    href,
    children,
  }: {
    href: string;
    children: React.ReactNode;
  }) => <a href={href}>{children}</a>,
}));
vi.mock("@/app/actions/reminders", () => ({
  deleteReminder: vi.fn(),
  completeReminder: vi.fn(),
  addReminder: vi.fn(),
  updateReminder: vi.fn(),
}));
vi.mock("@/app/components/Modal", () => ({
  Modal: ({
    open,
    children,
    title,
    // onOpenChange,
  }: {
    open: boolean;
    children: React.ReactNode;
    title: string;
    // onOpenChange: (v: boolean) => void;
  }) =>
    open ? (
      <div role="dialog" aria-label={title}>
        {children}
      </div>
    ) : null,
}));

const mockDelete = reminderActions.deleteReminder as ReturnType<typeof vi.fn>;
const mockComplete = reminderActions.completeReminder as ReturnType<
  typeof vi.fn
>;
const mockAdd = reminderActions.addReminder as ReturnType<typeof vi.fn>;
const mockUpdate = reminderActions.updateReminder as ReturnType<typeof vi.fn>;

// --- Helpers ---

const noApplications: Application[] = [];

function buildReminder(
  overrides: Partial<ReminderWithApplication> = {},
): ReminderWithApplication {
  return {
    id: "rem-1",
    type: "EVENT",
    remindAt: new Date("2026-06-27"), // today
    offsetDays: null,
    content: "Follow up on application",
    source: null,
    applicationId: null,
    application: null,
    userId: "user-1",
    ...overrides,
  };
}

function buildApplication(overrides: Partial<Application> = {}): Application {
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
    createdAt: new Date(),
    updatedAt: new Date(),
    resumeId: null,
    userId: "user-1",
    ...overrides,
  };
}

function renderWithToast(ui: React.ReactElement) {
  return render(<ToastProvider>{ui}</ToastProvider>);
}

function renderModal(
  props: Partial<React.ComponentProps<typeof ReminderModal>> = {},
) {
  const defaults = {
    open: true,
    onOpenChange: vi.fn(),
    applications: noApplications,
  };
  return renderWithToast(<ReminderModal {...defaults} {...props} />);
}

// --- Tests ---

describe("ReminderCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDelete.mockResolvedValue({ ok: true });
    mockComplete.mockResolvedValue({ ok: true });
  });

  describe("description format", () => {
    it("shows date only when unlinked", () => {
      renderWithToast(<ReminderCard reminder={buildReminder()} />);
      // "27 Jun 2026" — no application prefix
      expect(screen.getByText(/27 Jun 2026/i)).toBeInTheDocument();
      expect(screen.queryByText(/from/i)).not.toBeInTheDocument();
    });

    it("shows 'Company - Role' when linked", () => {
      renderWithToast(
        <ReminderCard
          reminder={buildReminder({
            applicationId: "app-1",
            application: buildApplication(),
          })}
        />,
      );
      expect(
        screen.getByText(/acme corp - software engineer/i),
      ).toBeInTheDocument();
    });

    it("shows 'Was due' prefix on overdue variant", () => {
      renderWithToast(
        <ReminderCard
          reminder={buildReminder({ remindAt: new Date("2026-06-20") })}
          variant="overdue"
        />,
      );
      expect(screen.getByText(/was due/i)).toBeInTheDocument();
    });

    it("does not show 'Was due' on default variant", () => {
      renderWithToast(<ReminderCard reminder={buildReminder()} />);
      expect(screen.queryByText(/was due/i)).not.toBeInTheDocument();
    });

    it("renders Application Details link when linked", () => {
      renderWithToast(
        <ReminderCard
          reminder={buildReminder({
            applicationId: "app-1",
            application: buildApplication(),
          })}
        />,
      );
      const link = screen.getByRole("link", {
        name: /acme corp - software engineer/i,
      });
      expect(link).toHaveAttribute("href", "/applications/app-1");
    });

    // it("does not render Application Details link when unlinked", () => {
    //   render(<ReminderCard reminder={buildReminder()} />);
    //   expect(
    //     screen.queryByRole("link", { name: /application details/i }),
    //   ).not.toBeInTheDocument();
    // });
  });

  describe("mark as completed", () => {
    it("calls completeReminder and refreshes on success", async () => {
      const user = userEvent.setup();
      renderWithToast(<ReminderCard reminder={buildReminder()} />);

      await user.click(
        screen.getByRole("button", { name: /mark as completed/i }),
      );

      expect(mockComplete).toHaveBeenCalledWith("rem-1");
      await vi.waitFor(() => expect(mockRefresh).toHaveBeenCalled());
    });

    it("shows error and does not refresh on failure", async () => {
      mockComplete.mockResolvedValueOnce({ ok: false });
      const user = userEvent.setup();
      renderWithToast(<ReminderCard reminder={buildReminder()} />);

      await user.click(
        screen.getByRole("button", { name: /mark as completed/i }),
      );

      expect(
        await screen.findByText(/something went wrong/i),
      ).toBeInTheDocument();
      expect(mockRefresh).not.toHaveBeenCalled();
    });

    it("disables both buttons while completing", async () => {
      let resolve!: (v: unknown) => void;
      mockComplete.mockReturnValueOnce(new Promise((r) => (resolve = r)));

      const user = userEvent.setup();
      renderWithToast(<ReminderCard reminder={buildReminder()} />);
      await user.click(
        screen.getByRole("button", { name: /mark as completed/i }),
      );

      expect(
        screen.getByRole("button", { name: /completing/i }),
      ).toBeDisabled();
      expect(screen.getByRole("button", { name: /dismiss/i })).toBeDisabled();

      // Resolve before test exits to avoid state update outside act
      await act(async () => {
        resolve({ ok: true });
      });
    });
  });

  describe("dismiss", () => {
    it("calls deleteReminder and refreshes on success", async () => {
      const user = userEvent.setup();
      renderWithToast(<ReminderCard reminder={buildReminder()} />);

      await user.click(screen.getByRole("button", { name: /dismiss/i }));

      expect(mockDelete).toHaveBeenCalledWith("rem-1");
      await vi.waitFor(() => expect(mockRefresh).toHaveBeenCalled());
    });

    it("shows error and does not refresh on failure", async () => {
      mockDelete.mockResolvedValueOnce({ ok: false });
      const user = userEvent.setup();
      renderWithToast(<ReminderCard reminder={buildReminder()} />);

      await user.click(screen.getByRole("button", { name: /dismiss/i }));

      expect(
        await screen.findByText(/something went wrong/i),
      ).toBeInTheDocument();
      expect(mockRefresh).not.toHaveBeenCalled();
    });
  });
});

describe("ReminderModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAdd.mockResolvedValue({ ok: true });
    mockUpdate.mockResolvedValue({ ok: true });
  });

  describe("open/close", () => {
    it("renders when open=true", () => {
      renderModal({ open: true });
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("does not render when open=false", () => {
      renderModal({ open: false });
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("calls onOpenChange(false) when Cancel is clicked", async () => {
      const onOpenChange = vi.fn();
      const user = userEvent.setup();
      renderModal({ onOpenChange });

      await user.click(screen.getByRole("button", { name: /cancel/i }));

      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it("shows 'Add reminder' title in create mode", () => {
      renderModal();
      expect(
        screen.getByRole("dialog", { name: /add reminder/i }),
      ).toBeInTheDocument();
    });

    it("shows 'Edit reminder' title in edit mode", () => {
      renderModal({ reminder: buildReminder() });
      expect(
        screen.getByRole("dialog", { name: /edit reminder/i }),
      ).toBeInTheDocument();
    });
  });

  describe("form validation", () => {
    it("shows field error from VALIDATION response", async () => {
      mockAdd.mockResolvedValueOnce({
        ok: false,
        error: {
          type: "VALIDATION",
          param: "content",
          message: "Content is required",
        },
      });
      const user = userEvent.setup();
      const { container } = renderModal();

      const dateInput = container.querySelector('input[name="remindAt"]')!;
      await user.type(dateInput as HTMLElement, "2026-08-01");
      await user.type(screen.getByPlaceholderText(/prepare problems/i), "  ");
      await user.click(screen.getByRole("button", { name: /add reminder/i }));

      expect(
        await screen.findByText(/content is required/i),
      ).toBeInTheDocument();
    });

    it("shows generic error on FAILURE response", async () => {
      mockAdd.mockResolvedValueOnce({
        ok: false,
        error: { type: "FAILURE" },
      });
      const user = userEvent.setup();
      const { container } = renderModal();

      const dateInput = container.querySelector('input[name="remindAt"]')!;
      await user.type(dateInput as HTMLElement, "2026-08-01");
      await user.type(
        screen.getByPlaceholderText(/prepare problems/i),
        "Some content",
      );
      await user.click(screen.getByRole("button", { name: /add reminder/i }));

      expect(
        await screen.findByText(/something went wrong/i),
      ).toBeInTheDocument();
    });
  });

  describe("submit — create mode", () => {
    it("calls addReminder with FormData and closes on success", async () => {
      const onOpenChange = vi.fn();
      const user = userEvent.setup();
      const { container } = renderModal({ onOpenChange });

      await user.type(
        screen.getByPlaceholderText(/prepare problems/i),
        "Check inbox",
      );
      const dateInput = container.querySelector('input[name="remindAt"]')!;
      await user.type(dateInput as HTMLElement, "2026-08-01");

      await user.click(screen.getByRole("button", { name: /add reminder/i }));

      await vi.waitFor(() => expect(mockAdd).toHaveBeenCalledOnce());
      const formData: FormData = mockAdd.mock.calls[0][0];
      expect(formData.get("content")).toBe("Check inbox");
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  describe("submit — edit mode", () => {
    it("calls updateReminder with reminder id on success", async () => {
      const reminder = buildReminder();
      const onOpenChange = vi.fn();
      const user = userEvent.setup();
      renderModal({ reminder, onOpenChange });

      await user.click(screen.getByRole("button", { name: /save changes/i }));

      await vi.waitFor(() =>
        expect(mockUpdate).toHaveBeenCalledWith("rem-1", expect.any(FormData)),
      );
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  describe("FOLLOW_UP type", () => {
    it("switches to follow-up fields when radio is selected", async () => {
      const user = userEvent.setup();
      renderModal();

      await user.click(screen.getByRole("radio", { name: /follow-up/i }));

      expect(screen.getByText(/follow-up reminder/i)).toBeInTheDocument();
      expect(screen.getByRole("spinbutton")).toBeInTheDocument(); // offsetDays number input
    });
  });
});
