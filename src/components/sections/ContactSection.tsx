// ContactSection.tsx — Homepage section featuring a heading at the top,
// a unified project-inquiry form (with contact details built in) on the
// left below it, and a premium ambient signal-network animation on the
// right — no card/border around the animation itself.
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

import {
  ParallaxSection,
  PrimaryButton,
} from "./section-kit";

import { Toaster } from "@/components/ui/sonner";

const CONTACT_DETAILS = [
  { icon: Mail, value: "dimisitechnologiespvtltd@gmail.com" },
  { icon: Phone, value: "+91 85450 99251" },
  { icon: MapPin, value: "Kanpur, Uttar Pradesh, India" },
];

const MESSAGE_MAX_LENGTH = 500;

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  message: string;
  agree: boolean;
}

type ContactFormField = keyof ContactFormData;

type ContactFormErrors = Partial<Record<ContactFormField, string>>;

const initialFormData: ContactFormData = {
  name: "",
  email: "",
  phone: "",
  message: "",
  agree: false,
};

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

  if (!values.agree) {
    errors.agree = "Please confirm before submitting.";
  }

  return errors;
}

// Highlight-only variant — moving glare + hover glow, no tilt or scale.
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

// Plain <style> tag (not styled-jsx) so this animation runs regardless of
// your compiler setup. Render once, not per-panel.
//
// Note: the traveling signal dots use CSS offset-path/offset-distance
// (supported in all evergreen browsers, incl. Safari 16+). Where unsupported
// the dots simply stay put — the nodes and lines still animate normally.
function ContactSignalStyles() {
  return (
    <style>{`
      .cs2-hub-glow {
        animation: cs2-hub-breathe 4.5s ease-in-out infinite;
        transform-box: fill-box;
        transform-origin: center;
      }
      @keyframes cs2-hub-breathe {
        0%, 100% { opacity: 0.15; transform: scale(1); }
        50% { opacity: 0.4; transform: scale(1.15); }
      }
      .cs2-hub-node {
        animation: cs2-hub-pulse 4.5s ease-in-out infinite;
        transform-box: fill-box;
        transform-origin: center;
      }
      @keyframes cs2-hub-pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.18); }
      }
      .cs2-node {
        animation: cs2-node-float 5s ease-in-out infinite;
        transform-box: fill-box;
        transform-origin: center;
      }
      @keyframes cs2-node-float {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-6px); }
      }
      .cs2-edge {
        animation: cs2-edge-fade 4s ease-in-out infinite;
      }
      @keyframes cs2-edge-fade {
        0%, 100% { opacity: 0.1; }
        50% { opacity: 0.28; }
      }
      .cs2-signal {
        offset-rotate: 0deg;
        animation-name: cs2-signal-move;
        animation-timing-function: ease-in-out;
        animation-iteration-count: infinite;
      }
      @keyframes cs2-signal-move {
        0% { offset-distance: 0%; opacity: 0; }
        10% { opacity: 1; }
        90% { offset-distance: 100%; opacity: 1; }
        100% { offset-distance: 100%; opacity: 0; }
      }
      .cs2-ambient-glow {
        animation: cs2-ambient-breathe 6s ease-in-out infinite;
      }
      @keyframes cs2-ambient-breathe {
        0%, 100% { opacity: 0.35; }
        50% { opacity: 0.6; }
      }

      @media (prefers-reduced-motion: reduce) {
        .cs2-hub-glow, .cs2-hub-node, .cs2-node, .cs2-edge, .cs2-signal, .cs2-ambient-glow {
          animation: none !important;
        }
      }
    `}</style>
  );
}

