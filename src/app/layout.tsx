import type { Metadata } from "next";
import type { ReactNode } from "react";

import "./globals.css";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { GlobalBackground } from "@/components/layout/GlobalBackground";

export const metadata: Metadata = {
  title: "Dimisi Technologies — Software, AI Automation & Cloud",
  description:
    "Dimisi Technologies builds premium software, AI automation, cloud, and web & mobile products — including Kalesh, CarryOn, Sylon, and Axis Conference Web.",
  authors: [{ name: "Dimisi Technologies" }],
  openGraph: {
    title: "Dimisi Technologies — Software, AI Automation & Cloud",
    description:
      "Premium software development, AI automation, and cloud engineering — plus our own products.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@Dimisi",
  },
  icons: {
    icon: "/just%20logo.svg",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700&family=Outfit:wght@300;400;500;600;700;800&display=swap"
        />
      </head>
      <body>
        <SmoothScroll />
        <GlobalBackground />
        <div className="relative flex min-h-screen flex-col bg-transparent text-foreground">
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
