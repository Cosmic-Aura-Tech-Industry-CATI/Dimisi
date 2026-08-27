import type { GalleryItem } from "@/types";

export const GALLERY_ITEMS: GalleryItem[] = [
  { id: "g1", title: "Owl Sentinel", category: "Characters", hue: 32, span: "tall", caption: "Hero character lighting study, volumetric pass 04." },
  { id: "g2", title: "Aviary Datacenter", category: "Environments", hue: 24, span: "wide", caption: "GPU hall concept for AVIARY Cloud." },
  { id: "g3", title: "Robot Rig", category: "Characters", hue: 40, span: "normal", caption: "DIMISI Technologies guide bot, expression sheet." },
  { id: "g4", title: "Nocturne HUD", category: "Interfaces", hue: 28, span: "normal", caption: "Low-light detection overlay." },
  { id: "g5", title: "Ember Canyon", category: "Environments", hue: 18, span: "tall", caption: "Scroll chapter three environment plate." },
  { id: "g6", title: "Energy Rings", category: "Motion", hue: 44, span: "normal", caption: "Procedural ring system, shader test." },
  { id: "g7", title: "Prism Grid", category: "Interfaces", hue: 36, span: "wide", caption: "PRISM Studio asset browser." },
  { id: "g8", title: "Feather Shader", category: "Motion", hue: 30, span: "normal", caption: "Anisotropic feather material breakdown." },
  { id: "g9", title: "Signal Tower", category: "Environments", hue: 22, span: "normal", caption: "Relay ops establishing shot." },
];

export const GALLERY_CATEGORIES = ["All", "Characters", "Environments", "Interfaces", "Motion"];