import type { Metadata } from "next";
import OurTeamPageClient from "./OurTeamPageClient";

export const metadata: Metadata = {
  title: "Our Team — Dimisi Technologies",
  description: "Meet the founders, core team, and interns behind Dimisi Technologies.",
  openGraph: { title: "Our Team — Dimisi Technologies" },
};

export default function OurTeamPage() {
  return <OurTeamPageClient />;
}
