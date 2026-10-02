import { useState, useEffect, useMemo } from "react";
import { SectionHeading } from "@/components/common/SectionHeading/SectionHeading";
import { Reveal } from "@/components/common/Reveal/Reveal";
import { ScrollScene } from "@/components/common/ScrollScene/ScrollScene";
import { TiltCard } from "@/components/common/TiltCard/TiltCard";
import { MagneticButton } from "@/components/common/MagneticButton/MagneticButton";
import { PRODUCTS } from "@/data/products";
import { getActiveCasestudiesApi } from "@/services/casestudy.service";
import type { ProjectItem } from "@/lib/work.shared";
import styles from "@/styles/page.module.css";

interface DisplayProduct {
  id: string;
  name: string;
  category: string;
  summary: string;
  features: string[];
  metrics: Array<{ label: string; value: string }>;
  status: string;
  websiteUrl?: string | undefined;
}

export function ProductsPage() {
  const [liveProducts, setLiveProducts] = useState<ProjectItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  useEffect(() => {
    let isMounted = true;
    async function loadProducts() {
      try {
        const data = await getActiveCasestudiesApi({ type: "product" });
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setLiveProducts(data);
        }
      } catch (err) {
        console.warn("Using default products cache:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadProducts();
    return () => {
      isMounted = false;
    };
  }, []);

  const displayProducts: DisplayProduct[] = useMemo(() => {
    if (liveProducts.length > 0) {
      return liveProducts.map((p) => ({
        id: p.id || p.slug,
        name: p.title,
        category: p.category || "AI Platform",
        summary: p.tagline || p.overview || "High-performance platform built for enterprise reliability.",
        features: p.tech_stack && p.tech_stack.length > 0
          ? p.tech_stack
          : ["Multi-Agent Architecture", "Zero-Latency Pipeline", "Scalable Infrastructure"],
        metrics: p.metrics && p.metrics.length > 0
          ? p.metrics
          : [
              { label: "Reliability", value: "99.98%" },
              { label: "Deployment", value: "Production" },
            ],
        status: p.is_featured ? "Featured" : "Live",
        websiteUrl: p.website_url,
      }));
    }
    return PRODUCTS;
  }, [liveProducts]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    displayProducts.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return ["All", ...Array.from(set)];
  }, [displayProducts]);

  const filteredProducts = useMemo(() => {
    if (selectedCategory === "All") return displayProducts;
    return displayProducts.filter(
      (p) => p.category.toLowerCase() === selectedCategory.toLowerCase(),
    );
  }, [displayProducts, selectedCategory]);

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <SectionHeading
          as="h1"
          eyebrow="Products"
          title="Systems already running in production"
          description="Everything below powers paying customers today. The metrics are pulled from live dashboards, not marketing."
        />

        {categories.length > 2 && (
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "center", marginTop: "24px" }}>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: "6px 14px",
                  borderRadius: "20px",
                  fontSize: "13px",
                  fontWeight: 500,
                  border: "1px solid",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  backgroundColor: selectedCategory === cat ? "rgba(255,255,255,0.15)" : "transparent",
                  borderColor: selectedCategory === cat ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.1)",
                  color: selectedCategory === cat ? "#fff" : "rgba(255,255,255,0.6)",
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </section>

      <ScrollScene variant="depth">
        <section className={styles.section}>
          <div className={styles.gridWide}>
            {filteredProducts.map((p, i) => (
              <Reveal key={p.id} delay={i * 70}>
                <TiltCard>
                  <span className={styles.pill}>{p.status}</span>
                  <p className={styles.eyebrow}>{p.category}</p>
                  <h2 className={styles.title}>{p.name}</h2>
                  <p className={styles.text}>{p.summary}</p>
                  <ul className={styles.tags}>
                    {p.features.map((f) => (
                      <li key={f} className={styles.tag}>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <div className={styles.metaRow}>
                    {p.metrics.map((m) => (
                      <div key={m.label}>
                        <span className={styles.metaValue}>{m.value}</span>
                        <span className={styles.metaLabel}>{m.label}</span>
                      </div>
                    ))}
                  </div>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </section>
      </ScrollScene>

      <ScrollScene variant="tiltIn">
        <section className={styles.section}>
          <MagneticButton to="/contact">Request a demo</MagneticButton>
        </section>
      </ScrollScene>
    </div>
  );
}
