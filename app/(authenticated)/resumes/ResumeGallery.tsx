"use client";

import { getResumes } from "@/app/actions/resume";
import { useCallback, useEffect, useRef, useState } from "react";
import ResumeCard from "./ResumeCard";
import { useInfiniteScroll } from "react-infinite-scroll-component";
import { Resume } from "@/lib/generated/client";
import { SORTABLE_FIELDS, SortableField } from "@/lib/types";
import styles from "./ResumeGallery.module.css";

type Props = {
  initialResumes: Resume[];
  totalCount: number;
};

const PAGE_SIZE = 12;

export default function ResumeGallery({ initialResumes, totalCount }: Props) {
  const [resumes, setResumes] = useState<Resume[]>(initialResumes);
  const [page, setPage] = useState(1); // starts at 1. can be interpreted as "what's the next starting point that is a multiple of PAGE_SIZE to fetch?"
  const [orderKey, setOrderKey] = useState<SortableField>("updatedAt");
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(resumes.length < totalCount);

  const isMounted = useRef(false);

  const loadMore = useCallback(async () => {
    if (!hasMore) {
      return;
    }

    const res = await getResumes(orderKey, order, page * PAGE_SIZE, PAGE_SIZE);
    if (!res.ok) {
      setErrMsg(`Something went wrong. Please try again.`);
      return;
    }
    const {
      value: { resumes: newResumes },
    } = res;
    setResumes((prevState) => [...prevState, ...newResumes]);
    setPage((prevPage) => prevPage + 1);
  }, [hasMore, order, orderKey, page]);

  useEffect(() => {
    async function refetch() {
      setErrMsg(null);
      const res = await getResumes(orderKey, order, 0, PAGE_SIZE);
      if (!res.ok) {
        setErrMsg(`Something went wrong. Please try again.`);
        return;
      }
      const {
        value: { resumes, totalCount },
      } = res;
      setResumes(resumes);
      setPage(1);
      setHasMore(resumes.length < totalCount);
    }
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    refetch();
  }, [orderKey, order]);

  const { sentinelRef, isLoading } = useInfiniteScroll({
    next: loadMore,
    hasMore,
    dataLength: resumes.length,
  });

  function handleOrderChange(key: SortableField) {
    if (key === orderKey) {
      setOrder((ord) => (ord === "desc" ? "asc" : "desc"));
    } else {
      setOrderKey(key);
      setOrder("desc");
    }
  }

  return (
    <div className={styles.container}>
      {/* ordering */}
      <div className={styles.ordering}>
        {SORTABLE_FIELDS.map((key) => (
          <button
            key={key}
            onClick={() => handleOrderChange(key)}
            className={`${styles.sortButton} ${
              orderKey === key ? styles.activeSortButton : ""
            }`}
          >
            {key === "updatedAt" ? "Updated At" : "Created At"}
            {orderKey === key && (order === "desc" ? " (Desc)" : " (Asc)")}
          </button>
        ))}
      </div>

      {/* gallery */}
      {resumes.length === 0 ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyTitle}>No resume uploaded</p>
          <p className={styles.emptyDescription}>
            Upload your first resume to start building your resume library.
          </p>
        </div>
      ) : (
        <div className={styles.gallery}>
          {resumes.map((resume) => (
            <ResumeCard key={resume.id} resume={resume} />
          ))}
        </div>
      )}

      {/* sentinel */}
      <div ref={sentinelRef} className={styles.sentinel} aria-hidden="true">
        {isLoading && <p className={styles.status}>Loading...</p>}
        {errMsg && (
          <p className={`${styles.status} ${styles.error}`}>{errMsg}</p>
        )}
        {!hasMore && !isLoading && (
          <p className={styles.status}>
            {resumes.length} / {totalCount} resumes
          </p>
        )}
      </div>
    </div>
  );
}
