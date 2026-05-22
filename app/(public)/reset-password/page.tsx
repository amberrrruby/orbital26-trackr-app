import ResetPasswordForm from "./ResetPasswordForm";

type Props = {
  searchParams: Promise<{
    code?: string;
    error?: string;
    error_code?: string;
    error_description?: string;
  }>;
};

export default async function ResetPasswordPage({ searchParams }: Props) {
  const params = await searchParams;
  if (params.error_code === "otp_expired" || params.error === "access_denied") {
    return (
      <div>
        <h2>Reset link is invalid or expired</h2>
        <p>
          The password reset link has expired, or is invalid. Request a new one.
        </p>

        <a href="/login/forgot-password">[Request new reset link]</a>
      </div>
    );
  }

  return <ResetPasswordForm />;
}
