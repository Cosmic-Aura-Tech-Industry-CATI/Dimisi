import { createFileRoute } from "@tanstack/react-router";
import { GalleryPage } from "@/pages/gallery/GalleryPage";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Visual Studio Archive & Gallery — DIMISI Technologies" },
      {
        name: "description",
        content:
          "Explore the visual archive, moments, shader tests, and tech showcase frames from DIMISI Technologies.",
      },
      { property: "og:title", content: "Visual Studio Archive & Gallery — DIMISI Technologies" },
      {
        property: "og:description",
        content: "High-resolution frames, moments, and visual studio archive from DIMISI Technologies.",
      },
    ],
  }),
  component: GalleryPage,
});

