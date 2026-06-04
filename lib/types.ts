import z, { ZodError } from "zod";

export type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

export type AppAuthError = { type: "UNAUTHORIZED"; message: "Unauthorized" };

// Action-related errors

export type ActionFailureError = { type: "FAILURE" };

export type ActionValidationError = {
  type: "VALIDATION";
  param: string;
  message: string;
};

// Types and constants for pagination
const SORTABLE_FIELDS = ["createdAt", "updatedAt"] as const;
const ORDERS = ["asc", "desc"] as const;
export type SortableField = (typeof SORTABLE_FIELDS)[number];
export type OrderType = (typeof ORDERS)[number];

// Actions: Applications

export type CreateApplicationError = ActionValidationError | ActionFailureError;

export type GetApplicationsError = ActionFailureError;

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
  dateApplied: z.coerce.date().optional(),
  notes: z.string().max(1000, "Notes too long").default(""),
  // tags: z.array(z.string()).default([]),
});

export const EditApplicationSchema = ApplicationSchema.extend({
  id: z.string().min(1, "Application ID is required"),
});

// Actions: Reminders

const REMINDER_TYPE = ["EVENT", "FOLLOW_UP"] as const;

export type GetRemindersError =
  | ActionValidationError // validating paging params
  | ActionFailureError;

export type AddReminderError = ActionValidationError | ActionFailureError;

export type UpdateReminderError = ActionValidationError | ActionFailureError;

export type DeleteReminderError = ActionFailureError;

export const ReminderSchema = z.object({
  applicationId: z.cuid2("Empty or invalid Application CUID."),
  type: z.enum(REMINDER_TYPE, "A reminder type is required"),
  remindAt: z.iso.date("Remind date is required"),
  content: z
    .string()
    .min(1, "Content is required")
    .max(1000, "Content too long"),
});

export const EditReminderSchema = ReminderSchema.pick({
  type: true,
  remindAt: true,
  content: true,
});

export const GetRemindersParamsSchema = z.object({
  orderKey: z.enum(SORTABLE_FIELDS).default("updatedAt"),
  order: z.enum(ORDERS).default("desc"),
  pageNumber: z.number().int().min(0).default(0),
  pageSize: z.number().int().min(1).max(100).default(12),
});

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
