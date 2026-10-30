import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ArrowUpRight,
  Award,
  BookOpen,
  Briefcase,
  CheckCircle2,
  Cpu,
  GraduationCap,
  Layers,
  MapPin,
  Rocket,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { Reveal } from "@/components/common/Reveal/Reveal";
import { MagneticButton } from "@/components/common/MagneticButton/MagneticButton";
import { TEAM_MEMBERS, TEAM_TIERS, type TeamTier, type TeamMemberData } from "@/data/teamMembers";
import styles from "./TeamPage.module.css";

export function TeamPage() {
  const [activeTier, setActiveTier] = useState<string>("All");

  const filteredMembers =
    activeTier === "All"
      ? TEAM_MEMBERS
      : TEAM_MEMBERS.filter((m) => m.tier === activeTier);

  // Group members by tier for structured overview
  const founders = TEAM_MEMBERS.filter((m) => m.tier === "Founders & Executive Directors");
  const coreLeads = TEAM_MEMBERS.filter((m) => m.tier === "Core Engineering & Leads");
  const interns = TEAM_MEMBERS.filter((m) => m.tier === "Innovation Cohort & Interns");
  const alumni = TEAM_MEMBERS.filter((m) => m.tier === "Alumni & Former Members");

  return (
    <div className={styles.page}>
      {/* 1. HERO SECTION */}
      <section className={styles.heroSection} aria-label="Team Overview">
        <div className={styles.container}>
          <div className={styles.heroContent}>
            <Reveal variant="fade">
              <div className={styles.eyebrowBadge}>
                <span className={styles.badgeDot} aria-hidden="true" />
                <span className={styles.badgeText}>04 · THE BUILDERS & ARCHITECTS</span>
              </div>
            </Reveal>

            <Reveal variant="up" delay={80}>
              <h1 className={styles.heroTitle}>
                The Minds Behind <span className={styles.accentGradient}>DIMISI Technologies.</span>
              </h1>
            </Reveal>

            <Reveal variant="up" delay={150}>
              <p className={styles.heroLead}>
                From founding directors and core engineering leads to the innovation cohort and honored alumni — meet the architects driving resilient software systems, consumer platforms, and the Kalesh ecosystem.
              </p>
            </Reveal>

            {/* Quick Stats Strip & Dimisipedia Verification Link */}
            <Reveal variant="up" delay={220}>
              <div className={styles.heroStatsRow}>
                <div className={styles.statChip}>
                  <Users size={14} className={styles.statIcon} />
                  <span>{TEAM_MEMBERS.length} Documented Profiles</span>
                </div>
                <div className={styles.statChip}>
                  <ShieldCheck size={14} className={styles.statIconGov} />
                  <span>MCA Registered & DPIIT Recognized</span>
                </div>
                <a
                  href="https://www.dimisipedia.me"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.dimisipediaPill}
                  aria-label="Inspect DIMISIPEDIA official public encyclopedia"
                >
                  <BookOpen size={14} />
                  <span>Dimisipedia Verified Records</span>
                  <ArrowUpRight size={13} />
                </a>
              </div>
            </Reveal>
          </div>

          {/* Interactive Filter Pills - Wide Organized Bar */}
          <Reveal variant="up" delay={280}>
            <div className={styles.filterBarWrapper}>
              <div className={styles.filterBar} role="tablist" aria-label="Filter Team by Tier">
                <button
                  type="button"
                  className={[styles.filterBtn, activeTier === "All" ? styles.filterActive : ""].join(" ")}
                  onClick={() => setActiveTier("All")}
                >
                  <Users size={14} className={styles.btnIcon} />
                  <span>All ({TEAM_MEMBERS.length})</span>
                </button>
                <button
                  type="button"
                  className={[
                    styles.filterBtn,
                    activeTier === "Founders & Executive Directors" ? styles.filterActive : "",
                  ].join(" ")}
                  onClick={() => setActiveTier("Founders & Executive Directors")}
                >
                  <Sparkles size={14} className={styles.btnIcon} />
                  <span>Founders & Directors ({founders.length})</span>
                </button>
                <button
                  type="button"
                  className={[
                    styles.filterBtn,
                    activeTier === "Core Engineering & Leads" ? styles.filterActive : "",
                  ].join(" ")}
                  onClick={() => setActiveTier("Core Engineering & Leads")}
                >
                  <Cpu size={14} className={styles.btnIcon} />
                  <span>Core Engineering ({coreLeads.length})</span>
                </button>
                <button
                  type="button"
                  className={[
                    styles.filterBtn,
                    activeTier === "Innovation Cohort & Interns" ? styles.filterActive : "",
                  ].join(" ")}
                  onClick={() => setActiveTier("Innovation Cohort & Interns")}
                >
                  <Rocket size={14} className={styles.btnIcon} />
                  <span>Intern Cohort ({interns.length})</span>
                </button>
                {alumni.length > 0 && (
                  <button
                    type="button"
                    className={[
                      styles.filterBtn,
                      activeTier === "Alumni & Former Members" ? styles.filterActive : "",
                    ].join(" ")}
                    onClick={() => setActiveTier("Alumni & Former Members")}
                  >
                    <Award size={14} className={styles.btnIcon} />
                    <span>Alumni / Ex-Team ({alumni.length})</span>
                  </button>
                )}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 2. MAIN TEAM DISPLAY */}
      <section className={styles.teamDirectorySection} aria-label="Team Members Directory">
        <div className={styles.container}>
          {activeTier === "All" ? (
            <div className={styles.tierGroupWrapper}>
              {/* SECTION A: FOUNDERS & EXECUTIVE DIRECTORS */}
              <div className={styles.tierBlock}>
                <div className={styles.tierHeader}>
                  <div className={styles.tierTag}>
                    <Sparkles size={13} />
                    <span>LEVEL 01 · EXECUTIVE LEADERSHIP</span>
                  </div>
                  <h2 className={styles.tierTitle}>
                    Founders & <span className={styles.accentText}>Executive Directors</span>
                  </h2>
                  <p className={styles.tierDesc}>
                    Steering statutory governance, long-term corporate vision, financial resilience, and end-to-end technical scalability.
                  </p>
                </div>

                <div className={styles.foundersGrid}>
                  {founders.map((member, idx) => (
                    <FounderCard key={member.slug} member={member} delay={idx * 100} />
                  ))}
                </div>
              </div>

              {/* SECTION B: CORE ENGINEERING & TECHNICAL LEADS */}
              <div className={styles.tierBlock}>
                <div className={styles.tierHeader}>
                  <div className={styles.tierTag}>
                    <Cpu size={13} />
                    <span>LEVEL 02 · FOUNDING TECH LEADS</span>
                  </div>
                  <h2 className={styles.tierTitle}>
                    Core Engineering & <span className={styles.accentText}>Technical Leads</span>
                  </h2>
                  <p className={styles.tierDesc}>
                    Commanding full-stack web platforms, mobile architectures, low-latency backends, commercial client delivery, and creative media.
                  </p>
                </div>

                <div className={styles.coreGrid}>
                  {coreLeads.map((member, idx) => (
                    <LeadCard key={member.slug} member={member} delay={idx * 80} />
                  ))}
                </div>
              </div>

              {/* SECTION C: INNOVATION COHORT & INTERNS */}
              <div className={styles.tierBlock}>
                <div className={styles.tierHeader}>
                  <div className={styles.tierTag}>
                    <Rocket size={13} />
                    <span>LEVEL 03 · INNOVATION LAB</span>
                  </div>
                  <h2 className={styles.tierTitle}>
                    Engineering & <span className={styles.accentText}>Innovation Intern Cohort</span>
                  </h2>
                  <p className={styles.tierDesc}>
                    Rising developers, market research analysts, and growth specialists shipping production features and user intelligence.
                  </p>
                </div>

                <div className={styles.internsGrid}>
                  {interns.map((member, idx) => (
                    <InternCard key={member.slug} member={member} delay={idx * 60} />
                  ))}
                </div>
              </div>

              {/* SECTION D: ALUMNI & FORMER MEMBERS (EX-EMPLOYEES) */}
              {alumni.length > 0 && (
                <div className={styles.tierBlock}>
                  <div className={styles.tierHeader}>
                    <div className={styles.tierTagAlumni}>
                      <Award size={13} />
                      <span>HONOR ROLL · ALUMNI & FORMER MEMBERS</span>
                    </div>
                    <h2 className={styles.tierTitle}>
                      DIMISI <span className={styles.accentText}>Alumni & Former Contributors</span>
                    </h2>
                    <p className={styles.tierDesc}>
                      Recognizing the valued contributions of former team members who contributed to our early platforms, user research, and engineering milestones.
                    </p>
                  </div>

                  <div className={styles.alumniGrid}>
                    {alumni.map((member, idx) => (
                      <AlumniCard key={member.slug} member={member} delay={idx * 60} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            // FILTERED VIEW
            <div className={styles.filteredSection}>
              <div className={styles.filteredHeader}>
                <h2 className={styles.filteredTitle}>
                  Showing <span className={styles.accentText}>{activeTier}</span> ({filteredMembers.length})
                </h2>
                <button
                  type="button"
                  onClick={() => setActiveTier("All")}
                  className={styles.resetFilterBtn}
                >
                  View All Members ({TEAM_MEMBERS.length})
                </button>
              </div>

              {activeTier === "Founders & Executive Directors" && (
                <div className={styles.foundersGrid}>
                  {filteredMembers.map((member, idx) => (
                    <FounderCard key={member.slug} member={member} delay={idx * 80} />
                  ))}
                </div>
              )}

              {activeTier === "Core Engineering & Leads" && (
                <div className={styles.coreGrid}>
                  {filteredMembers.map((member, idx) => (
                    <LeadCard key={member.slug} member={member} delay={idx * 60} />
                  ))}
                </div>
              )}

              {activeTier === "Innovation Cohort & Interns" && (
                <div className={styles.internsGrid}>
                  {filteredMembers.map((member, idx) => (
                    <InternCard key={member.slug} member={member} delay={idx * 60} />
                  ))}
                </div>
              )}

              {activeTier === "Alumni & Former Members" && (
                <div className={styles.alumniGrid}>
                  {filteredMembers.map((member, idx) => (
                    <AlumniCard key={member.slug} member={member} delay={idx * 60} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* 3. DIMISIPEDIA PUBLIC ENCYCLOPEDIA BANNER */}
      <section className={styles.dimisipediaSection} aria-label="Dimisipedia Knowledge Base">
        <div className={styles.container}>
          <div className={styles.dimisipediaCard}>
            <div className={styles.dCardLeft}>
              <div className={styles.dBadge}>
                <ShieldCheck size={14} className={styles.dShield} />
                <span>OFFICIAL VERIFIABLE SOURCE OF TRUTH</span>
              </div>
              <h3 className={styles.dTitle}>
                Explore the Complete Knowledge Graph on <span className={styles.accentText}>DIMISIPEDIA</span>
              </h3>
              <p className={styles.dDesc}>
                DIMISIPEDIA (<strong>dimisipedia.me</strong>) is the public corporate encyclopedia of DIMISI
                Technologies Private Limited. Every biographical milestone, technical project, and corporate role
                is documented with transparent evidence labels and verifiable sources.
              </p>
            </div>
            <div className={styles.dCardRight}>
              <a
                href="https://www.dimisipedia.me"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.dLaunchBtn}
              >
                <span>Visit dimisipedia.me</span>
                <ArrowUpRight size={16} />
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SUB-COMPONENTS: HIGH-END CARDS
// ---------------------------------------------------------------------------

function FounderCard({ member, delay }: { member: TeamMemberData; delay: number }) {
  return (
    <Reveal variant="up" delay={delay}>
      <article className={styles.founderCard}>
        <div className={styles.fCardGlow} aria-hidden="true" />

        <div className={styles.fPhotoWrapper}>
          {member.photo ? (
            <img
              src={member.photo}
              alt={member.name}
              className={styles.fPhoto}
              style={{ objectPosition: member.photoPosition || "center 20%" }}
              loading="lazy"
            />
          ) : (
            <div className={styles.fAvatarFallback}>
              <span>{member.initials}</span>
            </div>
          )}
          <div className={styles.fPhotoVignette} aria-hidden="true" />
          <span className={styles.fStatusPill}>
            <span className={styles.fLiveDot} />
            Executive Director
          </span>
        </div>

        <div className={styles.fContent}>
          <div className={styles.fDeptTag}>{member.department}</div>
          <h3 className={styles.fName}>{member.name}</h3>
          <p className={styles.fRole}>{member.role}</p>
          <p className={styles.fSummary}>{member.summary}</p>

          <div className={styles.fFocusBox}>
            <span className={styles.fFocusLabel}>Key Domain:</span>
            <div className={styles.fTags}>
              {member.techStack.slice(0, 4).map((tech, i) => (
                <span key={i} className={styles.fTag}>
                  {tech}
                </span>
              ))}
            </div>
          </div>

          <div className={styles.fCardFooter}>
            <Link to={`/team/${member.slug}`} className={styles.fViewLink}>
              <span>View Full Biography & Work</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </article>
    </Reveal>
  );
}

function LeadCard({ member, delay }: { member: TeamMemberData; delay: number }) {
  return (
    <Reveal variant="up" delay={delay}>
      <article className={styles.leadCard}>
        <div className={styles.leadTop}>
          <div className={styles.leadAvatarBox}>
            {member.photo ? (
              <img
                src={member.photo}
                alt={member.name}
                className={styles.leadPhoto}
                style={{ objectPosition: member.photoPosition || "center 20%" }}
                loading="lazy"
              />
            ) : (
              <div className={styles.leadAvatarFallback}>
                <span>{member.initials}</span>
              </div>
            )}
          </div>
          <div className={styles.leadMeta}>
            <span className={styles.leadDept}>{member.department}</span>
            <h3 className={styles.leadName}>{member.name}</h3>
            <p className={styles.leadRole}>{member.role}</p>
          </div>
        </div>

        <p className={styles.leadSummary}>{member.summary}</p>

        <div className={styles.leadTechList}>
          {member.techStack.slice(0, 3).map((t, i) => (
            <span key={i} className={styles.leadTechPill}>
              {t}
            </span>
          ))}
        </div>

        <div className={styles.leadFooter}>
          <Link to={`/team/${member.slug}`} className={styles.leadViewLink}>
            <span>View Profile</span>
            <ArrowRight size={14} />
          </Link>
          <span className={styles.dimisiRefTag}>dimisipedia.me</span>
        </div>
      </article>
    </Reveal>
  );
}

function InternCard({ member, delay }: { member: TeamMemberData; delay: number }) {
  return (
    <Reveal variant="up" delay={delay}>
      <article className={styles.internCard}>
        <div className={styles.internTop}>
          <div className={styles.internAvatarWrap}>
            {member.photo ? (
              <img
                src={member.photo}
                alt={member.name}
                className={styles.internPhoto}
                style={{ objectPosition: member.photoPosition || "center 20%" }}
                loading="lazy"
              />
            ) : (
              <div className={styles.internAvatarFallback}>
                <span>{member.initials}</span>
              </div>
            )}
          </div>
          <div className={styles.internHeaderInfo}>
            <h4 className={styles.internName}>{member.name}</h4>
            <span className={styles.internRole}>{member.role}</span>
          </div>
        </div>

        <p className={styles.internSummary}>{member.summary}</p>

        <div className={styles.internFooter}>
          <Link to={`/team/${member.slug}`} className={styles.internLink}>
            <span>Profile & Projects</span>
            <ArrowRight size={13} />
          </Link>
          <span className={styles.internCohortBadge}>2026 Cohort</span>
        </div>
      </article>
    </Reveal>
  );
}

function AlumniCard({ member, delay }: { member: TeamMemberData; delay: number }) {
  return (
    <Reveal variant="up" delay={delay}>
      <article className={styles.internCard}>
        <div className={styles.internTop}>
          <div className={styles.internAvatarWrap}>
            {member.photo ? (
              <img
                src={member.photo}
                alt={member.name}
                className={styles.internPhoto}
                style={{ objectPosition: member.photoPosition || "center 20%" }}
                loading="lazy"
              />
            ) : (
              <div className={styles.internAvatarFallback}>
                <span>{member.initials}</span>
              </div>
            )}
          </div>
          <div className={styles.internHeaderInfo}>
            <div className={styles.alumniBadgeRow}>
              <h4 className={styles.internName}>{member.name}</h4>
              <span className={styles.alumniTag}>Alumni • Ex-Employee</span>
            </div>
            <span className={styles.internRole}>{member.role}</span>
          </div>
        </div>

        <p className={styles.internSummary}>{member.summary}</p>

        <div className={styles.internFooter}>
          <Link to={`/team/${member.slug}`} className={styles.internLink}>
            <span>Past Contributions</span>
            <ArrowRight size={13} />
          </Link>
          <span className={styles.alumniCohortBadge}>Alumni (2026)</span>
        </div>
      </article>
    </Reveal>
  );
}
