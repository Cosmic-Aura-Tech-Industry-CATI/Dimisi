import { createFileRoute } from "@tanstack/react-router";
import { ReviewSubmitPage } from "@/pages/review/ReviewSubmitPage";

export const Route = createFileRoute("/review/$slug")({
  head: () => ({
    meta: [
      { title: "Review Your Experience — DIMISI Technologies" },
      {
        name: "description",
        content: "Submit your customer review and feedback for your project with DIMISI Technologies.",
      },
      { property: "og:title", content: "Submit Client Review — DIMISI Technologies" },
    ],
  }),
  component: CampaignReviewRoute,
});

function CampaignReviewRoute() {
  const { slug } = Route.useParams();
  // Check if opened with ?scan=1 or hash
  const isScan = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("scan") === "1";

  return <ReviewSubmitPage campaignSlug={slug} isScan={isScan} />;
}
