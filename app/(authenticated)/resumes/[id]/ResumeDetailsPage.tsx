"use client";

import { useState } from "react";
import ResumeDetailsComponent from "./ResumeDetails";
import ResumeFormComponent from "@/app/components/ResumeFormComponent";
import { Resume } from "@/lib/generated/client";

type Props = { id: string };

export default function ResumeDetailsPage({ id }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [resume, setResume] = useState<Resume | null>(null);

  return isEditing && resume ? (
    <ResumeFormComponent resume={resume} onCancel={() => setIsEditing(false)} />
  ) : (
    <ResumeDetailsComponent
      id={id}
      onEdit={(r) => {
        setResume(r);
        setIsEditing(true);
      }}
    />
  );
}
