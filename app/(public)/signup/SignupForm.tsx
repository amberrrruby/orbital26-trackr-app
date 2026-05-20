"use client";
import { useActionState } from "react";
import { signupAction } from "@/app/actions/auth/handle-signup";
import styles from "./SignupForm.module.css";
import GoogleLogin from "../login/GoogleLogin";
// included because OAuth login / signup is not very differentiable

export default function SignupForm() {
  const [state, formAction, isPending] = useActionState(signupAction, null);

  // Styling is temporary
  return (
    <>
      <form action={formAction} className={styles.signupForm}>
        <h1>Sign Up</h1>
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
