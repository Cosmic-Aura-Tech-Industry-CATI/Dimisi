import { createFileRoute, notFound } from "@tanstack/react-router";
import { getServiceBySlug } from "@/lib/services.functions";
import { ServiceDetailPage } from "@/pages/service-detail/ServiceDetailPage";

export const Route = createFileRoute("/services/$slug")({
  loader: async ({ params }) => {
    const service = await getServiceBySlug({ data: { slug: params.slug } });
    if (!service) {
      throw notFound();
    }
    return { service };
  },
  head: ({ loaderData }) => {
    const service = loaderData?.service;
    if (!service) {
      return {
        meta: [{ title: "Service Not Found — DIMISI Technologies" }],
      };
    }
    return {
      meta: [
        { title: `${service.title} — DIMISI Technologies` },
        { name: "description", content: service.summary },
        { property: "og:title", content: `${service.title} — DIMISI Technologies` },
        { property: "og:description", content: service.summary },
        { property: "og:image", content: service.hero_image },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: `${service.title} — DIMISI Technologies` },
        { name: "twitter:description", content: service.summary },
        { name: "twitter:image", content: service.hero_image },
      ],
    };
  },
  component: ServiceDetailRouteComponent,
});

function ServiceDetailRouteComponent() {
  const { service } = Route.useLoaderData();
  return <ServiceDetailPage service={service} />;
}
