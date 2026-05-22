"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { PasswordSchema } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ResetPasswordForm() {
  const router = useRouter();

  const supabase = createSupabaseBrowserClient();

  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Verify session exists; if not, the cookie wasn't set
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setError("Session expired or invalid. Request a new reset link.");
        return;
      }
      setIsReady(true);
    });
  }, []);

  async function onSubmit(formData: FormData) {
    const parseResult = PasswordSchema.safeParse({
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    });

    if (!parseResult.success) {
      setError("Invalid password.");
      return;
    }

    const {
      data: { password },
    } = parseResult;

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
      return;
    }

    await supabase.auth.signOut();

    router.push("/login?success=password-reset");
  }

  if (error) {
    return (
      <div>
        <h2>Password reset failed</h2>
        <p>{error}</p>
        <a href="/login/forgot-password">[Request a new reset link]</a>
      </div>
    );
  }

  if (!isReady) {
    return <p>Preparing password reset...</p>;
  }

  return (
    <>
      <h2>Reset password</h2>

      <form action={onSubmit}>
        <label>New password</label>

        <input name="password" type="password" required minLength={8} />

        <label>Confirm password</label>

        <input
          name="confirmPassword"
          type="password"
          required
          minLength={8}
          onInput={(e) => {
            const form = e.currentTarget.form;
            if (!form) return;

            const passwordInput = form.elements.namedItem(
              "password",
            ) as HTMLInputElement;

            if (e.currentTarget.value !== passwordInput.value) {
              e.currentTarget.setCustomValidity("Passwords do not match");
            } else {
              e.currentTarget.setCustomValidity("");
            }
          }}
        />

        <button type="submit">Update password</button>
      </form>
    </>
  );
}
