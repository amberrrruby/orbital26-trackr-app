import z, { ZodError } from "zod";
import { Prisma } from "@/lib/generated/client";

export type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

export type AppAuthError = { type: "UNAUTHORIZED"; message: "Unauthorized" };

// Action-related errors

export type ActionFailureError = { type: "FAILURE" };

export type AppUploadError = { type: "UPLOAD"; message: string };

export type ActionValidationError = {
  type: "VALIDATION";
  param: string;
  message: string;
};

// FileUpload component constants

export const ACCEPTED_MIME: Record<string, "pdf" | "docx"> = {
  "application/pdf": "pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "docx",
};

export const ACCEPTED_EXTENSIONS = ".pdf,.docx";
export const MAX_SIZE_MB = 10;
export const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

// Actions: Applications

export type CreateApplicationError = ActionValidationError | ActionFailureError;

export type GetApplicationsError = ActionFailureError;

export type GetApplicationByIdError =
  | ActionValidationError
  | ActionFailureError;

export type ApplicationWithDetails = Prisma.ApplicationGetPayload<{
  include: {
    resume: true;
    timelineEvents: true;
  };
}>;

export type UpdateApplicationError = ActionValidationError | ActionFailureError;

export type DeleteApplicationError = ActionFailureError;

export enum Status {
  WISHLIST = "WISHLIST",
  APPLIED = "APPLIED",
  OA_ASSESSMENT = "OA_ASSESSMENT",
  INTERVIEW = "INTERVIEW",
  OFFER = "OFFER",
  REJECTED = "REJECTED",
}

export const ApplicationSchema = z.object({
  company: z.string().min(1, "Company field is required"),
  role: z.string().min(1, "Role field is required"),
  source: z.string().default(""),
  status: z.enum(Status).default(Status.APPLIED),
  // possible to be passed in as null since date is picked through calendar pop-up, not text field
  resumeId: z.cuid2().optional(),
  dateApplied: z.coerce.date().optional(),
  oaAssessmentDate: z.coerce.date().optional(),
  interviewDate: z.coerce.date().optional(),
  offerExpiryDate: z.coerce.date().optional(),
  notes: z.string().max(1000, "Notes too long").default(""),
  // tags: z.array(z.string()).default([]),
});

export const EditApplicationSchema = ApplicationSchema.extend({
  id: z.string().min(1, "Application ID is required"),
});

export const ApplicationIdSchema = z.object({
  id: z.cuid2("Application ID is required"),
});

// Actions: Resumes

export type GetResumesError =
  | ActionValidationError // validating paging params
  | ActionFailureError;

export type GetAggregateStatsError = ActionFailureError;

export type GetTopKRecentApplicationsError = ActionFailureError;

export type AddResumeError = // TODO: naming convention: add -> create
  ActionValidationError | ActionFailureError | AppUploadError;

export type UpdateResumeError =
  | ActionValidationError
  | ActionFailureError
  | AppUploadError;

export type DeleteResumeError = ActionFailureError;

export type GenerateThumbnailError = ActionFailureError;

// export type GenerateThumbnailError
// TODO: resolve after thumbnail generation service is confirmed

// const ACCEPTED_FILE_TYPES = [
//   "application/pdf",
//   "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
// ];
// const MAX_FILE_SIZE_MB = 10;

// const ResumeFileSchema = z.object({
//   file: z
//     .instanceof(File)
//     .refine((f) => f.size > 0, "File is required")
//     .refine(
//       (f) => f.size <= MAX_FILE_SIZE_MB * 1024 * 1024,
//       `File must be under ${MAX_FILE_SIZE_MB} MB`,
//     )
//     .refine(
//       (f) => ACCEPTED_FILE_TYPES.includes(f.type),
//       "Only PDF or DOCX files are currently accepted",
//     ),
// });

export const SORTABLE_FIELDS = ["createdAt", "updatedAt"] as const;
export const ORDERS = ["asc", "desc"] as const;
export type SortableField = (typeof SORTABLE_FIELDS)[number];
export type OrderType = (typeof ORDERS)[number];
export type AggregateStats = Record<Status, number> & { TOTAL: number };

export const GetResumesParamsSchema = z.object({
  orderKey: z.enum(SORTABLE_FIELDS).default("updatedAt"),
  order: z.enum(ORDERS).default("desc"),
  pageNumber: z.number().int().min(0).default(0),
  pageSize: z.number().int().min(1).max(100).default(12),
});

export const ResumeSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title too long"),
  notes: z.string().max(1000, "Notes too long").optional(),
  tags: z.string().transform((val) =>
    val
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean),
  ),
  filePath: z.string().min(1, "File path is required"),
  fileType: z.enum(["pdf", "docx"]),
});

