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
import { useCallback, useEffect, useState, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Navbar } from "@/components/layout/Navbar/Navbar";
import { Footer } from "@/components/layout/Footer/Footer";
import { RobotGuide } from "@/components/robot/RobotGuide/RobotGuide";
import { GrainOverlay } from "@/components/effects/GrainOverlay/GrainOverlay";
import { ScrollProgress } from "@/components/effects/ScrollProgress/ScrollProgress";
import { CinematicStage } from "@/components/three/CinematicStage/CinematicStage";
import { VideoPreloader } from "@/components/loader/VideoPreloader/VideoPreloader";
import { VisitorTracker } from "@/components/VisitorTracker/VisitorTracker";
import { useSmoothScroll } from "@/hooks/useSmoothScroll";

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
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
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

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "DIMISI Technologies Pvt Ltd — Technology Beyond Limits" },
      {
        name: "description",
        content:
          "DIMISI Technologies builds futuristic AI products, automation systems and immersive digital experiences for businesses worldwide.",
      },
      { name: "author", content: "DIMISI Technologies" },
      { name: "theme-color", content: "#050505" },
      { property: "og:title", content: "DIMISI Technologies Pvt Ltd — Technology Beyond Limits" },
      {
        property: "og:description",
        content:
          "Futuristic AI products, automation systems and immersive digital experiences.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
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
      </head>
      <body suppressHydrationWarning>
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
  useSmoothScroll();
  // The cinematic intro plays on every page load / refresh, before the site appears.
  const [intro, setIntro] = useState(true);
  useEffect(() => {
    if (isAdmin) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isAdmin]);
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
      {intro ? null : <CinematicStage />}
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
