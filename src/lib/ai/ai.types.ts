/**
 * DIMISI AI — Core Type Definitions
 * Shared types for AI chat, multimodal attachments, project estimator, action chips, and lead metadata.
 */

export type Role = "user" | "assistant" | "system";

export type LeadIntent = "LOW_INTENT" | "MEDIUM_INTENT" | "HIGH_INTENT" | "ENTERPRISE_INTENT";

export interface ActionChip {
  id: string;
  label: string;
  action: "navigate" | "message" | "estimator";
  target?: string | undefined;
}

export interface UploadedFile {
  name: string;
  type: string; // e.g., "image/png", "application/pdf"
  size: number;
  dataUrl: string; // base64 data url
}

export interface ChatMessage {
  role: Role;
  content: string;
  attachment?: UploadedFile | undefined;
  actions?: ActionChip[] | undefined;
  timestamp?: number | undefined;
}

export interface ChatPayload {
  messages: ChatMessage[];
  currentRoute?: string | undefined;
  origin?: string | undefined;
  attachment?: UploadedFile | undefined;
}

export interface ChatResponse {
  reply: string;
  intent?: LeadIntent | undefined;
  actions?: ActionChip[] | undefined;
  detectedLanguage?: ("en" | "hi" | "hinglish") | undefined;
}

export interface LeadMetadata {
  intent: LeadIntent;
  projectType?: string | undefined;
  language?: string | undefined;
  page?: string | undefined;
  conversationId?: string | undefined;
  timestamp: number;
}

export interface ProjectEstimateInput {
  projectType: "web" | "mobile" | "ai" | "enterprise" | "custom";
  scale: "mvp" | "growth" | "enterprise";
  features: string[]; // e.g. ["auth", "payments", "admin", "ai", "realtime"]
  timelineNeed?: ("urgent" | "standard" | "flexible") | undefined;
}

export interface ProjectEstimateResult {
  title: string;
  summary: string;
  techStack: string[];
  complexity: "Standard" | "Medium" | "High" | "Enterprise High";
  estimatedTimeline: string;
  budgetGuidance: string;
  recommendedNextStep: string;
  disclaimer: string;
}
