import { editProfile } from "@/app/actions/settings";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth", () => ({
  requireUserOrRedirectLogin: vi
    .fn()
    .mockResolvedValue(process.env.TEST_USER_ID),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

afterEach(async () => {
  await prisma.user.update({
    where: { id: env.TEST_USER_ID },
    data: { name: "RunningTests2" },
  });
});

// Helper to build FormData
function makeFormData(fields: Record<string, string>): FormData {
  const fd = new FormData();
  Object.entries(fields).forEach(([k, v]) => fd.append(k, v));
  return fd;
}

describe("Profile settings", () => {
  describe("editProfile", () => {
    it("updates display name and redirects on valid input", async () => {
      await editProfile(makeFormData({ name: "SomeOtherName" }));
      expect(redirect).toHaveBeenCalledWith("/settings/profile?success=true");

      const row = await prisma.user.findUnique({
        where: { id: env.TEST_USER_ID },
      });
      expect(row?.name).toBe("SomeOtherName");
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
