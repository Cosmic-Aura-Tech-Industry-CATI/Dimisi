import type { Metadata } from "next";
import ProductsPageClient from "./ProductsPageClient";

export const metadata: Metadata = {
  title: "Kalesh — Dimisi Technologies",
  description: "Kalesh is Dimisi Technologies' in-house social platform for community connection and real-time discussion.",
  openGraph: { title: "Kalesh — Dimisi Technologies", description: "Kalesh is Dimisi Technologies' in-house social platform for community connection and real-time discussion." },
};

export default function ProductsPage() {
  return <ProductsPageClient />;
}
