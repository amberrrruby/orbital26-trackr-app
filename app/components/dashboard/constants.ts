import { Status } from "@/lib/generated/enums";

export const STATUS_COLORS: Record<Status, string> = {
  [Status.WISHLIST]: "#94a3b8", // slate  — not yet acted on
  [Status.APPLIED]: "#60a5fa", // blue   — in motion
  [Status.OA_ASSESSMENT]: "#a78bfa", // violet — being evaluated
  [Status.INTERVIEW]: "#fb923c", // orange — active stage
  [Status.OFFER]: "#4ade80", // green  — positive outcome
  [Status.REJECTED]: "#f87171", // red    — closed/negative
};
