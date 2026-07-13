"use client";

import Image from "next/image";
import emailjs from "@emailjs/browser";
import { useState, type FormEvent } from "react";
import { motion } from "motion/react";
import { PageHero } from "@/components/ui/PageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { FAQ } from "@/components/ui/FAQ";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { ArrowRight, Check, Loader2, Mail, MapPin, Phone } from "lucide-react";

const inputClass = "w-full rounded-xl border border-foreground/10 bg-foreground/[0.02] px-4 py-3 text-sm text-foreground placeholder:text-foreground/30 outline-none transition-colors focus:border-foreground/30";

const inquiryTypes = ["Hire Us", "Product Inquiry", "Partnership", "Technical Support", "General Inquiry"];

interface ProjectInquiryFormData {
  name: string;
  email: string;
  company: string;
  phone: string;
  inquiry_type: string;
  project_details: string;
  message: string;
}

const initialFormData: ProjectInquiryFormData = {
  name: "",
  email: "",
  company: "",
  phone: "",
  inquiry_type: "",
  project_details: "",
  message: "",
};

const faqs = [
  { question: "How quickly will you respond?", answer: "We typically reply within one business day." },
  { question: "Do you sign NDAs?", answer: "Yes — we're happy to sign an NDA before discussing sensitive details." },
  { question: "Can we schedule a call instead?", answer: "Absolutely. Mention it in your message and we'll send scheduling options." },
];

const contactInfo = [
  { icon: Mail, label: "Email", value: "dimisitechnologiespvtltd@gmail.com" },
  { icon: Phone, label: "Phone", value: "+91 85450 99251" },
  { icon: MapPin, label: "Location", value: "Kanpur, Uttar Pradesh, India" },
];

export default function ContactPageClient() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [formData, setFormData] = useState<ProjectInquiryFormData>(initialFormData);

  const handleFieldChange = (field: keyof ProjectInquiryFormData, value: string) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status !== "idle") return;
    setStatus("sending");

    const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
    const templateId = process.env.NEXT_PUBLIC_PROJECT_TEMPLATE_ID;
    const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

    if (!serviceId || !templateId || !publicKey) {
      toast.error("Email service is not configured.", {
        description: "Please add the EmailJS env vars to Netlify or your local .env.local.",
      });
      setStatus("idle");
      return;
    }

    try {
      await emailjs.send(serviceId, templateId, {
        name: formData.name.trim(),
        email: formData.email.trim(),
        company: formData.company.trim(),
        phone: formData.phone.trim(),
        inquiry_type: formData.inquiry_type,
        project_details: formData.project_details.trim(),
        message: formData.message.trim(),
        time: new Date().toLocaleString(),
      }, publicKey);

      setStatus("sent");
      setFormData(initialFormData);
      toast.success("Inquiry sent successfully.", {
        description: "Thanks! We'll respond within one business day.",
      });
    } catch (error) {
      console.error("EmailJS send failed", error);
      toast.error("Something went wrong.", {
        description: "Please try again later.",
      });
      setStatus("idle");
    }
  }

  return (
    <>
      <PageHero label="Contact" title="Let's Build Something Meaningful Together." subtitle="Tell us about your project, product idea, or support needs — we'd love to hear from you." />
      <Toaster />

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
                    <div>
                      <label className="mb-2 block text-xs uppercase tracking-wider text-foreground/40">Name</label>
                      <input
                        required
                        value={formData.name}
                        onChange={(event) => handleFieldChange("name", event.target.value)}
                        className={inputClass}
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-xs uppercase tracking-wider text-foreground/40">Email</label>
                      <input
                        required
                        type="email"
                        value={formData.email}
                        onChange={(event) => handleFieldChange("email", event.target.value)}
                        className={inputClass}
                        placeholder="you@company.com"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-xs uppercase tracking-wider text-foreground/40">Company</label>
                      <input
                        value={formData.company}
                        onChange={(event) => handleFieldChange("company", event.target.value)}
                        className={inputClass}
                        placeholder="Company name"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-xs uppercase tracking-wider text-foreground/40">Phone</label>
                      <input
                        value={formData.phone}
                        onChange={(event) => handleFieldChange("phone", event.target.value)}
                        className={inputClass}
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block text-xs uppercase tracking-wider text-foreground/40">Inquiry Type</label>
                    <select
                      required
                      value={formData.inquiry_type}
                      onChange={(event) => handleFieldChange("inquiry_type", event.target.value)}
                      className={`${inputClass} appearance-none`}
                    >
                      <option value="" disabled className="bg-[#050505]">Select an option</option>
                      {inquiryTypes.map((t) => (
                        <option key={t} value={t} className="bg-[#050505]">{t}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-xs uppercase tracking-wider text-foreground/40">Project Details</label>
                    <input
                      value={formData.project_details}
                      onChange={(event) => handleFieldChange("project_details", event.target.value)}
                      className={inputClass}
                      placeholder="Budget, timeline, scope…"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs uppercase tracking-wider text-foreground/40">Message</label>
                    <textarea
                      required
                      value={formData.message}
                      onChange={(event) => handleFieldChange("message", event.target.value)}
                      rows={5}
                      className={`${inputClass} resize-none`}
                      placeholder="Tell us more about what you're building…"
                    />
                  </div>
                  <motion.button
                    type="submit"
                    disabled={status === "sending"}
                    whileHover={status === "sending" ? undefined : { scale: 1.02 }}
                    whileTap={status === "sending" ? undefined : { scale: 0.98 }}
                    className="group inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-foreground/90 disabled:opacity-70"
                  >
                    {status === "sending" ? (
                      <>
                        Sending
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </>
                    ) : (
                      <>
                        Send Message
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </motion.button>
                </form>
              )}
            </div>
          </Reveal>
          <div className="relative flex min-h-[40rem] flex-col overflow-hidden rounded-3xl border border-foreground/10 bg-foreground/[0.02]">
            <div className="relative h-72">
              <Image
                src="/Bhootdev get in touch.svg"
                alt="Bhoot Dev get in touch art"
                fill
                sizes="(max-width: 1024px) 100vw, 420px"
                className="object-contain object-center opacity-50"
              />
            </div>

            <div className="mt-auto p-6 md:p-8">
              <div className="space-y-5">
                {contactInfo.map((info, i) => (
                  <Reveal key={info.label} delay={i * 0.08}>
                    <div className="flex items-start gap-4 rounded-2xl border border-foreground/10 bg-[#00000080] p-6 transition-all duration-300 hover:border-foreground/30 hover:bg-foreground/[0.08]">
                      <info.icon className="mt-0.5 h-5 w-5 text-foreground/60" />
                      <div>
                        <p className="text-xs uppercase tracking-wider text-foreground/40">{info.label}</p>
                        <p className="mt-1 text-sm text-foreground">{info.value}</p>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
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
