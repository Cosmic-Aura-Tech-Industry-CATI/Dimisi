import { createFileRoute } from "@tanstack/react-router";
import { AuthPage } from "@/pages/auth/AuthPage";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign In / Sign Up — DIMISI Technologies" },
      {
        name: "description",
        content:
          "Create your DIMISI Technologies account to get product updates, project information and announcements straight to your inbox.",
      },
      { property: "og:title", content: "Sign In / Sign Up — DIMISI Technologies" },
      {
        property: "og:description",
        content: "Create a DIMISI account for updates and announcements by email.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});
