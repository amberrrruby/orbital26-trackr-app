import { getResumesWithThumbnails } from "@/app/actions/resume";
import ResumeGallery from "./ResumeGallery";
import ErrorDisplay from "@/app/components/ErrorDisplay";
import { FileText } from "lucide-react";

export default async function ResumeGalleryServer() {
  const res = await getResumesWithThumbnails();
  if (!res.ok) {
    return (
      <ErrorDisplay
        title="Could not load resumes"
        message="Something went wrong while loading your resumes. Please try again."
        icon={<FileText />}
      />
    );
  }
  return (
    <ResumeGallery
      initialResumes={res.value.resumes}
      totalCount={res.value.totalCount}
    />
  );
}
