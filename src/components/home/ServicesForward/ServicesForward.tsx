import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Globe,
  Smartphone,
  Cpu,
  Palette,
  Code2,
  Cloud,
  Compass,
  Wrench,
  TrendingUp,
  Server,
  Rocket,
  ArrowUpRight,
  Sparkles,
  Layers,
  Database,
  ShieldCheck,
} from "lucide-react";
import { Reveal } from "@/components/common/Reveal/Reveal";
import { TiltCard } from "@/components/common/TiltCard/TiltCard";
import { MagneticButton } from "@/components/common/MagneticButton/MagneticButton";
import { getPublicServicesData } from "@/lib/services.functions";
import styles from "./ServicesForward.module.css";

export interface ForwardServiceItem {
  number: string;
  title: string;
  tagline: string;
  icon: React.ComponentType<{ className?: string }>;
  route: string;
  badge?: string;
  isFeatured?: boolean;
}

function resolveServiceIcon(slug = "", category = ""): React.ComponentType<{ className?: string }> {
  const str = `${slug} ${category}`.toLowerCase();
  if (str.includes("web") || str.includes("site") || str.includes("front")) return Globe;
  if (str.includes("mobile") || str.includes("app") || str.includes("android") || str.includes("ios")) return Smartphone;
  if (str.includes("ai") || str.includes("ml") || str.includes("intel") || str.includes("bot") || str.includes("auto")) return Cpu;
  if (str.includes("design") || str.includes("ui") || str.includes("ux")) return Palette;
  if (str.includes("cloud") || str.includes("devops") || str.includes("infra")) return Cloud;
  if (str.includes("consult") || str.includes("advis")) return Compass;
  if (str.includes("support") || str.includes("maint")) return Wrench;
  if (str.includes("market") || str.includes("growth") || str.includes("seo")) return TrendingUp;
  if (str.includes("data") || str.includes("analytics")) return Database;
  if (str.includes("sec") || str.includes("cyber")) return ShieldCheck;
  if (str.includes("startup") || str.includes("launch")) return Rocket;
  if (str.includes("server") || str.includes("backend")) return Server;
  if (str.includes("soft") || str.includes("dev") || str.includes("custom")) return Code2;
  return Sparkles;
}

export const FORWARD_SERVICES: ForwardServiceItem[] = [
  {
    number: "01",
    title: "Web Development",
    tagline: "Scalable, high-performance websites and web applications tailored to a business.",
    icon: Globe,
    route: "/services/web-development",
    badge: "Full-Stack",
  },
  {
    number: "02",
    title: "Mobile App Development",
    tagline: "Native and cross-platform mobile experiences for iOS and Android.",
    icon: Smartphone,
    route: "/services/mobile-app",
    badge: "iOS & Android",
  },
  {
    number: "03",
    title: "AI & Automation",
    tagline: "Intelligent workflows, machine learning, and automation that reduce manual work.",
    icon: Cpu,
    route: "/services/ai",
    badge: "GenAI & LLMs",
  },
  {
    number: "04",
    title: "UI/UX Design",
    tagline: "User-centered interface design, systems, and prototypes that delight users.",
    icon: Palette,
    route: "/services/ui-ux",
    badge: "Design Systems",
  },
  {
    number: "05",
    title: "Software Development",
    tagline: "Custom software, MVPs, and enterprise applications built for scale.",
    icon: Code2,
    route: "/services/enterprise",
    badge: "Custom MVPs",
  },
  {
    number: "06",
    title: "Cloud Services",
    tagline: "Cloud architecture, migration, DevOps, and managed infrastructure on leading platforms.",
    icon: Cloud,
    route: "/services/cloud",
    badge: "DevOps & Cloud",
  },
  {
    number: "07",
    title: "IT Consulting",
    tagline: "Strategic technology advisory to align your roadmap with business outcomes.",
    icon: Compass,
    route: "/contact",
    badge: "Advisory",
  },
  {
    number: "08",
    title: "IT Support & Maintenance",
    tagline: "Reliable monitoring, support, and continuous improvement.",
    icon: Wrench,
    route: "/contact",
    badge: "24/7 SLA",
  },
  {
    number: "09",
    title: "Digital Marketing",
    tagline: "Growth-focused campaigns, SEO, content, and analytics to drive qualified leads.",
    icon: TrendingUp,
    route: "/contact",
    badge: "Growth & SEO",
  },
  {
    number: "10",
    title: "IT-Enabled Services (ITES)",
    tagline: "Back-office technical support and process outsourcing powered by modern tooling.",
    icon: Server,
    route: "/contact",
    badge: "Operations",
  },
  {
    number: "11",
    title: "Startup Mentorship",
    tagline: "Hands-on guidance for founders, from idea to product-fit and scaling.",
    icon: Rocket,
    route: "/contact",
    badge: "Founder Fit",
  },
];

