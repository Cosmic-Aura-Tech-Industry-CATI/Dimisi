import { SectionHeading } from "@/components/common/SectionHeading/SectionHeading";
import { Reveal } from "@/components/common/Reveal/Reveal";
import { ScrollScene } from "@/components/common/ScrollScene/ScrollScene";
import { TiltCard } from "@/components/common/TiltCard/TiltCard";
import { COMPANY } from "@/constants/site";
import styles from "@/styles/page.module.css";
import legal from "@/styles/legal.module.css";
const PILLARS = [
  {
    title: "A technology company, not an AI shop",
    detail:
      "DIMISI Technologies Pvt Ltd builds software end to end — web platforms, mobile apps, cloud infrastructure, integrations and automation. AI is one tool in that kit, never the whole story.",
  },
  {
    title: "Services for businesses",
    detail:
      "Product engineering, custom web and mobile development, cloud and DevOps, UI/UX design, QA and long-term maintenance for companies that need a dependable delivery partner.",
  },
  {
    title: "Our own product: Kalesh",
    detail:
      "Alongside client work we are building Kalesh, our in-house app. It is where our team experiments first, and everything we learn there ships back into client projects.",
  },
  {
    title: "Built to be handed over",
    detail:
      "Every repository, credential and document belongs to the client. We write things down, train your team and stay available after launch.",
  },
];

export function AboutPage() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <SectionHeading
          as="h1"
          eyebrow="About Us"
          title="DIMISI Technologies Pvt Ltd"
          description={COMPANY.mission}
        />
      </section>

      <ScrollScene variant="depth">
        <section className={styles.section}>
          <div className={styles.grid}>
            {PILLARS.map((p, i) => (
              <Reveal key={p.title} delay={i * 80}>
                <TiltCard>
                  <h2 className={styles.title}>{p.title}</h2>
                  <p className={styles.text}>{p.detail}</p>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </section>
      </ScrollScene>

      <ScrollScene variant="tiltIn">
        <section className={styles.section}>
          <Reveal>
            <div className={legal.prose}>
              <h2>Company details</h2>
              <p>
                <strong>Legal name:</strong> {COMPANY.name}
              </p>
              <p>
                <strong>Registered office:</strong> {COMPANY.address}
              </p>
              <p>
                <strong>Email:</strong> {COMPANY.email}
              </p>
              <p>
                <strong>Phone:</strong> {COMPANY.phone}
              </p>
            </div>
          </Reveal>
        </section>
      </ScrollScene>
    </div>
  );
}
