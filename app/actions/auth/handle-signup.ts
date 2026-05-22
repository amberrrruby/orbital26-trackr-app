"use server";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { SignupSchema } from "@/lib/types";
import { redirect } from "next/navigation";

type AuthState = { error: string } | null;

export async function signupAction(prevState: AuthState, formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const parseResult = SignupSchema.safeParse({
    name: formData.get("displayName"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parseResult.success) {
    redirect(`/signup/?error=invalid-input`);
  }

  const {
    data: { name, email, password },
  } = parseResult;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { display_name: name } },
  });

  if (error) {
    return { error: error.message };
  }

  if (!data.user) {
    return { error: "Signup failed" };
  }

  redirect("/signup/confirm-email");
}
