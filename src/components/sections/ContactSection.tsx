// ContactSection.tsx — Homepage section featuring contact details cards alongside an interactive project inquiry contact form.
import { useState } from "react";
import { motion } from "motion/react";
import { Mail, MapPin, Phone } from "lucide-react";

import {
  ParallaxSection,
  PrimaryButton,
  SectionHeading,
  TiltCard,
} from "./section-kit";

const DETAILS = [
  { icon: Mail, label: "Email", value: "hello@dimisi.tech" },
  { icon: Phone, label: "Phone", value: "+1 (555) 012-3456" },
  { icon: MapPin, label: "Studio", value: "Remote-first, worldwide" },
];

export function ContactSection() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <ParallaxSection id="contact" className="py-14 md:py-20">
      {(style) => (
        <motion.div style={style} className="mx-auto max-w-7xl px-4 md:px-6">
          <SectionHeading
            label="Get in Touch"
            title="Let's Build Something"
            subtitle="Tell us about your project and we'll get back within one business day."
          />

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
            className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-2"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-1">
              {DETAILS.map((d) => {
                const Icon = d.icon;
                return (
                  <TiltCard
                    key={d.label}
                    className="flex items-center gap-4 rounded-2xl border border-foreground/10 bg-foreground/[0.02] p-6 transition-colors hover:border-foreground/30"
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
                  </TiltCard>
                );
              })}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSubmitted(true);
              }}
              className="rounded-2xl border border-foreground/10 bg-foreground/[0.02] p-8"
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <input
                  required
                  suppressHydrationWarning
                  placeholder="Name"
                  className="rounded-lg border border-foreground/10 bg-transparent px-4 py-3 text-sm text-foreground placeholder:text-foreground/40 focus:border-foreground/40 focus:outline-none"
                />
                <input
                  required
                  suppressHydrationWarning
                  type="email"
                  placeholder="Email"
                  className="rounded-lg border border-foreground/10 bg-transparent px-4 py-3 text-sm text-foreground placeholder:text-foreground/40 focus:border-foreground/40 focus:outline-none"
                />
              </div>
              <textarea
                required
                suppressHydrationWarning
                rows={4}
                placeholder="Tell us about your project"
                className="mt-4 w-full rounded-lg border border-foreground/10 bg-transparent px-4 py-3 text-sm text-foreground placeholder:text-foreground/40 focus:border-foreground/40 focus:outline-none"
              />
              <div className="mt-6">
                <PrimaryButton type="submit">
                  {submitted ? "Message Sent" : "Send Message"}
                </PrimaryButton>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </ParallaxSection>
  );
}
