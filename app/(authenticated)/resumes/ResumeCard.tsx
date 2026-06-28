import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { FileText } from "lucide-react";
import { Resume } from "@/lib/generated/client";
import styles from "./ResumeCard.module.css";

type Props = {
  resume: Resume;
};

export default function ResumeCard({ resume }: Props) {
  return (
    <Link
      href={`/resumes/${resume.id}`}
      className={styles.card}
      aria-label={`View ${resume.title}`}
    >
      {/* Thumbnail. Will always use the fallback until we sort out thumbnail gen. */}
      <div className={styles.preview}>
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
          <FileText className={styles.fileIcon} aria-hidden="true" />
        </div>
      </div>

      {/* Metadata */}
      <div className={styles.details}>
        <p className={styles.title}>{resume.title}</p>
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
        <p className={styles.metaData}>
          Uploaded{" "}
          {formatDistanceToNow(new Date(resume.createdAt), {
            addSuffix: true,
          })}
        </p>
      </div>
    </Link>
  );
}
