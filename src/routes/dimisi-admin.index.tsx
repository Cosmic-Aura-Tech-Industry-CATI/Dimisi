import { createFileRoute, redirect, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/dimisi-admin/")({
  validateSearch: (search: Record<string, unknown>) => ({
    tab: typeof search.tab === "string" ? search.tab : undefined,
  }),
  beforeLoad: ({ search }) => {
    const rawTab = search?.tab?.toLowerCase();
    const target =
      rawTab && rawTab !== "overview" ? `/dimisi-admin/${rawTab}` : "/dimisi-admin/overview";
    throw redirect({
      to: target,
      replace: true,
    });
  },
  component: () => <Navigate to="/dimisi-admin/overview" replace />,
});
