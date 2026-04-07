"use client";

import SmoothScroll from "@/components/SmoothScroll";
import CursorGlow from "@/components/CursorGlow";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { usePathname } from "next/navigation";

export default function LayoutClient({
  children,
  interVariable,
}: {
  children: React.ReactNode;
  interVariable: string;
}) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login" || pathname === "/signup";

  return (
    <body className={`${interVariable} min-h-full flex flex-col bg-background text-foreground selection:bg-blue-500/30 overflow-x-hidden`}>
      <SmoothScroll>
        <CursorGlow />
        {!isAuthPage && <Navbar />}
        {children}
        {!isAuthPage && <Footer />}
      </SmoothScroll>
    </body>
  );
}
