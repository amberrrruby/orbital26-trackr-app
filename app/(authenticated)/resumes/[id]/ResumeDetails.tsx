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
      <ErrorDisplay
        title="Resume can't be found."
        message="This resume may have been deleted or you do not have access to it."
        icon={<FileText />}
      />
    );
  }

  const { data: fileData } = await supabase.storage
    .from(`resumes`)
    .createSignedUrl(resume.filePath, 3600);

  const signedFileUrl = fileData?.signedUrl ?? undefined;

  const { data: thumbnailData } = await supabase.storage
    .from(`resumes`)
    .createSignedUrl(resume.thumbnailPath, 3600);

  const signedThumbnailUrl = thumbnailData?.signedUrl ?? null;

  const statsResult = await getAggregateStats(resume.id);

  const recentApplicationsResult = await getTopKRecentApplications(
    resume.id,
    3,
  );

  return (
    <ResumeDetailsClient
      resume={resume}
      signedFileUrl={signedFileUrl}
      signedThumbnailUrl={signedThumbnailUrl}
      statsResult={statsResult}
      recentApplicationsResult={recentApplicationsResult}
    />
  );
}
