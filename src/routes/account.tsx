import { createFileRoute } from "@tanstack/react-router";
import { AccountPage } from "@/pages/account/AccountPage";

export const Route = createFileRoute("/account")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Your Account — DIMISI Technologies" },
      {
        name: "description",
        content:
          "Manage your DIMISI Technologies account, update your details and control email update notifications.",
      },
      { property: "og:title", content: "Your Account — DIMISI Technologies" },
      {
        property: "og:description",
        content: "Manage your DIMISI account and email notification preferences.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AccountPage,
});
