import type { Metadata } from "next";
import ProductsPageClient from "./ProductsPageClient";

export const metadata: Metadata = {
  title: "Products — Dimisi Technologies",
  description: "Explore Dimisi Technologies' in-house products: Kalesh, CarryOn, Sylon, and Axis Conference Web.",
  openGraph: { title: "Products — Dimisi Technologies", description: "Digital products built in-house by Dimisi Technologies." },
};

export default function ProductsPage() {
  return <ProductsPageClient />;
}
