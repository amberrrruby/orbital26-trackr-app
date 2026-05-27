"use server";

import { prisma } from "@/lib/prisma";
import {
  requireApplicationOwnership,
  requireUserOrRedirectLogin,
} from "@/lib/auth";
import {
  AddResumeError,
  ResumeSchema,
  AppUploadError,
  GetAggregateStatsError,
  GetResumesError,
  GetTopKRecentApplicationsError,
  Result,
  UpdateResumeError,
  UpdateResumeSchema,
  DeleteResumeError,
} from "@/lib/types";
import { Application, Status } from "@/lib/generated/client";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";

export const SORTABLE_FIELDS = ["createdAt", "updatedAt"] as const;
export type SortableField = (typeof SORTABLE_FIELDS)[number];
export type AggregateStats = Record<Status, number> & { TOTAL: number };

// TODO: RESUME
export async function getResumes(
  orderKey: SortableField = "updatedAt",
  order: "asc" | "desc" = "desc",
  pageNumber: number = 0,
  pageSize: number = 12,
): Promise<Result<{ resumes: Resume[]; totalCount: number }, GetResumesError>> {
  const user = await requireUserOrRedirectLogin();

  // Verify orderKey is an existing, orderable key
  if (!SORTABLE_FIELDS.includes(orderKey)) {
    return {
      ok: false,
      error: {
        type: "VALIDATION",
        param: "orderKey",
        message: `Invalid sort field ${orderKey}`,
      },
    };
  }
  // Simple verification for pageNumber pageEnd
  if (pageNumber < 0) {
    return {
      ok: false,
      error: {
        type: "VALIDATION",
        param: "pageNumber",
        message: `Invalid pagination argument ${pageNumber}`,
      },
    };
  }

  if (pageSize < 1 || pageSize > 100) {
    return {
      ok: false,
      error: {
        type: "VALIDATION",
        param: "pageSize",
        message: `Invalid pagination argument ${pageSize}`,
      },
    };
  }

  try {
    const [resumes, totalCount] = (await prisma.$transaction([
      prisma.resume.findMany({
        where: { userId: user },
        orderBy: { [orderKey]: order },
        skip: pageNumber * pageSize,
        take: pageSize,
      }),
      prisma.resume.count({ where: { userId: user } }),
    ])) as [Resume[], number];
    return { resumes, totalCount };
  } catch (err) {
    return {
      ok: false,
      error: {
        type: "DB",
        message: `Failed to fetch resumes: ${err}`,
      },
    };
  }
}

export async function getAggregateStats(
  resumeId: string,
): Promise<Result<AggregateStats, GetAggregateStatsError>> {
  try {
    const groupedApplications = await prisma.application.groupBy({
      by: ["status"],
      where: { resumeId },
      _count: { status: true },
    });

    const zero = Object.fromEntries(
      Object.values(Status).map((st) => [st, 0]),
    ) as Record<Status, number>;

    const counts = groupedApplications.reduce((acc, group) => {
      acc[group.status] = group._count.status ?? 0;
      return acc;
    }, zero);

    const total = Object.values(counts).reduce((acc, n) => acc + n, 0);

    return { ok: true, value: { ...counts, TOTAL: total } };
  } catch (err) {
    return {
      ok: false,
      error: { type: "DB", message: `Failed to fetch stats: ${err}` },
    };
  }
}

export async function getTopKRecentApplications(
  resumeId: string,
  k: number = 3,
): Promise<Result<Application[], GetTopKRecentApplicationsError>> {
  try {
    const topKApplications = await prisma.application.findMany({
      where: { resumeId },
      orderBy: { updatedAt: "desc" },
      take: k,
    });
    return { ok: true, value: topKApplications };
  } catch (err) {
    return {
      ok: false,
      error: { type: "DB", message: `Failed to fetch stats: ${err}` },
    };
  }
}

export async function uploadResumeFile(
  file: File,
  userId: string,
): Promise<Result<string, AppUploadError>> {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase.storage
    .from("resumes")
    .upload(`${userId}/${Date.now()}-${file.name}`, file); // unique filename!
  if (error) {
    return {
      ok: false,
      error: {
        type: "UPLOAD",
        message: error.message,
      },
    };
  }
  // Note getPublicUrl is synchoronous no await, constructs URL locally without network calls.
  const { data: urlData } = supabase.storage
    .from("resumes")
    .getPublicUrl(data.path);
  return {
    ok: true,
    value: urlData.publicUrl,
  };
}

// export async function generateThumbnail(fileUrl: string, userId: string): Promise<Result<string, GenerateThumbnailError>> {
//     return {
//         ok: true,
//         value: "TEMPORARY"
//     };
// }

