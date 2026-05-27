import ErrorDisplay from "@/app/components/ErrorDisplay";
import { prisma } from "@/lib/prisma";
import { FileText } from "lucide-react";
import {
  getAggregateStats,
  getTopKRecentApplications,
} from "@/app/actions/resume";
import ResumeDetailsClient from "./ResumeDetailsClient";

type Props = {
  id: string;
  onEdit: (resume: Resume) => void;
};

export default async function ResumeDetailsComponent({ id, onEdit }: Props) {
  const resume = await prisma.resume.findUnique({
    where: { id },
  });
  if (!resume) {
    return (
      <ErrorDisplay errorMsg={"Resume can't be found."} icon={<FileText />} />
    );
  }
  const statsResult = await getAggregateStats(resume.id);

  const recentApplicationsResult = await getTopKRecentApplications(
    resume.id,
    3,
  );

  return (
    <ResumeDetailsClient
      resume={resume}
      statsResult={statsResult}
      recentApplicationsResult={recentApplicationsResult}
      onEdit={onEdit}
    />
  );
}
