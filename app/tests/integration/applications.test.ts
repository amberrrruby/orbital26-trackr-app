import {
  createApplication,
  getApplications,
  updateApplication,
  deleteApplication,
} from "@/app/actions/applications";
import { env } from "@/lib/env";
import { Status } from "@/lib/generated/enums";
import { prisma } from "@/lib/prisma";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth", () => ({
  requireUserOrRedirectLogin: vi
    .fn()
    .mockResolvedValue(process.env.TEST_USER_ID),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

afterEach(async () => {
  await prisma.application.deleteMany({
    where: { userId: env.TEST_USER_ID },
  });
});

// Helper to build FormData
function makeFormData(fields: Record<string, string>): FormData {
  const fd = new FormData();
  Object.entries(fields).forEach(([k, v]) => fd.append(k, v));
  return fd;
}

const validApplicationFields = {
  company: "Acme",
  role: "Engineer",
  source: "LinkedIn",
  status: Status.APPLIED,
  notes: "",
};

describe("Applications", () => {
  describe("createApplication", () => {
    it("returns the new application id on valid input", async () => {
      const result = await createApplication(
        makeFormData(validApplicationFields),
      );
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(typeof result.value).toBe("string");
      }
    });

    it("returns a schema validation error on invalid input", async () => {
      const result = await createApplication(makeFormData({ company: "" }));
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.type).toBe("VALIDATION");
      }
    });
  });

  describe("getApplications", () => {
    it("returns an empty array when user has no applications", async () => {
      const result = await getApplications();
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toHaveLength(0);
      }
    });

    it("returns all applications belonging to the user", async () => {
      await createApplication(makeFormData(validApplicationFields));
      await createApplication(
        makeFormData({ ...validApplicationFields, company: "Globex" }),
      );

      const result = await getApplications();
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toHaveLength(2);
      }
    });

    it("does not return applications belonging to another user", async () => {
      // Seed a row directly under a different userId
      await prisma.application.create({
        data: {
          ...validApplicationFields,
          source: "",
          notes: null,
          userId: "00000000-0000-0000-0000-000000000000",
        },
      });

      const result = await getApplications();
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toHaveLength(0);
      }
    });
  });

  describe("updateApplication", () => {
    it("updates the application and returns ok", async () => {
      const created = await createApplication(
        makeFormData(validApplicationFields),
      );
      expect(created.ok).toBe(true);
      if (!created.ok) {
        return;
      }

      const result = await updateApplication(
        makeFormData({
          ...validApplicationFields,
          id: created.value,
          company: "Updated Co",
        }),
      );
      expect(result.ok).toBe(true);

      const row = await prisma.application.findUnique({
        where: { id: created.value },
      });
      expect(row?.company).toBe("Updated Co");
    });

    it("returns FAILURE when application does not belong to the user", async () => {
      const result = await updateApplication(
        makeFormData({
          ...validApplicationFields,
          id: "00000000-0000-0000-0000-000000000000",
        }),
      );
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.type).toBe("FAILURE");
      }
    });

    it("returns a schema validation error on invalid input", async () => {
      const result = await updateApplication(makeFormData({ id: "" }));
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.type).toBe("VALIDATION");
      }
    });
  });

  describe("deleteApplication", () => {
    it("deletes the application and returns ok", async () => {
      const created = await createApplication(
        makeFormData(validApplicationFields),
      );
      expect(created.ok).toBe(true);
      if (!created.ok) {
        return;
      }

      const result = await deleteApplication(created.value);
      expect(result.ok).toBe(true);

      const row = await prisma.application.findUnique({
        where: { id: created.value },
      });
      expect(row).toBeNull();
    });

    it("returns FAILURE when application does not belong to the user", async () => {
      const result = await deleteApplication(
        "00000000-0000-0000-0000-000000000000",
      );
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.type).toBe("FAILURE");
      }
    });
  });
});
