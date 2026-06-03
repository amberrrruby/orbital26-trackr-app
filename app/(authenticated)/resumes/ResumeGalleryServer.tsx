"use server";

import { getResumes } from "@/app/actions/resume";
import ResumeGallery from "./ResumeGallery";
import ErrorDisplay from "@/app/components/ErrorDisplay";
import { FileText } from "lucide-react";

export default async function ResumeGalleryServer() {
  const res = await getResumes();
  if (!res.ok) {
    return (
      <ErrorDisplay
        errorMsg={`Something went wrong. Please try again.`}
        icon={<FileText />}
      />
    );
  }
  // TODO: might have other external components here, or else collapse to just one async component
  return (
    <ResumeGallery
      initialResumes={res.value.resumes}
      totalCount={res.value.totalCount}
    />
  );
}
