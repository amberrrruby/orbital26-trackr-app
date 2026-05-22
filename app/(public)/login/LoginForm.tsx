"use client";
import { useActionState } from "react";
import { loginAction } from "@/app/actions/auth/handle-login";
import styles from "./LoginForm.module.css";
import GoogleLogin from "./GoogleLogin";
import Link from "next/link";

export default function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, null);

  // Styling is temporary
  return (
    <>
      <form action={formAction} className={styles.loginForm}>
        <h1>Log In</h1>
        <label htmlFor="email">Email:</label>
        <input name="email" type="email" />
        <label htmlFor="password">Password:</label>
        <input name="password" type="password" />
        {state?.error && <p>{state.error}</p>}
        <button type="submit" disabled={isPending}>
          {isPending ? "Signing in..." : "Sign in"}
        </button>
        <button
          type="button"
          onClick={() => (window.location.href = "/signup")}
        >
          Don&apos;t have an account? Sign up
        </button>
        <Link href="/login/forgot-password">Forgot password?</Link>
      </form>
      <div className={styles.oauthSection}>
        <GoogleLogin />
      </div>
    </>
  );
}
