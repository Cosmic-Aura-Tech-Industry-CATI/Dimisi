import { Link } from "@tanstack/react-router";
import { SectionHeading } from "@/components/common/SectionHeading/SectionHeading";
import { SplitText } from "@/components/common/SplitText/SplitText";
import { Reveal } from "@/components/common/Reveal/Reveal";
import { ScrollScene } from "@/components/common/ScrollScene/ScrollScene";
import { MagneticButton } from "@/components/common/MagneticButton/MagneticButton";
import { WorldScene } from "../WorldScene/WorldScene";
import { SERVICE_WORLDS, type ServiceWorld } from "@/data/serviceWorlds";
import styles from "./ServiceWorldPage.module.css";

export function ServiceWorldPage({ world }: { world: ServiceWorld }) {
  const others = SERVICE_WORLDS.filter((w) => w.slug !== world.slug).slice(0, 4);

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <Reveal variant="fade">
            <p className={styles.eyebrow}>
              <span className={styles.dot} aria-hidden="true" />
              {world.index} · {world.environment}
            </p>
          </Reveal>
          <SplitText as="h1" text={world.title} className={styles.heroTitle} />
          <Reveal variant="up" delay={120}>
            <p className={styles.heroText}>{world.hero}</p>
          </Reveal>
          <Reveal variant="up" delay={200}>
            <div className={styles.heroActions}>
              <MagneticButton to="/contact">Start a project</MagneticButton>
              <MagneticButton to="/services" variant="ghost">
                ← All services
              </MagneticButton>
            </div>
          </Reveal>
        </div>
        <Reveal variant="zoom" delay={100}>
          <WorldScene motif={world.motif} />
        </Reveal>
      </section>

      <ScrollScene>
        <section className={styles.section}>
          <SectionHeading
            eyebrow={world.solutions.eyebrow}
            title={world.solutions.title}
            description={world.solutions.description}
          />
          <div className={styles.cards}>
            {world.solutions.items.map((it, i) => (
              <Reveal key={it.title} delay={i * 70}>
                <article className={styles.card}>
                  <span className={styles.cardGlow} aria-hidden="true" />
                  <h3 className={styles.cardTitle}>{it.title}</h3>
                  <p className={styles.cardText}>{it.text}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </section>
      </ScrollScene>

      <ScrollScene>
        <section className={styles.section}>
          <SectionHeading
            eyebrow="Technologies"
            title="The stack inside this world"
            description="Tools chosen for longevity, performance and hireability."
          />
          <Reveal variant="up">
            <ul className={styles.chips}>
              {world.technologies.map((t) => (
                <li key={t} className={styles.chip}>
                  {t}
                </li>
              ))}
            </ul>
          </Reveal>
        </section>
      </ScrollScene>

      <ScrollScene>
        <section className={styles.section}>
          <SectionHeading
            eyebrow="Workflow"
            title="How the build unfolds"
            description="A fixed rhythm so you always know what happens next."
          />
          <div className={styles.timeline}>
            {world.workflow.map((s, i) => (
              <Reveal key={s.step} delay={i * 80}>
                <div className={styles.stepCard}>
                  <span className={styles.stepNum}>{s.step}</span>
                  <h3 className={styles.stepTitle}>{s.title}</h3>
                  <p className={styles.stepText}>{s.detail}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      </ScrollScene>

      <ScrollScene>
        <section className={styles.section}>
          <SectionHeading eyebrow="Case study" title={world.caseStudy.client} />
          <Reveal variant="up">
            <div className={styles.case}>
              <div>
                <p className={styles.caseLabel}>Challenge</p>
                <p className={styles.caseText}>{world.caseStudy.challenge}</p>
                <p className={styles.caseLabel}>Outcome</p>
                <p className={styles.caseText}>{world.caseStudy.outcome}</p>
              </div>
              <div className={styles.metrics}>
                {world.caseStudy.metrics.map((m) => (
                  <div key={m.k} className={styles.metric}>
                    <span className={styles.metricV}>{m.v}</span>
                    <span className={styles.metricK}>{m.k}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </section>
      </ScrollScene>

      <ScrollScene>
        <section className={styles.section}>
          <SectionHeading eyebrow="Next world" title="Continue the journey" />
          <div className={styles.nextGrid}>
            {others.map((o, i) => (
              <Reveal key={o.slug} delay={i * 60}>
                <Link to={`/services/${o.slug}` as never} className={styles.nextCard}>
                  <span className={styles.nextGlyph} aria-hidden="true">
                    {o.glyph}
                  </span>
                  <span className={styles.nextName}>{o.title}</span>
                  <span className={styles.nextTag}>{o.tagline}</span>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      </ScrollScene>

      <ScrollScene>
        <section className={styles.section}>
          <div className={styles.cta}>
            <h2 className={styles.ctaTitle}>Build your {world.name.toLowerCase()} world with DIMISI</h2>
            <p className={styles.ctaText}>
              Tell us what you are trying to launch and we will map the architecture, timeline and
              team in a single call.
            </p>
            <div className={styles.heroActions}>
              <MagneticButton to="/contact">Start project</MagneticButton>
              <MagneticButton to="/contact" variant="ghost">
                Book meeting
              </MagneticButton>
            </div>
          </div>
        </section>
      </ScrollScene>
    </div>
  );
}
