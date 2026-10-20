/**
 * Dynamic Home Page Hero Section Configuration Types
 * Managed via Admin Panel and persisted in MongoDB under custom section 'home-hero'.
 */

export interface HomeHeroOrbitCard {
  title: string;
  desc: string;
}

export interface HomeHeroServiceItem {
  title: string;
  desc: string;
  link: string;
}

export interface HomeHeroMetricItem {
  value: string;
  label: string;
}

export interface HomeHeroConfig {
  badgeText: string;
  headlinePrefix: string;
  rotatingWords: string[];
  headlineSuffix: string;
  missionStatement: string;
  primaryBtnText: string;
  primaryBtnLink: string;
  secondaryBtnText: string;
  orbitCards: {
    ideas: HomeHeroOrbitCard;
    technology: HomeHeroOrbitCard;
    growth: HomeHeroOrbitCard;
    people: HomeHeroOrbitCard;
    impact: HomeHeroOrbitCard;
  };
  services: HomeHeroServiceItem[];
  metrics: HomeHeroMetricItem[];
}

export const DEFAULT_HOME_HERO_CONFIG: HomeHeroConfig = {
  badgeText: "Owl wisdom · DIMISI Technologies Pvt Ltd",
  headlinePrefix: "Engineering the Future of",
  rotatingWords: [
    "Scalable",
    "Autonomous",
    "Resilient",
    "Intelligent",
    "Brilliant",
    "Next-Gen",
  ],
  headlineSuffix: " Software",
  missionStatement:
    "DIMISI TECHNOLOGIES PVT LTD is a product and services technology company — we build software, web and mobile platforms, cloud systems and automation for businesses worldwide, and we are building our own app, Kalesh.",
  primaryBtnText: "TALK TO US",
  primaryBtnLink: "/contact",
  secondaryBtnText: "WATCH OUR FILM",
  orbitCards: {
    ideas: {
      title: "Ideas",
      desc: "From Vision to Reality",
    },
    technology: {
      title: "Technology",
      desc: "Build What's Next",
    },
    growth: {
      title: "Growth",
      desc: "Scale with Confidence",
    },
    people: {
      title: "People",
      desc: "Teams That Deliver",
    },
    impact: {
      title: "Impact",
      desc: "Technology for a Better Tomorrow",
    },
  },
  services: [
    {
      title: "Web Development",
      desc: "Responsive, performant web applications",
      link: "/services",
    },
    {
      title: "Mobile App Development",
      desc: "Native & cross-platform apps for iOS & Android",
      link: "/services",
    },
    {
      title: "Cloud Solutions",
      desc: "Scalable, secure cloud infrastructure & DevOps",
      link: "/services",
    },
    {
      title: "Digital Marketing",
      desc: "Data-driven growth & brand visibility strategies",
      link: "/services",
    },
    {
      title: "IT Consulting",
      desc: "Strategic tech roadmaps & architecture guidance",
      link: "/services",
    },
  ],
  metrics: [
    { value: "100+", label: "Projects Delivered" },
    { value: "50+", label: "Clients Worldwide" },
    { value: "5+", label: "Years Experience" },
    { value: "99%", label: "Client Satisfaction" },
  ],
};
