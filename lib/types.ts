import z from "zod";

export type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

export type AppAuthError = { type: "UNAUTHORIZED"; message: "Unauthorized" };

export type ActionFailureError = { type: "FAILURE" };

// Action-related errors

export type ActionValidationError = {
  type: "VALIDATION";
  param: string;
  message: string;
};

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

// Settings-related errors

// export type SettingsError =
//     | ChangePasswordError
//     | DeleteAccountError

export type ChangePasswordError = AppAuthError;

export type EditProfileError = AppAuthError;

export type DeleteAccountError = AppAuthError;

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
