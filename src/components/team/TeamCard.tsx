"use client";

import { Linkedin, User } from "lucide-react";
import { TiltCard } from "@/components/ui/TiltCard";
import { Reveal } from "@/components/ui/Reveal";
import type { TeamMember } from "@/lib/team-data";

export function TeamCard({
  member,
  index = 0,
  onOpen,
}: {
  member: TeamMember;
  index?: number;
  onOpen: (member: TeamMember) => void;
}) {
  return (
    <Reveal delay={index * 0.07}>
      <TiltCard className="h-full">
        <div className="group/card flex h-full flex-col rounded-3xl border border-foreground/10 bg-foreground/[0.02] p-6 backdrop-blur-xl transition-colors duration-500 hover:border-foreground/25">
          <button
            type="button"
            onClick={() => onOpen(member)}
            aria-haspopup="dialog"
            className="block w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/40"
          >
            <div className="relative mx-auto mb-5 aspect-square w-full overflow-hidden rounded-2xl bg-foreground/[0.04]">
              {member.photo ? (
                <img
                  src={member.photo}
                  alt={member.name}
                  className="h-full w-full object-cover object-center transition-transform duration-700 group-hover/card:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <User className="h-14 w-14 text-foreground/20" strokeWidth={1} />
                </div>
              )}
            </div>

            <h3 className="text-lg font-medium tracking-tight text-foreground">{member.name}</h3>
            <p className="mt-1 text-xs uppercase tracking-[0.18em] text-foreground/40">
              {member.role}
            </p>

            <p className="mt-4 text-sm leading-relaxed text-foreground/60">{member.bio}</p>
          </button>

          <div className="mt-5 flex items-center justify-between gap-3 border-t border-foreground/10 pt-4">
            <span className="text-xs uppercase tracking-[0.18em] text-foreground/40">Team Member</span>
            <a
              href={member.linkedin}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-foreground/15 px-3 py-1.5 text-xs font-medium text-foreground/60 transition-colors hover:border-foreground/30 hover:text-foreground"
            >
              <Linkedin className="h-3.5 w-3.5" />
              LinkedIn
            </a>
          </div>
        </div>
      </TiltCard>
    </Reveal>
  );
}
