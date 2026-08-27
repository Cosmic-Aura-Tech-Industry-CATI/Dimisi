import { useState } from "react";
import { SectionHeading } from "@/components/common/SectionHeading/SectionHeading";
import { Reveal } from "@/components/common/Reveal/Reveal";
import { MagneticButton } from "@/components/common/MagneticButton/MagneticButton";
import { COMPANY, SOCIALS } from "@/constants/site";
import { SERVICES } from "@/data/services";
import pageStyles from "@/styles/page.module.css";
import styles from "./ContactPage.module.css";

interface FormState {
  name: string;
  email: string;
  service: string;
  budget: string;
  message: string;
}

const BUDGETS = ["< $10k", "$10k – $30k", "$30k – $80k", "$80k+"];

export function ContactPage() {
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    service: SERVICES[0]?.title ?? "",
    budget: BUDGETS[1] ?? "",
    message: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [sent, setSent] = useState(false);

  const set = (key: keyof FormState) => (value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Partial<Record<keyof FormState, string>> = {};
    if (form.name.trim().length < 2) next.name = "Tell me your name.";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(form.email)) next.email = "That email looks off.";
    if (form.message.trim().length < 20) next.message = "A little more detail helps — 20+ characters.";
    setErrors(next);
    if (Object.keys(next).length === 0) setSent(true);
  };

  return (
    <div className={pageStyles.page}>
      <section className={pageStyles.hero}>
        <SectionHeading
          as="h1"
          eyebrow="Contact"
          title="Tell us what you're building"
          description="One form, one human, one reply. No sales sequence, no drip campaign."
        />
      </section>

      <section className={pageStyles.section}>
        <div className={styles.layout}>
          <Reveal className={styles.formWrap}>
            {sent ? (
              <div className={styles.success} role="status">
                <span className={styles.tick} aria-hidden="true">
                  ✓
                </span>
                <h2 className={pageStyles.title}>Signal received, {form.name.split(" ")[0]}.</h2>
                <p className={pageStyles.text}>
                  DIMISI Technologies has logged your brief about <strong>{form.service}</strong>. A human
                  replies within forty-eight hours — usually much sooner.
                </p>
                <MagneticButton variant="ghost" onClick={() => setSent(false)}>
                  Send another
                </MagneticButton>
              </div>
            ) : (
              <form className={styles.form} onSubmit={submit} noValidate>
                <div className={styles.field}>
                  <label htmlFor="name">Your name</label>
                  <input
                    id="name"
                    value={form.name}
                    onChange={(e) => set("name")(e.target.value)}
                    placeholder="Ada Lovelace"
                    aria-invalid={Boolean(errors.name)}
                  />
                  {errors.name ? <span className={styles.error}>{errors.name}</span> : null}
                </div>

                <div className={styles.field}>
                  <label htmlFor="email">Work email</label>
                  <input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => set("email")(e.target.value)}
                    placeholder="you@company.com"
                    aria-invalid={Boolean(errors.email)}
                  />
                  {errors.email ? <span className={styles.error}>{errors.email}</span> : null}
                </div>

                <div className={styles.row2}>
                  <div className={styles.field}>
                    <label htmlFor="service">Service</label>
                    <select
                      id="service"
                      value={form.service}
                      onChange={(e) => set("service")(e.target.value)}
                    >
                      {SERVICES.map((s) => (
                        <option key={s.id} value={s.title}>
                          {s.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="budget">Budget</label>
                    <select
                      id="budget"
                      value={form.budget}
                      onChange={(e) => set("budget")(e.target.value)}
                    >
                      {BUDGETS.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className={styles.field}>
                  <label htmlFor="message">The problem</label>
                  <textarea
                    id="message"
                    rows={6}
                    value={form.message}
                    onChange={(e) => set("message")(e.target.value)}
                    placeholder="What are you trying to build, and what is in the way?"
                    aria-invalid={Boolean(errors.message)}
                  />
                  {errors.message ? <span className={styles.error}>{errors.message}</span> : null}
                </div>

                <MagneticButton type="submit">Send to DIMISI Technologies</MagneticButton>
              </form>
            )}
          </Reveal>

          <Reveal delay={120} className={styles.aside}>
            <div className={styles.card}>
              <p className={pageStyles.eyebrow}>Direct</p>
              <a className={styles.link} href={`mailto:${COMPANY.email}`}>
                {COMPANY.email}
              </a>
              <a className={styles.link} href={`tel:${COMPANY.phone.replace(/\s/g, "")}`}>
                {COMPANY.phone}
              </a>
              <p className={pageStyles.text}>{COMPANY.address}</p>
            </div>
            <div className={styles.card}>
              <p className={pageStyles.eyebrow}>Elsewhere</p>
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  className={styles.link}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  {s.label}
                </a>
              ))}
            </div>
            <div className={styles.card}>
              <p className={pageStyles.eyebrow}>Response time</p>
              <p className={pageStyles.text}>
                Median first reply: <strong>6 hours</strong>. Full scope proposal within five
                working days.
              </p>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
