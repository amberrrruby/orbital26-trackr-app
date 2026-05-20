import { redirectIfAuthenticated } from "@/lib/auth";
import SignupForm from "./SignupForm";

export default async function SignupPage() {
  await redirectIfAuthenticated();
  return <SignupForm />;
}
