/**
 * DIMISI Technologies — Client-Side Assistant Knowledge & Chat
 * Pure client-side robot guide response engine.
 */

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const FAQ_KNOWLEDGE: { keywords: string[]; answer: string }[] = [
  {
    keywords: ["service", "what do you do", "build", "offerings", "product"],
    answer:
      "DIMISI Technologies is an advanced engineering and product innovation studio. We specialize in AI & Autonomous Multi-Agent Systems, 3D WebGL Web Experiences, Enterprise Cloud & DevOps, High-Performance Mobile Applications, and custom digital transformation.",
  },
  {
    keywords: ["contact", "reach", "email", "phone", "hire", "talk"],
    answer:
      "You can connect directly with our engineering leadership at hello@dimisi.in or visit our Contact page to schedule an architectural consultation.",
  },
  {
    keywords: ["kalesh", "mobile app", "app"],
    answer:
      "Kalesh is our viral mobile social app built with high-throughput real-time architecture, sub-second media delivery, and community moderation engines.",
  },
  {
    keywords: ["review", "feedback", "rating", "client"],
    answer:
      "Our clients and team members rate DIMISI 5.0★ for engineering excellence, zero-bloat delivery, and production-grade reliability. Check out our Reviews page to read verified testimonials!",
  },
  {
    keywords: ["career", "job", "hiring", "apply", "intern"],
    answer:
      "We are always looking for visionary builders, full-stack engineers, and 3D artists. Head over to our Careers page to see open roles and our 5-step transparent hiring process.",
  },
  {
    keywords: ["team", "founder", "who is", "swatantra"],
    answer:
      "DIMISI Technologies is founded and led by Swatantra Singh along with a team of elite architects, researchers, and creative technologists based in India and operating globally.",
  },
];

export async function askDimisi({
  data,
}: {
  data: {
    messages: ChatMessage[];
    origin?: string;
  };
}): Promise<{ reply: string }> {
  const lastMsg = data.messages[data.messages.length - 1]?.content?.toLowerCase() || "";

  for (const item of FAQ_KNOWLEDGE) {
    if (item.keywords.some((k) => lastMsg.includes(k))) {
      return { reply: item.answer };
    }
  }

  return {
    reply:
      "Welcome to DIMISI Technologies! We engineer autonomous AI agents, high-speed platforms, and cinematic 3D digital experiences. How can we help bring your vision to life?",
  };
}
