"use client";

import { useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";
import { ArrowRight } from "lucide-react";

import { caseStudies } from "@/lib/site-data";
import { OutlineButton, ParallaxSection } from "./section-kit";

// Maps each case study, in order, to its animation. Adjust this order
// if your caseStudies array order changes, or add a `scene` field to
// your data instead and read it directly (study.scene).
const SCENE_BY_INDEX = ["travel", "social", "service", "college"] as const;
type Scene = (typeof SCENE_BY_INDEX)[number];

// Neutral line-art in text-foreground, one accent glow per scene in
// text-primary (your theme color) — premium, thin-stroke, but each
// scene still literally depicts its industry. Each scene now tells a
// small, looping story rather than a single repeating gesture.

function TravelScene() {
  return (
    <div className="cs-scene">
      <svg viewBox="0 0 400 160" className="h-full w-full text-foreground">
        {/* horizon + sun, softly breathing */}
        <circle cx="336" cy="34" r="14" className="text-primary cs-sun-glow" fill="none" stroke="currentColor" strokeOpacity="0.5" strokeWidth="1" />
        <g className="cs-parallax-far">
          <path d="M280 46 L296 32 L312 46" fill="none" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1" />
        </g>
        <g className="cs-parallax-near">
          <path d="M40 50 L58 30 L78 50" fill="none" stroke="currentColor" strokeOpacity="0.2" strokeWidth="1" />
        </g>

        {/* a planned route between two pins — the "trip" itself */}
        <path
          d="M46 138 Q 200 18 354 46"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="3 7"
          className="text-primary cs-route-line"
        />
        <circle cx="46" cy="138" r="3" fill="none" stroke="currentColor" strokeWidth="1.25" className="text-primary" />
        <circle
          r="2.5"
          fill="currentColor"
          className="text-primary cs-travel-dot"
          style={{ offsetPath: "path('M46 138 Q 200 18 354 46')" }}
        />
        <g className="cs-pin-drop">
          <circle cx="354" cy="38" r="9" fill="currentColor" className="text-primary" />
          <path d="M345 44 L354 62 L363 44 Z" fill="currentColor" className="text-primary" />
          <circle cx="354" cy="38" r="3.5" fill="var(--background, #0a0a0a)" />
        </g>
        <circle cx="354" cy="62" r="3" fill="none" stroke="currentColor" strokeWidth="1" className="text-primary cs-pin-ping" />

        {/* road */}
        <line x1="0" y1="122" x2="400" y2="122" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1" />
        <line
          x1="0" y1="122" x2="400" y2="122"
          stroke="currentColor" strokeOpacity="0.5" strokeWidth="1.5"
          strokeDasharray="10 12" className="cs-road-dash"
        />

        {/* car */}
        <g className="cs-car">
          <g className="cs-wheel-l">
            <circle cx="14" cy="108" r="7" fill="none" stroke="currentColor" strokeWidth="1.25" />
            <line x1="14" y1="102" x2="14" y2="114" stroke="currentColor" strokeWidth="0.75" opacity="0.6" />
          </g>
          <g className="cs-wheel-r">
            <circle cx="48" cy="108" r="7" fill="none" stroke="currentColor" strokeWidth="1.25" />
            <line x1="48" y1="102" x2="48" y2="114" stroke="currentColor" strokeWidth="0.75" opacity="0.6" />
          </g>
          <path
            d="M2 101 L10 101 L18 86 L44 86 L52 101 L60 101 L60 101 L60 104 L2 104 Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinejoin="round"
          />
          <line x1="20" y1="86" x2="24" y2="101" stroke="currentColor" strokeWidth="0.75" opacity="0.6" />
          <circle cx="60" cy="94" r="2" className="text-primary cs-headlight" fill="currentColor" />
        </g>
      </svg>
    </div>
  );
}

function SocialScene() {
  return (
    <div className="cs-scene">
      <svg viewBox="0 0 400 160" className="h-full w-full text-foreground">
        <defs>
          <linearGradient id="cs-story-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.9" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.05" />
          </linearGradient>
        </defs>

        {/* profile avatar with a rotating "story" ring */}
        <g className="text-primary cs-story-ring">
          <circle cx="88" cy="82" r="28" fill="none" stroke="url(#cs-story-grad)" strokeWidth="2" strokeLinecap="round" strokeDasharray="132 44" />
        </g>
        <circle cx="88" cy="82" r="21" fill="none" stroke="currentColor" strokeOpacity="0.3" strokeWidth="1" />
        <circle cx="88" cy="74" r="6.5" fill="none" stroke="currentColor" strokeOpacity="0.4" strokeWidth="1" />
        <path d="M74 94 q14 -13 28 0" fill="none" stroke="currentColor" strokeOpacity="0.4" strokeWidth="1" />

        {/* phone */}
        <rect x="164" y="24" width="72" height="120" rx="10" fill="none" stroke="currentColor" strokeOpacity="0.4" strokeWidth="1.25" />
        <line x1="188" y1="32" x2="212" y2="32" stroke="currentColor" strokeOpacity="0.3" strokeWidth="1.5" strokeLinecap="round" />
        <rect x="176" y="46" width="48" height="48" rx="4" fill="none" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1" />

        {/* like heart, double-tap pulse with a small sparkle burst */}
        <path
          d="M200 84 C193 74 178 78 178 90 C178 100 200 112 200 112 C200 112 222 100 222 90 C222 78 207 74 200 84 Z"
          className="text-primary cs-heart"
          fill="currentColor"
        />
        <circle cx="185" cy="80" r="1.4" fill="currentColor" className="text-primary cs-spark-a" />
        <circle cx="215" cy="80" r="1.4" fill="currentColor" className="text-primary cs-spark-b" />
        <circle cx="200" cy="66" r="1.4" fill="currentColor" className="text-primary cs-spark-c" />

        {/* comment bubble rising */}
        <g className="cs-bubble-rise">
          <rect x="252" y="0" width="40" height="26" rx="8" fill="none" stroke="currentColor" strokeOpacity="0.45" strokeWidth="1" />
          <path d="M262 26 L258 34 L268 26 Z" fill="none" stroke="currentColor" strokeOpacity="0.45" strokeWidth="1" />
          <line x1="260" y1="10" x2="284" y2="10" stroke="currentColor" strokeOpacity="0.4" strokeWidth="1" />
          <line x1="260" y1="17" x2="276" y2="17" stroke="currentColor" strokeOpacity="0.4" strokeWidth="1" />
        </g>

        {/* notification badge */}
        <circle cx="228" cy="30" r="6" className="text-primary cs-badge" fill="currentColor" />
        <text x="228" y="33" fontSize="8" textAnchor="middle" fill="var(--background, #0a0a0a)" fontWeight="600">
          +1
        </text>
      </svg>
    </div>
  );
}

function ServiceScene() {
  return (
    <div className="cs-scene">
      <svg viewBox="0 0 400 160" className="h-full w-full text-foreground">
        {/* ground */}
        <line x1="0" y1="130" x2="400" y2="130" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1" />

        {/* house / doorway */}
        <path d="M300 130 V86 L330 62 L360 86 V130" fill="none" stroke="currentColor" strokeOpacity="0.4" strokeWidth="1.25" strokeLinejoin="round" />
        <rect x="318" y="102" width="18" height="28" fill="none" stroke="currentColor" strokeOpacity="0.4" strokeWidth="1" />
        <circle cx="331" cy="116" r="1.6" className="text-primary cs-doorbell" fill="currentColor" />

        {/* job-confirmed checkmark, appears on arrival */}
        <g className="text-primary cs-check-confirm">
          <circle cx="331" cy="72" r="10" fill="none" stroke="currentColor" strokeWidth="1" />
          <path d="M326 72 L330 76 L338 66" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </g>

        {/* walking service provider carrying a bag, with a live-tracking blip */}
        <g className="cs-walk">
          <circle cx="0" cy="80" r="1.8" fill="currentColor" className="text-primary cs-tracking-ping" />
          <circle cx="0" cy="80" r="1.8" fill="none" stroke="currentColor" strokeWidth="1" className="text-primary cs-tracking-ping-ring" />

          <circle cx="0" cy="86" r="7" fill="none" stroke="currentColor" strokeWidth="1.25" />
          <line x1="0" y1="93" x2="0" y2="112" stroke="currentColor" strokeWidth="1.25" />
          <line x1="0" y1="112" x2="-7" y2="128" stroke="currentColor" strokeWidth="1.25" className="cs-leg-a" />
          <line x1="0" y1="112" x2="7" y2="128" stroke="currentColor" strokeWidth="1.25" className="cs-leg-b" />
          <line x1="0" y1="98" x2="-9" y2="108" stroke="currentColor" strokeWidth="1.25" />
          <line x1="0" y1="98" x2="8" y2="106" stroke="currentColor" strokeWidth="1.25" className="cs-arm-bag" />
          <rect x="4" y="104" width="12" height="14" rx="2" fill="none" stroke="currentColor" strokeWidth="1.1" className="cs-bag" />
        </g>
      </svg>
    </div>
  );
}

function CollegeScene() {
  return (
    <div className="cs-scene">
      <svg viewBox="0 0 400 160" className="h-full w-full text-foreground">
        {/* academic hall */}
        <line x1="30" y1="128" x2="150" y2="128" stroke="currentColor" strokeOpacity="0.4" strokeWidth="1.25" />
        <path d="M28 96 L90 66 L152 96" fill="none" stroke="currentColor" strokeOpacity="0.4" strokeWidth="1.25" strokeLinejoin="round" />
        {[46, 66, 90, 114, 134].map((x, i) => (
          <line key={i} x1={x} y1="96" x2={x} y2="128" stroke="currentColor" strokeOpacity="0.35" strokeWidth="1" />
        ))}

        {/* graduation cap toss, with a small confetti burst at its peak */}
        <g className="cs-cap-float">
          <path d="M90 44 L118 54 L90 64 L62 54 Z" fill="none" stroke="currentColor" strokeWidth="1.25" className="text-primary" strokeLinejoin="round" />
          <line x1="90" y1="64" x2="90" y2="74" stroke="currentColor" strokeWidth="1" className="text-primary" opacity="0.7" />
          <circle cx="90" cy="76" r="1.6" fill="currentColor" className="text-primary" />
        </g>
        <line x1="72" y1="42" x2="76" y2="36" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" className="text-primary cs-confetti-a" />
        <line x1="108" y1="42" x2="104" y2="36" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" className="text-primary cs-confetti-b" />
        <line x1="90" y1="34" x2="90" y2="26" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" className="text-primary cs-confetti-c" />

        {/* meeting table with avatars, quietly networked together */}
        <ellipse cx="290" cy="122" rx="54" ry="12" fill="none" stroke="currentColor" strokeOpacity="0.35" strokeWidth="1" />
        <g className="text-primary cs-meet-links">
          <line x1="246" y1="96" x2="290" y2="88" stroke="currentColor" strokeWidth="0.75" />
          <line x1="290" y1="88" x2="334" y2="96" stroke="currentColor" strokeWidth="0.75" />
        </g>
        {[
          { cx: 246, cy: 96 },
          { cx: 290, cy: 88 },
          { cx: 334, cy: 96 },
        ].map((p, i) => (
          <g key={i}>
            <circle cx={p.cx} cy={p.cy} r="8" fill="none" stroke="currentColor" strokeOpacity="0.5" strokeWidth="1.1" />
            <line x1={p.cx} y1={p.cy + 8} x2={p.cx} y2={p.cy + 20} stroke="currentColor" strokeOpacity="0.5" strokeWidth="1.1" />
          </g>
        ))}
        {[0, 1, 2].map((i) => (
          <circle
            key={i}
            cx={278 + i * 8}
            cy="70"
            r="2"
            className="text-primary cs-talk-dot"
            fill="currentColor"
            style={{ animationDelay: `${i * 0.25}s` }}
          />
        ))}
      </svg>
    </div>
  );
}

function CaseStudyAnimation({ scene }: { scene: Scene }) {
  switch (scene) {
    case "travel":
      return <TravelScene />;
    case "social":
      return <SocialScene />;
    case "service":
      return <ServiceScene />;
    case "college":
      return <CollegeScene />;
  }
}

function CaseStudyCard({
  study,
  scene,
}: {
  study: (typeof caseStudies)[number];
  scene: Scene;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(
    useTransform(mouseY, [-0.5, 0.5], [4, -4]),
    { stiffness: 200, damping: 20, mass: 0.5 }
  );
  const rotateY = useSpring(
    useTransform(mouseX, [-0.5, 0.5], [-4, 4]),
    { stiffness: 200, damping: 20, mass: 0.5 }
  );

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    mouseX.set(x);
    mouseY.set(y);
  }

  function handleMouseLeave() {
    mouseX.set(0);
    mouseY.set(0);
  }

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
        perspective: 800,
      }}
      className="group relative flex w-full flex-col overflow-hidden rounded-2xl border border-foreground/10 bg-foreground/[0.02] transition-colors duration-300 hover:border-foreground/45 hover:bg-foreground/[0.065] hover:shadow-[0_0_46px_-11px_rgba(255,255,255,0.32)] md:flex-row md:items-stretch"
    >
      <div
        style={{ transform: "translateZ(20px)", transformStyle: "preserve-3d" }}
        className="relative flex flex-1 flex-col justify-center p-8 md:p-10"
      >
        <span className="text-xs uppercase tracking-widest text-foreground/40 transition-colors duration-300 group-hover:text-foreground/60">
          {study.category}
        </span>

        <h3 className="mt-4 font-display text-xl font-light text-foreground/90 transition-colors duration-300 group-hover:text-foreground md:text-2xl">
          {study.title}
        </h3>

        <p className="mt-3 text-sm leading-relaxed text-foreground/50 transition-colors duration-300 group-hover:text-foreground/80">
          {study.overview}
        </p>

        <p className="mt-4 border-t border-foreground/10 pt-4 text-sm leading-relaxed text-foreground/60 transition-colors duration-300 group-hover:text-foreground/80">
          {study.outcome}
        </p>

        <a
          href={study.websiteUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-6 inline-flex items-center gap-2 self-start rounded-full border border-foreground/20 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
        >
          Visit Website
          <ArrowRight className="h-4 w-4" />
        </a>
      </div>

      <div className="relative h-48 w-full shrink-0 md:h-auto md:w-[42%]">
        <CaseStudyAnimation scene={scene} />
      </div>

    </motion.div>
  );
}

