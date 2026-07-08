import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { services } from "@/lib/site-data";
import { serviceDetails } from "@/lib/detail-data";
import ServiceDetailPageClient from "./ServiceDetailPageClient";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = services.find((s) => s.slug === slug);
  const detail = serviceDetails[slug];
  if (!service || !detail) {
    return { title: "Service Not Found — Dimisi Technologies", robots: "noindex" };
  }
  return {
    title: `${service.title} — Dimisi Technologies`,
    description: detail.tagline,
    openGraph: { title: `${service.title} — Dimisi Technologies`, description: detail.tagline },
  };
}

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params;
  const service = services.find((s) => s.slug === slug);
  const detail = serviceDetails[slug];
  if (!service || !detail) notFound();
  return <ServiceDetailPageClient slug={slug} />;
}
