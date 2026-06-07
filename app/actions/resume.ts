"use server";

import { prisma } from "@/lib/prisma";
import { requireUserOrRedirectLogin } from "@/lib/auth";
import {
  AddResumeError,
  ResumeSchema,
  GetAggregateStatsError,
  GetResumesError,
  GetTopKRecentApplicationsError,
  Result,
  UpdateResumeError,
  UpdateResumeSchema,
  DeleteResumeError,
  SortableField,
  AggregateStats,
  GetResumesParamsSchema,
  OrderType,
  returnSchemaValidationError,
  GenerateThumbnailError,
} from "@/lib/types";
import { Application, Resume, Status } from "@/lib/generated/client";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export async function getResumes(
  orderKey: SortableField = "updatedAt",
  order: OrderType = "desc",
  pageNumber: number = 0,
  pageSize: number = 12,
): Promise<Result<{ resumes: Resume[]; totalCount: number }, GetResumesError>> {
  const user = await requireUserOrRedirectLogin();

  const parseResult = GetResumesParamsSchema.safeParse({
    orderKey,
    order,
    pageNumber,
    pageSize,
  });

  if (!parseResult.success) {
    return {
      ok: false,
      error: returnSchemaValidationError(parseResult),
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
    return { ok: true, value: { resumes, totalCount } };
  } catch {
    return {
      ok: false,
      error: { type: "FAILURE" },
    };
  }
}

export async function getAggregateStats(
  resumeId: string,
): Promise<Result<AggregateStats, GetAggregateStatsError>> {
  const userId = await requireUserOrRedirectLogin();
  try {
    const groupedApplications = await prisma.application.groupBy({
      by: ["status"],
      where: { userId, resumeId },
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
  } catch {
    return {
      ok: false,
      error: { type: "FAILURE" },
    };
  }
}

export async function getTopKRecentApplications(
  resumeId: string,
  k: number = 3,
): Promise<Result<Application[], GetTopKRecentApplicationsError>> {
  const userId = await requireUserOrRedirectLogin();
  try {
    const topKApplications = await prisma.application.findMany({
      where: { userId, resumeId },
      orderBy: { updatedAt: "desc" },
      take: k,
    });
    return { ok: true, value: topKApplications };
  } catch {
    return {
      ok: false,
      error: { type: "FAILURE" },
    };
  }
}

export async function generateThumbnail(
  _fileUrl: string,
  _userId: string,
): Promise<Result<string, GenerateThumbnailError>> {
  // TEMPORARY
  return {
    ok: false,
    error: { type: "FAILURE" },
  };
}

// Form just provides the resume URL directly
export async function addResume(
  formData: FormData,
): Promise<Result<string, AddResumeError>> {
  const userId = await requireUserOrRedirectLogin();
  const parseResult = ResumeSchema.safeParse({
    title: formData.get("title"),
    notes: formData.get("notes"),
    tags: formData.get("tags") ?? "",
    filePath: formData.get("filePath"),
    fileType: formData.get("fileType"),
  });
  if (!parseResult.success) {
    return {
      ok: false,
      error: returnSchemaValidationError(parseResult),
    };
  }
  const { title, notes, tags, filePath, fileType } = parseResult.data;

  // 1. Upload file (should be handled by a component)
  // const resumeUrlResult = await uploadResumeFile(file, userId);
  // if (!resumeUrlResult.ok) {
  //   return resumeUrlResult;
  // }
  // const resumeUrl = resumeUrlResult.value;

  // 2. Generate thumbnail (CURRENTLY DISABLED)
  // let thumbnailPath: string | null = null;
  const thumbnailPath: string = "DUMMY"; // i forgor to do String? in schema :wilted_rose:
  // if (fileType === "pdf") {

  //   TODO: resumeUrl to be changed with getting a signedUrl

  //   const thumbnailPathResult = await generateThumbnail(resumeUrl, userId);
  //   if (!thumbnailPathResult.ok) {
  //     // non-fatal - just null
  //     console.log(
  //       `[NOTE] Called generateThumbnail. Hardcoded failure correctly returned.`,
  //     );
  //   } else {
  //     thumbnailPath = thumbnailPathResult.value;
  //   }
  // }

  // 3. Write DB record
  try {
    const resume = await prisma.resume.create({
      data: {
        userId,
        title,
        notes,
        tags,
        filePath,
        fileType,
        thumbnailPath, // will always be "DUMMY" for now
        // will always be "failed" for now
        thumbnailStatus: "failed",
        // fileType === "docx"
        //   ? "ready"
        //   : thumbnailPath !== null
        //     ? "ready"
        //     : "failed",
      },
    });
    return { ok: true, value: resume.id };
  } catch {
    return {
      ok: false,
      error: { type: "FAILURE" },
    };
  }
}

export async function updateResume(
  resumeId: string,
  formData: FormData,
): Promise<Result<void, UpdateResumeError>> {
  const userId = await requireUserOrRedirectLogin();

  const parseResult = UpdateResumeSchema.safeParse({
    title: formData.get("title"),
    notes: formData.get("notes"),
    tags: formData.get("tags") ?? "",
    filePath: formData.get("filePath") ?? undefined,
    fileType: formData.get("fileType") ?? undefined,
  });
  if (!parseResult.success) {
    return {
      ok: false,
      error: returnSchemaValidationError(parseResult),
    };
  }

  const { title, notes, tags, filePath, fileType } = parseResult.data;

  const thumbnailPath: string = "DUMMY"; // i forgor
  const thumbnailStatus: string = "failed";

  // let thumbnailPath: string | null = null;
  // let thumbnailStatus: string | undefined;

  // TODO: resumeUrl to be changed with getting a signedUrl

  // if (resumeUrl !== undefined && fileType !== undefined) {
  //   if (fileType === "pdf") {
  //     const thumbnailResult = await generateThumbnail(resumeUrl, userId);
  //     if (!thumbnailResult.ok) {
  //       console.log(
  //         `[NOTE] Called generateThumbnail. Hardcoded failure correctly returned.`,
  //       );
  //     } else {
  //       thumbnailPath = thumbnailResult.value;
  //     }
  //   }
  //   thumbnailStatus =
  //     fileType === "docx"
  //       ? "ready"
  //       : thumbnailPath !== null
  //         ? "ready"
  //         : "failed";
  // }

  try {
    const result = await prisma.resume.updateMany({
      where: { id: resumeId, userId }, // userId guard prevents updating another user's resume
      data: {
        title,
        notes,
        tags,
        ...(filePath !== undefined && { filePath }),
        ...(fileType !== undefined && { fileType }),
        ...(thumbnailStatus !== undefined && {
          thumbnailPath,
          thumbnailStatus,
        }),
      },
    });
    if (result.count === 0) {
      return { ok: false, error: { type: "FAILURE" } };
    }
    // revalidatePath(`/applications`);
    return { ok: true, value: undefined };
  } catch {
    return {
      ok: false,
      error: { type: "FAILURE" },
    };
  }
}

export async function deleteResume(
  resumeId: string,
  filePath: string,
): Promise<Result<void, DeleteResumeError>> {
  const userId = await requireUserOrRedirectLogin();
  const supabase = await createSupabaseServerClient();
  try {
    const { error: storageError } = await supabase.storage
      .from("resumes")
      .remove([filePath]);

    if (storageError) {
      return { ok: false, error: { type: "FAILURE" } };
    }

    const { count } = await prisma.resume.deleteMany({
      where: {
        id: resumeId,
        userId,
      },
    });
    if (count === 0) {
      return { ok: false, error: { type: "FAILURE" } };
    }
    // revalidatePath(`/applications`);
    return { ok: true, value: undefined };
  } catch {
    return {
      ok: false,
      error: { type: "FAILURE" },
    };
  }
}
