import { Suspense } from "react";
import ResumeDetailsComponent from "./ResumeDetails";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ResumeDetailsPage({ params }: Props) {
  const { id } = await params;

  return (
    <Suspense>
      <ResumeDetailsComponent id={id} />
    </Suspense>
  );
}
