import { Application } from "./generated/client";
import { Status } from "./generated/enums";
import { ReminderWithApplication } from "./types";

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
    overdue: ReminderWithApplication[];
    today: ReminderWithApplication[];
    upcoming: ReminderWithApplication[];
  };
};
