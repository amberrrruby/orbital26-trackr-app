import {
  getResumes,
  createResume,
  updateResume,
  deleteResume,
} from "@/app/actions/resume";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { createClient } from "@supabase/supabase-js";
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from "vitest";

// ─── Constants ────────────────────────────────────────────────────────────────

const TEST_USER_ID = env.TEST_USER_ID!;
const OTHER_USER_ID = "00000000-0000-0000-0000-000000000000";
const TEST_BUCKET = "test_resumes";

const VALID_RESUME_FIELDS = {
  title: "Product Manager",
  notes: "some unformatted notes",
  tags: "pm, uiux",
  filePath: `files/${TEST_USER_ID}/test-create.pdf`,
  fileType: "pdf",
};

const INVALID_RESUME_FIELDS = {
  title: "",
  filePath: "",
  fileType: "",
};

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock("@/lib/auth", () => ({
  requireUserOrRedirectLogin: vi
    .fn()
    .mockResolvedValue(process.env.TEST_USER_ID), // due to hoisting, this must be taken from process.env.
}));

vi.mock("@/lib/supabase/server-client", () => ({
  createSupabaseServerClient: vi.fn(), // mock with vi.fn() first, then point to supabaseAdmin in beforeAll after it's defined
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

// ─── Supabase admin client ────────────────────────────────────────────────────

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// ─── Factories ────────────────────────────────────────────────────────────────

const BASE_RESUME = {
  filePath: "files/test/placeholder.pdf",
  fileType: "pdf",
  thumbnailPath: "DUMMY",
  thumbnailStatus: "failed" as const,
};

function makeResumeData(
  overrides: { userId: string; title: string } & Partial<typeof BASE_RESUME>,
) {
  return { ...BASE_RESUME, ...overrides };
}

function makeFormData(fields: Record<string, string>): FormData {
  const fd = new FormData();
  Object.entries(fields).forEach(([k, v]) => fd.append(k, v));
  return fd;
}

// ─── Storage helpers ──────────────────────────────────────────────────────────

async function uploadTestFile(path: string): Promise<void> {
  const dummyFile = new Uint8Array([0x25, 0x50, 0x44, 0x46]); // pdf magic bytes
  await supabaseAdmin.storage.from(TEST_BUCKET).upload(path, dummyFile, {
    contentType: "application/pdf",
    upsert: true,
  });
}

async function fileExistsInBucket(path: string): Promise<boolean> {
  const { data, error } = await supabaseAdmin.storage
    .from(TEST_BUCKET)
    .exists(path);
  return !error && !!data;
}

// ─── Lifecycle ────────────────────────────────────────────────────────────────

beforeAll(async () => {
  // now supabaseAdmin is defined, point the mock at it
  vi.mocked(createSupabaseServerClient).mockResolvedValue(supabaseAdmin);

  const { error } = await supabaseAdmin.storage.createBucket(TEST_BUCKET, {
    public: false,
  });
  if (error && !error.message.includes("already exists")) throw error;
});

afterEach(async () => {
  await prisma.resume.deleteMany({
    where: { userId: { in: [TEST_USER_ID, OTHER_USER_ID] } },
  });

  const { data: files } = await supabaseAdmin.storage
    .from(TEST_BUCKET)
    .list(`files/${TEST_USER_ID}`);
  if (files?.length) {
    await supabaseAdmin.storage
      .from(TEST_BUCKET)
      .remove(files.map((f) => `files/${TEST_USER_ID}/${f.name}`));
  }
});

afterAll(async () => {
  await supabaseAdmin.storage.emptyBucket(TEST_BUCKET);
  await supabaseAdmin.storage.deleteBucket(TEST_BUCKET);
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("Resumes", () => {
  describe("createResume", () => {
    it("returns the new resume id on valid input", async () => {
      await uploadTestFile(VALID_RESUME_FIELDS.filePath);

      const res = await createResume(makeFormData(VALID_RESUME_FIELDS));

      expect(res.ok).toBe(true);
      if (!res.ok) return;
      expect(typeof res.value).toBe("string");

      const record = await prisma.resume.findUnique({
        where: { id: res.value },
      });
      expect(record).not.toBeNull();
      expect(record?.filePath).toBe(VALID_RESUME_FIELDS.filePath);
    });

    it("returns a schema validation error on invalid input", async () => {
      const res = await createResume(makeFormData(INVALID_RESUME_FIELDS));

      expect(res.ok).toBe(false);
      if (res.ok) return;
      expect(res.error.type).toBe("VALIDATION");
    });
  });

  describe("getResumes", () => {
    it("returns an empty array when user has no resumes", async () => {
      const res = await getResumes();

      expect(res.ok).toBe(true);
      if (!res.ok) return;
      expect(res.value.resumes).toHaveLength(0);
      expect(res.value.totalCount).toBe(0);
    });

    it("returns all resumes belonging to the user", async () => {
      await prisma.resume.createMany({
        data: [
          makeResumeData({
            userId: TEST_USER_ID,
            title: "Resume A",
            filePath: "files/test/a.pdf",
          }),
          makeResumeData({
            userId: TEST_USER_ID,
            title: "Resume B",
            filePath: "files/test/b.pdf",
          }),
        ],
      });

      const res = await getResumes();

      expect(res.ok).toBe(true);
      if (!res.ok) return;
      expect(res.value.resumes).toHaveLength(2);
      expect(res.value.totalCount).toBe(2);
    });

    it("does not return resumes belonging to another user", async () => {
      await prisma.resume.createMany({
        data: [
          makeResumeData({
            userId: TEST_USER_ID,
            title: "Mine",
            filePath: "files/test/mine.pdf",
          }),
          makeResumeData({
            userId: OTHER_USER_ID,
            title: "Theirs",
            filePath: "files/other/theirs.pdf",
          }),
        ],
      });

      const res = await getResumes();

      expect(res.ok).toBe(true);
      if (!res.ok) return;
      expect(res.value.resumes).toHaveLength(1);
      expect(res.value.resumes[0].title).toBe("Mine");
    });
  });

  describe("updateResume", () => {
    it("updates the resume and returns ok", async () => {
      const record = await prisma.resume.create({
        data: makeResumeData({
          userId: TEST_USER_ID,
          title: "Old Title",
          filePath: "files/test/old.pdf",
        }),
      });

      const formData = makeFormData({
        title: "New Title",
        filePath: "files/test/old.pdf", // same file, no replacement
        fileType: "pdf",
        notes: "Updated note",
        tags: "",
      });

      const res = await updateResume(record.id, formData);

      expect(res.ok).toBe(true);
      const updated = await prisma.resume.findUnique({
        where: { id: record.id },
      });
      expect(updated?.title).toBe("New Title");
      expect(updated?.notes).toBe("Updated note");
    });

    it("returns FAILURE when resume does not belong to the user", async () => {
      const record = await prisma.resume.create({
        data: makeResumeData({
          userId: OTHER_USER_ID,
          title: "Theirs",
          filePath: "files/other/x.pdf",
        }),
      });

      const res = await updateResume(
        record.id,
        makeFormData({
          title: "Hacked",
          filePath: "files/other/x.pdf",
          fileType: "pdf",
          tags: "",
          notes: "",
        }),
      );

      expect(res.ok).toBe(false);
      if (res.ok) return;
      expect(res.error.type).toBe("FAILURE");
    });

    it("returns a schema validation error on invalid input", async () => {
      const record = await prisma.resume.create({
        data: makeResumeData({
          userId: TEST_USER_ID,
          title: "Valid",
          filePath: "files/test/v.pdf",
        }),
      });

      const res = await updateResume(
        record.id,
        makeFormData(INVALID_RESUME_FIELDS),
      );

      expect(res.ok).toBe(false);
      if (res.ok) return;
      expect(res.error.type).toBe("VALIDATION");
    });
  });

  describe("deleteResume", () => {
    it("deletes the resume and returns ok", async () => {
      const filePath = `files/${TEST_USER_ID}/to-delete.pdf`;
      await uploadTestFile(filePath);

      const record = await prisma.resume.create({
        data: makeResumeData({
          userId: TEST_USER_ID,
          title: "To Delete",
          filePath,
        }),
      });

      const res = await deleteResume(record.id, filePath, TEST_BUCKET);

      expect(res.ok).toBe(true);
      expect(
        await prisma.resume.findUnique({ where: { id: record.id } }),
      ).toBeNull();
      expect(await fileExistsInBucket(filePath)).toBe(false);
    });

    it("returns FAILURE when resume does not belong to the user", async () => {
      const filePath = "files/other/y.pdf";
      const record = await prisma.resume.create({
        data: makeResumeData({
          userId: OTHER_USER_ID,
          title: "Theirs",
          filePath,
        }),
      });

      const res = await deleteResume(record.id, filePath);

      expect(res.ok).toBe(false);
      expect(
        await prisma.resume.findUnique({ where: { id: record.id } }),
      ).not.toBeNull();
    });
  });
});
