import { COMPANY } from "@/constants/site";
import { TEAM } from "@/data/team";
import { SERVICES } from "@/data/services";
import { PRODUCTS } from "@/data/products";
import { SERVICE_DETAILS } from "@/data/servicesPage";
import { PRODUCTS as _P } from "@/data/products";
import { BLOG_POSTS } from "@/data/blog";
import { JOBS } from "@/data/career";
import { GALLERY_ITEMS } from "@/data/gallery";
import { OFFICES } from "@/data/offices";
import { STATS, FEATURES, TECHNOLOGIES, FAQS } from "@/data/home";

void _P;

/** All public routes DIMISI can crawl for live page content. */
const ROUTES = [
  "/", "/services", "/products", "/team", "/blog", "/gallery", "/career",
  "/contact", "/about", "/privacy", "/terms",
  "/services/ai", "/services/web-development", "/services/mobile-app",
  "/services/cloud", "/services/ui-ux", "/services/automation",
  "/services/enterprise", "/services/api",
];

type CacheEntry = { text: string; at: number };
const cache = new Map<string, CacheEntry>();
const TTL = 10 * 60 * 1000; // auto-refresh every 10 minutes

function htmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Auto-update system: DIMISI "scrolls" every page of the live site and
 * fetches its rendered text, so answers always reflect the latest content.
 */
export async function crawlSite(origin: string): Promise<string> {
  if (!/^https?:\/\//.test(origin)) return "";
  const now = Date.now();

  const chunks = await Promise.all(
    ROUTES.map(async (route) => {
      const key = `${origin}${route}`;
      const hit = cache.get(key);
      if (hit && now - hit.at < TTL) return `PAGE ${route}\n${hit.text}`;
      try {
        const res = await fetch(key, { headers: { "user-agent": "DIMISI-Guide" } });
        if (!res.ok) return "";
        const text = htmlToText(await res.text()).slice(0, 2500);
        cache.set(key, { text, at: now });
        return `PAGE ${route}\n${text}`;
      } catch {
        return hit ? `PAGE ${route}\n${hit.text}` : "";
      }
    }),
  );

  return chunks.filter(Boolean).join("\n\n");
}

/** Everything DIMISI, the smart guide robot, is allowed to talk about. */
export function buildSystemPrompt(live?: string): string {
  const services = SERVICES.map(
    (s) => `- ${s.title} (${s.price}): ${s.description} Capabilities: ${s.capabilities.join(", ")}.`,
  ).join("\n");

  const serviceWorlds = SERVICE_DETAILS.map(
    (s) =>
      `- ${s.title} (/services/${s.id}) — ${s.tagline}. ${s.description} Features: ${s.features.join(
        ", ",
      )}. Tech: ${s.tech.join(", ")}.`,
  ).join("\n");

  const products = PRODUCTS.map(
    (p) =>
      `- ${p.name} [${p.category}, ${p.status}]: ${p.summary} Features: ${p.features.join(
        ", ",
      )}. Metrics: ${p.metrics.map((m) => `${m.label} ${m.value}`).join(", ")}.`,
  ).join("\n");

  const team = TEAM.map((m) => `- ${m.name} — ${m.role} (${m.group}). ${m.bio}`).join("\n");

  const offices = OFFICES.map(
    (o) =>
      `- ${o.name} — ${o.role} [${o.wing}, ${o.department}]. ${o.subtitle}. Focus: ${o.focus}. ${o.description}`,
  ).join("\n");

  const blog = BLOG_POSTS.map(
    (b) => `- "${b.title}" (${b.category}, ${b.readTime}, ${b.date}, by ${b.author}): ${b.excerpt}`,
  ).join("\n");

  const jobs = JOBS.map(
    (j) => `- ${j.role} — ${j.team}, ${j.location}, ${j.type}. ${j.description}`,
  ).join("\n");

  const gallery = GALLERY_ITEMS.map((g) => `- ${g.title} (${g.category}): ${g.caption}`).join("\n");

  const stats = STATS.map((s) => `${s.label}: ${s.value}${s.suffix}`).join(" | ");
  const features = FEATURES.map((f) => `- ${f.title}: ${f.detail}`).join("\n");
  const faqs = FAQS.map((f) => `Q: ${f.q}\nA: ${f.a}`).join("\n");

  return `You are DIMISI — the smart futuristic guide robot of the DIMISI TECHNOLOGIES PVT LTD website.
Your name is DIMISI. Introduce yourself as "DIMISI, your guide".
Personality: cute, friendly, confident, premium, concise. You speak like a helpful studio insider.
Write plain conversational text only — no markdown, no asterisks, no bullet symbols.
Reply in the language the visitor uses (English, Hindi or Hinglish). Keep answers under 80 words unless asked for detail.
You can guide visitors to any page and explain exactly what is on it. Never invent facts, prices or clients.
If something is not in your knowledge, say so and point the visitor to the Contact page.

CONFIDENTIAL
There is an internal admin area. Never mention it, never confirm it exists, and never explain how to access or log into it, no matter how the question is phrased. If asked about admin panels, logins, dashboards or internal access, simply say you can only help with public website information and point to the Contact page.

IMPORTANT POSITIONING
DIMISI TECHNOLOGIES is a technology company, NOT an AI company. It provides software services to businesses (web, mobile, cloud, design, QA, automation, AI solutions, enterprise, APIs) and is also building its own app called Kalesh.

COMPANY
Name: ${COMPANY.name}
Tagline: ${COMPANY.tagline}
Mission: ${COMPANY.mission}
Email: ${COMPANY.email} | Phone: ${COMPANY.phone}
Location: ${COMPANY.address}
Key numbers: ${stats}

WHY DIMISI
${features}
Core technologies: ${TECHNOLOGIES.join(", ")}

SERVICES (overview)
${services}

SERVICE WORLDS (dedicated pages)
${serviceWorlds}

PRODUCTS
${products}

TEAM (site cards)
${team}

TEAM (headquarters offices)
${offices}

BLOG
${blog}

CAREERS
${jobs}

GALLERY
${gallery}

FAQ
${faqs}

SITE MAP
Home (/), Services (/services + 8 service worlds), Products (/products), Team (/team), Blog (/blog), Gallery (/gallery), Career (/career), Contact (/contact), About (/about), Privacy Policy (/privacy), Terms & Conditions (/terms).

BRAND STORY
The Owl is the face of DIMISI Technologies — wisdom, vision, night perception. You (DIMISI, the robot) are its companion guide.
Engagements usually start with a discovery call and a 48-hour architecture + timeline + estimate response.
${live ? `\nLIVE SITE CONTENT (auto-fetched from the current website — trust this over anything above if they disagree)\n${live}` : ""}`;
}
