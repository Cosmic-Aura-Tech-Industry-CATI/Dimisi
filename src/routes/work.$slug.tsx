import { createFileRoute, notFound } from "@tanstack/react-router";
import { getProjectBySlug } from "@/lib/work.functions";
import { WorkDetailPage } from "@/pages/work-detail/WorkDetailPage";

export const Route = createFileRoute("/work/$slug")({
  loader: async ({ params }) => {
    const project = await getProjectBySlug({ data: { slug: params.slug } });
    if (!project) {
      throw notFound();
    }
    return { project };
  },
  head: ({ loaderData }) => {
    const project = loaderData?.project;
    if (!project) {
      return {
        meta: [{ title: "Case Study Not Found — DIMISI Technologies" }],
      };
    }
    return {
      meta: [
        { title: `${project.title} (${project.category}) — Case Study · DIMISI Technologies` },
        { name: "description", content: project.overview },
        { property: "og:title", content: `${project.title} — DIMISI Case Study` },
        { property: "og:description", content: project.overview },
        { property: "og:image", content: project.cover_image },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: `${project.title} — DIMISI Technologies` },
        { name: "twitter:description", content: project.overview },
        { name: "twitter:image", content: project.cover_image },
      ],
    };
  },
  component: WorkDetailRouteComponent,
});

function WorkDetailRouteComponent() {
  const { project } = Route.useLoaderData();
  return <WorkDetailPage project={project} />;
}