// Completely content-free, borderless — a slow, monochrome "signal network"
// converging on a central hub, with faint pulses traveling the connections.
// Meant to sit directly on the section background, not inside a card.
function ContactSignalPanel() {
  const hub = { x: 200, y: 230 };
  const nodes = [
    { x: 60, y: 90 },
    { x: 180, y: 55 },
    { x: 320, y: 105 },
    { x: 340, y: 265 },
    { x: 230, y: 385 },
    { x: 90, y: 345 },
    { x: 40, y: 205 },
  ];
  const outerEdges: [number, number][] = [
    [0, 1],
    [3, 4],
    [5, 6],
  ];
  const signalEdges = [
    { d: `M${hub.x} ${hub.y} L${nodes[0].x} ${nodes[0].y}`, duration: 4.5, delay: 0 },
    { d: `M${hub.x} ${hub.y} L${nodes[3].x} ${nodes[3].y}`, duration: 5.2, delay: 1.4 },
    { d: `M${hub.x} ${hub.y} L${nodes[5].x} ${nodes[5].y}`, duration: 3.8, delay: 2.6 },
  ];

  return (
    <svg viewBox="0 0 400 460" preserveAspectRatio="xMidYMid slice" className="h-full w-full text-foreground">
      <circle cx={hub.x} cy={hub.y} r="60" fill="currentColor" className="text-primary cs2-hub-glow" />

      <g className="text-foreground">
        {nodes.map((n, i) => (
          <line
            key={`spoke-${i}`}
            x1={hub.x}
            y1={hub.y}
            x2={n.x}
            y2={n.y}
            stroke="currentColor"
            strokeWidth="1"
            className="cs2-edge"
            style={{ animationDelay: `${i * 0.3}s` }}
          />
        ))}
        {outerEdges.map(([a, b], i) => (
          <line
            key={`outer-${i}`}
            x1={nodes[a].x}
            y1={nodes[a].y}
            x2={nodes[b].x}
            y2={nodes[b].y}
            stroke="currentColor"
            strokeWidth="1"
            className="cs2-edge"
            style={{ animationDelay: `${i * 0.5 + 1}s` }}
          />
        ))}
      </g>

      {signalEdges.map((edge, i) => (
        <circle
          key={`signal-${i}`}
          r="3"
          fill="currentColor"
          className="text-primary cs2-signal"
          style={{
            offsetPath: `path('${edge.d}')`,
            animationDuration: `${edge.duration}s`,
            animationDelay: `${edge.delay}s`,
          }}
        />
      ))}

      <circle cx={hub.x} cy={hub.y} r="6" fill="currentColor" className="text-primary cs2-hub-node" />
      <circle cx={hub.x} cy={hub.y} r="10" fill="none" stroke="currentColor" strokeOpacity="0.4" strokeWidth="1" />

      {nodes.map((n, i) => (
        <circle
          key={`node-${i}`}
          cx={n.x}
          cy={n.y}
          r="3.5"
          fill="currentColor"
          className="cs2-node"
          style={{ animationDelay: `${i * 0.4}s` }}
        />
      ))}
    </svg>
  );
}

