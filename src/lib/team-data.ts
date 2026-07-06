export type TeamMember = {
  name: string;
  role: string;
  bio: string;
  linkedin?: string;
  photo?: string;
};

export const founders: TeamMember[] = [
  {
    name: "Shikhar Dixit",
    role: "Founder & CEO",
    linkedin: "https://www.linkedin.com/in/shikhar040/",
    bio: "Shikhar Dixit is the Founder and CEO of Dimisi Technologies. He leads the company's vision, product strategy, business growth, and innovation, focusing on building AI-powered software, enterprise platforms, cloud solutions, and digital products that solve real-world business challenges through thoughtful engineering.",
  },
  {
    name: "Swatantra Singh",
    role: "Co-Founder & CTO",
    // no linkedin — provided URL was invalid (404), button auto-hides when linkedin is undefined
    bio: "Swatantra Singh leads the technology vision at Dimisi Technologies. He oversees software architecture, engineering operations, scalability, cloud infrastructure, and product development while ensuring exceptional performance and reliability across every solution.",
  },
  {
    name: "Nishkarsh Mishra",
    role: "Co-Founder & CFO",
    linkedin: "https://www.linkedin.com/in/0nishkarshm/",
    bio: "Nishkarsh Mishra oversees financial strategy, budgeting, investment planning, and sustainable business growth, ensuring that innovation is supported by strong financial planning and long-term stability.",
  },
];

export const coreTeam: TeamMember[] = [
  {
    name: "Shikhar Dixit",
    role: "CEO",
    linkedin: "https://www.linkedin.com/in/shikhar040/",
    bio: "Founder and CEO of Dimisi Technologies, leading vision, product strategy, and company growth.",
  },
  {
    name: "Swatantra Singh",
    role: "CTO",
    bio: "Co-Founder and CTO of Dimisi Technologies, leading technology vision and engineering.",
  },
  {
    name: "Nishkarsh Mishra",
    role: "CFO",
    linkedin: "https://www.linkedin.com/in/0nishkarshm/",
    bio: "Co-Founder and CFO of Dimisi Technologies, overseeing financial strategy and planning.",
  },
  {
    name: "Mridul Mishra",
    role: "Founding Engineer",
    linkedin: "https://www.linkedin.com/in/mridul-mishra-4717b828b/",
    bio: "Mridul Mishra is the Founding Engineer at Dimisi Technologies, responsible for designing scalable backend systems, building REST APIs, implementing real-time communication with WebSockets, optimizing MongoDB, managing Redis and BullMQ workflows, and maintaining CI/CD pipelines.",
  },
  {
    name: "Sheelu Singh",
    role: "Android Developer",
    linkedin: "https://www.linkedin.com/in/sheelu-singh-bbb788307/",
    bio: "Sheelu Singh develops and maintains Android applications, focusing on performance, security, scalability, and delivering an exceptional mobile experience.",
  },
];

export const interns: TeamMember[] = [
  {
    name: "Harsh Mishra",
    role: "Full Stack Intern",
    linkedin: "https://www.linkedin.com/in/harshbits/",
    bio: "Harsh Mishra contributes to frontend and backend development, supporting product engineering while learning modern software development practices.",
  },
  {
    name: "Amrit Awasthi",
    role: "Android Development Intern",
    linkedin: "https://www.linkedin.com/in/amritawasthi0416/",
    bio: "Amrit Awasthi contributes to Android application development, testing, feature implementation, and application optimization while working alongside the mobile engineering team.",
  },
];