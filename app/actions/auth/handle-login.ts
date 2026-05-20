"use server";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { redirect } from "next/navigation";

type AuthState = { error: string } | null;

export async function loginAction(prevState: AuthState, formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  });
  if (error) {
    return { error: error.message };
  }
  redirect("/dashboard");
}
