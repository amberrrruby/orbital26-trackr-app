import { redirectIfAuthenticated } from "@/lib/auth";
import { Suspense } from "react";
import LoginForm from "./LoginForm";

type Props = {
  searchParams: Promise<{
    success?: string;
    error?: string;
  }>;
};

function getSuccessMessage(message: string | undefined): string | null {
  switch (message) {
    case "password-reset":
      return "Password updated, please sign in.";
    default:
      return null;
  }
}

export default async function LoginPage({ searchParams }: Props) {
  const params = await searchParams;
  const successToastMessage = getSuccessMessage(params.success);
  await redirectIfAuthenticated();

  return (
    <>
      {successToastMessage && <div>{successToastMessage}</div>}
      <Suspense fallback="Loading LoginForm...">
        <LoginForm />
      </Suspense>
    </>
  );
}
