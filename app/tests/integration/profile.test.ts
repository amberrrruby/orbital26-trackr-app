import { editProfile } from "@/app/actions/settings";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth", () => ({
  requireUserOrRedirectLogin: vi
    .fn()
    .mockResolvedValue(process.env.TEST_USER_ID),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

// Helper to build FormData
function makeFormData(fields: Record<string, string>): FormData {
  const fd = new FormData();
  Object.entries(fields).forEach(([k, v]) => fd.append(k, v));
  return fd;
}

describe("Profile settings", () => {
  describe("editProfile", () => {
    it("updates display name and redirects on valid input", async () => {
      await editProfile(makeFormData({ name: "B-san" }));
      expect(redirect).toHaveBeenCalledWith("/settings/profile?success=true");

      const row = await prisma.user.findUnique({
        where: { id: env.TEST_USER_ID },
      });
      expect(row?.name).toBe("B-san");
    });
    it("fails to update to empty display name and ", async () => {
      const res = await editProfile(makeFormData({ name: "" }));
      expect(res?.ok).toBe(false);
      if (!res || res.ok) {
        return;
      }
      expect(res.error.type).toBe("VALIDATION");
    });
  });
});
