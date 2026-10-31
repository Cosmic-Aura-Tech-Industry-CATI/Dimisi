import { createFileRoute, notFound } from "@tanstack/react-router";
import { getTeamMemberBySlug } from "@/data/teamMembers";
import { TeamMemberDetailPage } from "@/pages/team/TeamMemberDetailPage";

export const Route = createFileRoute("/team/$slug")({
  loader: async ({ params }) => {
    const member = getTeamMemberBySlug(params.slug);
    if (!member) {
      throw notFound();
    }
    return { member };
  },
  head: ({ loaderData }) => {
    const member = loaderData?.member;
    if (!member) {
      return {
        meta: [{ title: "Team Member Not Found — DIMISI Technologies" }],
      };
    }
    return {
      meta: [
        { title: `${member.name} — ${member.role} | DIMISI Technologies` },
        { name: "description", content: member.summary },
        { property: "og:title", content: `${member.name} — ${member.role} | DIMISI Technologies` },
        { property: "og:description", content: member.summary },
        { property: "og:image", content: member.photo },
        { property: "og:type", content: "profile" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: `${member.name} — ${member.role} | DIMISI Technologies` },
        { name: "twitter:description", content: member.summary },
        { name: "twitter:image", content: member.photo },
      ],
    };
  },
  component: TeamMemberDetailRouteComponent,
});

function TeamMemberDetailRouteComponent() {
  const { member } = Route.useLoaderData();
  return <TeamMemberDetailPage member={member} />;
}
