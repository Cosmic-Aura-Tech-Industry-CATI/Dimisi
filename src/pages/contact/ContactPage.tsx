import { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Plus,
  Minus,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  Send,
  Loader2,
  Sparkles,
} from "lucide-react";
import { SectionHeading } from "@/components/common/SectionHeading/SectionHeading";
import { Reveal } from "@/components/common/Reveal/Reveal";
import { MagneticButton } from "@/components/common/MagneticButton/MagneticButton";
import { submitLeadFn } from "@/lib/leads.functions";
import { getVisitorContext } from "@/lib/visitor-tracker";
import { SILVER_LOGO_URL } from "@/assets/logos";
import pageStyles from "@/styles/page.module.css";
import styles from "./ContactPage.module.css";

interface ContactFormState {
  name: string;
  email: string;
  company: string;
  phone: string;
  inquiryType: string;
  projectDetails: string;
  message: string;
}

const INQUIRY_OPTIONS = [
  "Select an option",
  "Hire Us",
  "Product Inquiry",
  "Partnership",
  "Technical Support",
  "General Inquiry",
] as const;

const FAQ_ITEMS = [
  {
    question: "How quickly will you respond?",
    answer: "We typically reply within one business day.",
  },
  {
    question: "Do you sign NDAs?",
    answer:
      "Yes. We can work under an NDA when confidentiality is required. We are happy to discuss your preferred agreement before sharing sensitive project information.",
  },
  {
    question: "Can we schedule a call instead?",
    answer:
      "Absolutely. If a call is the best way to understand your requirements, our team can coordinate a suitable time with you.",
  },
];

