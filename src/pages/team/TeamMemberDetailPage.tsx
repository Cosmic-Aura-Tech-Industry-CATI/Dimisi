import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Award,
  BookOpen,
  Briefcase,
  CheckCircle2,
  Code2,
  ExternalLink,
  GraduationCap,
  Layers,
  Linkedin,
  Mail,
  MapPin,
  Rocket,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { Reveal } from "@/components/common/Reveal/Reveal";
import { MagneticButton } from "@/components/common/MagneticButton/MagneticButton";
import { type TeamMemberData, TEAM_MEMBERS } from "@/data/teamMembers";
import styles from "./TeamMemberDetailPage.module.css";

interface Props {
  member: TeamMemberData;
}

export function TeamMemberDetailPage({ member }: Props) {
  // Find current index to provide next / prev navigation
  const currentIndex = TEAM_MEMBERS.findIndex((m) => m.slug === member.slug);
  const prevMember = currentIndex > 0 ? TEAM_MEMBERS[currentIndex - 1] : undefined;
  const nextMember =
    currentIndex < TEAM_MEMBERS.length - 1 ? TEAM_MEMBERS[currentIndex + 1] : undefined;

  return (
    <div className={styles.page}>
      {/* 1. TOP BREADCRUMB & BACK ACTION */}
      <div className={styles.navBar}>
        <div className={styles.container}>
          <Link to="/team" className={styles.backLink}>
            <ArrowLeft size={16} />
            <span>Back to All Team Members</span>
          </Link>
          <div className={styles.breadcrumbTrail}>
            <Link to="/" className={styles.bcItem}>Home</Link>
            <span className={styles.bcSep}>/</span>
            <Link to="/team" className={styles.bcItem}>Team</Link>
            <span className={styles.bcSep}>/</span>
            <span className={styles.bcActive}>{member.name}</span>
          </div>
        </div>
      </div>

      {/* 2. PROFILE HERO HEADER */}
      <section className={styles.heroSection}>
        <div className={styles.container}>
          <div className={styles.heroGrid}>
            {/* Left Photo / Avatar */}
            <div className={styles.photoCol}>
              <Reveal variant="fade">
                <div className={styles.photoFrame}>
                  {member.photo ? (
                    <img
                      src={member.photo}
                      alt={member.name}
                      className={styles.memberPhoto}
                      style={{ objectPosition: member.photoPosition || "center 20%" }}
                    />
                  ) : (
                    <div className={styles.avatarFallback}>
                      <span className={styles.avatarInitials}>{member.initials}</span>
                    </div>
                  )}
                  <div className={styles.photoGlow} aria-hidden="true" />
                  <div className={styles.verifiedBadge}>
                    <ShieldCheck size={14} className={styles.verifiedIcon} />
                    <span>Dimisipedia Verified</span>
                  </div>
                </div>
              </Reveal>
            </div>

            {/* Right Header Metadata */}
            <div className={styles.metaCol}>
              <Reveal variant="fade">
                <div className={styles.tierPill}>
                  <Sparkles size={12} />
                  <span>{member.tier}</span>
                </div>
              </Reveal>

              <Reveal variant="up" delay={60}>
                <h1 className={styles.name}>{member.name}</h1>
                <p className={styles.officialTitle}>{member.role}</p>
              </Reveal>

              <Reveal variant="up" delay={120}>
                <p className={styles.summary}>{member.summary}</p>
              </Reveal>

              {/* Quick Spec Pills */}
              <Reveal variant="up" delay={180}>
                <div className={styles.quickFactsGrid}>
                  <div className={styles.factCard}>
                    <Briefcase size={15} className={styles.factIcon} />
                    <div>
                      <span className={styles.factLabel}>Department</span>
                      <span className={styles.factVal}>{member.department}</span>
                    </div>
                  </div>

                  <div className={styles.factCard}>
                    <GraduationCap size={15} className={styles.factIcon} />
                    <div>
                      <span className={styles.factLabel}>Education</span>
                      <span className={styles.factVal}>{member.education}</span>
                    </div>
                  </div>

                  <div className={styles.factCard}>
                    <MapPin size={15} className={styles.factIcon} />
                    <div>
                      <span className={styles.factLabel}>Operating Base</span>
                      <span className={styles.factVal}>{member.location}</span>
                    </div>
                  </div>
                </div>
              </Reveal>

              {/* Actions & Dimisipedia Verification Link */}
              <Reveal variant="up" delay={240}>
                <div className={styles.actionRow}>
                  <a
                    href={member.dimisipediaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.dimisipediaBtn}
                  >
                    <BookOpen size={15} />
                    <span>Read on Dimisipedia (dimisipedia.me)</span>
                    <ArrowUpRight size={14} />
                  </a>

                  {member.email ? (
                    <a href={`mailto:${member.email}`} className={styles.contactBtn}>
                      <Mail size={15} />
                      <span>{member.email}</span>
                    </a>
                  ) : null}

                  {member.linkedin ? (
                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.socialBtn}
                      aria-label={`${member.name} on LinkedIn`}
                    >
                      <Linkedin size={16} />
                    </a>
                  ) : null}
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* 3. JOURNEY & BACKGROUND STORY (FROM DIMISIPEDIA) */}
      <section className={styles.storySection}>
        <div className={styles.container}>
          <div className={styles.sectionHeading}>
            <div className={styles.eyebrow}>
              <span className={styles.pulseDot} aria-hidden="true" />
              <span>OFFICIAL BIOGRAPHY & JOURNEY</span>
            </div>
            <h2 className={styles.sectionTitle}>
              Background & <span className={styles.accentText}>Technological Journey</span>
            </h2>
          </div>

          <div className={styles.storyContent}>
            <Reveal variant="up">
              <div className={styles.storyCard}>
                <p className={styles.leadBio}>{member.bio}</p>
                {member.fullStory.map((paragraph, idx) => (
                  <p key={idx} className={styles.storyParagraph}>
                    {paragraph}
                  </p>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 4. KEY ROLES & RESPONSIBILITIES */}
      <section className={styles.respSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeading}>
            <div className={styles.eyebrow}>
              <span className={styles.pulseDot} aria-hidden="true" />
              <span>MANDATE & DELIVERABLES</span>
            </div>
            <h2 className={styles.sectionTitle}>
              Key Roles & <span className={styles.accentText}>Core Responsibilities</span>
            </h2>
          </div>

          <div className={styles.respGrid}>
            {member.responsibilities.map((resp, idx) => (
              <Reveal key={idx} variant="up" delay={idx * 60}>
                <div className={styles.respCard}>
                  <div className={styles.respIconWrap}>
                    <CheckCircle2 size={16} className={styles.respCheckIcon} />
                  </div>
                  <span className={styles.respText}>{resp}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 5. KEY PROJECTS & ARCHITECTURAL CONTRIBUTIONS */}
      {member.keyProjects.length > 0 && (
        <section className={styles.projectsSection}>
          <div className={styles.container}>
            <div className={styles.sectionHeading}>
              <div className={styles.eyebrow}>
                <span className={styles.pulseDot} aria-hidden="true" />
                <span>SHIPPED & ENGINEERED</span>
              </div>
              <h2 className={styles.sectionTitle}>
                Projects & <span className={styles.accentText}>Architectural Milestones</span>
              </h2>
            </div>

            <div className={styles.projectsGrid}>
              {member.keyProjects.map((proj, idx) => (
                <Reveal key={idx} variant="up" delay={idx * 80}>
                  <div className={styles.projectCard}>
                    <div className={styles.projTop}>
                      <div className={styles.projIconBox}>
                        <Rocket size={18} />
                      </div>
                      <span className={styles.projRoleTag}>{proj.role}</span>
                    </div>
                    <h3 className={styles.projTitle}>{proj.title}</h3>
                    <p className={styles.projDesc}>{proj.description}</p>
                    <div className={styles.projTags}>
                      {proj.tags.map((t, i) => (
                        <span key={i} className={styles.projTag}>
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 6. TECHNICAL COMPETENCY & DOMAIN STACK */}
      {member.techStack.length > 0 && (
        <section className={styles.techSection}>
          <div className={styles.container}>
            <div className={styles.sectionHeading}>
              <div className={styles.eyebrow}>
                <span className={styles.pulseDot} aria-hidden="true" />
                <span>TECHNICAL PROFILE</span>
              </div>
              <h2 className={styles.sectionTitle}>
                Domain Expertise & <span className={styles.accentText}>Technology Stack</span>
              </h2>
            </div>

            <div className={styles.techPillGrid}>
              {member.techStack.map((tech, idx) => (
                <Reveal key={idx} variant="fade" delay={idx * 40}>
                  <div className={styles.techPill}>
                    <Code2 size={14} className={styles.techPillIcon} />
                    <span>{tech}</span>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 7. DIMISIPEDIA VERIFICATION NOTICE */}
      <section className={styles.citationSection}>
        <div className={styles.container}>
          <div className={styles.citationBox}>
            <div className={styles.citationHeader}>
              <ShieldCheck size={20} className={styles.citationShield} />
              <h4 className={styles.citationTitle}>
                Dimisipedia Corporate Knowledge Base Verification
              </h4>
            </div>
            <p className={styles.citationText}>
              All biographical records, academic backgrounds, projects, and organizational designations
              displayed on this page are indexed from and verifiable on{" "}
              <strong>DIMISIPEDIA (dimisipedia.me)</strong> — the official public documentation
              repository of DIMISI Technologies Private Limited (CIN: U62013UP2026PTC246506).
            </p>
            <div className={styles.citationActions}>
              <a
                href={member.dimisipediaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.citationLink}
              >
                <span>Inspect Entry on DIMISIPEDIA</span>
                <ArrowUpRight size={13} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 8. NEXT / PREV TEAM NAVIGATION */}
      <div className={styles.bottomNavSection}>
        <div className={styles.container}>
          <div className={styles.bottomNavGrid}>
            {prevMember ? (
              <Link to={`/team/${prevMember.slug}`} className={styles.navCardPrev}>
                <div className={styles.navCardArrow}>
                  <ArrowLeft size={16} />
                </div>
                <div className={styles.navCardText}>
                  <span className={styles.navCardSub}>Previous Profile</span>
                  <span className={styles.navCardName}>{prevMember.name}</span>
                </div>
              </Link>
            ) : <div />}

            <Link to="/team" className={styles.navCardCenter}>
              <Users size={16} />
              <span>View All 13 Team Members</span>
            </Link>

            {nextMember ? (
              <Link to={`/team/${nextMember.slug}`} className={styles.navCardNext}>
                <div className={styles.navCardTextRight}>
                  <span className={styles.navCardSub}>Next Profile</span>
                  <span className={styles.navCardName}>{nextMember.name}</span>
                </div>
                <div className={styles.navCardArrow}>
                  <ArrowRight size={16} />
                </div>
              </Link>
            ) : <div />}
          </div>
        </div>
      </div>
    </div>
  );
}
