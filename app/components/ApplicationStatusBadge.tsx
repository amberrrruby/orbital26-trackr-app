import { Badge, type BadgeVariant } from "./Badge";

type ApplicationStatus =
  | "WISHLIST"
  | "APPLIED"
  | "OA_ASSESSMENT"
  | "INTERVIEW"
  | "OFFER"
  | "REJECTED";

const STATUS_BADGE_CONFIG: Record<
  ApplicationStatus,
  {
    label: string;
    variant: BadgeVariant;
  }
> = {
  WISHLIST: {
    label: "WISHLIST",
    variant: "wishlist",
  },
  APPLIED: {
    label: "APPLIED",
    variant: "applied",
  },
  OA_ASSESSMENT: {
    label: "OA/ ASSESSMENT",
    variant: "assessment",
  },
  INTERVIEW: {
    label: "INTERVIEW",
    variant: "interview",
  },
  OFFER: {
    label: "OFFER",
    variant: "offer",
  },
  REJECTED: {
    label: "REJECTED",
    variant: "rejected",
  },
};

type ApplicationBadgeProps = {
  status: ApplicationStatus;
  className?: string;
};

export function ApplicationStatusBadge({
  status,
  className,
}: ApplicationBadgeProps) {
  const config = STATUS_BADGE_CONFIG[status];

  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
}
