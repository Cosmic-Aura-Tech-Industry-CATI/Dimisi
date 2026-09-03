export interface Service {
  id: string;
  title: string;
  tagline: string;
  description: string;
  capabilities: string[];
  price: string;
  robotLine: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  summary: string;
  features: string[];
  metrics: { label: string; value: string }[];
  status: "Live" | "Beta" | "Preview";
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  date: string;
  author: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: string;
  hue: number;
  span: "tall" | "wide" | "normal";
  caption: string;
}

export interface Job {
  id: string;
  role: string;
  team: string;
  location: string;
  type: string;
  description: string;
}

export interface Faq {
  q: string;
  a: string;
}

export interface Stat {
  label: string;
  value: number;
  suffix: string;
}

export interface NavLink {
  label: string;
  to: string;
}