export function ServicesForward() {
  // Live dynamic services query synced with MongoDB and Admin Panel
  const { data: payload } = useQuery({
    queryKey: ["publicServices"],
    queryFn: () => getPublicServicesData(),
    staleTime: 1000 * 60 * 5, // 5 min cache
  });

  // Curate services for Home: prioritize Admin 'is_featured' services, with smart fallback to FORWARD_SERVICES
  const displayServices: ForwardServiceItem[] = useMemo(() => {
    const liveServices = payload?.services?.filter((s) => s.is_active) || [];
    if (liveServices.length === 0) {
      return FORWARD_SERVICES;
    }

    const featured = liveServices.filter((s) => s.is_featured);
    const nonFeatured = liveServices.filter((s) => !s.is_featured);

    // If at least one service is marked as featured, showcase featured first
    const curatedList = featured.length > 0 ? [...featured, ...nonFeatured] : liveServices;

    // Show up to 6 or 9 services on Home (or all featured if more exist)
    const targetCount = Math.max(featured.length, 6);
    const finalServices = curatedList.slice(0, Math.min(targetCount, 12));

    return finalServices.map((srv, idx) => ({
      number: String(idx + 1).padStart(2, "0"),
      title: srv.title,
      tagline:
        srv.tagline ||
        (srv.summary ? srv.summary.slice(0, 95) + "..." : "Engineered for sustained business throughput."),
      icon: resolveServiceIcon(srv.slug, srv.category),
      route: `/services/${srv.slug}`,
      badge: srv.is_featured ? "Featured" : (srv.category || "Capability"),
      isFeatured: Boolean(srv.is_featured),
    }));
  }, [payload?.services]);

  return (
    <section className={styles.section} id="services-forward" aria-label="Services That Move You Forward">
      <div className={styles.container}>
        {/* Section Header */}
        <div className={styles.header}>
          <Reveal variant="fade">
            <div className={styles.badgeWrap}>
              <span className={styles.badgeDot} aria-hidden="true" />
              <span className={styles.badgeText}>03 · Capabilities & Disciplines</span>
            </div>
          </Reveal>

          <Reveal variant="up" delay={80}>
            <h2 className={styles.title}>
              Services That <span className={styles.gradientTitle}>Move You Forward</span>
            </h2>
          </Reveal>

          <Reveal variant="up" delay={140}>
            <p className={styles.subtitle}>
              From autonomous AI agents and cloud infrastructure to consumer mobile platforms and venture scaling — engineered for sustained performance.
            </p>
          </Reveal>
        </div>

        {/* Dynamic Services Grid */}
        <div className={styles.grid}>
          {displayServices.map((svc, i) => {
            const Icon = svc.icon;
            return (
              <Reveal key={`${svc.number}-${svc.title}`} delay={i * 45} className={styles.gridItem}>
                <Link to={svc.route as any} className={styles.cardLink}>
                  <TiltCard
                    className={[
                      styles.card,
                      svc.isFeatured ? styles.cardFeatured : "",
                    ].join(" ")}
                  >
                    <div className={styles.cardGlow} aria-hidden="true" />

                    <div className={styles.cardTop}>
                      <div className={styles.iconBox}>
                        <Icon className={styles.icon} />
                      </div>
                      <div className={styles.metaRow}>
                        {svc.badge && (
                          <span
                            className={[
                              styles.tagBadge,
                              svc.isFeatured ? styles.tagBadgeFeatured : "",
                            ].join(" ")}
                          >
                            {svc.isFeatured && (
                              <Sparkles size={10} className={styles.badgeStarIcon} />
                            )}
                            {svc.badge}
                          </span>
                        )}
                        <span className={styles.serviceNum}>{svc.number}</span>
                      </div>
                    </div>

                    <div className={styles.cardBody}>
                      <h3 className={styles.cardTitle}>
                        {svc.title}
                        <ArrowUpRight className={styles.arrowIcon} aria-hidden="true" />
                      </h3>
                      <p className={styles.cardTagline}>{svc.tagline}</p>
                    </div>

                    <div className={styles.cardFooter}>
                      <span className={styles.footerPrompt}>
                        <Sparkles className={styles.sparkleIcon} aria-hidden="true" />
                        Explore capability
                      </span>
                    </div>
                  </TiltCard>
                </Link>
              </Reveal>
            );
          })}
        </div>

        {/* Action Row */}
        <Reveal variant="up" delay={200}>
          <div className={styles.actionRow}>
            <MagneticButton to="/services">View Detailed Service Architectures</MagneticButton>
            <MagneticButton to="/contact" variant="ghost">
              Schedule Technical Consultation
            </MagneticButton>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
