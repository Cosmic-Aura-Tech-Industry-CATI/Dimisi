"use client";

import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { PageHero } from "@/components/ui/PageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { ArrowUpRight } from "lucide-react";

const categories = [
  "All",
  "Web Development",
  "Mobile Development",
  "AI & Automation",
  "Cloud Computing",
  "Startup Guides",
  "Technology Trends",
  "Product Updates",
  "Company Announcements",
];

const posts = [
  {
    title: "Designing for Scale from Day One",
    category: "Web Development",
    excerpt: "How to architect systems that grow with you without over-engineering early.",
    date: "Coming soon",
  },
  {
    title: "Practical AI Automation for Small Teams",
    category: "AI & Automation",
    excerpt: "Where AI actually creates leverage — and where it doesn't.",
    date: "Coming soon",
  },
  {
    title: "A Founder's Guide to Shipping an MVP",
    category: "Startup Guides",
    excerpt: "The minimum you need to learn the maximum from your first users.",
    date: "Coming soon",
  },
  {
    title: "Cloud Cost Optimization Without the Pain",
    category: "Cloud Computing",
    excerpt: "Simple habits that keep your infrastructure lean as you scale.",
    date: "Coming soon",
  },
  {
    title: "Building Great Mobile Experiences",
    category: "Mobile Development",
    excerpt: "Performance, polish, and patterns that make mobile apps feel effortless.",
    date: "Coming soon",
  },
  {
    title: "What We're Building Next",
    category: "Product Updates",
    excerpt: "A behind-the-scenes look at our product roadmap and priorities.",
    date: "Coming soon",
  },
];

export default function BlogPageClient() {
  const [active, setActive] = useState("All");
  const filtered =
    active === "All" ? posts : posts.filter((p) => p.category === active);

  return (
    <>
      <PageHero
        label="Blog"
        title={
          <span className="inline-flex flex-col items-center gap-10 text-left sm:flex-row sm:justify-center sm:text-left">
            <span className="flex-shrink-0 w-full max-w-[320px] sm:w-auto">
              <Image
                src="/Bhootdev blog.svg"
                alt="Bhootdev blog logo"
                width={320}
                height={320}
                className="h-auto w-full"
              />
            </span>
            <span className="max-w-2xl">
              <span className="block text-[clamp(40px,6vw,72px)] font-light leading-tight tracking-tight text-foreground">
                Ideas, Insights
              </span>
              <span className="block text-[clamp(34px,5vw,62px)] font-light leading-tight tracking-tight text-foreground">
                & Updates
              </span>
            </span>
          </span>
        }
        subtitle="Thoughts on building software, shipping products, and the technology shaping tomorrow."
      />

      <section className="bg-[#050505] px-4 py-24 md:px-8">
        <div className="mx-auto max-w-7xl">
          {/*
          <SectionHeading label="Latest" title="Blog section under development" subtitle="Please visit again after some time." />
          */}

          {/*
          <Reveal className="mt-10 flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActive(cat)}
                className={`rounded-full border px-4 py-2 text-xs font-medium transition-all duration-300 ${
                  active === cat
                    ? "border-foreground bg-primary text-primary-foreground"
                    : "border-foreground/15 text-foreground/60 hover:border-foreground/30 hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </Reveal>

          <motion.div layout className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {filtered.map((post) => (
                <motion.article
                  key={post.title}
                  layout
                  layoutId={post.title}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.35, ease: "easeInOut" }}
                  whileHover={{ y: -4 }}
                  className="group flex h-full flex-col rounded-2xl border border-foreground/10 p-6 transition-colors duration-300 hover:border-foreground/30 hover:bg-foreground/[0.02]"
                >
                  <div className="mb-6 aspect-[16/10] w-full rounded-xl border border-foreground/10 bg-foreground/[0.02]" />
                  <p className="text-xs uppercase tracking-wider text-foreground/40">{post.category}</p>
                  <h3 className="mt-2 flex items-start gap-1.5 text-lg font-medium text-foreground">
                    {post.title}
                    <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-foreground/40 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground" />
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-foreground/50">{post.excerpt}</p>
                  <span className="mt-4 text-xs text-foreground/40">{post.date}</span>
                </motion.article>
              ))}
            </AnimatePresence>
          </motion.div>
          */}

          <div className="mt-20 flex flex-col items-center justify-center gap-10 text-center">
            <p className="max-w-3xl text-2xl font-medium leading-relaxed text-foreground/70 sm:text-3xl">
              Blog section under development. Please visit again after some time.
            </p>
            <div className="w-full max-w-3xl px-6 sm:px-0">
              <Image
                src="/under contruction.svg"
                alt="Under construction"
                width={900}
                height={600}
                className="w-full max-w-full"
              />
            </div>
          </div>

          {filtered.length === 0 ? (
            <p className="mt-12 text-center text-sm text-foreground/40">
              No posts in this category yet — check back soon.
            </p>
          ) : null}
        </div>
      </section>
    </>
  );
}
