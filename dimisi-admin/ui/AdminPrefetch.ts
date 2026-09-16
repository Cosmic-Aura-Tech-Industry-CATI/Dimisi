import type { AdminTab } from "./AdminSidebar/AdminSidebar";

const prefetchedTabs = new Set<AdminTab>();

/**
 * Prefetches the code-split JavaScript chunk for an admin module on user intent
 * (such as hovering or focusing a tab link in the sidebar).
 */
export function prefetchAdminTab(tab: AdminTab): void {
  if (typeof window === "undefined") return;
  if (prefetchedTabs.has(tab)) return;
  prefetchedTabs.add(tab);

  switch (tab) {
    case "overview":
      void import("./AdminOverview/AdminOverview").catch(() => {});
      break;
    case "services":
      void import("./AdminServices/AdminServices").catch(() => {});
      break;
    case "work":
      void import("./AdminWork/AdminWork").catch(() => {});
      break;
    case "careers":
      void import("./AdminCareers/AdminCareers").catch(() => {});
      break;
    case "blog":
      void import("./AdminBlog/AdminBlog").catch(() => {});
      break;
    case "events":
      void import("./AdminEvents/AdminEvents").catch(() => {});
      break;
    case "reviews":
      void import("./AdminReviews/AdminReviews").catch(() => {});
      break;
    case "campaigns":
      void import("./AdminCampaigns/AdminCampaigns").catch(() => {});
      break;
    case "reports":
      void import("./AdminReports/AdminReports").catch(() => {});
      break;
    case "analytics":
      void import("./AdminAnalytics/AdminAnalytics").catch(() => {});
      break;
    case "logs":
      void import("./AdminLogs/AdminLogs").catch(() => {});
      break;
    case "settings":
      void import("./AdminSettings/AdminSettings").catch(() => {});
      break;
    case "leads":
      void import("./AdminLeads/AdminLeads").catch(() => {});
      break;
    case "admins":
      void import("./AdminAdmins/AdminAdmins").catch(() => {});
      break;
  }
}