export const UpdateResumeSchema = ResumeSchema.extend({
  filePath: z.string().min(1, "File path is required").optional(),
  fileType: z.enum(["pdf", "docx"]).optional(),
});

// Actions: Reminders

const REMINDER_TYPE = ["EVENT", "FOLLOW_UP"] as const;
const SOURCE_KEY = [
  "DATE_APPLIED",
  "OA_ASSESSMENT_DATE",
  "INTERVIEW_DATE",
  "OFFER_EXPIRY_DATE",
] as const;

export type GetRemindersError =
  | ActionValidationError // validating paging params
  | ActionFailureError;

export type GetRemindersByApplicationIdError =
  | ActionValidationError
  | ActionFailureError;

export type AddReminderError = ActionValidationError | ActionFailureError;

export type UpdateReminderError = ActionValidationError | ActionFailureError;

export type DeleteReminderError = ActionFailureError;

export const ReminderSchema = z.object({
  applicationId: z.preprocess(
    (v) => (v === "" ? null : v),
    z.cuid2().nullable().optional(),
  ),
  type: z.enum(REMINDER_TYPE, "A reminder type is required"),
  remindAt: z.iso.datetime({
    offset: true,
    error: "Remind datetime is required",
  }),
  offsetDays: z.preprocess(
    (v) => (v === "" || v === null ? undefined : v),
    z.coerce.number().int().positive().optional(),
  ),
  source: z.preprocess(
    (v) => (v === "" ? undefined : v),
    z.enum(SOURCE_KEY).optional(),
  ),
  content: z
    .string()
    .min(1, "Content is required")
    .max(1000, "Content too long"),
});

export const GetRemindersParamsSchema = z.object({
  pageNumber: z.number().int().min(0).default(0),
  pageSize: z.number().int().min(1).max(100).default(12),
  group: z.enum(["today", "upcoming", "overdue", "all"]),
});

export type ReminderWithApplication = Prisma.ReminderGetPayload<{
  include: {
    application: true;
  };
}>;

export type Reminder = Prisma.ReminderGetPayload<Prisma.ReminderDefaultArgs>;

// Actions: Timeline
const TIMELINE_EVENT_TYPE = [
  "APPLICATION_CREATED",
  "STATUS_CHANGED",
  "IMPORTANT_DATE",
  "REMINDER_COMPLETED",
  "MANUAL",
] as const;

export type GetTimelineEventsError = ActionValidationError | ActionFailureError;

export type AddTimelineEventError = ActionValidationError | ActionFailureError;

export type UpdateTimelineEventError =
  | ActionValidationError
  | ActionFailureError;

export type DeleteTimelineEventError = ActionFailureError;

export const ManualTimelineEventSchema = z.object({
  applicationId: z.cuid2("Application ID is required"),
  eventDate: z.iso.date("Remind date is required"),
  description: z
    .string()
    .min(1, "Content is required")
    .max(1000, "Content too long"),
});

export const EditManualTimelineEventSchema = ManualTimelineEventSchema.extend({
  id: z.cuid2("Timeline event ID is required"),
});

export const TimelineApplicationIdSchema = z.object({
  applicationId: z.cuid2("Application ID is required"),
});
export const TimelineEventIdSchema = z.object({
  id: z.cuid2("Timeline event ID is required"),
});

export type TimelineEventWithApplication = Prisma.TimelineEventGetPayload<{
  include: {
    application: true;
  };
}>;

// Settings-related errors

export type ChangeCredentialsError = ActionValidationError | ActionFailureError;

export type EditProfileError = ActionValidationError | ActionFailureError;

export type DeleteAccountError = ActionFailureError;

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

export function returnSchemaValidationError(parseResult: {
  success: false;
  error: ZodError;
}): ActionValidationError {
  const first = parseResult.error.issues[0];
  return {
    type: "VALIDATION",
    // IDK, see how does error messages get returned then we tweak
    param: first.path.join("."),
    message: first.message,
  };
}

export type GetReminderSettingsError = ActionFailureError;

export const ReminderSettingsSchema = z.object({
  eventReminderDays: z
    .array(z.number().int().nonnegative())
    .refine((days) => new Set(days).size === days.length, {
      message: "Reminder days must be unique",
    }),

  appliedFollowUpDays: z.number().int().nonnegative(),
  assessmentFollowUpDays: z.number().int().nonnegative(),
  interviewFollowUpDays: z.number().int().nonnegative(),
});

export type ReminderSettings = z.infer<typeof ReminderSettingsSchema>;

export type UpdateReminderSettingsError =
  | ActionValidationError
  | ActionFailureError;
