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
  ResumeWithThumbnail,
} from "@/lib/types";
import { Application, Resume, Status } from "@/lib/generated/client";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { createId } from "@paralleldrive/cuid2";
import { revalidatePath } from "next/cache";
// import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
// import { createCanvas } from "@napi-rs/canvas";
import { resolve } from "path";
import { pathToFileURL } from "url";

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

export async function getResumesWithThumbnails(
  orderKey: SortableField = "updatedAt",
  order: OrderType = "desc",
  pageNumber: number = 0,
  pageSize: number = 12,
): Promise<
  Result<
    { resumes: ResumeWithThumbnail[]; totalCount: number },
    GetResumesError
  >
> {
  const res = await getResumes(orderKey, order, pageNumber, pageSize);
  if (!res.ok) {
    return res;
  }

  const { resumes, totalCount } = res.value;

  const supabase = await createSupabaseServerClient();
  const thumbnailPaths = resumes
    .filter((r) => r.thumbnailStatus === "ready" && r.thumbnailPath !== "")
    .map((r) => r.thumbnailPath);

  const signedUrlMap = new Map<string, string>();
  if (thumbnailPaths.length > 0) {
    const { data } = await supabase.storage
      .from("resumes")
      .createSignedUrls(thumbnailPaths, 60 * 60);
    data?.forEach((item) => {
      if (item.signedUrl && item.path)
        signedUrlMap.set(item.path, item.signedUrl);
    });
  }

  const resumesWithThumbnails = resumes.map((r) => ({
    ...r,
    signedThumbnailUrl: signedUrlMap.get(r.thumbnailPath) ?? null,
  }));

  return { ok: true, value: { resumes: resumesWithThumbnails, totalCount } };
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
  filePath: string,
  userId: string,
  resumeId: string,
): Promise<Result<string, GenerateThumbnailError>> {
  const [pdfjsLib, { createCanvas }] = await Promise.all([
    import("pdfjs-dist/legacy/build/pdf.mjs"),
    import("@napi-rs/canvas"),
  ]);
  try {
    // Step 1: Download the PDF from Supabase Storage
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.storage
      .from("resumes")
      .download(filePath);
    if (error || !data) {
      return { ok: false, error: { type: "FAILURE" } };
    }
    const pdfBuffer = await data.arrayBuffer();
    console.log("passed step 1");

    // Step 2: Load into PDF.js
    pdfjsLib.GlobalWorkerOptions.workerSrc = pathToFileURL(
      resolve(
        process.cwd(),
        "node_modules/pdfjs-dist/legacy/build/pdf.worker.min.mjs",
      ),
    ).toString();
    const pdfDoc = await pdfjsLib.getDocument({
      data: new Uint8Array(pdfBuffer),
      useWorkerFetch: false,
      useSystemFonts: true,
      disableFontFace: true,
    }).promise;
    console.log("passed step 2");

    // Step 3: Get page 1
    const page = await pdfDoc.getPage(1);
    console.log("passed step 3");

    // Step 4: Make canvas
    const scale = 1.5;
    const viewport = page.getViewport({ scale });
    const canvas = createCanvas(viewport.width, viewport.height);
    const context = canvas.getContext("2d");
    console.log("passed step 4");

    // Step 5: Render page on canvas
    await page.render({
      canvasContext: context as unknown as CanvasRenderingContext2D,
      canvas: canvas as unknown as HTMLCanvasElement,
      viewport,
    }).promise;
    console.log("passed step 5");

    // Step 6: Encode canvas as JPEG
    const imageBuffer = await canvas.encode("jpeg", 90);
    console.log("passed step 6");

    // Step 7: Upload
    const thumbnailPath = `thumbnails/${userId}/${resumeId}.jpg`;
    const { error: uploadError } = await supabase.storage
      .from("resumes")
      .upload(thumbnailPath, imageBuffer, {
        contentType: "image/jpeg",
        upsert: true,
      });
    if (uploadError) {
      console.log(uploadError.message);
      return { ok: false, error: { type: "FAILURE" } };
    }
    console.log("passed step 7");

    // Step 8: Return path
    return { ok: true, value: thumbnailPath }; // temporary
  } catch (err) {
    console.log(err);
    return { ok: false, error: { type: "FAILURE" } };
  }
}

// Form provides file path to bucket storage, then a signed URL is generated, expires in 1 hour
export async function createResume(
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

  // 2. Generate thumbnail
  // Because we need the resume ID here already,
  // we'd just generate a CUID here instead of letting the DB generate it.
  const resumeId = createId();

  let thumbnailPath: string | null = null;
  if (fileType === "pdf") {
    const thumbnailPathResult = await generateThumbnail(
      filePath,
      userId,
      resumeId,
    );
    if (!thumbnailPathResult.ok) {
      // non-fatal - just null
      console.log(
        `[NOTE] Called generateThumbnail. Hardcoded failure correctly returned.`,
      );
    } else {
      thumbnailPath = thumbnailPathResult.value;
    }
  }

  // 3. Write DB record
  try {
    const resume = await prisma.resume.create({
      data: {
        id: resumeId, // use our own CUID
        userId,
        title,
        notes,
        tags,
        filePath,
        fileType,
        thumbnailPath: thumbnailPath ?? "",
        thumbnailStatus:
          fileType === "docx"
            ? "ready"
            : thumbnailPath !== null
              ? "ready"
              : "failed",
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

  let thumbnailPath: string | null = null;
  let thumbnailStatus: string | undefined;

  if (filePath !== undefined && fileType !== undefined) {
    if (fileType === "pdf") {
      const thumbnailResult = await generateThumbnail(
        filePath,
        userId,
        resumeId,
      );
      if (!thumbnailResult.ok) {
        // non-fatal - just null
        console.log(
          `[NOTE] Called generateThumbnail. Hardcoded failure correctly returned.`,
        );
      } else {
        thumbnailPath = thumbnailResult.value;
      }
    }
    thumbnailStatus =
      fileType === "docx"
        ? "ready"
        : thumbnailPath !== null
          ? "ready"
          : "failed";
  }

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
          thumbnailPath: thumbnailPath ?? "",
          thumbnailStatus,
        }),
      },
    });
    if (result.count === 0) {
      return { ok: false, error: { type: "FAILURE" } };
    }
    revalidatePath(`/resumes/${resumeId}`);
    revalidatePath(`/resumes`);
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
  _bucket: string = "resumes", // only change for tests, in actual use this should just be "resumes" which is the default.
): Promise<Result<void, DeleteResumeError>> {
  const userId = await requireUserOrRedirectLogin();
  const supabase = await createSupabaseServerClient();
  try {
    const thumbnailPath = `thumbnails/${userId}/${resumeId}.jpg`;

    const { error: storageError } = await supabase.storage
      .from(_bucket)
      .remove([filePath, thumbnailPath]);

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
    revalidatePath(`/resumes/${resumeId}`);
    revalidatePath(`/resumes`);
    return { ok: true, value: undefined };
  } catch {
    return {
      ok: false,
      error: { type: "FAILURE" },
    };
  }
}
