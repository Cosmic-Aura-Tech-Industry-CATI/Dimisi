import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useCallback, useEffect, useState, lazy, Suspense, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportAppError } from "../lib/app-error-reporting";
import { Navbar } from "@/components/layout/Navbar/Navbar";
import { Footer } from "@/components/layout/Footer/Footer";
import { RobotGuide } from "@/components/robot/RobotGuide/RobotGuide";
import { GrainOverlay } from "@/components/effects/GrainOverlay/GrainOverlay";
import { ScrollProgress } from "@/components/effects/ScrollProgress/ScrollProgress";
import { VideoPreloader } from "@/components/loader/VideoPreloader/VideoPreloader";
import { VisitorTracker } from "@/components/VisitorTracker/VisitorTracker";
import { useSmoothScroll } from "@/hooks/useSmoothScroll";

const CinematicStage = lazy(() =>
  import("@/components/three/CinematicStage/CinematicStage").then((m) => ({
    default: m.CinematicStage,
  })),
);

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  const isStaleChunkError =
    error instanceof TypeError &&
    /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module/i.test(
      error.message,
    );
  useEffect(() => {
    reportAppError(error, { boundary: "tanstack_root_error_component" });
    if (!isStaleChunkError) return;

    const recoveryKey = `dm:chunk-recovery:${window.location.pathname}`;
    if (window.sessionStorage.getItem(recoveryKey) === "pending") {
      window.sessionStorage.removeItem(recoveryKey);
      return;
    }

    window.sessionStorage.setItem(recoveryKey, "pending");
    window.location.reload();
  }, [error, isStaleChunkError]);

  if (isStaleChunkError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <p className="text-sm text-muted-foreground">Loading the latest version…</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

const ORGANIZATION_JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://www.dimisi.tech/#organization",
      name: "DIMISI Technologies Pvt Ltd",
      legalName: "DIMISI Technologies Private Limited",
      url: "https://www.dimisi.tech",
      logo: "https://www.dimisi.tech/dimisi-silver-logo.png",
      description:
        "DIMISI Technologies engineers autonomous AI agents, computer vision, cinematic WebGL experiences, and scalable enterprise software architectures.",
      foundingDate: "2024",
      sameAs: [
        "https://www.linkedin.com/company/dimisi-technologies",
        "https://twitter.com/dimisitech",
        "https://github.com/dimisitech",
        "https://www.instagram.com/dimisitech",
        "https://thekalesh.com",
      ],
      address: {
        "@type": "PostalAddress",
        addressLocality: "Kanpur",
        addressRegion: "Uttar Pradesh",
        addressCountry: "IN",
      },
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "Customer Support & Technical Inquiries",
        email: "contact@dimisi.tech",
        telephone: "+91-9450346850",
        availableLanguage: ["English", "Hindi"],
      },
      knowsAbout: [
        "Artificial Intelligence",
        "Autonomous Agents",
        "Computer Vision",
        "WebGL",
        "Three.js",
        "Cloud Architecture",
        "Full-Stack Software Engineering",
        "Distributed Systems",
      ],
    },
    {
      "@type": "WebSite",
      "@id": "https://www.dimisi.tech/#website",
      url: "https://www.dimisi.tech",
      name: "DIMISI Technologies",
      publisher: {
        "@id": "https://www.dimisi.tech/#organization",
      },
      potentialAction: {
        "@type": "SearchAction",
        target: "https://www.dimisi.tech/services?q={search_term_string}",
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "DIMISI Technologies Pvt Ltd — Enterprise AI, WebGL & Scalable Software" },
      {
        name: "description",
        content:
          "DIMISI Technologies engineers autonomous AI agents, computer vision, cinematic WebGL experiences, and scalable enterprise software architectures for visionary teams worldwide.",
      },
      {
        name: "keywords",
        content:
          "DIMISI Technologies, Autonomous Agents, AI Development, WebGL 3D, Enterprise Software Engineering, Computer Vision, Scalable Architecture, Full-Stack Development, Three.js",
      },
      { name: "author", content: "DIMISI Technologies" },
      { name: "theme-color", content: "#050505" },
      {
        name: "robots",
        content: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
      },
      { name: "googlebot", content: "index, follow, max-snippet:-1, max-image-preview:large" },
      { name: "bingbot", content: "index, follow, max-snippet:-1, max-image-preview:large" },
      { property: "og:site_name", content: "DIMISI Technologies" },
      {
        property: "og:title",
        content: "DIMISI Technologies Pvt Ltd — Enterprise AI, WebGL & Scalable Software",
      },
      {
        property: "og:description",
        content:
          "Autonomous AI agents, computer vision, cinematic WebGL, and resilient enterprise software engineered end to end.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://www.dimisi.tech/" },
      { property: "og:image", content: "https://www.dimisi.tech/images/about/global-network.png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "DIMISI Technologies — Technology Beyond Limits" },
      { property: "og:locale", content: "en_US" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@dimisitech" },
      { name: "twitter:creator", content: "@dimisitech" },
      {
        name: "twitter:title",
        content: "DIMISI Technologies Pvt Ltd — Enterprise AI, WebGL & Scalable Software",
      },
      {
        name: "twitter:description",
        content:
          "Autonomous AI agents, computer vision, cinematic WebGL, and scalable enterprise software architectures.",
      },
      { name: "twitter:image", content: "https://www.dimisi.tech/images/about/global-network.png" },
    ],
    links: [
      { rel: "canonical", href: "https://www.dimisi.tech/" },
      { rel: "sitemap", type: "application/xml", title: "Sitemap", href: "/sitemap.xml" },
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.png", type: "image/png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@400;500;600;700&family=Sora:wght@300;400;500;600;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION_JSON_LD) }}
        />
      </head>
      <body suppressHydrationWarning>
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[99999] focus:px-4 focus:py-2 focus:bg-[#ff7a00] focus:text-black focus:font-semibold focus:rounded-md focus:shadow-xl focus:outline-none"
        >
          Skip to main content
        </a>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isAdmin = pathname.startsWith("/dimisi-admin");
  useSmoothScroll(isAdmin);
  // The cinematic intro plays on first visit per browser session, before the site appears.
  const [intro, setIntro] = useState(false);

  useEffect(() => {
    try {
      if (window.sessionStorage.getItem("dimisi_intro_seen") === "1") return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const conn = (
        navigator as Navigator & {
          connection?: { saveData?: boolean; effectiveType?: string };
        }
      ).connection;
      if (conn?.saveData || conn?.effectiveType === "2g" || conn?.effectiveType === "slow-2g") {
        return;
      }
      setIntro(true);
    } catch {
      setIntro(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin || !intro) {
      document.body.style.overflow = "";
      return;
    }
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isAdmin, intro]);

  useEffect(() => {
    const recoverFromStalePreload = (event: Event) => {
      event.preventDefault();
      const recoveryKey = `dm:preload-recovery:${window.location.pathname}`;
      if (window.sessionStorage.getItem(recoveryKey) === "pending") {
        window.sessionStorage.removeItem(recoveryKey);
        return;
      }
      window.sessionStorage.setItem(recoveryKey, "pending");
      window.location.reload();
    };

    window.addEventListener("vite:preloadError", recoverFromStalePreload);
    return () => window.removeEventListener("vite:preloadError", recoverFromStalePreload);
  }, []);

  const finishIntro = useCallback(() => {
    try {
      window.sessionStorage.setItem("dimisi_intro_seen", "1");
    } catch {}
    document.body.style.overflow = "";
    setIntro(false);
  }, []);

  if (isAdmin) {
    return (
      <QueryClientProvider client={queryClient}>
        <Outlet />
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <VisitorTracker />
      {intro ? <VideoPreloader onDone={finishIntro} /> : null}
      {intro ? null : (
        <Suspense fallback={null}>
          <CinematicStage />
        </Suspense>
      )}
      <Navbar />
      <ScrollProgress />
      <main id="content">
        {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
        <Outlet />
      </main>
      <Footer />
      <RobotGuide />
      <GrainOverlay />
    </QueryClientProvider>
  );
}
