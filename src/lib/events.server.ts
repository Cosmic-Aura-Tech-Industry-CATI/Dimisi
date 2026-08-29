/** Server-side events & gallery store and persistence handler. */
import {
  type CompanyEvent,
  type EventGalleryItem,
  type EventInput,
  type GalleryItemInput,
  type PublicEventsPayload,
  slugifyEvent,
} from "./events.shared";

// High-fidelity curated seed events and gallery items for instant out-of-the-box immersion
const SEED_EVENTS: CompanyEvent[] = [
  {
    id: "evt-001",
    title: "Kalesh App Global Launch & Creator Keynote 2026",
    slug: "kalesh-app-global-launch-2026",
    date: "October 24, 2026",
    start_time: "06:00 PM IST",
    end_time: "10:30 PM IST",
    location: "Auditorium Grand Alpha, New Delhi & Global Livestream",
    venue_details: "Main Innovation Hall, Tech Boulevard, Sector 62",
    status: "upcoming",
    category: "Product Launch",
    description:
      "Official public unveil of Kalesh — our proprietary anonymous social platform with real-time room engine, zero-profile debate spheres, and WebGPU graphics.",
    full_description:
      "Join the core engineering and design team of DIMISI Technologies as we reveal Kalesh to the world. Experience live architectural deep-dives into our low-latency distributed room mesh, anonymous cryptographic voting protocols, and our next-generation mobile interface built from scratch. Attendees will receive exclusive founder-tier digital passes and live beta access.",
    cover_image:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1600&q=85",
    images: [
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80",
    ],
    is_featured: true,
    attendees_count: 1250,
    registration_url: "/contact?event=kalesh-launch",
    highlights: [
      "Live keynote by DIMISI Founding Engineering Team",
      "Real-time load test with 50,000 simulated concurrent rooms",
      "Exclusive early-access founder badges and Kalesh merchandise",
      "Interactive Q&A and networking lounge with venture partners",
    ],
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: "evt-002",
    title: "DIMISI Sovereign AI & Agentic Systems Summit 2026",
    slug: "sovereign-ai-summit-2026",
    date: "November 14, 2026",
    start_time: "10:00 AM IST",
    end_time: "05:00 PM IST",
    location: "ITC Grand Chola, Bengaluru",
    venue_details: "Emerald Ballroom, Guindy Executive Center",
    status: "upcoming",
    category: "Tech Summit",
    description:
      "A flagship technology conference exploring sovereign local AI agents, model routing pipelines, and multi-tenant high-throughput vector clusters.",
    full_description:
      "The DIMISI Sovereign AI Summit brings together 500+ AI researchers, enterprise architects, and engineering leaders to discuss the shift toward autonomous multi-agent software. Learn how to architect zero-data-leakage model clusters, write custom Triton kernels, and orchestrate intelligent workflows that replace weeks of manual labor.",
    cover_image:
      "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1600&q=85",
    images: [
      "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=1200&q=80",
    ],
    is_featured: false,
    attendees_count: 550,
    registration_url: "/contact?event=ai-summit",
    highlights: [
      "Keynotes on Edge AI and Local Vector Processing",
      "Hands-on workshop on multi-agent consensus protocols",
      "Private VIP dinner for CTOs and founders",
    ],
    created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: "evt-003",
    title: "Genesis 48-Hour Open Innovation Hackathon",
    slug: "genesis-hackathon-2026",
    date: "August 12-14, 2026",
    start_time: "09:00 AM IST",
    end_time: "06:00 PM IST",
    location: "DIMISI Engineering Hub, Noida & Remote",
    venue_details: "Building 4, 3rd Floor Innovation Arena",
    status: "completed",
    category: "Hackathon",
    description:
      "Over 400 developers built breakthrough autonomous systems, WebGPU shaders, and full-stack solutions over 48 sleepless hours of intense building.",
    full_description:
      "Genesis 2026 brought together developers, students, and product designers from 18 states. Teams competed across three tracks: Autonomous AI Agents, Next-Gen Mobile Experiences, and Distributed Edge Systems. Over ₹5,00,000 in cash prizes and incubator grants were awarded.",
    cover_image:
      "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=1600&q=85",
    images: [
      "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80",
    ],
    is_featured: false,
    attendees_count: 420,
    registration_url: null,
    highlights: [
      "48 hours of nonstop coding, mentorship, and pizza",
      "32 working MVPs shipped and deployed to production",
      "₹5,00,000 in prize pools awarded to winning teams",
    ],
    created_at: new Date(Date.now() - 40 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    id: "evt-004",
    title: "DIMISI Annual Team Convergence & Strategy Retreat",
    slug: "dimisi-annual-convergence-2026",
    date: "July 20-23, 2026",
    start_time: "All Day",
    end_time: "All Day",
    location: "Rishikesh Himalayan Valley Resort, Uttarakhand",
    venue_details: "Valley of Light Retreat Center",
    status: "completed",
    category: "Team Retreat",
    description:
      "Four days of company-wide alignment, architectural roadmap planning, river expeditions, and celebrating milestone platform deliveries.",
    full_description:
      "Our entire distributed team of engineers, product managers, and UI/UX craftsmen convened in the Himalayas to decompress, align on 2027 vision, celebrate the release of major client platforms, and bond over riverside campfires.",
    cover_image:
      "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1600&q=85",
    images: [
      "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?auto=format&fit=crop&w=1200&q=80",
    ],
    is_featured: false,
    attendees_count: 85,
    registration_url: null,
    highlights: [
      "Vision 2027 company roadmap alignment",
      "River rafting and team adventure challenge",
      "Annual engineering excellence awards ceremony",
    ],
    created_at: new Date(Date.now() - 60 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 25 * 86400000).toISOString(),
  },
];

const SEED_GALLERY: EventGalleryItem[] = [
  {
    id: "gal-001",
    event_id: "evt-001",
    event_title: "Kalesh App Global Launch",
    title: "Kalesh Real-Time Holographic UI Plate",
    caption: "First look at the 3D dark-mode debate sphere and neon voting dials.",
    image_url:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=85",
    category: "Interfaces",
    aspect_ratio: "tall",
    hue: 35,
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    id: "gal-002",
    event_id: "evt-001",
    event_title: "Kalesh App Global Launch",
    title: "Main Stage Light Design Study",
    caption: "Volumetric orange laser rig simulated in Blender before stage assembly.",
    image_url:
      "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=1200&q=85",
    category: "Motion",
    aspect_ratio: "wide",
    hue: 25,
    created_at: new Date(Date.now() - 12 * 86400000).toISOString(),
  },
  {
    id: "gal-003",
    event_id: "evt-002",
    event_title: "Sovereign AI Summit",
    title: "Neural Agent Matrix Architecture",
    caption: "Diagrammatic visual plate of our multi-agent model router in action.",
    image_url:
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=85",
    category: "AI & Systems",
    aspect_ratio: "normal",
    hue: 42,
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
  },
  {
    id: "gal-004",
    event_id: "evt-003",
    event_title: "Genesis 48-Hour Hackathon",
    title: "Midnight Sprint in the Innovation Arena",
    caption: "Teams building real-time autonomous systems at 3:00 AM on Day 2.",
    image_url:
      "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=85",
    category: "Culture",
    aspect_ratio: "normal",
    hue: 28,
    created_at: new Date(Date.now() - 25 * 86400000).toISOString(),
  },
  {
    id: "gal-005",
    event_id: "evt-003",
    event_title: "Genesis 48-Hour Hackathon",
    title: "Winner Showcase & Pitch Stage",
    caption: "Grand prize winner presenting a zero-latency WebGPU video editor.",
    image_url:
      "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=85",
    category: "Culture",
    aspect_ratio: "tall",
    hue: 18,
    created_at: new Date(Date.now() - 26 * 86400000).toISOString(),
  },
  {
    id: "gal-006",
    event_id: "evt-004",
    event_title: "DIMISI Annual Team Convergence",
    title: "Himalayan Ridge Dawn Discussion",
    caption: "Engineering leads mapping the next 5 years of software craftsmanship.",
    image_url:
      "https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1200&q=85",
    category: "Culture",
    aspect_ratio: "wide",
    hue: 30,
    created_at: new Date(Date.now() - 40 * 86400000).toISOString(),
  },
  {
    id: "gal-007",
    event_id: null,
    event_title: "DIMISI Studio R&D",
    title: "Anisotropic Shader Study 08",
    caption: "Hardware-accelerated iridescent crystal material rendered in real-time WebGL.",
    image_url:
      "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1200&q=85",
    category: "Motion",
    aspect_ratio: "tall",
    hue: 48,
    created_at: new Date(Date.now() - 45 * 86400000).toISOString(),
  },
  {
    id: "gal-008",
    event_id: null,
    event_title: "DIMISI Studio R&D",
    title: "Distributed Edge Node Cluster",
    caption: "High-density micro-datacenter architecture study for edge AI compute.",
    image_url:
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=85",
    category: "Environments",
    aspect_ratio: "normal",
    hue: 22,
    created_at: new Date(Date.now() - 50 * 86400000).toISOString(),
  },
];

class MemoryEventsStore {
  events: CompanyEvent[] = [...SEED_EVENTS];
  gallery: EventGalleryItem[] = [...SEED_GALLERY];

  getPublicPayload(): PublicEventsPayload {
    // Sort events: featured first, then upcoming, ongoing, then completed, then newest
    const sorted = [...this.events].sort((a, b) => {
      if (a.is_featured && !b.is_featured) return -1;
      if (!a.is_featured && b.is_featured) return 1;
      const statusWeight = { ongoing: 0, upcoming: 1, completed: 2 };
      const diff = statusWeight[a.status] - statusWeight[b.status];
      if (diff !== 0) return diff;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    const featuredEvent = sorted.find((e) => e.is_featured) ?? sorted[0] ?? null;

    const upcomingCount = this.events.filter((e) => e.status === "upcoming" || e.status === "ongoing").length;
    const completedCount = this.events.filter((e) => e.status === "completed").length;
    const attendeesServed = this.events.reduce((acc, e) => acc + (e.attendees_count || 0), 0);

    const categories = Array.from(new Set(this.events.map((e) => e.category)));

    return {
      events: sorted,
      featuredEvent,
      galleryItems: [...this.gallery].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      ),
      stats: {
        totalEvents: this.events.length,
        upcomingCount,
        completedCount,
        totalGalleryPhotos: this.gallery.length,
        attendeesServed,
      },
      categories,
    };
  }

  saveEvent(input: EventInput): CompanyEvent {
    const slug = input.slug || slugifyEvent(input.title);
    const existingIndex = input.id ? this.events.findIndex((e) => e.id === input.id) : -1;

    // If marked as featured, unfeature other events to keep one main spotlight
    if (input.is_featured) {
      for (const ev of this.events) {
        if (ev.id !== input.id) ev.is_featured = false;
      }
    }

    if (existingIndex >= 0) {
      const updated: CompanyEvent = {
        ...this.events[existingIndex]!,
        title: input.title.trim(),
        slug,
        date: input.date.trim(),
        start_time: input.start_time?.trim() || null,
        end_time: input.end_time?.trim() || null,
        location: input.location.trim(),
        venue_details: input.venue_details?.trim() || null,
        mode: input.mode || undefined,
        status: input.status,
        category: input.category.trim(),
        description: input.description.trim(),
        full_description: input.full_description.trim(),
        cover_image: input.cover_image.trim(),
        images: input.images && input.images.length > 0 ? input.images : [input.cover_image.trim()],
        is_featured: Boolean(input.is_featured),
        attendees_count: input.attendees_count ? Number(input.attendees_count) : null,
        registration_url: input.registration_url?.trim() || null,
        highlights: input.highlights?.filter(Boolean) || [],
        updated_at: new Date().toISOString(),
      };
      this.events[existingIndex] = updated;
      try {
        import("@/server/repositories/content.repository").then(({ contentRepository }) => {
          contentRepository.saveEvent(updated).catch(() => {});
        });
      } catch {}
      return updated;
    } else {
      const id = `evt-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const newEv: CompanyEvent = {
        id,
        title: input.title.trim(),
        slug,
        date: input.date.trim(),
        start_time: input.start_time?.trim() || null,
        end_time: input.end_time?.trim() || null,
        location: input.location.trim(),
        venue_details: input.venue_details?.trim() || null,
        mode: input.mode || undefined,
        status: input.status,
        category: input.category.trim(),
        description: input.description.trim(),
        full_description: input.full_description.trim(),
        cover_image: input.cover_image.trim(),
        images: input.images && input.images.length > 0 ? input.images : [input.cover_image.trim()],
        is_featured: Boolean(input.is_featured),
        attendees_count: input.attendees_count ? Number(input.attendees_count) : null,
        registration_url: input.registration_url?.trim() || null,
        highlights: input.highlights?.filter(Boolean) || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      this.events.unshift(newEv);
      try {
        import("@/server/repositories/content.repository").then(({ contentRepository }) => {
          contentRepository.saveEvent(newEv).catch(() => {});
        });
      } catch {}
      return newEv;
    }
  }

  deleteEvent(id: string): boolean {
    const lenBefore = this.events.length;
    this.events = this.events.filter((e) => e.id !== id);
    // Also unlink gallery items
    for (const g of this.gallery) {
      if (g.event_id === id) {
        g.event_id = null;
        g.event_title = null;
      }
    }
    try {
      import("@/server/repositories/content.repository").then(({ contentRepository }) => {
        contentRepository.deleteEvent(id).catch(() => {});
      });
    } catch {}
    return this.events.length < lenBefore;
  }

  saveGalleryItem(input: GalleryItemInput): EventGalleryItem {
    const linkedEvent = input.event_id ? this.events.find((e) => e.id === input.event_id) : null;
    const existingIndex = input.id ? this.gallery.findIndex((g) => g.id === input.id) : -1;

    if (existingIndex >= 0) {
      const updated: EventGalleryItem = {
        ...this.gallery[existingIndex]!,
        event_id: input.event_id ?? null,
        event_title: linkedEvent?.title ?? null,
        title: input.title.trim(),
        caption: input.caption.trim(),
        image_url: input.image_url.trim(),
        category: input.category.trim(),
        aspect_ratio: input.aspect_ratio ?? "normal",
        hue: input.hue ?? 30,
      };
      this.gallery[existingIndex] = updated;
      try {
        import("@/server/repositories/content.repository").then(({ contentRepository }) => {
          contentRepository.saveGalleryItem(updated).catch(() => {});
        });
      } catch {}
      return updated;
    } else {
      const id = `gal-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const newItem: EventGalleryItem = {
        id,
        event_id: input.event_id ?? null,
        event_title: linkedEvent?.title ?? null,
        title: input.title.trim(),
        caption: input.caption.trim(),
        image_url: input.image_url.trim(),
        category: input.category.trim(),
        aspect_ratio: input.aspect_ratio ?? "normal",
        hue: input.hue ?? 30,
        created_at: new Date().toISOString(),
      };
      this.gallery.unshift(newItem);
      try {
        import("@/server/repositories/content.repository").then(({ contentRepository }) => {
          contentRepository.saveGalleryItem(newItem).catch(() => {});
        });
      } catch {}
      return newItem;
    }
  }

  deleteGalleryItem(id: string): boolean {
    const lenBefore = this.gallery.length;
    this.gallery = this.gallery.filter((g) => g.id !== id);
    try {
      import("@/server/repositories/content.repository").then(({ contentRepository }) => {
        contentRepository.deleteGalleryItem(id).catch(() => {});
      });
    } catch {}
    return this.gallery.length < lenBefore;
  }
}

export const eventsStore = new MemoryEventsStore();
