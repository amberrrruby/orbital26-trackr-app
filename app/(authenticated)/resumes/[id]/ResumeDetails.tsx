import ErrorDisplay from "@/app/components/ErrorDisplay";
import { prisma } from "@/lib/prisma";
import { FileText } from "lucide-react";
import {
  getAggregateStats,
  getTopKRecentApplications,
} from "@/app/actions/resume";
import ResumeDetailsClient from "./ResumeDetailsClient";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

type Props = {
  id: string;
};

export default async function ResumeDetailsComponent({ id }: Props) {
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

  const statsResult = await getAggregateStats(resume.id);

  const recentApplicationsResult = await getTopKRecentApplications(
    resume.id,
    3,
  );

  return (
    <ResumeDetailsClient
      resume={resume}
      signedUrl={signedUrl}
      statsResult={statsResult}
      recentApplicationsResult={recentApplicationsResult}
    />
  );
}
