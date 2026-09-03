import { useEffect, useMemo, useState } from "react";
import { SectionHeading } from "@/components/common/SectionHeading/SectionHeading";
import { Reveal } from "@/components/common/Reveal/Reveal";
import { GALLERY_CATEGORIES, GALLERY_ITEMS } from "@/data/gallery";
import type { GalleryItem } from "@/types";
import pageStyles from "@/styles/page.module.css";
import styles from "./GalleryPage.module.css";

export function GalleryPage() {
  const [category, setCategory] = useState("All");
  const [active, setActive] = useState<GalleryItem | null>(null);

  const items = useMemo(
    () => GALLERY_ITEMS.filter((g) => category === "All" || g.category === category),
    [category],
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
          description="Lighting studies, shader tests and interface plates. Click any frame to open it."
        />
      </section>

      <section className={pageStyles.section}>
        <div className={pageStyles.filters}>
          {GALLERY_CATEGORIES.map((c) => (
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
          {items.map((item, i) => (
            <Reveal key={item.id} delay={i * 50} className={styles[item.span]}>
              <button
                type="button"
                className={styles.frame}
                style={{ ["--hue" as string]: item.hue }}
                onClick={() => setActive(item)}
                aria-label={`Open ${item.title}`}
              >
                <span className={styles.art} aria-hidden="true" />
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
            <span
              className={styles.viewerArt}
              style={{ ["--hue" as string]: active.hue }}
              aria-hidden="true"
            />
            <div className={styles.viewerMeta}>
              <p className={pageStyles.eyebrow}>{active.category}</p>
              <h2 className={pageStyles.title}>{active.title}</h2>
              <p className={pageStyles.text}>{active.caption}</p>
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
