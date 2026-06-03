"use client";

import { getResumes } from "@/app/actions/resume";
import { useCallback, useEffect, useRef, useState } from "react";
import ResumeCard from "./ResumeCard";
import { useInfiniteScroll } from "react-infinite-scroll-component";
import { Resume } from "@/lib/generated/client";
import { SORTABLE_FIELDS, SortableField } from "@/lib/types";

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
    <>
      {/* ordering */}
      <div>
        {SORTABLE_FIELDS.map((key) => (
          <button key={key} onClick={() => handleOrderChange(key)}>
            {key === "updatedAt" ? "Updated At" : "Created At"}
            {orderKey === key && (order === "desc" ? " (Asc)" : " (Desc)")}
          </button>
        ))}
      </div>

      {/* gallery */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {resumes.map((resume) => (
          <ResumeCard key={resume.id} resume={resume} />
        ))}
      </div>

      {/* sentinel */}
      <div ref={sentinelRef} aria-hidden="true">
        {isLoading && (
          <p className="text-center text-sm text-muted-foreground mt-4">
            Loading...
          </p>
        )}
        {errMsg && (
          <p className="text-center text-sm text-destructive mt-4">{errMsg}</p>
        )}
        {!hasMore && !isLoading && (
          <p className="text-center text-sm text-muted-foreground mt-4">
            {resumes.length} / {totalCount} resumes
          </p>
        )}
      </div>
    </>
  );
}
