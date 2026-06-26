import { TimelineEvent } from "@/lib/generated/client";

export function getImportantDateValues(timelineEvent: TimelineEvent[]) {
  function findDate(sourceKey: string) {
    const event = timelineEvent.find(
      (timelineEvent) =>
        timelineEvent.type === "IMPORTANT_DATE" &&
        timelineEvent.sourceKey === sourceKey,
    );

    return event ? formatDateInputValue(event.eventDate) : "";
  }

  return {
    oaAssessmentDate: findDate("OA_ASSESSMENT_DATE"),
    interviewDate: findDate("INTERVIEW_DATE"),
    offerExpiryDate: findDate("OFFER_EXPIRY_DATE"),
  };
}

function formatDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
