import { createFileRoute } from "@tanstack/react-router";
import { ReviewsPage } from "@/pages/reviews/ReviewsPage";

export const Route = createFileRoute("/reviews")({
  head: () => ({
    meta: [
      { title: "Client Reviews & Ratings — DIMISI Technologies" },
      {
        name: "description",
        content:
          "Read verified client reviews, ratings, and testimonials for AI, web development, mobile apps, and cloud software engineered by DIMISI Technologies.",
      },
      { property: "og:title", content: "Client Reviews & Ratings — DIMISI Technologies" },
      {
        property: "og:description",
        content:
          "Explore real outcomes, ratings, and feedback from companies powered by DIMISI Technologies.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: ReviewsPage,
});
