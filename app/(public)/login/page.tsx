import { redirectIfAuthenticated } from "@/lib/auth";
import { Suspense } from "react";
import LoginForm from "./LoginForm";

export default async function LoginPage() {
  await redirectIfAuthenticated();

  return (
    <Suspense fallback="Loading LoginForm...">
      <LoginForm />
    </Suspense>
  );
}