export function ContactSection() {
  const [formData, setFormData] = useState<ContactFormData>(initialFormData);
  const [errors, setErrors] = useState<ContactFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFieldChange = (
    field: ContactFormField,
    value: string | boolean
  ) => {
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
          phone: formData.phone.trim(),
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

  const messageLength = formData.message.length;

  return (
    <ParallaxSection id="contact" className="py-14 md:py-20">
      {(style) => (
        <motion.div style={style} className="mx-auto max-w-7xl px-4 md:px-6">
          <ContactSignalStyles />

          {/* Heading — left aligned, full width layout */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.7 }}
            className="mb-12 max-w-2xl text-left md:mb-16"
          >
            <span className="text-base font-medium uppercase tracking-[0.3em] text-foreground/40 md:text-lg">
              Get in Touch
            </span>
            <h2
              style={{ fontFamily: '"Angsana New", "Angsana New Web", serif' }}
              className="mt-4 text-4xl font-light leading-[1.15] text-foreground md:text-6xl"
            >
              Let&apos;s Build Something
            </h2>
            <p className="mt-4 max-w-md text-base leading-relaxed text-foreground/50 md:text-lg">
              Tell us about your project and we&apos;ll get back within one business day.
            </p>
          </motion.div>

          {/* Below the heading: the form (with contact details) on the
              left, a premium ambient animation on the right. */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-stretch"
            style={{ perspective: 1000 }}
          >
            {/* Left: one unified form block, contact details included. */}
            <GlareOnlyCard className="relative overflow-hidden rounded-2xl border border-foreground/10 bg-foreground/[0.02] transition-colors duration-300 hover:border-foreground/40 hover:bg-foreground/[0.05] hover:shadow-[0_0_40px_-12px_rgba(255,255,255,0.25)]">
              <form onSubmit={handleSubmit} className="relative flex flex-col gap-5 p-8" noValidate>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="contact-name" className="text-xs uppercase tracking-widest text-foreground/40">
                    Full Name
                  </label>
                  <div className="flex items-center gap-3 rounded-lg border border-foreground/10 bg-transparent px-4 py-3 focus-within:border-foreground/40">
                    <User className="h-4 w-4 shrink-0 text-foreground/40" />
                    <input
                      id="contact-name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      aria-invalid={Boolean(errors.name)}
                      aria-describedby={errors.name ? "contact-name-error" : undefined}
                      value={formData.name}
                      onChange={(event) => handleFieldChange("name", event.target.value)}
                      placeholder="Enter your full name..."
                      className="w-full bg-transparent text-sm text-foreground placeholder:text-foreground/40 focus:outline-none"
                    />
                  </div>
                  {errors.name ? (
                    <p id="contact-name-error" className="text-xs text-red-500">
                      {errors.name}
                    </p>
                  ) : null}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="contact-email" className="text-xs uppercase tracking-widest text-foreground/40">
                    Email Address
                  </label>
                  <div className="flex items-center gap-3 rounded-lg border border-foreground/10 bg-transparent px-4 py-3 focus-within:border-foreground/40">
                    <Mail className="h-4 w-4 shrink-0 text-foreground/40" />
                    <input
                      id="contact-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      aria-invalid={Boolean(errors.email)}
                      aria-describedby={errors.email ? "contact-email-error" : undefined}
                      value={formData.email}
                      onChange={(event) => handleFieldChange("email", event.target.value)}
                      placeholder="Enter your email address..."
                      className="w-full bg-transparent text-sm text-foreground placeholder:text-foreground/40 focus:outline-none"
                    />
                  </div>
                  {errors.email ? (
                    <p id="contact-email-error" className="text-xs text-red-500">
                      {errors.email}
                    </p>
                  ) : null}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="contact-phone" className="text-xs uppercase tracking-widest text-foreground/40">
                    Phone Number <span className="normal-case text-foreground/30">(optional)</span>
                  </label>
                  <div className="flex items-center gap-3 rounded-lg border border-foreground/10 bg-transparent px-4 py-3 focus-within:border-foreground/40">
                    <Phone className="h-4 w-4 shrink-0 text-foreground/40" />
                    <input
                      id="contact-phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      value={formData.phone}
                      onChange={(event) => handleFieldChange("phone", event.target.value)}
                      placeholder="Enter your phone number..."
                      className="w-full bg-transparent text-sm text-foreground placeholder:text-foreground/40 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="contact-message" className="text-xs uppercase tracking-widest text-foreground/40">
                    Message
                  </label>
                  <div className="rounded-lg border border-foreground/10 bg-transparent px-4 py-3 focus-within:border-foreground/40">
                    <textarea
                      id="contact-message"
                      name="message"
                      aria-invalid={Boolean(errors.message)}
                      aria-describedby={errors.message ? "contact-message-error" : undefined}
                      value={formData.message}
                      onChange={(event) =>
                        handleFieldChange(
                          "message",
                          event.target.value.slice(0, MESSAGE_MAX_LENGTH)
                        )
                      }
                      maxLength={MESSAGE_MAX_LENGTH}
                      rows={4}
                      placeholder="Tell us about your project..."
                      className="w-full resize-none bg-transparent text-sm text-foreground placeholder:text-foreground/40 focus:outline-none"
                    />
                    <div className="mt-1 text-right text-xs text-foreground/30">
                      {messageLength}/{MESSAGE_MAX_LENGTH}
                    </div>
                  </div>
                  {errors.message ? (
                    <p id="contact-message-error" className="text-xs text-red-500">
                      {errors.message}
                    </p>
                  ) : null}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="flex items-start gap-3 text-sm text-foreground/60">
                    <input
                      type="checkbox"
                      checked={formData.agree}
                      onChange={(event) => handleFieldChange("agree", event.target.checked)}
                      aria-invalid={Boolean(errors.agree)}
                      aria-describedby={errors.agree ? "contact-agree-error" : undefined}
                      className="mt-0.5 h-4 w-4 shrink-0 rounded border-foreground/20 bg-transparent accent-primary"
                    />
                    <span>I agree to be contacted about my project inquiry.</span>
                  </label>
                  {errors.agree ? (
                    <p id="contact-agree-error" className="text-xs text-red-500">
                      {errors.agree}
                    </p>
                  ) : null}
                </div>

                <div className="mt-2">
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

                {/* Contact details, inside the same box as the form. */}
                <div className="mt-2 flex flex-col gap-3 border-t border-foreground/10 pt-5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                  {CONTACT_DETAILS.map((d, i) => {
                    const Icon = d.icon;
                    return (
                      <div key={i} className="flex items-center gap-2.5 text-xs text-foreground/55 sm:text-sm">
                        <Icon className="h-3.5 w-3.5 shrink-0 text-foreground/40" />
                        <span>{d.value}</span>
                      </div>
                    );
                  })}
                </div>
              </form>
            </GlareOnlyCard>

            {/* Right: premium ambient animation, no card/border. */}
            <div className="relative flex min-h-[420px] items-center justify-center overflow-hidden lg:min-h-full">
              <div
                aria-hidden
                className="cs2-ambient-glow pointer-events-none absolute inset-0 opacity-40"
                style={{
                  background:
                    "radial-gradient(circle at 50% 50%, hsl(var(--primary) / 0.16), transparent 65%)",
                }}
              />
              <div className="relative h-full w-full max-w-md">
                <ContactSignalPanel />
              </div>
            </div>
          </motion.div>

          <Toaster />
        </motion.div>
      )}
    </ParallaxSection>
  );
}