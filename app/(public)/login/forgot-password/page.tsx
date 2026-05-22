import ForgotPasswordForm from "./ForgotPasswordForm";

type Props = {
  searchParams: Promise<{
    success?: string;
    error?: string;
  }>;
};

function getSuccessMessage(success?: string): string | null {
  switch (success) {
    case "reset-email-sent":
      return "A reset link has been sent to the email mailbox of the account, if exists.";
    default:
      return null;
  }
}

function getErrorMessage(error?: string): string | null {
  switch (error) {
    case "missing-code":
      return "Invalid reset link.";
    case "invalid-code":
      return "Reset link expired. Request for a new reset link.";
    case "server-error":
      return "An internal server error occurred.";
    case "invalid-email":
      return "Enter a valid email address.";
    default:
      return null;
  }
}

export default async function ForgotPasswordPage({ searchParams }: Props) {
  const { success, error } = await searchParams;

  const successMessage = getSuccessMessage(success);
  const errorMessage = getErrorMessage(error);

  if (!errorMessage || error === "invalid-email") {
    return (
      <ForgotPasswordForm
        successMessage={successMessage}
        errorMessage={errorMessage}
      />
    );
  }

  return (
    <div>
      <p>{errorMessage}</p>

      <a href="/login/forgot-password">[Request new reset link]</a>
    </div>
  );
}
