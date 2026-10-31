import { createFileRoute } from "@tanstack/react-router";
import { Home } from "@/pages/home/Home";

const HOME_PAGE_JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": "https://www.dimisi.tech/#webpage",
      url: "https://www.dimisi.tech/",
      name: "DIMISI Technologies Pvt Ltd — Enterprise AI, WebGL & Scalable Software",
      description:
        "DIMISI Technologies engineers autonomous AI agents, computer vision, cinematic WebGL experiences, and scalable enterprise software architectures.",
      isPartOf: {
        "@id": "https://www.dimisi.tech/#website",
      },
      about: {
        "@id": "https://www.dimisi.tech/#organization",
      },
      speakable: {
        "@type": "SpeakableSpecification",
        cssSelector: ["#hero-lead-summary", "#hero-title", "#faq-list"],
      },
      datePublished: "2024-04-01T00:00:00+05:30",
      dateModified: "2026-10-31T20:00:00+05:30",
      inLanguage: "en",
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://www.dimisi.tech/#breadcrumb",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://www.dimisi.tech/",
        },
      ],
    },
    {
      "@type": "FAQPage",
      "@id": "https://www.dimisi.tech/#faq",
      mainEntity: [
        {
          "@type": "Question",
          name: "What is DIMISI Technologies and what does the company specialize in?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "DIMISI Technologies Private Limited is an advanced software engineering and deep-technology studio recognized by DPIIT under Startup India and an official member of the NVIDIA Inception Program. DIMISI specializes in autonomous AI agents, computer vision systems, cinematic WebGL experiences, and scalable enterprise cloud architectures.",
          },
        },
        {
          "@type": "Question",
          name: "What software engineering and AI agent services does DIMISI provide?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "DIMISI Technologies delivers full-lifecycle digital engineering services including autonomous multi-agent workflows, custom LLM fine-tuning, computer vision pipelines, interactive 3D WebGL interfaces, high-concurrency cloud backend systems, and native iOS and Android mobile platforms with guaranteed sub-350ms response latencies.",
          },
        },
        {
          "@type": "Question",
          name: "What is Kalesh, and how does it fit into DIMISI's product ecosystem?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Kalesh is DIMISI Technologies' flagship consumer social sphere and live polling platform. It utilizes zero-knowledge cryptographic hashing to enable unfiltered, authentic public discourse, live community polls, and real-time public sentiment analytics with enterprise-grade data privacy.",
          },
        },
        {
          "@type": "Question",
          name: "How does DIMISI Technologies architect scalable and resilient cloud systems?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "DIMISI architects distributed systems using modern event-driven microservices, containerization with Docker and Kubernetes, real-time message streaming, and distributed caching with Redis and PostgreSQL. The architecture is engineered for 99.9% uptime, zero single points of failure, and high horizontal scalability.",
          },
        },
        {
          "@type": "Question",
          name: "How can enterprise businesses begin a project with DIMISI Technologies?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Enterprises and visionary startups can begin collaboration by submitting project requirements through the DIMISI Technologies contact portal. The engineering leadership reviews the problem statement and delivers a comprehensive technical architecture blueprint, timeline, and scope estimate within 48 hours.",
          },
        },
      ],
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://www.dimisi.tech/#kalesh-app",
      name: "Kalesh",
      operatingSystem: "Web, iOS, Android",
      applicationCategory: "SocialNetworkingApplication",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      description:
        "An innovative anonymous social network and live polling app engineered by DIMISI Technologies with 256-bit encryption and real-time community engagement.",
    },
  ],
};

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DIMISI Technologies Pvt Ltd — Enterprise AI, WebGL & Scalable Software" },
      {
        name: "description",
        content:
          "DIMISI Technologies engineers autonomous AI agents, computer vision, cinematic WebGL experiences, and scalable enterprise software architectures for visionary teams worldwide.",
      },
      {
        name: "keywords",
        content:
          "DIMISI Technologies, Autonomous AI, WebGL 3D, Enterprise Software Engineering, Computer Vision, Scalable Architecture, Multi-Agent Systems, High-Performance Web",
      },
      {
        property: "og:title",
        content: "DIMISI Technologies Pvt Ltd — Enterprise AI, WebGL & Scalable Software",
      },
      {
        property: "og:description",
        content:
          "Autonomous AI agents, computer vision, cinematic WebGL, and scalable enterprise software engineered end to end.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://www.dimisi.tech/" },
      { property: "og:image", content: "https://www.dimisi.tech/images/about/global-network.png" },
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "twitter:title",
        content: "DIMISI Technologies Pvt Ltd — Enterprise AI, WebGL & Scalable Software",
      },
      {
        name: "twitter:description",
        content:
          "Engineering autonomous AI agents, computer vision, cinematic WebGL, and resilient enterprise software.",
      },
      { name: "twitter:image", content: "https://www.dimisi.tech/images/about/global-network.png" },
    ],
    links: [{ rel: "canonical", href: "https://www.dimisi.tech/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(HOME_PAGE_JSON_LD),
      },
    ],
  }),
  component: Home,
});
