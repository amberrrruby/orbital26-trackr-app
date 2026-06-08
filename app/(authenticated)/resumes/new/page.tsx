import ResumeFormComponent from "@/app/components/ResumeFormComponent";
import { requireUserOrRedirectLogin } from "@/lib/auth";

export default async function AddNewResumePage() {
  const userId = await requireUserOrRedirectLogin();
  return (
    <>
      <ResumeFormComponent userId={userId} />
    </>
  );
}
