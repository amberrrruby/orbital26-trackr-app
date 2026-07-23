import { describe, expect, test, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import EditProfileForm from "@/app/(authenticated)/settings/profile/EditProfileForm";
import type { User } from "@/lib/generated/client";
import userEvent from "@testing-library/user-event";
import { editProfile } from "@/app/actions/settings";
import { ToastProvider } from "@/app/components/Toast";

vi.mock("@/app/actions/settings", () => ({
  editProfile: vi.fn(),
  updateReminderSettings: vi.fn(),
}));

const settings = {
  eventReminderDays: [1, 3],
  appliedFollowUpDays: 7,
  assessmentFollowUpDays: 7,
  interviewFollowUpDays: 7,
};

const mockUser: User = {
  id: "mock-user-1",
  email: "someone@example.com",
  name: "Someone",
  createdAt: new Date("2024-01-01"),
  settings,
};

describe("Settings page", () => {
  test("save button is disabled initially", () => {
    render(
      <ToastProvider>
        <EditProfileForm userProfile={mockUser} userSettings={settings} />
      </ToastProvider>,
    );

    expect(
      screen.getByRole("button", { name: /save changes/i }),
    ).toBeDisabled();
  });

  test("save button becomes enabled after changing display name", async () => {
    const u = userEvent.setup();

    render(
      <ToastProvider>
        <EditProfileForm userProfile={mockUser} userSettings={settings} />
      </ToastProvider>,
    );

    const input = screen.getByLabelText(/display name/i);

    await u.clear(input);
    await u.type(input, "Someone2");

    const profileForm = screen.getByRole("form", {
      name: /profile settings/i,
    });

    expect(
      within(profileForm).getByRole("button", {
        name: /save changes/i,
      }),
    ).toBeEnabled();
  });

  test("save button becomes disabled again when reverted", async () => {
    const u = userEvent.setup();

    render(
      <ToastProvider>
        <EditProfileForm userProfile={mockUser} userSettings={settings} />
      </ToastProvider>,
    );

    const input = screen.getByLabelText(/display name/i);

    await u.clear(input);
    await u.type(input, "Someone2");

    expect(screen.getByRole("button", { name: /save changes/i })).toBeEnabled();

    await u.clear(input);
    await u.type(input, "Someone");

    expect(
      screen.getByRole("button", { name: /save changes/i }),
    ).toBeDisabled();
  });

  test("submits profile changes", async () => {
    vi.mocked(editProfile).mockResolvedValue({
      ok: true,
      value: undefined,
    });

    const u = userEvent.setup();

    render(
      <ToastProvider>
        <EditProfileForm userProfile={mockUser} userSettings={settings} />
      </ToastProvider>,
    );

    await u.clear(screen.getByLabelText(/display name/i));
    await u.type(screen.getByLabelText(/display name/i), "Someone2");

    await u.click(
      screen.getByRole("button", {
        name: /save changes/i,
      }),
    );

    expect(editProfile).toHaveBeenCalledOnce();
  });
});