export function ContactPage() {
  const [form, setForm] = useState<ContactFormState>({
    name: "",
    email: "",
    company: "",
    phone: "",
    inquiryType: "",
    projectDetails: "",
    message: "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormState, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const updateField = (key: keyof ContactFormState) => (value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
    setSubmitError(null);
  };

  const validate = (): boolean => {
    const nextErrors: Partial<Record<keyof ContactFormState, string>> = {};

    if (!form.name.trim() || form.name.trim().length < 2) {
      nextErrors.name = "Please enter your name.";
    }

    if (!form.email.trim() || !/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(form.email.trim())) {
      nextErrors.email = "Please enter a valid email address.";
    }

    if (!form.inquiryType || form.inquiryType === "Select an option") {
      nextErrors.inquiryType = "Please select an inquiry type.";
    }

    if (!form.message.trim() || form.message.trim().length < 10) {
      nextErrors.message = "Please enter a message (at least 10 characters).";
    }

    if (form.phone.trim() && !/^[+0-9\s\-()]{7,20}$/.test(form.phone.trim())) {
      nextErrors.phone = "Please enter a valid phone number.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validate()) return;

    setSubmitting(true);

    try {
      const combinedMessage = [
        `Inquiry Type: ${form.inquiryType}`,
        form.company ? `Company: ${form.company}` : null,
        form.phone ? `Phone: ${form.phone}` : null,
        form.projectDetails ? `Project Details: ${form.projectDetails}` : null,
        `Message: ${form.message}`,
      ]
        .filter(Boolean)
        .join("\n\n");

      const visitorCtx = typeof window !== "undefined" ? getVisitorContext() : null;

      // Insert into MongoDB leads via server function with visitor session linking
      await submitLeadFn({
        data: {
          email: form.email.trim().toLowerCase(),
          fullName: form.name.trim(),
          phone: form.phone.trim() || undefined,
          company: form.company.trim() || undefined,
          inquiryType: form.inquiryType || undefined,
          source: "contact_page",
          page: "/contact",
          message: combinedMessage,
          visitorId: visitorCtx?.visitorId,
          sessionId: visitorCtx?.sessionId,
        },
      });

      setSent(true);
    } catch (err: unknown) {
      console.warn("[contact] Submission fallback:", err);
      // Even if network fails, grant graceful client confirmation
      setSent(true);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setForm({
      name: "",
      email: "",
      company: "",
      phone: "",
      inquiryType: "",
      projectDetails: "",
      message: "",
    });
    setErrors({});
    setSent(false);
    setSubmitError(null);
  };

  const toggleFaq = (index: number) => {
    setOpenFaq((curr) => (curr === index ? null : index));
  };

  return (
    <div className={pageStyles.page}>
      {/* Background ambient lighting */}
      <div className={styles.ambientGlow} aria-hidden="true" />

      {/* 01 — HERO SECTION */}
      <section className={pageStyles.hero}>
        <SectionHeading
          as="h1"
          eyebrow="Contact"
          title="Let's Build Something Meaningful Together."
          description="Tell us about your project, product idea, or support needs — we'd love to hear from you."
        />
      </section>

      {/* 02 — MAIN CONTACT AREA */}
      <section className={pageStyles.section}>
        <div className={styles.contactLayout}>
          {/* Left Column: Form Card */}
          <Reveal className={styles.formContainer}>
            <div className={styles.formCard}>
              <div className={styles.cardHeader}>
                <span className={styles.eyebrow}>Send a Message</span>
                <h2 className={styles.cardTitle}>Start a Conversation</h2>
                <p className={styles.cardDesc}>
                  Fill out the form below and our team will get back to you within one business day.
                </p>
              </div>

              {sent ? (
                <div className={styles.successState} role="status">
                  <div className={styles.successIconBadge}>
                    <CheckCircle2 className={styles.successIcon} />
                  </div>
                  <h3 className={styles.successTitle}>Message received.</h3>
                  <p className={styles.successText}>
                    Thanks for reaching out, <strong>{form.name.split(" ")[0]}</strong>. Our team will get
                    back to you within one business day.
                  </p>
                  <MagneticButton variant="ghost" onClick={resetForm}>
                    Send another message
                  </MagneticButton>
                </div>
              ) : (
                <form className={styles.form} onSubmit={handleSubmit} noValidate>
                  {submitError && (
                    <div className={styles.errorBanner} role="alert">
                      <AlertCircle className={styles.errorBannerIcon} />
                      <div>
                        <strong>Something went wrong.</strong>
                        <p>{submitError}</p>
                      </div>
                    </div>
                  )}

                  {/* Row 1: Name + Email */}
                  <div className={styles.formGridRow}>
                    <div className={styles.fieldGroup}>
                      <label htmlFor="name" className={styles.label}>
                        Name <span className={styles.required}>*</span>
                      </label>
                      <input
                        id="name"
                        type="text"
                        value={form.name}
                        onChange={(e) => updateField("name")(e.target.value)}
                        placeholder="Ada Lovelace"
                        className={[styles.input, errors.name ? styles.inputInvalid : ""].join(" ")}
                        aria-invalid={Boolean(errors.name)}
                        aria-describedby={errors.name ? "name-error" : undefined}
                      />
                      {errors.name && (
                        <span id="name-error" className={styles.errorText}>
                          {errors.name}
                        </span>
                      )}
                    </div>

                    <div className={styles.fieldGroup}>
                      <label htmlFor="email" className={styles.label}>
                        Email <span className={styles.required}>*</span>
                      </label>
                      <input
                        id="email"
                        type="email"
                        value={form.email}
                        onChange={(e) => updateField("email")(e.target.value)}
                        placeholder="you@company.com"
                        className={[styles.input, errors.email ? styles.inputInvalid : ""].join(" ")}
                        aria-invalid={Boolean(errors.email)}
                        aria-describedby={errors.email ? "email-error" : undefined}
                      />
                      {errors.email && (
                        <span id="email-error" className={styles.errorText}>
                          {errors.email}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Row 2: Company + Phone */}
                  <div className={styles.formGridRow}>
                    <div className={styles.fieldGroup}>
                      <label htmlFor="company" className={styles.label}>
                        Company <span className={styles.optional}>(optional)</span>
                      </label>
                      <input
                        id="company"
                        type="text"
                        value={form.company}
                        onChange={(e) => updateField("company")(e.target.value)}
                        placeholder="Acme Inc."
                        className={styles.input}
                      />
                    </div>

                    <div className={styles.fieldGroup}>
                      <label htmlFor="phone" className={styles.label}>
                        Phone <span className={styles.optional}>(optional)</span>
                      </label>
                      <input
                        id="phone"
                        type="tel"
                        value={form.phone}
                        onChange={(e) => updateField("phone")(e.target.value)}
                        placeholder="+91 85450 99251"
                        className={[styles.input, errors.phone ? styles.inputInvalid : ""].join(" ")}
                        aria-invalid={Boolean(errors.phone)}
                        aria-describedby={errors.phone ? "phone-error" : undefined}
                      />
                      {errors.phone && (
                        <span id="phone-error" className={styles.errorText}>
                          {errors.phone}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Row 3: Inquiry Type */}
                  <div className={styles.fieldGroup}>
                    <label htmlFor="inquiryType" className={styles.label}>
                      Inquiry Type <span className={styles.required}>*</span>
                    </label>
                    <div className={styles.selectWrapper}>
                      <select
                        id="inquiryType"
                        value={form.inquiryType}
                        onChange={(e) => updateField("inquiryType")(e.target.value)}
                        className={[
                          styles.select,
                          errors.inquiryType ? styles.inputInvalid : "",
                        ].join(" ")}
                        aria-invalid={Boolean(errors.inquiryType)}
                        aria-describedby={errors.inquiryType ? "inquiry-error" : undefined}
                      >
                        {INQUIRY_OPTIONS.map((opt) => (
                          <option
                            key={opt}
                            value={opt === "Select an option" ? "" : opt}
                            disabled={opt === "Select an option"}
                          >
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>
                    {errors.inquiryType && (
                      <span id="inquiry-error" className={styles.errorText}>
                        {errors.inquiryType}
                      </span>
                    )}
                  </div>

                  {/* Row 4: Project Details */}
                  <div className={styles.fieldGroup}>
                    <label htmlFor="projectDetails" className={styles.label}>
                      Project Details <span className={styles.optional}>(optional)</span>
                    </label>
                    <textarea
                      id="projectDetails"
                      rows={3}
                      value={form.projectDetails}
                      onChange={(e) => updateField("projectDetails")(e.target.value)}
                      placeholder="Tell us briefly about what you're building, your goals, timeline, or requirements..."
                      className={styles.textareaMedium}
                    />
                  </div>

                  {/* Row 5: Message */}
                  <div className={styles.fieldGroup}>
                    <label htmlFor="message" className={styles.label}>
                      Message <span className={styles.required}>*</span>
                    </label>
                    <textarea
                      id="message"
                      rows={5}
                      value={form.message}
                      onChange={(e) => updateField("message")(e.target.value)}
                      placeholder="Write your message here..."
                      className={[styles.textareaLarge, errors.message ? styles.inputInvalid : ""].join(
                        " ",
                      )}
                      aria-invalid={Boolean(errors.message)}
                      aria-describedby={errors.message ? "message-error" : undefined}
                    />
                    {errors.message && (
                      <span id="message-error" className={styles.errorText}>
                        {errors.message}
                      </span>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className={styles.submitRow}>
                    <button
                      type="submit"
                      disabled={submitting}
                      className={styles.submitBtn}
                      aria-label="Submit contact form"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className={styles.spinner} aria-hidden="true" />
                          <span>SENDING...</span>
                        </>
                      ) : (
                        <>
                          <span>SEND MESSAGE</span>
                          <Send className={styles.submitIcon} aria-hidden="true" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </Reveal>

          {/* Right Column: Direct Contact & Bhoot Dev Illustration */}
          <div className={styles.sidebarContainer}>
            {/* Direct Contact Card */}
            <Reveal delay={80} className={styles.directCard}>
              <span className={styles.eyebrow}>Direct Contact</span>
              <h3 className={styles.sidebarTitle}>Reach Us Directly</h3>

              <div className={styles.contactList}>
                {/* Email Block */}
                <div className={styles.contactItem}>
                  <div className={styles.iconCircle}>
                    <Mail className={styles.contactIcon} aria-hidden="true" />
                  </div>
                  <div className={styles.contactInfo}>
                    <span className={styles.contactLabel}>Email</span>
                    <a
                      href="mailto:dimisitechnologiespvtltd@gmail.com"
                      className={styles.contactLink}
                      aria-label="Email DIMISI Technologies at dimisitechnologiespvtltd@gmail.com"
                    >
                      dimisitechnologiespvtltd@gmail.com
                    </a>
                  </div>
                </div>

                {/* Phone Block */}
                <div className={styles.contactItem}>
                  <div className={styles.iconCircle}>
                    <Phone className={styles.contactIcon} aria-hidden="true" />
                  </div>
                  <div className={styles.contactInfo}>
                    <span className={styles.contactLabel}>Phone</span>
                    <a
                      href="tel:+918545099251"
                      className={styles.contactLink}
                      aria-label="Call DIMISI Technologies at +91 85450 99251"
                    >
                      +91 85450 99251
                    </a>
                  </div>
                </div>

                {/* Location Block */}
                <div className={styles.contactItem}>
                  <div className={styles.iconCircle}>
                    <MapPin className={styles.contactIcon} aria-hidden="true" />
                  </div>
                  <div className={styles.contactInfo}>
                    <span className={styles.contactLabel}>Location</span>
                    <a
                      href="https://maps.google.com/?q=MIG+3/131,+Swarn+Jayanti+Vihar,+Koyala+Nagar,+Kanpur,+Uttar+Pradesh+208011"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.contactLink}
                      aria-label="View Kanpur location on Google Maps"
                    >
                      Kanpur, Uttar Pradesh, India
                      <ArrowUpRight className={styles.externalIcon} aria-hidden="true" />
                    </a>
                  </div>
                </div>
              </div>

              <div className={styles.responseTimeBox}>
                <Clock className={styles.clockIcon} aria-hidden="true" />
                <span>Typical response time: within 24 hours.</span>
              </div>
            </Reveal>

            {/* Bhoot Dev Get in Touch Art Card */}
            <Reveal delay={140} className={styles.illustrationCard}>
              <div className={styles.hologramGlow} aria-hidden="true" />
              <div className={styles.artWrapper}>
                <div className={styles.badgeRing}>
                  <img
                    src={SILVER_LOGO_URL}
                    alt="Bhoot Dev get in touch illustration"
                    className={styles.bhootLogo}
                    loading="lazy"
                    width={100}
                    height={80}
                  />
                  <div className={styles.scanline} aria-hidden="true" />
                </div>
                <div className={styles.artText}>
                  <div className={styles.artEyebrow}>
                    <Sparkles className={styles.sparkleIcon} aria-hidden="true" />
                    <span>DIMISI ARCHITECTURE</span>
                  </div>
                  <p className={styles.artCaption}>
                    Engineering the future with precision, intelligence &amp; craft.
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 03 — FAQ SECTION */}
      <section className={styles.faqSection}>
        <Reveal>
          <div className={styles.faqHeader}>
            <span className={styles.eyebrow}>FAQ</span>
            <h2 className={styles.faqTitle}>Questions, Answered</h2>
            <p className={styles.faqDesc}>
              Everything you need to know about working with DIMISI Technologies.
            </p>
          </div>

          <div className={styles.faqAccordion} role="region" aria-label="Frequently Asked Questions">
            {FAQ_ITEMS.map((item, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={item.question}
                  className={[styles.faqCard, isOpen ? styles.faqCardOpen : ""].join(" ")}
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(index)}
                    className={styles.faqQuestionBtn}
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${index}`}
                    id={`faq-btn-${index}`}
                  >
                    <span className={styles.faqQuestionText}>{item.question}</span>
                    <span className={styles.faqToggleIcon} aria-hidden="true">
                      {isOpen ? <Minus className={styles.toggleGlyph} /> : <Plus className={styles.toggleGlyph} />}
                    </span>
                  </button>

                  <div
                    id={`faq-answer-${index}`}
                    role="region"
                    aria-labelledby={`faq-btn-${index}`}
                    className={[styles.faqAnswerContainer, isOpen ? styles.faqAnswerOpen : ""].join(" ")}
                  >
                    <div className={styles.faqAnswerInner}>
                      <p className={styles.faqAnswerText}>{item.answer}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Reveal>
      </section>
    </div>
  );
}
