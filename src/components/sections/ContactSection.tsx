// ContactSection.tsx — Homepage section featuring contact details cards alongside an interactive project inquiry contact form.
import Image from "next/image";
import { useRef, useState, type FormEvent } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";
import { Mail, MapPin, Phone, User } from "lucide-react";
import emailjs from "@emailjs/browser";
import { toast } from "sonner";

import { ParallaxSection, PrimaryButton } from "./section-kit";
import { Toaster } from "@/components/ui/sonner";

const DETAILS = [
  { icon: Mail, label: "Email", value: "dimisitechnologiespvtltd@gmail.com" },
  { icon: Phone, label: "Phone", value: "+91 85450 99251" },
  { icon: User, label: "Contact", value: "Bhoot Dev" },
  { icon: MapPin, label: "Location", value: "Kanpur, Uttar Pradesh, India" },
];

interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

type ContactFormField = keyof ContactFormData;

type ContactFormErrors = Partial<Record<ContactFormField, string>>;

const initialFormData: ContactFormData = { name: "", email: "", message: "" };

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateContactForm(values: ContactFormData): ContactFormErrors {
  const errors: ContactFormErrors = {};
  const name = values.name.trim();
  const email = values.email.trim();
  const message = values.message.trim();

  if (!name) {
    errors.name = "Name is required.";
  } else if (name.length < 2) {
    errors.name = "Name must be at least 2 characters.";
  }

  if (!email) {
    errors.email = "Email is required.";
  } else if (!emailRegex.test(email)) {
    errors.email = "Please enter a valid email address.";
  }

  if (!message) {
    errors.message = "Project description is required.";
  } else if (message.length < 15) {
    errors.message = "Project description must be at least 15 characters.";
  }

  return errors;
}

// Same mouse-tracking tilt + glare interaction used by ServiceCard in ServicesSection.
function TiltGlareCard({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(
    useTransform(mouseY, [-0.5, 0.5], [10, -10]),
    { stiffness: 200, damping: 20, mass: 0.5 }
  );
  const rotateY = useSpring(
    useTransform(mouseX, [-0.5, 0.5], [-10, 10]),
    { stiffness: 200, damping: 20, mass: 0.5 }
  );

  const glareX = useTransform(mouseX, [-0.5, 0.5], [0, 100]);
  const glareY = useTransform(mouseY, [-0.5, 0.5], [0, 100]);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  }

  function handleMouseLeave() {
    mouseX.set(0);
    mouseY.set(0);
  }

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
        transformPerspective: 800,
      }}
      whileHover={{ scale: 1.03 }}
      transition={{ scale: { duration: 0.3 } }}
      className={`group relative overflow-hidden ${className}`}
    >
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: useTransform(
            [glareX, glareY],
            ([x, y]) =>
              `radial-gradient(circle at ${x}% ${y}%, rgba(255,255,255,0.12), transparent 60%)`
          ),
        }}
      />

      <div
        style={{ transform: "translateZ(30px)", transformStyle: "preserve-3d" }}
        className="relative"
      >
        {children}
      </div>
    </motion.div>
  );
}

// Highlight-only variant of TiltGlareCard — same moving glare + hover glow,
// but no rotateX/rotateY tilt or scale movement.
function GlareOnlyCard({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const glareX = useTransform(mouseX, [-0.5, 0.5], [0, 100]);
  const glareY = useTransform(mouseY, [-0.5, 0.5], [0, 100]);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  }

  function handleMouseLeave() {
    mouseX.set(0);
    mouseY.set(0);
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`group relative overflow-hidden ${className}`}
    >
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: useTransform(
            [glareX, glareY],
            ([x, y]) =>
              `radial-gradient(circle at ${x}% ${y}%, rgba(255,255,255,0.12), transparent 60%)`
          ),
        }}
      />
      {children}
    </div>
  );
}

