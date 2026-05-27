import z from "zod";

export type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

export type AppAuthError = { type: "UNAUTHORIZED"; message: "Unauthorized" };

export type AppUnknownError = { type: "UNKNOWN"; message: string };

// message hardcoded for enumeration protection
export type AppOwnershipError = { type: "NOT_FOUND"; message: "Not found" };

export type AppDbError = { type: "DB"; message: string };

export type AppUploadError = { type: "UPLOAD"; message: string };

// Action-related errors

export type ActionValidationError = {
  type: "VALIDATION";
  param: string;
  message: string;
};

// Actions: Resumes
export type GetResumesError =
  | AppAuthError
  | AppDbError
  | ActionValidationError
  | AppUnknownError;

export type GetAggregateStatsError = AppDbError;

export type GetTopKRecentApplicationsError = AppDbError;

export type AddResumeError =
  | ActionValidationError
  | AppDbError
  | AppUploadError;

export type UpdateResumeError =
  | ActionValidationError
  | AppDbError
  | AppUploadError;

export type DeleteResumeError = AppOwnershipError | AppDbError;

// export type GenerateThumbnailError
// TODO: resolve after thumbnail generation service is confirmed

const ACCEPTED_FILE_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const MAX_FILE_SIZE_MB = 10;

const ResumeBaseSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title too long"),
  notes: z.string().max(1000, "Notes too long").optional(),
  tags: z.string().transform((val) =>
    val
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean),
  ),
});

const ResumeFileSchema = z.object({
  file: z
    .instanceof(File)
    .refine((f) => f.size > 0, "File is required")
    .refine(
      (f) => f.size <= MAX_FILE_SIZE_MB * 1024 * 1024,
      `File must be under ${MAX_FILE_SIZE_MB} MB`,
    )
    .refine(
      (f) => ACCEPTED_FILE_TYPES.includes(f.type),
      "Only PDF or DOCX files are currently accepted",
    ),
});

export const ResumeSchema = ResumeBaseSchema.extend(ResumeFileSchema.shape);

export const UpdateResumeSchema = ResumeBaseSchema.extend({
  file: ResumeFileSchema.shape.file.optional(),
});

// export type GetApplicationsError = AppAuthError | AppDbError | AppUnknownError;

// Settings-related errors

// export type SettingsError =
//     | ChangePasswordError
//     | DeleteAccountError

export type ChangePasswordError = AppAuthError | AppUnknownError;

export type EditProfileError = AppAuthError | AppUnknownError;

export type DeleteAccountError = AppAuthError | AppUnknownError;

export const SignupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email("Invalid email"),
  // currently signup doesn't require a confirm password, so only copied one over
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be at most 128 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[a-z]/, "Must contain at least one lowercase letter")
    .regex(/[0-9]/, "Must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Must contain at least one special character"),
});

export const EditProfileSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

export const EmailSchema = z.object({
  email: z.email("Invalid email"),
});

export const PasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password must be at most 128 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[a-z]/, "Must contain at least one lowercase letter")
      .regex(/[0-9]/, "Must contain at least one number")
      .regex(/[^A-Za-z0-9]/, "Must contain at least one special character"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
