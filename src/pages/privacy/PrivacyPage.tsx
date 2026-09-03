import { SectionHeading } from "@/components/common/SectionHeading/SectionHeading";
import { Reveal } from "@/components/common/Reveal/Reveal";
import { COMPANY } from "@/constants/site";
import styles from "@/styles/page.module.css";
import legal from "@/styles/legal.module.css";

export function PrivacyPage() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <SectionHeading
          as="h1"
          eyebrow="Legal"
          title="Privacy Policy"
          description="This policy explains what information we collect, why we collect it and what control you have over it."
        />
      </section>

      <section className={styles.section}>
        <Reveal>
          <div className={legal.prose}>
            <span className={legal.updated}>Last updated: 31 July 2026</span>

            <h2>1. Who we are</h2>
            <p>
              {COMPANY.name} ("DIMISI", "we", "us") operates this website, delivers software
              services to clients and develops the Kalesh application. Our registered office is at{" "}
              {COMPANY.address}. You can reach us at {COMPANY.email}.
            </p>

            <h2>2. Information we collect</h2>
            <ul>
              <li>Details you submit through our contact or career forms — name, email, phone, company and message content.</li>
              <li>Basic technical data such as browser type, device type, approximate region and pages visited.</li>
              <li>Account and usage data inside the Kalesh app, where you have created an account.</li>
              <li>Information clients share with us during a project, handled under the terms of the signed agreement.</li>
            </ul>

            <h2>3. How we use it</h2>
            <ul>
              <li>To reply to enquiries and prepare proposals.</li>
              <li>To deliver, support and improve our services and products.</li>
              <li>To evaluate job and internship applications.</li>
              <li>To meet legal, accounting and tax obligations.</li>
            </ul>
            <p>We do not sell your personal data, and we do not use it for third-party advertising.</p>

            <h2>4. Sharing</h2>
            <p>
              We share data only with service providers who help us run our business (hosting,
              email, analytics and payment processing), and only to the extent needed. They are
              bound by confidentiality obligations. We may disclose information where the law
              requires it.
            </p>

            <h2>5. Retention</h2>
            <p>
              We keep enquiry data for up to 24 months, applicant data for up to 12 months, and
              client project data for the duration of the engagement plus any period required by
              law or contract.
            </p>

            <h2>6. Security</h2>
            <p>
              Access is restricted on a need-to-know basis, transport is encrypted, and credentials
              are stored in managed secret stores. No system is perfect, but we treat client and
              user data as if it were our own.
            </p>

            <h2>7. Your rights</h2>
            <p>
              You can ask us to access, correct, export or delete your personal data, or object to
              a particular use. Write to {COMPANY.email} and we will respond within 30 days.
            </p>

            <h2>8. Cookies</h2>
            <p>
              We use essential cookies to keep the site working and minimal analytics to understand
              traffic. You can block cookies in your browser; the site will still function.
            </p>

            <h2>9. Changes</h2>
            <p>
              We will update this page when our practices change and revise the date above. Material
              changes will be announced on the website.
            </p>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
