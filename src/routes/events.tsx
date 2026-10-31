import { createFileRoute } from "@tanstack/react-router";
import { EventsPage } from "@/pages/events/EventsPage";

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "Events, Milestones & Gallery — DIMISI Technologies" },
      {
        name: "description",
        content:
          "Explore product keynotes, tech summits, hackathons, and visual studio archive from DIMISI Technologies.",
      },
      { property: "og:title", content: "Events, Milestones & Gallery — DIMISI Technologies" },
      {
        property: "og:description",
        content: "Flagship keynotes, summits, hackathons, and creative visual plates from DIMISI.",
      },
    ],
    links: [{ rel: "canonical", href: "https://www.dimisi.tech/events" }],
  }),
  component: EventsPage,
});
