import type { Metadata } from "next";
import ContactPageClient from "./ContactPageClient";

export const metadata: Metadata = {
  title: "Contact — Dimisi Technologies",
  description: "Get in touch with Dimisi Technologies. Start a project, request a consultation, or reach support.",
  openGraph: { title: "Contact — Dimisi Technologies", description: "Let's build something meaningful together. Contact Dimisi Technologies." },
};

export default function ContactPage() {
  return <ContactPageClient />;
}
