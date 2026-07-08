import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { products } from "@/lib/site-data";
import { productDetails } from "@/lib/detail-data";
import ProductDetailPageClient from "./ProductDetailPageClient";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = products.find((p) => p.slug === slug);
  const detail = productDetails[slug];
  if (!product || !detail) {
    return { title: "Product Not Found — Dimisi Technologies", robots: "noindex" };
  }
  return {
    title: `${product.name} — Dimisi Technologies`,
    description: detail.intro,
    openGraph: { title: `${product.name} — Dimisi Technologies`, description: detail.intro },
  };
}

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = products.find((p) => p.slug === slug);
  const detail = productDetails[slug];
  if (!product || !detail) notFound();
  return <ProductDetailPageClient slug={slug} />;
}
