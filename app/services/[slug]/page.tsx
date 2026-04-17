import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ServiceDetailView from "@/components/services/ServiceDetailView";
import { SERVICE_PROFILES, SERVICE_SLUGS } from "@/app/services/_service-data";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return SERVICE_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const profile = SERVICE_PROFILES[slug];

  if (!profile) {
    return {
      title: "Service Not Found | Demisi",
    };
  }

  return {
    title: `${profile.title} | Demisi`,
    description: profile.summary,
  };
}

export default async function ServiceSlugPage({ params }: PageProps) {
  const { slug } = await params;
  const profile = SERVICE_PROFILES[slug];

  if (!profile) {
    notFound();
  }

  return <ServiceDetailView profile={profile} />;
}
