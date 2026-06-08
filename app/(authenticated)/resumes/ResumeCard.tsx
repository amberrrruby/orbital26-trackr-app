import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { FileText } from "lucide-react";
import { Resume } from "@/lib/generated/client";

type Props = {
  resume: Resume;
};

export default function ResumeCard({ resume }: Props) {
  return (
    <Link
      href={`/resumes/${resume.id}`}
      className="group block rounded-xl border border-border hover:border-primary/40 hover:shadow-sm transition-all overflow-hidden"
    >
      {/* Thumbnail. Will always use the fallback until we sort out thumbnail gen. */}
      <div className="aspect-[3/4] bg-muted relative overflow-hidden">
        {/* {resume.thumbnailUrl ? (
          <Image
            src={resume.thumbnailUrl}
            alt={resume.title}
            fill
            className="object-cover group-hover:scale-[1.02] transition-transform duration-200"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FileText className="w-12 h-12 text-muted-foreground/40" />
          </div>
        )} */}
        <div className="w-full h-full flex items-center justify-center">
          <FileText className="w-12 h-12 text-muted-foreground/40" />
        </div>
      </div>

      {/* Metadata */}
      <div className="p-3 space-y-1">
        <p className="font-medium text-sm leading-tight truncate">
          {resume.title}
        </p>
        {/* {resume.company && (
          <p className="text-xs text-muted-foreground truncate">
            {resume.company}
          </p>
        )}
        {resume.position && (
          <p className="text-xs text-muted-foreground truncate">
            {resume.position}
          </p>
        )} */}
        <p className="text-xs text-muted-foreground/60">
          {formatDistanceToNow(new Date(resume.createdAt), {
            addSuffix: true,
          })}
        </p>
      </div>
    </Link>
  );
}
