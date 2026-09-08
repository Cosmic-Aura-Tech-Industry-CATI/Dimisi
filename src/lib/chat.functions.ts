/**
 * DIMISI AI — Assistant Knowledge & Gemini AI Chat Engine
 * Canonical conversation pipeline for DIMISI AI.
 */
import { apiRequest } from "@/services/apiClient";
import type { ChatMessage, ChatPayload, ChatResponse, ActionChip } from "./ai/ai.types";
import { sanitizeAIOutput } from "./ai/ai.security";
import { resolveIdentityQuestion } from "./ai/conversation";

export type { ChatMessage, ChatPayload, ChatResponse, ActionChip };

const LOCAL_FAQ_KNOWLEDGE: {
  keywords: string[];
  answer: string;
  actions?: ActionChip[];
}[] = [
  {
    keywords: [
      "service",
      "services",
      "what do you do",
      "build",
      "offerings",
      "web development",
      "mobile app",
      "ai",
      "cloud",
      "devops",
      "automation",
      "kya karte ho",
      "kya service",
    ],
    answer:
      "DIMISI Technologies specializes in AI & Autonomous Multi-Agent Systems, High-Performance Web & Mobile Apps, 3D WebGL Experiences, Enterprise Cloud & DevOps, and Custom Digital Transformation. You can explore our dedicated Services chapter to see all capabilities.",
    actions: [
      { id: "services", label: "⚡ Explore Services", action: "navigate", target: "/services" },
      { id: "estimator", label: "📊 Estimate My Project", action: "estimator" },
    ],
  },
  {
    keywords: [
      "website",
      "web dev",
      "web development",
      "website banwani",
      "website banana",
      "frontend",
      "react",
      "fullstack",
    ],
    answer:
      "We design and build ultra-fast, cinematic, production-grade web applications using React, Next.js, TanStack, and modern 3D WebGL shaders. Reach out via our Contact page to start your web project.",
    actions: [
      { id: "web-dev", label: "🌐 Web Engineering", action: "navigate", target: "/services/web-development" },
      { id: "contact", label: "💬 Start Project Discussion", action: "navigate", target: "/contact" },
    ],
  },
  {
    keywords: [
      "contact",
      "reach",
      "email",
      "phone",
      "hire",
      "talk",
      "kaise contact karein",
      "sampark",
      "consultation",
      "call",
    ],
    answer:
      "You can connect directly with our engineering leadership at hello@dimisi.in or visit our Contact page (/contact) to schedule an architectural consultation. We provide 48-hour estimate & roadmap turnaround.",
    actions: [
      { id: "contact", label: "✉️ Open Contact Form", action: "navigate", target: "/contact" },
    ],
  },
  {
    keywords: [
      "kalesh",
      "kalesh app",
      "social app",
      "viral app",
      "app",
    ],
    answer:
      "Kalesh is our viral mobile social app engineered with high-throughput real-time architecture, sub-second media delivery, and community moderation engines.",
    actions: [
      { id: "products", label: "🚀 View Products", action: "navigate", target: "/products" },
    ],
  },
  {
    keywords: [
      "athena",
      "athena core",
      "products",
      "product",
    ],
    answer:
      "ATHENA Core is our flagship multi-agent AI intelligence platform designed to automate complex workflows and orchestrate autonomous systems at enterprise scale.",
    actions: [
      { id: "products", label: "🧠 Explore ATHENA Core", action: "navigate", target: "/products" },
    ],
  },
  {
    keywords: [
      "review",
      "reviews",
      "feedback",
      "rating",
      "ratings",
      "client",
      "testimonial",
      "testimonials",
    ],
    answer:
      "Our clients and partners rate DIMISI 5.0★ for engineering excellence, zero-bloat delivery, and production-grade reliability. Check out our Reviews page (/reviews) to read verified client testimonials!",
    actions: [
      { id: "reviews", label: "⭐ Read Reviews", action: "navigate", target: "/reviews" },
    ],
  },
  {
    keywords: [
      "career",
      "careers",
      "job",
      "jobs",
      "hiring",
      "apply",
      "intern",
      "internship",
      "opening",
      "openings",
      "naukri",
    ],
    answer:
      "We are always hiring curious builders, full-stack engineers, and 3D creative technologists. Visit our Careers page (/career) to see our open positions and transparent 5-step hiring process with 48-hour decisions.",
    actions: [
      { id: "career", label: "💼 Open Positions", action: "navigate", target: "/career" },
    ],
  },
  {
    keywords: [
      "team",
      "founder",
      "who is",
      "swatantra",
      "leadership",
      "ceo",
      "cto",
    ],
    answer:
      "DIMISI Technologies is founded and led by Swatantra Singh along with a team of elite software architects, AI researchers, and creative technologists based in India and operating globally.",
    actions: [
      { id: "team", label: "👥 Meet the Team", action: "navigate", target: "/team" },
    ],
  },
  {
    keywords: [
      "price",
      "pricing",
      "cost",
      "quote",
      "kitna lagega",
      "budget",
      "estimate",
    ],
    answer:
      "Every software engagement is scoped based on architectural complexity, timeline, and technical requirements. Use our Smart Project Estimator or contact us on our Contact page for a custom 48-hour blueprint and quote.",
    actions: [
      { id: "estimator", label: "📊 Estimate My Project", action: "estimator" },
      { id: "contact", label: "💬 Get Custom Quote", action: "navigate", target: "/contact" },
    ],
  },
  {
    keywords: [
      "hi",
      "hello",
      "hey",
      "namaste",
      "greeting",
      "kaisa",
    ],
    answer:
      "Hello! I am DIMISI AI, your intelligent guide. I can help you explore our services, products, team, careers, and project estimates. What are you looking to build today?",
    actions: [
      { id: "services", label: "⚡ Explore Services", action: "navigate", target: "/services" },
      { id: "estimator", label: "📊 Project Estimator", action: "estimator" },
    ],
  },
];

