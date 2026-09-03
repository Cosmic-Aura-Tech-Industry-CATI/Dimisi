import { SectionHeading } from "@/components/common/SectionHeading/SectionHeading";
import { Reveal } from "@/components/common/Reveal/Reveal";
import { COMPANY } from "@/constants/site";
import styles from "@/styles/page.module.css";
import legal from "@/styles/legal.module.css";

export function TermsPage() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <SectionHeading
          as="h1"
          eyebrow="Legal"
          title="Terms & Conditions"
          description="Please read these terms before using our website, engaging our services or using the Kalesh app."
        />
      </section>

      <section className={styles.section}>
        <Reveal>
          <div className={legal.prose}>
            <span className={legal.updated}>Last updated: 31 July 2026</span>

            <h2>1. Acceptance</h2>
            <p>
              By accessing this website or using any product or service provided by {COMPANY.name},
              you agree to these terms. If you do not agree, please do not use them.
            </p>

            <h2>2. Services</h2>
            <p>
              Scope, timelines, deliverables and fees for client work are defined in a separate
              written proposal or statement of work. Where those documents conflict with this page,
              the signed agreement takes precedence.
            </p>

            <h2>3. Payments</h2>
            <p>
              Invoices are payable within the period stated on the invoice. Work may be paused on
              overdue accounts. Taxes are charged as applicable under Indian law.
            </p>

            <h2>4. Intellectual property</h2>
            <p>
              On full payment, ownership of custom deliverables transfers to the client. We retain
              ownership of our pre-existing tools, libraries and internal frameworks, and grant a
              perpetual licence to use them as embedded in the deliverable. The DIMISI name, logo and
              the Kalesh app remain our property.
            </p>

            <h2>5. Client responsibilities</h2>
            <ul>
              <li>Provide content, access and approvals in reasonable time.</li>
              <li>Ensure you hold rights to any material you supply to us.</li>
              <li>Nominate a decision-maker for the engagement.</li>
            </ul>

            <h2>6. Acceptable use</h2>
            <p>
              You may not misuse the website or Kalesh — no reverse engineering, scraping at scale,
              interference with security controls, or use for unlawful purposes.
            </p>

            <h2>7. Warranties and liability</h2>
            <p>
              We deliver services with reasonable skill and care. Except where the law says
              otherwise, our total liability for any claim is limited to the fees paid for the
              engagement giving rise to it, and we are not liable for indirect or consequential loss.
            </p>

            <h2>8. Confidentiality</h2>
            <p>
              Each party keeps the other's confidential information private and uses it only for the
              engagement.
            </p>

            <h2>9. Termination</h2>
            <p>
              Either party may terminate an engagement with written notice as set out in the signed
              agreement. Work completed up to the termination date remains payable.
            </p>

            <h2>10. Governing law</h2>
            <p>
              These terms are governed by the laws of India, with courts at our registered location
              having exclusive jurisdiction. Questions? Write to {COMPANY.email}.
            </p>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
