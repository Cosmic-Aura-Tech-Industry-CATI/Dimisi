import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { SectionHeading } from "@/components/common/SectionHeading/SectionHeading";
import { Reveal } from "@/components/common/Reveal/Reveal";
import { getPublicEvents } from "@/lib/events.functions";
import { GALLERY_CATEGORIES, GALLERY_ITEMS } from "@/data/gallery";
import pageStyles from "@/styles/page.module.css";
import styles from "./GalleryPage.module.css";

export interface GalleryDisplayItem {
  id: string;
  title: string;
  category: string;
  caption: string;
  hue: number;
  span: "normal" | "tall" | "wide";
  image_url?: string | undefined;
}

export function GalleryPage() {
  const queryClient = useQueryClient();
  const [category, setCategory] = useState("All");
  const [active, setActive] = useState<GalleryDisplayItem | null>(null);

  // Fetch real MongoDB gallery items via public API
  const { data: payload } = useQuery({
    queryKey: ["publicGallery"],
    queryFn: () => getPublicEvents(),
    staleTime: 5000,
  });

  // Listen to cleaner function event for immediate re-fetch
  useEffect(() => {
    const handleEventsUpdated = () => {
      void queryClient.invalidateQueries({ queryKey: ["publicGallery"] });
    };
    window.addEventListener("dimisi:events-updated", handleEventsUpdated);
    return () => window.removeEventListener("dimisi:events-updated", handleEventsUpdated);
  }, [queryClient]);


  const rawGallery = payload?.galleryItems || (payload as any)?.gallery || [];

  // Transform backend gallery items, falling back to sample items if no photos in DB yet
  const allItems: GalleryDisplayItem[] = useMemo(() => {
    if (rawGallery && rawGallery.length > 0) {
      return rawGallery.map((item, idx) => ({
        id: item.id || `gal-${idx}`,
        title: item.title || "Gallery Frame",
        category: item.category || "General",
        caption: item.caption || "",
        hue: item.hue || (30 + ((idx * 17) % 60)),
        span: (item.aspect_ratio || "normal") as "normal" | "tall" | "wide",
        image_url: item.image_url,
      }));
    }
    // Fallback to sample items if database is empty so page renders smoothly
    return GALLERY_ITEMS.map((item) => ({
      id: item.id,
      title: item.title,
      category: item.category,
      caption: item.caption,
      hue: item.hue,
      span: item.span,
      image_url: undefined,
    }));
  }, [rawGallery]);

  // Dynamic categories
  const categories = useMemo(() => {
    const cats = new Set<string>(["All"]);
    allItems.forEach((it) => {
      if (it.category && it.category.trim()) {
        cats.add(it.category.trim());
      }
    });
    return Array.from(cats);
  }, [allItems]);

  const filteredItems = useMemo(
    () => allItems.filter((g) => category === "All" || g.category === category),
    [allItems, category],
  );

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active]);

  return (
    <div className={pageStyles.page}>
      <section className={pageStyles.hero}>
        <SectionHeading
          as="h1"
          eyebrow="Archive"
          title="Frames from the studio"
          description="Moments, tech showcases, and studio plates. Click any frame to view in high resolution."
        />
      </section>

      <section className={pageStyles.section}>
        <div className={pageStyles.filters}>
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={[pageStyles.filter, c === category ? pageStyles.filterOn : ""].join(" ")}
            >
              {c}
            </button>
          ))}
        </div>

        <div className={styles.mosaic}>
          {filteredItems.map((item, i) => (
            <Reveal key={item.id} delay={Math.min(i * 40, 400)} className={styles[item.span] || styles.normal}>
              <button
                type="button"
                className={styles.frame}
                style={{ ["--hue" as string]: item.hue }}
                onClick={() => setActive(item)}
                aria-label={`Open ${item.title}`}
              >
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className={styles.realImg}
                    loading="lazy"
                  />
                ) : (
                  <span className={styles.art} aria-hidden="true" />
                )}
                <span className={styles.meta}>
                  <span className={styles.cat}>{item.category}</span>
                  <span className={styles.name}>{item.title}</span>
                </span>
              </button>
            </Reveal>
          ))}
        </div>
      </section>

      {active ? (
        <div
          className={styles.lightbox}
          role="dialog"
          aria-modal="true"
          aria-label={active.title}
          onClick={() => setActive(null)}
        >
          <div className={styles.viewer} onClick={(e) => e.stopPropagation()}>
            {active.image_url ? (
              <div className={styles.viewerImgWrapper}>
                <img
                  src={active.image_url}
                  alt={active.title}
                  className={styles.viewerImg}
                />
              </div>
            ) : (
              <span
                className={styles.viewerArt}
                style={{ ["--hue" as string]: active.hue }}
                aria-hidden="true"
              />
            )}
            <div className={styles.viewerMeta}>
              <p className={pageStyles.eyebrow}>{active.category}</p>
              <h2 className={pageStyles.title}>{active.title}</h2>
              {active.caption ? <p className={pageStyles.text}>{active.caption}</p> : null}
            </div>
            <button
              type="button"
              className={styles.close}
              onClick={() => setActive(null)}
              aria-label="Close image"
            >
              ×
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

