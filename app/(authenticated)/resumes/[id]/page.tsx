import { Suspense } from "react";
import ResumeDetailsPage from "./ResumeDetailsPage";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function Page({ params }: Props) {
  const { id } = await params;

  return (
    <Suspense>
      <ResumeDetailsPage id={id} />
    </Suspense>
  );
}
