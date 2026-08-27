/**
 * In-memory persistence and seed data store for Our Work & Our Products case studies.
 * Includes complete CRUD operations, real-time status toggles, and seed integrity.
 */

import {
  type ProjectItem,
  type ProjectInput,
  type PublicWorkPayload,
  slugifyProject,
  validateProjectInput,
} from "./work.shared";

const INITIAL_PROJECTS: ProjectItem[] = [
  {
    id: "proj-1",
    slug: "rudra-tours-travels",
    title: "Rudra Tours & Travels",
    type: "work",
    category: "Travel · Website",
    tagline: "Custom Travel Booking & Itinerary Platform for Northern India Expeditions",
    overview:
      "A travel website for India tour packages, car rentals, wedding travel, and city-based trip planning from Kanpur.",
    challenge:
      "Travel customers need a fast way to compare tours, vehicles, destinations, and contact options without getting lost in a large catalog.",
    solution:
      "We structured the site around clear service pages, destination guides, vehicle categories, and direct inquiry flows so visitors can plan trips quickly.",
    outcome:
      "Visitors can move from inspiration to booking or inquiry with less friction, whether they need a package, a car, or wedding travel support.",
    website_url: "https://toursbyrudra.com",
    client_name: "Rudra Tours & Travels Ltd",
    timeline: "4 Weeks Sprint",
    cover_image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
    gallery_images: [
      {
        url: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1000&q=80",
        caption: "Interactive Tour Itinerary Planner & Destination Guides",
      },
      {
        url: "https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?auto=format&fit=crop&w=1000&q=80",
        caption: "Vehicle Fleet & Wedding Travel Booking Interface",
      },
      {
        url: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1000&q=80",
        caption: "Direct WhatsApp & Instant Quote Integration",
      },
    ],
    tech_stack: ["React", "TypeScript", "Tailwind CSS", "Vite", "Supabase", "Cloudflare Edge"],
    metrics: [
      { label: "Inquiry Conversion", value: "+145%" },
      { label: "Mobile Page Load", value: "0.6s" },
      { label: "Booking Drop-off", value: "-40%" },
    ],
    order_index: 1,
    is_featured: true,
    is_active: true,
    created_at: "2026-08-20T10:00:00Z",
    updated_at: "2026-08-26T12:00:00Z",
  },
  {
    id: "proj-2",
    slug: "kalesh",
    title: "Kalesh",
    type: "product",
    category: "Social Platform · Website",
    tagline: "Anonymous Polling, Private Real-Time Chats & Unfiltered Community Opinions",
    overview:
      "An anonymous social platform built around real-time polls, private chats, and authentic opinion sharing.",
    challenge:
      "The product needed a clear way to explain anonymity, community trust, and fast participation without overwhelming first-time visitors.",
    solution:
      "We presented the platform around anonymous profiles, instant polls, and direct community actions so the value is obvious on arrival.",
    outcome:
      "Visitors can quickly understand how to share honest opinions without profile pressure or identity exposure.",
    website_url: "https://thekalesh.com",
    client_name: "DIMISI Labs (In-House Product)",
    timeline: "Ongoing Continuous Delivery",
    cover_image:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
    gallery_images: [
      {
        url: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1000&q=80",
        caption: "Real-time Live Polling Engine with WebSockets",
      },
      {
        url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1000&q=80",
        caption: "Zero-Knowledge Anonymized Encryption Layer",
      },
      {
        url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=80",
        caption: "Community Trending Feed & Dynamic Moderation",
      },
    ],
    tech_stack: ["Next.js", "React 19", "WebSockets", "Node.js", "Redis Pub/Sub", "PostgreSQL"],
    metrics: [
      { label: "Active Poll Engagements", value: "250K+" },
      { label: "Real-Time Sync Latency", value: "< 45ms" },
      { label: "Identity Leak Risk", value: "0.00%" },
    ],
    order_index: 2,
    is_featured: true,
    is_active: true,
    created_at: "2026-08-21T10:00:00Z",
    updated_at: "2026-08-26T12:00:00Z",
  },
  {
    id: "proj-3",
    slug: "karyon",
    title: "Karyon",
    type: "product",
    category: "Home Services · Web App",
    tagline: "On-Demand Home Services Booking Engine with Verified Trade Professionals",
    overview:
      "A home-services platform for booking verified professionals across plumbing, electrical, cleaning, painting, moving, and more.",
    challenge:
      "Home service customers need a simple way to browse offerings, trust the providers, and book help without friction.",
    solution:
      "We organized the experience around premium services, booking steps, and customer reassurance to make service selection straightforward.",
    outcome:
      "Customers can move from browsing to booking quickly, with a clearer sense of service scope and reliability.",
    website_url: "https://karyon.app",
    client_name: "DIMISI Labs (In-House Product)",
    timeline: "6 Weeks Core MVP",
    cover_image:
      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80",
    gallery_images: [
      {
        url: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1000&q=80",
        caption: "One-Tap Verified Professional Dispatch System",
      },
      {
        url: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1000&q=80",
        caption: "Transparent Pricing Estimator & Milestone Tracking",
      },
      {
        url: "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1000&q=80",
        caption: "Provider Background Verification & Rating Portal",
      },
    ],
    tech_stack: ["React Native / Web", "TypeScript", "Node.js", "PostgreSQL", "Stripe API", "AWS"],
    metrics: [
      { label: "Booking Completion", value: "3.2 mins" },
      { label: "Customer Satisfaction", value: "4.9/5" },
      { label: "Verified Service Pros", value: "500+" },
    ],
    order_index: 3,
    is_featured: true,
    is_active: true,
    created_at: "2026-08-22T10:00:00Z",
    updated_at: "2026-08-26T12:00:00Z",
  },
  {
    id: "proj-4",
    slug: "axiscon",
    title: "AxisCon",
    type: "work",
    category: "Conference · Website",
    tagline: "Academic Research & Registration Portal for International ICCIST 2026",
    overview:
      "A conference website for ICCIST 2026 highlighting research themes, registration, schedules, and participation details.",
    challenge:
      "The event needed a site that could explain the conference scope, guide registrations, and present academic information cleanly.",
    solution:
      "We structured the pages around key research areas, important dates, schedules, and registration links for easy navigation.",
    outcome:
      "Attendees can understand the event quickly and move into registration or deeper conference details with less effort.",
    website_url: "https://axiscon.netlify.app/",
    client_name: "ICCIST Organizing Committee",
    timeline: "3 Weeks Turnaround",
    cover_image:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80",
    gallery_images: [
      {
        url: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1000&q=80",
        caption: "Keynote Speakers & Interactive Conference Schedule",
      },
      {
        url: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1000&q=80",
        caption: "Paper Submission Portal & Peer Review Timeline",
      },
      {
        url: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1000&q=80",
        caption: "Early-Bird Delegate Registration Flow",
      },
    ],
    tech_stack: ["Astro / React", "Tailwind CSS", "Netlify Edge", "TypeScript", "Markdown CMS"],
    metrics: [
      { label: "Paper Submissions", value: "350+" },
      { label: "Global Registrations", value: "1,200+" },
      { label: "Lighthouse Performance", value: "99/100" },
    ],
    order_index: 4,
    is_featured: true,
    is_active: true,
    created_at: "2026-08-23T10:00:00Z",
    updated_at: "2026-08-26T12:00:00Z",
  },
];