export async function addResume(
  formData: FormData,
): Promise<Result<string, AddResumeError>> {
  const userId = await requireUserOrRedirectLogin();
  const parseResult = ResumeSchema.safeParse({
    title: formData.get("title"),
    notes: formData.get("notes"),
    tags: formData.get("tags") ?? "",
    file: formData.get("file"),
  });
  if (!parseResult.success) {
    const first = parseResult.error.errors[0];
    return {
      ok: false,
      error: {
        type: "VALIDATION",
        param: first.path[0] as string,
        message: first.message,
      },
    };
  }
  const { title, notes, tags, file } = parseResult.data;
  const fileType = file.name.endsWith(".pdf") ? "PDF" : "DOCX";

  // 1. Upload file
  const resumeUrlResult = await uploadResumeFile(file, userId);
  if (!resumeUrlResult.ok) {
    return resumeUrlResult;
  }
  const resumeUrl = resumeUrlResult.value;

  // 2. Generate thumbnail (CURRENTLY ONLY PDF)
  let thumbnailPath: string | null = null;
  if (fileType === "PDF") {
    const thumbnailPathResult = await generateThumbnail(resumeUrl, userId);
    if (!thumbnailPathResult.ok) {
      // non-fatal - just null
      console.log(
        `[NOTE] Error in thumbnail generation - err caught and nothing else. err: ${thumbnailPathResult.error.message}`,
      );
    }
    thumbnailPath = thumbnailPathResult.value;
  }

  // 3. Write DB record
  try {
    const resume = await prisma.resume.create({
      data: {
        userId,
        title,
        notes,
        tags,
        resumeUrl,
        fileType,
        thumbnailPath,
        thumbnailStatus:
          fileType === "DOCX" || thumbnailPath ? "ready" : "failed",
      },
    });
    return { ok: true, value: resume.id };
  } catch (err) {
    return {
      ok: false,
      error: {
        type: "DB",
        message: `Failed to create resume record: ${err}`,
      },
    };
  }
}

export async function updateResume(
  resumeId: string,
  formData: FormData,
): Promise<Result<string, UpdateResumeError>> {
  const userId = await requireUserOrRedirectLogin();

  const parseResult = UpdateResumeSchema.safeParse({
    title: formData.get("title"),
    notes: formData.get("notes"),
    tags: formData.get("tags") ?? "",
    file: formData.get("file"),
  });
  if (!parseResult.success) {
    const first = parseResult.error.errors[0];
    return {
      ok: false,
      error: {
        type: "VALIDATION",
        param: first.path[0] as string,
        message: first.message,
      },
    };
  }

  const { title, notes, tags, file } = parseResult.data;

  // Only re-upload if a new file was provided
  let resumeUrl: string | undefined;
  let thumbnailPath: string | null | undefined;
  let fileType: string | undefined;
  let thumbnailStatus: string | undefined;

  if (file) {
    fileType = file.name.endsWith(".pdf") ? "PDF" : "DOCX";

    const resumeUrlResult = await uploadResumeFile(file, userId);
    if (!resumeUrlResult.ok) return resumeUrlResult;
    resumeUrl = resumeUrlResult.value;

    thumbnailPath = null;
    if (fileType === "PDF") {
      const thumbnailResult = await generateThumbnail(resumeUrl, userId);
      if (!thumbnailResult.ok) {
        console.log(
          `[NOTE] Thumbnail generation failed: ${thumbnailResult.error.message}`,
        );
      }
      thumbnailPath = thumbnailResult.ok ? thumbnailResult.value : null;
    }
    thumbnailStatus = fileType === "DOCX" || thumbnailPath ? "ready" : "failed";
  }

  try {
    const resume = await prisma.resume.update({
      where: { id: resumeId, userId }, // userId guard prevents updating another user's resume
      data: {
        title,
        notes,
        tags,
        ...(resumeUrl !== undefined && { resumeUrl }),
        ...(fileType !== undefined && { fileType }),
        ...(thumbnailPath !== undefined && { thumbnailPath }),
        ...(thumbnailStatus !== undefined && { thumbnailStatus }),
      },
    });
    return { ok: true, value: resume.id };
  } catch (err) {
    return {
      ok: false,
      error: { type: "DB", message: `Failed to update resume: ${err}` },
    };
  }
}

export async function deleteResume(
  resumeId: string,
): Promise<Result<void, DeleteResumeError>> {
  const userId = await requireUserOrRedirectLogin();
  const res = await requireApplicationOwnership(resumeId, userId);
  if (!res.ok) {
    return res;
  }
  try {
    await prisma.resume.delete({ where: { id: resumeId } });
    return { ok: true, value: undefined };
  } catch (err) {
    return {
      ok: false,
      error: {
        type: "DB",
        message: `Failed to delete resume: ${err}`,
      },
    };
  }
}
