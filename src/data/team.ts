import { TEAM_MEMBERS } from "./teamMembers";

export interface TeamMember {
  name: string;
  role: string;
  group: "Leadership" | "Employees" | "Interns";
  bio: string;
  initials: string;
}

export const TEAM: TeamMember[] = TEAM_MEMBERS.map((m) => ({
  name: m.name,
  role: m.role,
  group:
    m.tier === "Founders & Executive Directors"
      ? "Leadership"
      : m.tier === "Core Engineering & Leads"
        ? "Employees"
        : "Interns",
  bio: m.summary,
  initials: m.initials,
}));
