import { Application, Reminder } from "./generated/client";
import { Status } from "./generated/enums";

export interface StatusCount {
  status: Status;
  count: number;
}

export type DashboardData = {
  totalTracked: number;
  totalActive: number;
  attentionCount: number;
  statusBreakdown: StatusCount[];
  recentApplications: Application[];
  reminders: {
    overdue: Reminder[];
    today: Reminder[];
    upcoming: Reminder[];
  };
};
