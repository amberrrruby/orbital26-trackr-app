"use client";
import { forgotPasswordAction } from "@/app/actions/auth/handle-forgot-password";
import { Input } from "@/app/components/Input";
import { Button } from "@/app/components/Button";
import styles from "./ForgotPasswordForm.module.css";

type Props = {
  successMessage: string | null;
  errorMessage: string | null;
};

export default function ForgotPasswordForm({
  successMessage,
  errorMessage,
}: Props) {
  if (successMessage) {
    return (
      <>
        <p>{successMessage}</p>
      </>
    );
  }

  return (
    <section className={styles.container}>
      {errorMessage && <p className={styles.error}>{errorMessage}</p>}
      <h2>Enter your registered email address for a recovery link.</h2>
      <form action={forgotPasswordAction} className={styles.form}>
        <Input name="email" type="email" required />
        <Button type="submit">Send reset link</Button>
      </form>
    </section>
  );
}
