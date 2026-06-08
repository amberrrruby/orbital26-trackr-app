"use client";

import { useState } from "react";
import ResumeDetailsComponent from "./ResumeDetails";
import ResumeFormComponent from "@/app/components/ResumeFormComponent";
import { Resume } from "@/lib/generated/client";

type Props = { id: string };

export default function ResumeDetailsPage({ id }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [resume, setResume] = useState<Resume | undefined>(undefined);
  const [signedUrl, setSignedUrl] = useState<string | undefined>(undefined);

  return isEditing && resume ? (
    <ResumeFormComponent
      resume={resume}
      signedUrl={signedUrl}
      onCancel={() => setIsEditing(false)}
    />
  ) : (
    <ResumeDetailsComponent
      id={id}
      onEdit={(resu, sUrl) => {
        setResume(resu);
        setSignedUrl(sUrl);
        setIsEditing(true);
      }}
    />
  );
}
