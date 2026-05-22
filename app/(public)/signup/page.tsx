import { redirectIfAuthenticated } from "@/lib/auth";
import SignupForm from "./SignupForm";

type Props = {
  searchParams: Promise<{
    error?: string;
  }>;
};

function getErrorMessage(error: string | undefined): string | null {
  switch (error) {
    case "invalid-input":
      return "Input is invalid.";
    default:
      return null;
  }
}

export default async function SignupPage({ searchParams }: Props) {
  const params = await searchParams;
  const errorMessage = getErrorMessage(params.error);
  await redirectIfAuthenticated();
  return <SignupForm errorMessage={errorMessage} />;
}
