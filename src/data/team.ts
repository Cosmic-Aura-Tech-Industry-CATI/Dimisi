export interface TeamMember {
  name: string;
  role: string;
  group: "Leadership" | "Employees" | "Interns";
  bio: string;
  initials: string;
}

export const TEAM: TeamMember[] = [
  {
    name: "Dinesh Mishra",
    role: "Founder & Owner",
    group: "Leadership",
    bio: "Started DIMISI as a two-person build shop and grew it into a product and services company shipping software for clients across three continents.",
    initials: "DM",
  },
  {
    name: "Simran Kaur",
    role: "Co-Founder & COO",
    group: "Leadership",
    bio: "Runs delivery, hiring and client operations. Keeps every engagement inside scope, budget and calendar.",
    initials: "SK",
  },
  {
    name: "Arjun Nair",
    role: "Chief Technology Officer",
    group: "Leadership",
    bio: "Owns architecture across web, mobile and cloud, and leads engineering on the Kalesh app.",
    initials: "AN",
  },
  {
    name: "Rhea Dsouza",
    role: "Product Lead — Kalesh",
    group: "Employees",
    bio: "Shapes the Kalesh roadmap from user research to release notes.",
    initials: "RD",
  },
  {
    name: "Kabir Sethi",
    role: "Senior Full-Stack Engineer",
    group: "Employees",
    bio: "TypeScript, Node and Postgres. Builds the platforms our clients run their business on.",
    initials: "KS",
  },
  {
    name: "Meera Iyer",
    role: "Mobile Engineer",
    group: "Employees",
    bio: "Android and iOS delivery, from first screen to store release.",
    initials: "MI",
  },
  {
    name: "Yash Verma",
    role: "Cloud & DevOps Engineer",
    group: "Employees",
    bio: "Pipelines, containers and uptime. Automates everything that repeats twice.",
    initials: "YV",
  },
  {
    name: "Ananya Kulkarni",
    role: "UI/UX Designer",
    group: "Employees",
    bio: "Design systems, motion and interfaces that stay usable on a five-inch screen.",
    initials: "AK",
  },
  {
    name: "Rohit Bansal",
    role: "QA Engineer",
    group: "Employees",
    bio: "Manual and automated testing across every release train.",
    initials: "RB",
  },
  {
    name: "Tanvi Shah",
    role: "Software Engineering Intern",
    group: "Interns",
    bio: "Working on Kalesh front-end features and component library work.",
    initials: "TS",
  },
  {
    name: "Aman Gupta",
    role: "Backend Intern",
    group: "Interns",
    bio: "APIs, database queries and internal tooling.",
    initials: "AG",
  },
  {
    name: "Ishita Rao",
    role: "Design Intern",
    group: "Interns",
    bio: "Marketing visuals, prototypes and design QA.",
    initials: "IR",
  },
];

export const TEAM_GROUPS = ["Leadership", "Employees", "Interns"] as const;