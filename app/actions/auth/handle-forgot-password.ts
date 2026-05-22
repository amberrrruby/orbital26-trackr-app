"use server";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { EmailSchema } from "@/lib/types";

export async function forgotPasswordAction(formData: FormData) {
  const supabase = await createSupabaseServerClient();

  const parseResult = EmailSchema.safeParse({ email: formData.get("email") });

  if (!parseResult.success) {
    redirect("/login/forgot-password?error=invalid-email");
  }

  const {
    data: { email },
  } = parseResult;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: "http://localhost:3000/auth/confirm",
  });

  if (error) {
    // Preventing email enumeration attacks (don't let them know if this email has a linked account here), being ambiguous about what happened.
    redirect("/login/forgot-password?error=server-error");
  }

  redirect("/login/forgot-password?success=reset-email-sent");
}
