import { Suspense } from "react";
import ResumeGalleryServer from "./ResumeGalleryServer";
import Link from "next/link";
import { Button } from "@/app/components/Button";

export default function ResumeGalleryPage() {
  return (
    <>
      <Link href="/dashboard">
        <Button> Back </Button>
      </Link>
      <h1>Resumes</h1>
      <Link href="/resumes/new">
        <Button> + Add new resume </Button>
      </Link>
      <Suspense>
        <ResumeGalleryServer />
      </Suspense>
    </>
  );
}