// Plain <style> tag (not styled-jsx) so these animations run regardless of
// your compiler setup (works with Turbopack, Babel, SWC, anything). Render
// this once near the top of CaseStudiesSection, not per-card.
//
// Note: the travel scene's moving dot uses CSS offset-path/offset-distance
// (supported in all evergreen browsers, incl. Safari 16+). Where unsupported
// the dot simply stays put — the route, pins, and car still animate normally.
function CaseStudySceneStyles() {
  return (
    <style>{`
      .cs-scene {
        position: relative;
        width: 100%;
        height: 100%;
      }

      /* Travel */
      .cs-sun-glow {
        animation: cs-sun-breathe 4s ease-in-out infinite;
        transform-box: fill-box;
        transform-origin: center;
      }
      @keyframes cs-sun-breathe {
        0%, 100% { opacity: 0.4; transform: scale(1); }
        50% { opacity: 0.85; transform: scale(1.08); }
      }
      .cs-parallax-far {
        animation: cs-drift-far 11s ease-in-out infinite;
      }
      @keyframes cs-drift-far {
        0%, 100% { transform: translateX(0); }
        50% { transform: translateX(-10px); }
      }
      .cs-parallax-near {
        animation: cs-drift-near 8s ease-in-out infinite;
      }
      @keyframes cs-drift-near {
        0%, 100% { transform: translateX(0); }
        50% { transform: translateX(-16px); }
      }
      .cs-route-line {
        animation: cs-route-fade 6s ease-in-out infinite;
      }
      @keyframes cs-route-fade {
        0%, 100% { opacity: 0.15; }
        50% { opacity: 0.4; }
      }
      .cs-travel-dot {
        offset-rotate: 0deg;
        animation: cs-travel-move 6s ease-in-out infinite;
      }
      @keyframes cs-travel-move {
        0% { offset-distance: 0%; opacity: 0; }
        8% { opacity: 1; }
        46% { offset-distance: 100%; opacity: 1; }
        52% { opacity: 0; }
        100% { offset-distance: 0%; opacity: 0; }
      }
      .cs-pin-drop {
        animation: cs-pin-drop 6s ease-in-out infinite;
        transform-box: fill-box;
        transform-origin: bottom center;
      }
      @keyframes cs-pin-drop {
        0%, 40% { transform: translateY(-6px); opacity: 0; }
        46% { transform: translateY(2px); opacity: 1; }
        50% { transform: translateY(-2px); }
        54%, 96% { transform: translateY(0); opacity: 1; }
        100% { transform: translateY(-6px); opacity: 0; }
      }
      .cs-pin-ping {
        animation: cs-pin-ping 6s ease-out infinite;
        transform-box: fill-box;
        transform-origin: center;
      }
      @keyframes cs-pin-ping {
        0%, 50% { transform: scale(0.6); opacity: 0; }
        58% { transform: scale(1.6); opacity: 0.6; }
        74%, 100% { transform: scale(2.4); opacity: 0; }
      }
      .cs-road-dash {
        animation: cs-dash 1.1s linear infinite;
      }
      @keyframes cs-dash {
        to { stroke-dashoffset: -22; }
      }
      .cs-car {
        animation: cs-drive 6s ease-in-out infinite;
      }
      @keyframes cs-drive {
        0%   { transform: translateX(-70px) translateY(0); }
        48%  { transform: translateX(430px) translateY(-1px); }
        52%  { transform: translateX(430px) translateY(0); }
        100% { transform: translateX(-70px) translateY(0); }
      }
      .cs-wheel-l,
      .cs-wheel-r {
        animation: cs-spin 0.8s linear infinite;
        transform-box: fill-box;
        transform-origin: center;
      }
      @keyframes cs-spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      .cs-headlight {
        animation: cs-headlight-glow 1.6s ease-in-out infinite;
      }
      @keyframes cs-headlight-glow {
        0%, 100% { opacity: 0.5; }
        50% { opacity: 1; }
      }

      /* Social */
      .cs-story-ring {
        animation: cs-ring-spin 4s linear infinite;
        transform-box: fill-box;
        transform-origin: center;
      }
      @keyframes cs-ring-spin {
        to { transform: rotate(360deg); }
      }
      .cs-heart {
        animation: cs-heart-pulse 2.6s ease-in-out infinite;
        transform-box: fill-box;
        transform-origin: center;
      }
      @keyframes cs-heart-pulse {
        0%, 60%, 100% { transform: scale(0.85); opacity: 0.5; }
        68% { transform: scale(1.15); opacity: 1; }
        78% { transform: scale(1); opacity: 1; }
      }
      .cs-spark-a, .cs-spark-b, .cs-spark-c {
        transform-box: fill-box;
        transform-origin: center;
        animation-duration: 2.6s;
        animation-timing-function: ease-out;
        animation-iteration-count: infinite;
      }
      .cs-spark-a { animation-name: cs-spark-a; }
      .cs-spark-b { animation-name: cs-spark-b; }
      .cs-spark-c { animation-name: cs-spark-c; }
      @keyframes cs-spark-a {
        0%, 60%, 100% { opacity: 0; transform: translate(0, 0) scale(0.4); }
        70% { opacity: 1; transform: translate(-10px, -6px) scale(1); }
        85% { opacity: 0; transform: translate(-16px, -10px) scale(0.6); }
      }
      @keyframes cs-spark-b {
        0%, 60%, 100% { opacity: 0; transform: translate(0, 0) scale(0.4); }
        70% { opacity: 1; transform: translate(10px, -6px) scale(1); }
        85% { opacity: 0; transform: translate(16px, -10px) scale(0.6); }
      }
      @keyframes cs-spark-c {
        0%, 60%, 100% { opacity: 0; transform: translate(0, 0) scale(0.4); }
        70% { opacity: 1; transform: translate(0, -12px) scale(1); }
        85% { opacity: 0; transform: translate(0, -18px) scale(0.6); }
      }
      .cs-bubble-rise {
        animation: cs-bubble-up 3.2s ease-out infinite;
      }
      @keyframes cs-bubble-up {
        0% { transform: translateY(30px); opacity: 0; }
        20% { opacity: 1; }
        70% { opacity: 1; }
        100% { transform: translateY(0); opacity: 0; }
      }
      .cs-badge {
        animation: cs-badge-pop 2.6s ease-in-out infinite;
        transform-box: fill-box;
        transform-origin: center;
      }
      @keyframes cs-badge-pop {
        0%, 55% { transform: scale(0); opacity: 0; }
        65% { transform: scale(1.2); opacity: 1; }
        75%, 100% { transform: scale(1); opacity: 1; }
      }

      /* Service */
      .cs-walk {
        animation: cs-walk-across 6s linear infinite;
      }
      @keyframes cs-walk-across {
        0% { transform: translateX(20px); }
        70% { transform: translateX(280px); }
        100% { transform: translateX(280px); }
      }
      .cs-leg-a {
        animation: cs-leg-swing-a 0.6s ease-in-out infinite;
        transform-box: fill-box;
        transform-origin: top center;
      }
      .cs-leg-b {
        animation: cs-leg-swing-b 0.6s ease-in-out infinite;
        transform-box: fill-box;
        transform-origin: top center;
      }
      @keyframes cs-leg-swing-a {
        0%, 100% { transform: rotate(14deg); }
        50% { transform: rotate(-14deg); }
      }
      @keyframes cs-leg-swing-b {
        0%, 100% { transform: rotate(-14deg); }
        50% { transform: rotate(14deg); }
      }
      .cs-bag {
        animation: cs-bag-swing 0.6s ease-in-out infinite;
        transform-box: fill-box;
        transform-origin: top center;
      }
      @keyframes cs-bag-swing {
        0%, 100% { transform: rotate(-6deg); }
        50% { transform: rotate(6deg); }
      }
      .cs-tracking-ping {
        animation: cs-tracking-dot 1.4s ease-in-out infinite;
        transform-box: fill-box;
        transform-origin: center;
      }
      @keyframes cs-tracking-dot {
        0%, 100% { opacity: 0.9; }
        50% { opacity: 0.35; }
      }
      .cs-tracking-ping-ring {
        animation: cs-ping-ring 1.4s ease-out infinite;
        transform-box: fill-box;
        transform-origin: center;
      }
      @keyframes cs-ping-ring {
        0% { transform: scale(0.6); opacity: 0.8; }
        100% { transform: scale(2.6); opacity: 0; }
      }
      .cs-doorbell {
        animation: cs-doorbell-glow 6s linear infinite;
      }
      @keyframes cs-doorbell-glow {
        0%, 72% { opacity: 0.3; }
        78%, 92% { opacity: 1; }
        100% { opacity: 0.3; }
      }
      .cs-check-confirm {
        animation: cs-check-in 6s ease-in-out infinite;
        transform-box: fill-box;
        transform-origin: center;
      }
      @keyframes cs-check-in {
        0%, 74% { opacity: 0; transform: scale(0.5) translateY(6px); }
        80% { opacity: 1; transform: scale(1.08) translateY(0); }
        90%, 96% { opacity: 1; transform: scale(1) translateY(0); }
        100% { opacity: 0; transform: scale(0.6) translateY(4px); }
      }

      /* College */
      .cs-cap-float {
        animation: cs-cap-bob 4.5s ease-in-out infinite;
        transform-box: fill-box;
        transform-origin: center;
      }
      @keyframes cs-cap-bob {
        0% { transform: translateY(10px) rotate(-6deg) scale(0.92); opacity: 0.55; }
        28% { transform: translateY(-10px) rotate(5deg) scale(1.05); opacity: 1; }
        50%, 82% { transform: translateY(-4px) rotate(-2deg) scale(1); opacity: 1; }
        100% { transform: translateY(10px) rotate(-6deg) scale(0.92); opacity: 0.55; }
      }
      .cs-confetti-a, .cs-confetti-b, .cs-confetti-c {
        transform-box: fill-box;
        transform-origin: center;
        animation-duration: 4.5s;
        animation-timing-function: ease-out;
        animation-iteration-count: infinite;
      }
      .cs-confetti-a { animation-name: cs-confetti-a; }
      .cs-confetti-b { animation-name: cs-confetti-b; }
      .cs-confetti-c { animation-name: cs-confetti-c; }
      @keyframes cs-confetti-a {
        0%, 20%, 100% { opacity: 0; transform: translate(0, 0) scale(0.6); }
        30% { opacity: 1; transform: translate(-6px, -8px) scale(1); }
        46% { opacity: 0; transform: translate(-10px, -14px) scale(0.6); }
      }
      @keyframes cs-confetti-b {
        0%, 20%, 100% { opacity: 0; transform: translate(0, 0) scale(0.6); }
        30% { opacity: 1; transform: translate(6px, -8px) scale(1); }
        46% { opacity: 0; transform: translate(10px, -14px) scale(0.6); }
      }
      @keyframes cs-confetti-c {
        0%, 20%, 100% { opacity: 0; transform: translate(0, 0) scale(0.6); }
        30% { opacity: 1; transform: translate(0, -10px) scale(1); }
        46% { opacity: 0; transform: translate(0, -16px) scale(0.6); }
      }
      .cs-meet-links line {
        animation: cs-link-pulse 3s ease-in-out infinite;
      }
      @keyframes cs-link-pulse {
        0%, 100% { opacity: 0.15; }
        50% { opacity: 0.55; }
      }
      .cs-talk-dot {
        animation: cs-talk 1.4s ease-in-out infinite;
        transform-box: fill-box;
        transform-origin: center;
      }
      @keyframes cs-talk {
        0%, 100% { opacity: 0.25; transform: translateY(0); }
        50% { opacity: 0.9; transform: translateY(-3px); }
      }

      @media (prefers-reduced-motion: reduce) {
        .cs-road-dash, .cs-car, .cs-wheel-l, .cs-wheel-r, .cs-headlight,
        .cs-sun-glow, .cs-parallax-far, .cs-parallax-near, .cs-route-line,
        .cs-travel-dot, .cs-pin-drop, .cs-pin-ping,
        .cs-story-ring, .cs-heart, .cs-spark-a, .cs-spark-b, .cs-spark-c,
        .cs-bubble-rise, .cs-badge,
        .cs-walk, .cs-leg-a, .cs-leg-b, .cs-bag, .cs-doorbell,
        .cs-tracking-ping, .cs-tracking-ping-ring, .cs-check-confirm,
        .cs-cap-float, .cs-confetti-a, .cs-confetti-b, .cs-confetti-c,
        .cs-meet-links line, .cs-talk-dot {
          animation: none !important;
        }
      }
    `}</style>
  );
}