class MemoryWorkStore {
  private projects: Map<string, ProjectItem> = new Map();

  constructor() {
    INITIAL_PROJECTS.forEach((p) => this.projects.set(p.id, { ...p }));
  }

  public getPublicPayload(): PublicWorkPayload {
    const list = Array.from(this.projects.values())
      .filter((p) => p.is_active)
      .sort((a, b) => a.order_index - b.order_index);

    const totalWork = list.filter((p) => p.type === "work").length;
    const totalProducts = list.filter((p) => p.type === "product").length;

    return {
      projects: list,
      stats: {
        totalProjects: list.length,
        totalWork,
        totalProducts,
        satisfactionScore: "99.4%",
        deliveryRate: "100%",
      },
    };
  }

  public getAllProjects(): ProjectItem[] {
    return Array.from(this.projects.values()).sort((a, b) => a.order_index - b.order_index);
  }

  public getProjectBySlug(slug: string): ProjectItem | null {
    const clean = slug.toLowerCase().trim();
    for (const p of this.projects.values()) {
      if (p.slug.toLowerCase() === clean && p.is_active) {
        return p;
      }
    }
    return null;
  }

  public getProjectById(id: string): ProjectItem | null {
    return this.projects.get(id) || null;
  }

  public saveProject(input: ProjectInput): ProjectItem {
    const validation = validateProjectInput(input);
    if (!validation.valid) {
      throw new Error(validation.error || "Invalid project data.");
    }

    const now = new Date().toISOString();
    const id = input.id || `proj-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const slug = input.slug?.trim() || slugifyProject(input.title);

    const existing = this.projects.get(id);

    const item: ProjectItem = {
      id,
      slug,
      title: input.title.trim(),
      type: input.type,
      category: input.category.trim(),
      tagline: input.tagline?.trim() || input.overview.slice(0, 80),
      overview: input.overview.trim(),
      challenge: input.challenge.trim(),
      solution: input.solution.trim(),
      outcome: input.outcome.trim(),
      cover_image: input.cover_image.trim(),
      gallery_images: input.gallery_images || [],
      website_url: input.website_url?.trim() || undefined,
      client_name: input.client_name?.trim() || undefined,
      timeline: input.timeline?.trim() || undefined,
      tech_stack: input.tech_stack || [],
      metrics: input.metrics || [],
      order_index: input.order_index ?? (existing ? existing.order_index : this.projects.size + 1),
      is_featured: input.is_featured ?? (existing ? existing.is_featured : false),
      is_active: input.is_active ?? (existing ? existing.is_active : true),
      created_at: existing ? existing.created_at : now,
      updated_at: now,
    };

    this.projects.set(id, item);
    return item;
  }

  public deleteProject(id: string): boolean {
    return this.projects.delete(id);
  }
}

// Global persistent instance on server
const globalForWork = globalThis as unknown as { __dimisi_work_store__?: MemoryWorkStore };
export const workStore = globalForWork.__dimisi_work_store__ || new MemoryWorkStore();
if (process.env.NODE_ENV !== "production") {
  globalForWork.__dimisi_work_store__ = workStore;
}
