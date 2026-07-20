"use client";
import { useActionState } from "react";
import { signupAction } from "@/app/actions/auth/handle-signup";
import styles from "./SignupForm.module.css";
import GoogleLogin from "../login/GoogleLogin";
import { Button } from "@/app/components/Button";
import { Input } from "@/app/components/Input";
// included because OAuth login / signup is not very differentiable

type Props = {
  errorMessage: string | null;
};

export default function SignupForm({ errorMessage }: Props) {
  const [state, formAction, isPending] = useActionState(signupAction, null);

  // Styling is temporary
  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <div className={styles.header}>
          <h1>Create a new account</h1>
          <p>Sign up to start tracking your job applications.</p>
        </div>
        {errorMessage && <p>{errorMessage}</p>}

        <form action={formAction} className={styles.signupForm}>
          {state?.formError && (
            <p className={styles.error}>{state.formError}</p>
          )}

          <Input label="Display name:" name="displayName" type="text" />
          {state?.fieldErrors?.name?.map((msg) => (
            <p key={msg} className={styles.fieldError}>
              {msg}
            </p>
          ))}

          <Input label="Email:" name="email" type="email" />
          {state?.fieldErrors?.email?.map((msg) => (
            <p key={msg} className={styles.fieldError}>
              {msg}
            </p>
          ))}

          <Input label="Password:" name="password" type="password" />
          {state?.fieldErrors?.password?.map((msg) => (
            <p key={msg} className={styles.fieldError}>
              {msg}
            </p>
          ))}

          {/* {state?.error && <p>{state.error}</p>} */}

          <Button type="submit" disabled={isPending} variant="primary">
            {isPending ? "Processing..." : "Sign up"}
          </Button>
          <Button
            type="button"
            onClick={() => (window.location.href = "/login")}
            variant="outline"
          >
            Already have an account? Log in
          </Button>
        </form>

        <div className={styles.divider}>
          <span>or</span>
        </div>

        <div className={styles.oauthSection}>
          <GoogleLogin />
        </div>
      </section>
    </main>
  );
}