export function CaseStudiesSection() {
  return (
    <ParallaxSection id="work" className="py-14 md:py-20">
      {(style) => (
        <motion.div style={style} className="mx-auto max-w-7xl px-4 md:px-6">
          <CaseStudySceneStyles />
          <div className="max-w-2xl text-left">
            <span className="text-base font-medium uppercase tracking-[0.3em] text-foreground/40 md:text-lg">
              Our Work
            </span>

            <h2
              style={{ fontFamily: '"Angsana New", "Angsana New Web", serif' }}
              className="mt-4 text-4xl font-light leading-[1.15] text-foreground md:text-6xl"
            >
              Selected Case Studies
            </h2>

            <p className="mt-4 text-base leading-relaxed text-foreground/50 md:text-lg">
              Real outcomes for startups and enterprises across industries.
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
            className="mt-14 flex flex-col gap-6"
          >
            {caseStudies.map((study, i) => (
              <CaseStudyCard
                key={study.slug}
                study={study}
                scene={SCENE_BY_INDEX[i % SCENE_BY_INDEX.length]}
              />
            ))}
          </motion.div>

          <div className="mt-14 flex justify-center">
            <OutlineButton>View All Case Studies</OutlineButton>
          </div>
        </motion.div>
      )}
    </ParallaxSection>
  );
}