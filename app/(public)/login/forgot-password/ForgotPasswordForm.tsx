"use client";
import { forgotPasswordAction } from "@/app/actions/auth/handle-forgot-password";

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
    <>
      {errorMessage && <p>{errorMessage}</p>}
      <h2>Enter your registered email address for a recovery link.</h2>
      <form action={forgotPasswordAction}>
        <input name="email" type="email" required />

        <button type="submit">Send reset link</button>
      </form>
    </>
  );
}
