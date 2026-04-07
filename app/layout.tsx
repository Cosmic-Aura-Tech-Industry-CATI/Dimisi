import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import LayoutClient from "./LayoutClient";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Demisi | High-Conversion SaaS",
  description: "Earn revenue by selling anything from the internet on your app.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <LayoutClient interVariable={inter.variable}>
        {children}
      </LayoutClient>
    </html>
  );
}
