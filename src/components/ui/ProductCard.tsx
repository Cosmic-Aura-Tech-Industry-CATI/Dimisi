import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import type { Product } from "@/lib/site-data";
import { TiltCard } from "./TiltCard";

export function ProductCard({ product }: { product: Product }) {
  const Icon = product.icon;
  return (
    <TiltCard className="h-full">
      <Link
        to="/products/$slug"
        params={{ slug: product.slug }}
        className="flex h-full flex-col rounded-2xl border border-foreground/10 bg-foreground/[0.01] p-6 transition-colors duration-300 hover:border-foreground/30 hover:bg-foreground/[0.03]"
      >
        <div className="flex items-start justify-between">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-foreground/10 text-foreground/70 transition-colors group-hover/tilt:text-foreground">
            <Icon className="h-5 w-5" />
          </span>
          <span className="rounded-full border border-foreground/10 px-2.5 py-1 text-[10px] uppercase tracking-wider text-foreground/40">
            {product.status}
          </span>
        </div>
        <h3 className="mt-5 flex items-center gap-1.5 text-lg font-medium text-foreground">
          {product.name}
          <ArrowUpRight className="h-4 w-4 text-foreground/40 transition-all group-hover/tilt:translate-x-0.5 group-hover/tilt:-translate-y-0.5 group-hover/tilt:text-foreground" />
        </h3>
        <p className="mt-1 text-xs uppercase tracking-wider text-foreground/40">{product.tagline}</p>
        <p className="mt-3 text-sm leading-relaxed text-foreground/50">{product.description}</p>
        <span className="mt-4 text-xs text-foreground/40">{product.category}</span>
      </Link>
    </TiltCard>
  );
}
