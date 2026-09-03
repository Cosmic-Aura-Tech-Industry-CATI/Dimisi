import { SectionHeading } from "@/components/common/SectionHeading/SectionHeading";
import { Reveal } from "@/components/common/Reveal/Reveal";
import { ScrollScene } from "@/components/common/ScrollScene/ScrollScene";
import { TiltCard } from "@/components/common/TiltCard/TiltCard";
import { MagneticButton } from "@/components/common/MagneticButton/MagneticButton";
import { PRODUCTS } from "@/data/products";
import styles from "@/styles/page.module.css";

export function ProductsPage() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <SectionHeading
          as="h1"
          eyebrow="Products"
          title="Systems already running in production"
          description="Everything below powers paying customers today. The metrics are pulled from live dashboards, not marketing."
        />
      </section>

      <ScrollScene variant="depth">
        <section className={styles.section}>
          <div className={styles.gridWide}>
            {PRODUCTS.map((p, i) => (
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
