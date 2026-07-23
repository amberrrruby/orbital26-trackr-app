import ErrorDisplay from "@/app/components/ErrorDisplay";
import ResumeFormComponent from "@/app/components/ResumeFormComponent";
import { requireUserOrRedirectLogin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { FileText } from "lucide-react";
import Link from "next/link.js";
import styles from "./page.module.css";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

function wait(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export default async function EditResumeDetailPage({ params }: Props) {
  await wait(3000);
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
      <Link href={`/resumes/${resume.id}`}>← Back to Resume Details Page</Link>

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
