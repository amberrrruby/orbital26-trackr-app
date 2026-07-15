import ErrorDisplay from "@/app/components/ErrorDisplay";
import ResumeFormComponent from "@/app/components/ResumeFormComponent";
import { requireUserOrRedirectLogin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { FileText } from "lucide-react";
import styles from "./page.module.css";

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
      <ErrorDisplay
        title="Resume not found."
        message="This resume may have been deleted or you do not have access to it."
        icon={<FileText />}
      />
    );
  }

  const { data } = await supabase.storage
    .from(`resumes`)
    .createSignedUrl(resume.filePath, 3600);

  const signedUrl = data?.signedUrl ?? undefined;

  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <h1>Edit resume details</h1>
        <p>Modify resume details or upload a new version.</p>
      </div>
      <ResumeFormComponent
        userId={userId}
        resume={resume}
        signedUrl={signedUrl}
      />
    </main>
  );
}
