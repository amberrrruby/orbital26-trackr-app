"use server";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { SignupSchema } from "@/lib/types";
import { AuthError } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

function mapSupabaseError(error: AuthError): string {
  switch (error.code) {
    case "user_already_exists":
    case "email_exists":
      return "An account with this email already exists.";
    case "weak_password":
      return "Password does not meet security requirements.";
    case "over_email_send_rate_limit":
      return "Too many attempts. Please try again shortly.";
    default:
      return "Something went wrong. Please try again.";
  }
}

// type AuthState = { error: string } | null;
type AuthState = {
  formError?: string;
  fieldErrors?: Partial<Record<"name" | "email" | "password", string[]>>;
} | null;

export async function signupAction(prevState: AuthState, formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const parseResult = SignupSchema.safeParse({
    name: formData.get("displayName"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parseResult.success) {
    return { fieldErrors: parseResult.error.flatten().fieldErrors };
  }

  const { name, email, password } = parseResult.data;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { display_name: name } },
  });

  if (error) {
    return { formError: mapSupabaseError(error) };
  }

  if (!data.user) {
    return { formError: "Signup failed" };
  }

  redirect("/signup/confirm-email");
}
