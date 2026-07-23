import { Suspense } from "react";
import ResumeDetailsComponent from "./ResumeDetails";

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

export default async function ResumeDetailsPage({ params }: Props) {
  await wait(3000);
  const { id } = await params;

  return (
    <Suspense>
      <ResumeDetailsComponent id={id} />
    </Suspense>
  );
}
