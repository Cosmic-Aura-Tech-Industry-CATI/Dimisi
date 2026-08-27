import { createFileRoute } from "@tanstack/react-router";
import { ReviewSubmitPage } from "@/pages/review/ReviewSubmitPage";

export const Route = createFileRoute("/review")({
  head: () => ({
    meta: [
      { title: "Share Your Experience — DIMISI Technologies" },
      {
        name: "description",
        content: "Submit your customer review and rating for services received from DIMISI Technologies.",
      },
      { property: "og:title", content: "Leave a Review — DIMISI Technologies" },
      {
        property: "og:description",
        content: "Share your feedback with DIMISI Technologies Pvt Ltd.",
      },
    ],
  }),
  component: () => <ReviewSubmitPage />,
});
