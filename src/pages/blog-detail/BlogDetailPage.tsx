import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Share2,
  BookOpen,
  Sparkles,
  ChevronRight,
  User,
  ArrowUpRight,
  CheckCircle2,
} from "lucide-react";
import { Reveal } from "@/components/common/Reveal/Reveal";
import { TiltCard } from "@/components/common/TiltCard/TiltCard";
import { MagneticButton } from "@/components/common/MagneticButton/MagneticButton";
import type { BlogPostItem } from "@/lib/blog.shared";
import pageStyles from "@/styles/page.module.css";
import styles from "./BlogDetailPage.module.css";

interface BlogDetailPageProps {
  post: BlogPostItem;
  relatedPosts?: BlogPostItem[];
}

export function BlogDetailPage({ post, relatedPosts = [] }: BlogDetailPageProps) {
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.excerpt,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Article link copied to clipboard!");
    }
  };

  return (
    <div className={pageStyles.page}>
      {/* Top Header & Breadcrumbs */}
      <section className={styles.headerSection} aria-label="Article Header">
        <div className={styles.headerGlow} aria-hidden="true" />
        <div className={styles.container}>
          {/* Breadcrumb Navigation */}
          <Reveal variant="fade">
            <nav className={styles.breadcrumbNav} aria-label="Breadcrumbs">
              <Link to="/" className={styles.breadcrumbLink}>
                Home
              </Link>
              <ChevronRight size={13} className={styles.breadcrumbSep} />
              <Link to="/blog" className={styles.breadcrumbLink}>
                Blog
              </Link>
              <ChevronRight size={13} className={styles.breadcrumbSep} />
              <span className={styles.breadcrumbCurrent}>{post.category}</span>
            </nav>
          </Reveal>

          {/* Meta Badges */}
          <Reveal variant="fade" delay={40}>
            <div className={styles.metaBadgesRow}>
              <span className={styles.categoryBadge}>{post.category}</span>
              <span className={styles.metaItem}>
                <Calendar size={13} />
                <span>
                  {new Date(post.published_at).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </span>
              <span className={styles.metaItem}>
                <Clock size={13} />
                <span>{post.reading_time}</span>
              </span>
            </div>
          </Reveal>

          {/* Title */}
          <Reveal variant="up" delay={80}>
            <h1 className={styles.articleTitle}>{post.title}</h1>
          </Reveal>

          {/* Excerpt */}
          <Reveal variant="up" delay={120}>
            <p className={styles.articleExcerpt}>{post.excerpt}</p>
          </Reveal>

          {/* Author Card & Share Actions */}
          <Reveal variant="up" delay={160}>
            <div className={styles.authorShareRow}>
              <div className={styles.authorBox}>
                <img
                  src={post.author_avatar}
                  alt={post.author_name}
                  className={styles.authorAvatar}
                />
                <div>
                  <span className={styles.authorName}>{post.author_name}</span>
                  <span className={styles.authorRole}>{post.author_role || "Engineering & Research"}</span>
                </div>
              </div>

              <div className={styles.shareGroup}>
                <button
                  type="button"
                  onClick={handleShare}
                  className={styles.shareBtn}
                  title="Share Article"
                >
                  <Share2 size={15} />
                  <span>Share Article</span>
                </button>

                <Link to="/blog" className={styles.backBtn}>
                  <ArrowLeft size={15} />
                  <span>All Articles</span>
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Full-Width Featured Cover Showcase */}
      <section className={styles.coverSection} aria-label="Cover Image">
        <div className={styles.container}>
          <Reveal variant="fade" delay={100}>
            <div className={styles.coverWrapper}>
              <img
                src={post.cover_image}
                alt={post.title}
                className={styles.coverImage}
              />
              {post.cover_caption && (
                <span className={styles.coverCaption}>{post.cover_caption}</span>
              )}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Rich Formatted Article Content */}
      <section className={styles.contentSection} aria-label="Article Content">
        <div className={styles.articleContainer}>
          <div className={styles.articleBody}>
            {/* Split paragraphs or markdown headings */}
            {post.content.split("\n\n").map((block, idx) => {
              const trimmed = block.trim();
              if (trimmed.startsWith("## ")) {
                return (
                  <h2 key={idx} className={styles.contentH2}>
                    {trimmed.replace("## ", "")}
                  </h2>
                );
              }
              if (trimmed.startsWith("### ")) {
                return (
                  <h3 key={idx} className={styles.contentH3}>
                    {trimmed.replace("### ", "")}
                  </h3>
                );
              }
              if (trimmed.startsWith("```")) {
                const codeLines = trimmed
                  .replace(/```[a-z]*\n?/i, "")
                  .replace(/```$/, "")
                  .trim();
                return (
                  <pre key={idx} className={styles.codeBlock}>
                    <code>{codeLines}</code>
                  </pre>
                );
              }
              if (trimmed.startsWith("- ") || trimmed.startsWith("1. ")) {
                const lines = trimmed.split("\n");
                return (
                  <ul key={idx} className={styles.contentList}>
                    {lines.map((l, lIdx) => (
                      <li key={lIdx}>
                        <CheckCircle2 size={15} className={styles.listCheck} />
                        <span>{l.replace(/^[-*]|\d+\.\s*/, "").replace(/\*\*(.*?)\*\*/g, "$1")}</span>
                      </li>
                    ))}
                  </ul>
                );
              }
              return (
                <p key={idx} className={styles.contentParagraph}>
                  {trimmed}
                </p>
              );
            })}
          </div>

          {/* Article Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className={styles.articleTagsRow}>
              <span className={styles.tagsLabel}>Tagged under:</span>
              <div className={styles.tagsPills}>
                {post.tags.map((tag, idx) => (
                  <span key={idx} className={styles.tagPill}>
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Related Posts Recommendations */}
      {relatedPosts && relatedPosts.length > 0 && (
        <section className={styles.relatedSection} aria-label="Related Articles">
          <div className={styles.container}>
            <div className={styles.relatedHeader}>
              <Reveal variant="fade">
                <span className={styles.relatedEyebrow}>Explore Further</span>
              </Reveal>
              <Reveal variant="up" delay={40}>
                <h2 className={styles.relatedTitle}>Related Insights</h2>
              </Reveal>
            </div>

            <div className={styles.relatedGrid}>
              {relatedPosts.slice(0, 3).map((r, idx) => (
                <Reveal key={r.id} delay={idx * 50}>
                  <TiltCard className={styles.relatedCard}>
                    <img
                      src={r.cover_image}
                      alt={r.title}
                      className={styles.relatedCover}
                      loading="lazy"
                    />
                    <div className={styles.relatedBody}>
                      <span className={styles.relatedCat}>{r.category}</span>
                      <h3 className={styles.relatedPostTitle}>
                        <Link to="/blog/$slug" params={{ slug: r.slug }}>
                          {r.title}
                        </Link>
                      </h3>
                      <p className={styles.relatedExcerpt}>{r.excerpt}</p>
                    </div>
                  </TiltCard>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Closing Newsletter / Contact CTA */}
      <section className={styles.ctaSection} aria-label="Closing CTA">
        <div className={styles.container}>
          <Reveal variant="up">
            <div className={styles.ctaCard}>
              <h2 className={styles.ctaHeading}>Stay at the Frontier of Product Engineering</h2>
              <p className={styles.ctaSub}>
                Have a project or technical challenge in mind? Let's engineer scalable software together.
              </p>
              <div className={styles.ctaButtons}>
                <MagneticButton to="/contact" variant="solid">
                  <span>Start a Conversation</span>
                </MagneticButton>
                <MagneticButton to="/blog" variant="ghost">
                  <span>Browse All Articles</span>
                </MagneticButton>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
