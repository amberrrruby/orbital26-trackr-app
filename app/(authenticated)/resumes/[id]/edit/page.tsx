import ErrorDisplay from "@/app/components/ErrorDisplay";
import ResumeFormComponent from "@/app/components/ResumeFormComponent";
import { requireUserOrRedirectLogin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { FileText } from "lucide-react";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditResumeDetailPage({ params }: Props) {
  const { id } = await params;
  const userId = await requireUserOrRedirectLogin();
  const supabase = await createSupabaseServerClient();
  const resume = await prisma.resume.findUnique({
    where: { id },
  });

  if (!resume) {
    return (
      <ErrorDisplay errorMsg={"Resume can't be found."} icon={<FileText />} />
    );
  }

  const { data } = await supabase.storage
    .from(`resumes`)
    .createSignedUrl(resume.filePath, 3600);

  const signedUrl = data?.signedUrl ?? undefined;

  return (
    <ResumeFormComponent
      userId={userId}
      resume={resume}
      signedUrl={signedUrl}
    />
  );
}
