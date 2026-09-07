import type { AdminRole } from "./rbac.shared";

export type LogStatus = "SUCCESS" | "WARNING" | "FAILED";

export type ActivityModule =
  | "Authentication"
  | "Administrators"
  | "Services"
  | "Our Work"
  | "Careers"
  | "Blogs"
  | "Events"
  | "Reviews"
  | "Campaigns"
  | "Analytics"
  | "Settings"
  | "Profile";

export interface AdminLog {
  id: string;
  date: string; // ISO format e.g. "2026-09-07"
  time: string; // e.g. "02:15 PM"
  timestamp: number; // Unix timestamp in ms
  adminName: string;
  email: string;
  accountId: string;
  role: AdminRole;
  activity: string;
  module: ActivityModule;
  status: LogStatus;
  details?: string;
  targetResource?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface AdminLogFilters {
  search: string;
  role: "all" | AdminRole;
  module: "all" | ActivityModule;
  status: "all" | LogStatus;
  dateRange: "all" | "today" | "yesterday" | "7days" | "30days";
}

export type SortField = "timestamp" | "adminName" | "module" | "status";
export type SortOrder = "asc" | "desc";

export interface AdminLogStats {
  totalActivities: number;
  todayCount: number;
  successfulCount: number;
  failedCount: number;
}
