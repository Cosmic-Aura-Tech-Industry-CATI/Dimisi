import { createFileRoute } from "@tanstack/react-router";
import { GalleryPage } from "@/pages/gallery/GalleryPage";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Visual & Creative Gallery — DIMISI Technologies" },
      {
        name: "description",
        content:
          "Explore the visual archive, moments, shader tests, and tech showcase frames from DIMISI Technologies.",
      },
      { property: "og:title", content: "Visual & Creative Gallery — DIMISI Technologies" },
      {
        property: "og:description",
        content:
          "High-resolution frames, moments, and visual studio archive from DIMISI Technologies.",
      },
    ],
    links: [{ rel: "canonical", href: "https://www.dimisi.tech/gallery" }],
  }),
  component: GalleryPage,
});