function getLocalFallbackAnswer(question: string): { reply: string; actions?: ActionChip[] } {
  const normalized = question.toLowerCase();

  for (const item of LOCAL_FAQ_KNOWLEDGE) {
    if (item.keywords.some((k) => normalized.includes(k))) {
      return { reply: item.answer, actions: item.actions };
    }
  }

  return {
    reply:
      "Welcome to DIMISI Technologies! We engineer autonomous AI systems, high-speed applications, and cinematic 3D digital experiences. How can we help bring your vision to life?",
    actions: [
      { id: "services", label: "⚡ Explore Services", action: "navigate", target: "/services" },
      { id: "contact", label: "💬 Contact Us", action: "navigate", target: "/contact" },
    ],
  };
}

/**
 * Executes a query to the DIMISI AI engine.
 * 1. Checks for direct identity queries with 100% accurate, instantaneous identity response.
 * 2. Attempts Google Gemini AI call via backend server endpoint.
 * 3. If backend/Gemini is unavailable, gracefully falls back to local FAQ engine.
 */
export async function askDimisi({
  data,
}: {
  data: ChatPayload;
}): Promise<ChatResponse> {
  const messages = data.messages || [];
  const lastMsg = messages[messages.length - 1];
  const lastMsgContent = lastMsg?.content || "";

  if (!lastMsgContent.trim() && !data.attachment) {
    return {
      reply: "Please ask a question about DIMISI Technologies, our services, or team.",
    };
  }

  // 1. Instant Identity Matcher (Ensures 100% identity accuracy across English, Hindi, Hinglish)
  const identityCheck = resolveIdentityQuestion(lastMsgContent);
  if (identityCheck.isIdentity && identityCheck.reply) {
    return {
      reply: identityCheck.reply,
      actions: identityCheck.actions,
    };
  }

  // 2. Attempt Server-Side Gemini AI Request
  try {
    const res = await apiRequest<{
      success: boolean;
      reply: string;
      intent?: "LOW_INTENT" | "MEDIUM_INTENT" | "HIGH_INTENT" | "ENTERPRISE_INTENT";
      actions?: ActionChip[];
    }>("/api/v1/chat", {
      method: "POST",
      timeoutMs: 12000,
      body: JSON.stringify({
        messages: messages.slice(-10),
        currentRoute: data.currentRoute,
        attachment: data.attachment,
      }),
    });

    if (res?.reply && typeof res.reply === "string" && res.reply.trim().length > 0) {
      const cleanReply = sanitizeAIOutput(res.reply);
      return {
        reply: cleanReply,
        intent: res.intent,
        actions: res.actions,
      };
    }
  } catch (err: unknown) {
    console.warn("AI chat endpoint unavailable, activating local FAQ fallback:", err);
  }

  // 3. Local FAQ Fallback
  const fallback = getLocalFallbackAnswer(lastMsgContent);
  return {
    reply: fallback.reply,
    actions: fallback.actions,
  };
}
