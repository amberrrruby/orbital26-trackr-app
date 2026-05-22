"use client";
import { useActionState } from "react";
import { signupAction } from "@/app/actions/auth/handle-signup";
import styles from "./SignupForm.module.css";
import GoogleLogin from "../login/GoogleLogin";
// included because OAuth login / signup is not very differentiable

type Props = {
  errorMessage: string | null;
};

export default function SignupForm({ errorMessage }: Props) {
  const [state, formAction, isPending] = useActionState(signupAction, null);

  // Styling is temporary
  return (
    <>
      {errorMessage && <p>{errorMessage}</p>}
      <form action={formAction} className={styles.signupForm}>
        <h1>Sign Up</h1>
        <label htmlFor="displayName">Display name:</label>
        <input name="displayName" type="text" />
        <label htmlFor="email">Email:</label>
        <input name="email" type="email" />
        <label htmlFor="password">Password:</label>
        <input name="password" type="password" />
        {state?.error && <p>{state.error}</p>}
        <button type="submit" disabled={isPending}>
          {isPending ? "Processing..." : "Sign up"}
        </button>
        <button type="button" onClick={() => (window.location.href = "/login")}>
          Already have an account? Log in
        </button>
      </form>
      <div className={styles.oauthSection}>
        <GoogleLogin />
      </div>
    </>
  );
}
