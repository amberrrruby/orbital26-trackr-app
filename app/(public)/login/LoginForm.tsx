"use client";
import { useActionState } from "react";
import { loginAction } from "@/app/actions/auth/handle-login";
import styles from "./LoginForm.module.css";
import GoogleLogin from "./GoogleLogin";
import { Button } from "@/app/components/Button";
import { Input } from "@/app/components/Input";
import Image from "next/image";
import Link from "next/link";

export default function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, null);

  // Styling is temporary
  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <div className={styles.brand}>
          <Image
            src="/trackr-logo.png"
            alt="Trackr logo"
            width={52}
            height={52}
          />
          <div>
            <h1 className={styles.appName}>Trackr</h1>
            <p className={styles.tagLine}>Apply. Track. Get Hired.</p>
          </div>
        </div>
        <form action={formAction} className={styles.loginForm}>
          <h2 className={styles.title}>Log In</h2>

          <Input label="Email:" name="email" type="email" />
          <Input label="Password:" name="password" type="password" />
          {state?.error && <p>{state.error}</p>}

          <Button type="submit" variant="primary" disabled={isPending}>
            {isPending ? "Signing in..." : "Sign in"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => (window.location.href = "/signup")}
          >
            Don&apos;t have an account? Sign up
          </Button>

          <Link className={styles.forgotLink} href="/login/forgot-password">
            Forgot password?
          </Link>
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