export function ContactSection() {
  const [formData, setFormData] = useState<ContactFormData>(initialFormData);
  const [errors, setErrors] = useState<ContactFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFieldChange = (field: ContactFormField, value: string) => {
    setFormData((current) => ({ ...current, [field]: value }));
    if (errors[field]) {
      setErrors((current) => {
        const next = { ...current };
        delete next[field];
        return next;
      });
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    const validationErrors = validateContactForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
      const templateId = process.env.NEXT_PUBLIC_CONTACT_TEMPLATE_ID;
      const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

      if (!serviceId || !templateId || !publicKey) {
        toast.error("Email service is not configured.", {
          description: "Please set NEXT_PUBLIC_EMAILJS_SERVICE_ID, NEXT_PUBLIC_CONTACT_TEMPLATE_ID, and NEXT_PUBLIC_EMAILJS_PUBLIC_KEY.",
        });
        setIsSubmitting(false);
        return;
      }

      await emailjs.send(
        serviceId,
        templateId,
        {
          name: formData.name.trim(),
          email: formData.email.trim(),
          message: formData.message.trim(),
          time: new Date().toLocaleString(),
        },
        publicKey
      );

      setFormData(initialFormData);
      toast.success("Message Sent Successfully 🚀", {
        description: "We'll contact you within one business day.",
      });
    } catch (error) {
      console.error("EmailJS send failed", error);
      toast.error("Something went wrong.", {
        description: "Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ParallaxSection id="contact" className="py-14 md:py-20">
      {(style) => (
        <motion.div style={style} className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="max-w-2xl text-left">
            <span className="text-base font-medium uppercase tracking-[0.3em] text-foreground/40 md:text-lg">
              Get in Touch
            </span>
            <h2
              style={{ fontFamily: '"Angsana New", "Angsana New Web", serif' }}
              className="mt-4 text-4xl font-light leading-[1.15] text-foreground md:text-6xl"
            >
              Let&apos;s Build Something
            </h2>
            <p className="mt-4 text-base leading-relaxed text-foreground/50 md:text-lg">
              Tell us about your project and we&apos;ll get back within one business day.
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
            className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-2"
            style={{ perspective: 1000 }}
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-1">
              {DETAILS.map((d) => {
                const Icon = d.icon;
                return (
                  <TiltGlareCard
                    key={d.label}
                    className="flex items-center gap-4 rounded-2xl border border-foreground/10 bg-foreground/[0.02] p-6 transition-colors duration-300 hover:border-foreground/40 hover:bg-foreground/[0.05] hover:shadow-[0_0_40px_-12px_rgba(255,255,255,0.25)]"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-foreground/10 bg-foreground/[0.03]">
                      <Icon className="h-5 w-5 text-foreground" />
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-widest text-foreground/40">
                        {d.label}
                      </div>
                      <div className="mt-1 text-sm text-foreground/70">{d.value}</div>
                    </div>
                  </TiltGlareCard>
                );
              })}
            </div>

            <GlareOnlyCard className="rounded-2xl border border-foreground/10 bg-foreground/[0.02] transition-colors duration-300 hover:border-foreground/40 hover:bg-foreground/[0.05] hover:shadow-[0_0_40px_-12px_rgba(255,255,255,0.25)]">
              <div className="pointer-events-none absolute inset-0 opacity-20">
                <Image
                  src="/Bhootdev get in touch.svg"
                  alt="Bhoot Dev contact art"
                  fill
                  sizes="(max-width: 1024px) 100vw, 420px"
                  className="object-cover object-center"
                />
              </div>

              <form onSubmit={handleSubmit} className="relative p-8" noValidate>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <input
                      name="name"
                      type="text"
                      autoComplete="name"
                      aria-label="Name"
                      aria-invalid={Boolean(errors.name)}
                      aria-describedby={errors.name ? "contact-name-error" : undefined}
                      value={formData.name}
                      onChange={(event) => handleFieldChange("name", event.target.value)}
                      placeholder="Name"
                      className="rounded-lg border border-foreground/10 bg-transparent px-4 py-3 text-sm text-foreground placeholder:text-foreground/40 focus:border-foreground/40 focus:outline-none"
                    />
                    {errors.name ? (
                      <p id="contact-name-error" className="mt-2 text-xs text-red-500">
                        {errors.name}
                      </p>
                    ) : null}
                  </div>

                  <div>
                    <input
                      name="email"
                      type="email"
                      autoComplete="email"
                      aria-label="Email"
                      aria-invalid={Boolean(errors.email)}
                      aria-describedby={errors.email ? "contact-email-error" : undefined}
                      value={formData.email}
                      onChange={(event) => handleFieldChange("email", event.target.value)}
                      placeholder="Email"
                      className="rounded-lg border border-foreground/10 bg-transparent px-4 py-3 text-sm text-foreground placeholder:text-foreground/40 focus:border-foreground/40 focus:outline-none"
                    />
                    {errors.email ? (
                      <p id="contact-email-error" className="mt-2 text-xs text-red-500">
                        {errors.email}
                      </p>
                    ) : null}
                  </div>
                </div>
                <div>
                  <textarea
                    name="message"
                    aria-label="Project Description"
                    aria-invalid={Boolean(errors.message)}
                    aria-describedby={errors.message ? "contact-message-error" : undefined}
                    value={formData.message}
                    onChange={(event) => handleFieldChange("message", event.target.value)}
                    rows={4}
                    placeholder="Tell us about your project"
                    className="mt-4 w-full rounded-lg border border-foreground/10 bg-transparent px-4 py-3 text-sm text-foreground placeholder:text-foreground/40 focus:border-foreground/40 focus:outline-none"
                  />
                  {errors.message ? (
                    <p id="contact-message-error" className="mt-2 text-xs text-red-500">
                      {errors.message}
                    </p>
                  ) : null}
                </div>
                <div className="mt-6">
                  <PrimaryButton type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Sending...
                      </span>
                    ) : (
                      "Send Message"
                    )}
                  </PrimaryButton>
                </div>
              </form>
              <Toaster />
            </GlareOnlyCard>
          </motion.div>
        </motion.div>
      )}
    </ParallaxSection>
  );
}