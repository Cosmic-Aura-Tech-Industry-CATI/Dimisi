"use client";

import { useState, type FormEvent } from "react";
import { motion } from "motion/react";
import { PageHero } from "@/components/ui/PageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { FAQ } from "@/components/ui/FAQ";
import { ArrowRight, Check, Loader2, Mail, MapPin, Phone } from "lucide-react";

const inputClass = "w-full rounded-xl border border-foreground/10 bg-foreground/[0.02] px-4 py-3 text-sm text-foreground placeholder:text-foreground/30 outline-none transition-colors focus:border-foreground/30";

const inquiryTypes = ["Hire Us", "Product Inquiry", "Partnership", "Technical Support", "General Inquiry"];

const faqs = [
  { question: "How quickly will you respond?", answer: "We typically reply within one business day." },
  { question: "Do you sign NDAs?", answer: "Yes — we're happy to sign an NDA before discussing sensitive details." },
  { question: "Can we schedule a call instead?", answer: "Absolutely. Mention it in your message and we'll send scheduling options." },
];

const contactInfo = [
  { icon: Mail, label: "Email", value: "hello@dimisi.tech" },
  { icon: Phone, label: "Phone", value: "+1 (555) 010-2026" },
  { icon: MapPin, label: "Location", value: "Remote-first · Worldwide" },
];

export default function ContactPageClient() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status !== "idle") return;
    setStatus("sending");
    window.setTimeout(() => setStatus("sent"), 1200);
  }

  return (
    <>
      <PageHero label="Contact" title="Let's Build Something Meaningful Together." subtitle="Tell us about your project, product idea, or support needs — we'd love to hear from you." />

      <section className="bg-[#050505] px-4 py-24 md:px-8">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 lg:grid-cols-[1.4fr_1fr]">
          <Reveal>
            <div className="rounded-3xl border border-foreground/10 p-6 md:p-8">
              {status === "sent" ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <motion.span initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 300, damping: 18 }} className="grid h-14 w-14 place-items-center rounded-full border border-foreground/20 bg-foreground/[0.04]">
                    <Check className="h-7 w-7 text-foreground" />
                  </motion.span>
                  <h3 className="mt-4 text-xl font-light text-foreground">Message sent</h3>
                  <p className="mt-2 max-w-sm text-sm text-foreground/50">Thanks for reaching out. Our team will get back to you within one business day.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div><label className="mb-2 block text-xs uppercase tracking-wider text-foreground/40">Name</label><input required suppressHydrationWarning className={inputClass} placeholder="Your name" /></div>
                    <div><label className="mb-2 block text-xs uppercase tracking-wider text-foreground/40">Email</label><input required type="email" suppressHydrationWarning className={inputClass} placeholder="you@company.com" /></div>
                    <div><label className="mb-2 block text-xs uppercase tracking-wider text-foreground/40">Company</label><input suppressHydrationWarning className={inputClass} placeholder="Company name" /></div>
                    <div><label className="mb-2 block text-xs uppercase tracking-wider text-foreground/40">Phone</label><input suppressHydrationWarning className={inputClass} placeholder="+1 (555) 000-0000" /></div>
                  </div>
                  <div><label className="mb-2 block text-xs uppercase tracking-wider text-foreground/40">Inquiry Type</label><select required suppressHydrationWarning defaultValue="" className={`${inputClass} appearance-none`}><option value="" disabled className="bg-[#050505]">Select an option</option>{inquiryTypes.map((t) => (<option key={t} value={t} className="bg-[#050505]">{t}</option>))}</select></div>
                  <div><label className="mb-2 block text-xs uppercase tracking-wider text-foreground/40">Project Details</label><input suppressHydrationWarning className={inputClass} placeholder="Budget, timeline, scope…" /></div>
                  <div><label className="mb-2 block text-xs uppercase tracking-wider text-foreground/40">Message</label><textarea required suppressHydrationWarning rows={5} className={`${inputClass} resize-none`} placeholder="Tell us more about what you're building…" /></div>
                  <motion.button type="submit" suppressHydrationWarning disabled={status === "sending"} whileHover={status === "sending" ? undefined : { scale: 1.02 }} whileTap={status === "sending" ? undefined : { scale: 0.98 }} className="group inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-foreground/90 disabled:opacity-70">
                    {status === "sending" ? (<>Sending<Loader2 className="h-4 w-4 animate-spin" /></>) : (<>Send Message<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></>)}
                  </motion.button>
                </form>
              )}
            </div>
          </Reveal>
          <div className="flex flex-col gap-5">
            {contactInfo.map((info, i) => (
              <Reveal key={info.label} delay={i * 0.08}>
                <div className="flex items-start gap-4 rounded-2xl border border-foreground/10 p-6 transition-all duration-300 hover:border-foreground/30 hover:bg-foreground/[0.02]">
                  <info.icon className="mt-0.5 h-5 w-5 text-foreground/60" />
                  <div><p className="text-xs uppercase tracking-wider text-foreground/40">{info.label}</p><p className="mt-1 text-sm text-foreground">{info.value}</p></div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#050505] px-4 py-24 md:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeading align="center" label="FAQ" title="Questions, Answered" className="mb-14" />
          <FAQ items={faqs} />
        </div>
      </section>
    </>
  );
}
