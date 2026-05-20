"use server";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
// import { redirect } from "next/navigation";
import { redirect } from "next/navigation";

type AuthState = { error: string } | null;

export async function signupAction(prevState: AuthState, formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  });
  if (error) {
    return { error: error.message };
  }
  if (!data.user) {
    return { error: "Signup failed" };
  }

  redirect("/signup/confirm-email"); // might change to a temp page for waiting email confirmation before sending to protected pages
}
