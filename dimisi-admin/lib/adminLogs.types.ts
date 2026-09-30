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
  | "Settings"
  | "Profile"
  | "Workspace";

export interface AdminLog {
  id: string;
  date: string; // ISO format e.g. "2026-09-07"
  time: string; // e.g. "02:15 PM"
  timestamp: number; // Unix timestamp in ms
  adminName: string;
  email: string;
  employeeId: string;
  accountId?: string | undefined;
  avatar?: string | undefined;
  role: AdminRole;
  activity: string;
  actionRaw?: string | undefined;
  module: ActivityModule;
  entityTypeRaw?: string | undefined;
  status: LogStatus;
  scope?: "PANEL" | "ADMIN" | "PERSONAL" | "ORG" | string | undefined;
  details?: string | undefined;
  targetResource?: string | undefined;
  ipAddress?: string | undefined;
  userAgent?: string | undefined;
  metadata?: Record<string, any> | undefined;
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
