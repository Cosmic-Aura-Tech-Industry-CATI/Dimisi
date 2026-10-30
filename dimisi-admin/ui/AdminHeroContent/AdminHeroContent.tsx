import { useState, useEffect } from "react";
import {
  Sparkles,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Globe,
  Layers,
  BarChart3,
  MousePointerClick,
  FileText,
  Loader2,
} from "lucide-react";
import {
  getSectionConfigApi,
  updateSectionConfigApi,
} from "@/services/config.service";
import {
  type HomeHeroConfig,
  DEFAULT_HOME_HERO_CONFIG,
} from "@/types/homeHero.types";
import { HOME_HERO_CONFIG_EVENT } from "@/hooks/useHomeHeroConfig";
import styles from "./AdminHeroContent.module.css";

export function AdminHeroContent() {
  const [form, setForm] = useState<HomeHeroConfig>(DEFAULT_HOME_HERO_CONFIG);
  const [rotatingWordsStr, setRotatingWordsStr] = useState(
    DEFAULT_HOME_HERO_CONFIG.rotatingWords.join(", "),
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Load from MongoDB on mount
  useEffect(() => {
    let isMounted = true;
    async function loadConfig() {
      setIsLoading(true);
      try {
        const live = await getSectionConfigApi<Partial<HomeHeroConfig>>("home-hero");
        if (isMounted && live && typeof live === "object") {
          const merged: HomeHeroConfig = {
            ...DEFAULT_HOME_HERO_CONFIG,
            ...live,
            orbitCards: {
              ...DEFAULT_HOME_HERO_CONFIG.orbitCards,
              ...(live.orbitCards || {}),
            },
            services:
              Array.isArray(live.services) && live.services.length > 0
                ? live.services
                : DEFAULT_HOME_HERO_CONFIG.services,
            metrics:
              Array.isArray(live.metrics) && live.metrics.length > 0
                ? live.metrics
                : DEFAULT_HOME_HERO_CONFIG.metrics,
            rotatingWords:
              Array.isArray(live.rotatingWords) && live.rotatingWords.length > 0
                ? live.rotatingWords
                : DEFAULT_HOME_HERO_CONFIG.rotatingWords,
          };
          setForm(merged);
          setRotatingWordsStr(merged.rotatingWords.join(", "));
        }
      } catch (err) {
        console.error("Failed to load hero configuration:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    void loadConfig();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setFeedback(null);
    try {
      // Parse rotating words
      const wordsArr = rotatingWordsStr
        .split(",")
        .map((w) => w.trim())
        .filter(Boolean);

      const payload: HomeHeroConfig = {
        ...form,
        rotatingWords:
          wordsArr.length > 0 ? wordsArr : DEFAULT_HOME_HERO_CONFIG.rotatingWords,
      };

      await updateSectionConfigApi<HomeHeroConfig>("home-hero", payload);
      setForm(payload);

      // Trigger cross-component synchronization
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent(HOME_HERO_CONFIG_EVENT));
      }

      setFeedback({
        type: "success",
        message: "Home Page Hero Content successfully updated and published to live website!",
      });
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err?.message || "Failed to save configuration. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (
      window.confirm(
        "Are you sure you want to reset all Home Hero content back to default values?",
      )
    ) {
      setForm(DEFAULT_HOME_HERO_CONFIG);
      setRotatingWordsStr(DEFAULT_HOME_HERO_CONFIG.rotatingWords.join(", "));
      setFeedback({
        type: "success",
        message: "Reset to default constants. Click 'Save & Publish' to write to database.",
      });
    }
  };

  if (isLoading) {
    return (
      <div className={styles.container} style={{ textAlign: "center", padding: "4rem 0" }}>
        <Loader2 size={36} className="animate-spin text-amber-500 mx-auto" />
        <p className={styles.subtitle} style={{ marginTop: "1rem" }}>
          Loading live Hero configuration from MongoDB...
        </p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* TOP HEADER */}
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <h1 className={styles.title}>Home Content Manager</h1>
          <p className={styles.subtitle}>
            Directly update text, headline words, buttons, 3D orbit cards, core services, and metrics for the live site.
          </p>
        </div>
        <div className={styles.actionsTop}>
          <button
            type="button"
            className={styles.btnSecondary}
            onClick={handleReset}
            disabled={isSaving}
          >
            <RotateCcw size={15} />
            Reset Defaults
          </button>
          <button
            type="button"
            className={styles.btnPrimary}
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {isSaving ? "Saving to Database..." : "Save & Publish to Live Site"}
          </button>
        </div>
      </div>

      {/* FEEDBACK ALERT */}
      {feedback && (
        <div className={feedback.type === "success" ? styles.alertSuccess : styles.alertError}>
          {feedback.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* 1. BADGE & HEADLINE */}
      <section className={styles.cardSection}>
        <h2 className={styles.sectionHeader}>
          <Sparkles size={18} /> 1. Top Badge & Animated Headline
        </h2>

        <div className={styles.fieldGrid}>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Top Status Badge Text</label>
            <input
              type="text"
              className={styles.input}
              value={form.badgeText}
              onChange={(e) => setForm({ ...form, badgeText: e.target.value })}
              placeholder="e.g. INNOVATION & ENGINEERING EXCELLENCE"
            />
            <span className={styles.hint}>Displays inside the illuminated pill at the top of hero.</span>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>Headline Prefix</label>
            <input
              type="text"
              className={styles.input}
              value={form.headlinePrefix}
              onChange={(e) => setForm({ ...form, headlinePrefix: e.target.value })}
              placeholder="e.g. Engineering the Future of"
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>Headline Suffix</label>
            <input
              type="text"
              className={styles.input}
              value={form.headlineSuffix}
              onChange={(e) => setForm({ ...form, headlineSuffix: e.target.value })}
              placeholder="e.g.  Software"
            />
          </div>
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label}>Dynamic Rotating Words (Comma-Separated)</label>
          <input
            type="text"
            className={styles.input}
            value={rotatingWordsStr}
            onChange={(e) => setRotatingWordsStr(e.target.value)}
            placeholder="e.g. Scalable, Autonomous, Resilient, Intelligent, Brilliant, Next-Gen"
          />
          <div className={styles.pillRow}>
            {rotatingWordsStr
              .split(",")
              .map((w) => w.trim())
              .filter(Boolean)
              .map((word, i) => (
                <span key={i} className={styles.wordPill}>
                  {word}
                </span>
              ))}
          </div>
        </div>
      </section>

      {/* 2. MISSION STATEMENT & CTAs */}
      <section className={styles.cardSection}>
        <h2 className={styles.sectionHeader}>
          <FileText size={18} /> 2. Mission Paragraph & Action Buttons
        </h2>

        <div className={styles.fieldGroup}>
          <label className={styles.label}>Company Mission Statement / Description</label>
          <textarea
            className={styles.textarea}
            value={form.missionStatement}
            onChange={(e) => setForm({ ...form, missionStatement: e.target.value })}
            placeholder="Enter the primary mission paragraph..."
          />
        </div>

        <div className={styles.fieldGrid}>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Primary Button Label</label>
            <input
              type="text"
              className={styles.input}
              value={form.primaryBtnText}
              onChange={(e) => setForm({ ...form, primaryBtnText: e.target.value })}
              placeholder="e.g. TALK TO US"
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>Primary Button Link URL</label>
            <input
              type="text"
              className={styles.input}
              value={form.primaryBtnLink}
              onChange={(e) => setForm({ ...form, primaryBtnLink: e.target.value })}
              placeholder="e.g. /contact"
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>Secondary Button Label (Video Modal)</label>
            <input
              type="text"
              className={styles.input}
              value={form.secondaryBtnText}
              onChange={(e) => setForm({ ...form, secondaryBtnText: e.target.value })}
              placeholder="e.g. WATCH OUR FILM"
            />
          </div>
        </div>
      </section>

      {/* 3. 3D EARTH ORBIT CARDS (5 BADGES) */}
      <section className={styles.cardSection}>
        <h2 className={styles.sectionHeader}>
          <Globe size={18} /> 3. 3D Earth Orbit Badges (5 Floating Transparent Cards)
        </h2>

        <div className={styles.cardsGrid5}>
          {/* Ideas */}
          <div className={styles.subCard}>
            <h3 className={styles.subCardTitle}>💡 Card 1: Ideas</h3>
            <input
              type="text"
              className={styles.input}
              value={form.orbitCards.ideas.title}
              onChange={(e) =>
                setForm({
                  ...form,
                  orbitCards: {
                    ...form.orbitCards,
                    ideas: { ...form.orbitCards.ideas, title: e.target.value },
                  },
                })
              }
              placeholder="Title"
            />
            <input
              type="text"
              className={styles.input}
              value={form.orbitCards.ideas.desc}
              onChange={(e) =>
                setForm({
                  ...form,
                  orbitCards: {
                    ...form.orbitCards,
                    ideas: { ...form.orbitCards.ideas, desc: e.target.value },
                  },
                })
              }
              placeholder="Description"
            />
          </div>

          {/* Technology */}
          <div className={styles.subCard}>
            <h3 className={styles.subCardTitle}>⚡ Card 2: Technology</h3>
            <input
              type="text"
              className={styles.input}
              value={form.orbitCards.technology.title}
              onChange={(e) =>
                setForm({
                  ...form,
                  orbitCards: {
                    ...form.orbitCards,
                    technology: { ...form.orbitCards.technology, title: e.target.value },
                  },
                })
              }
              placeholder="Title"
            />
            <input
              type="text"
              className={styles.input}
              value={form.orbitCards.technology.desc}
              onChange={(e) =>
                setForm({
                  ...form,
                  orbitCards: {
                    ...form.orbitCards,
                    technology: { ...form.orbitCards.technology, desc: e.target.value },
                  },
                })
              }
              placeholder="Description"
            />
          </div>

          {/* Growth */}
          <div className={styles.subCard}>
            <h3 className={styles.subCardTitle}>📈 Card 3: Growth</h3>
            <input
              type="text"
              className={styles.input}
              value={form.orbitCards.growth.title}
              onChange={(e) =>
                setForm({
                  ...form,
                  orbitCards: {
                    ...form.orbitCards,
                    growth: { ...form.orbitCards.growth, title: e.target.value },
                  },
                })
              }
              placeholder="Title"
            />
            <input
              type="text"
              className={styles.input}
              value={form.orbitCards.growth.desc}
              onChange={(e) =>
                setForm({
                  ...form,
                  orbitCards: {
                    ...form.orbitCards,
                    growth: { ...form.orbitCards.growth, desc: e.target.value },
                  },
                })
              }
              placeholder="Description"
            />
          </div>

          {/* People */}
          <div className={styles.subCard}>
            <h3 className={styles.subCardTitle}>👥 Card 4: People</h3>
            <input
              type="text"
              className={styles.input}
              value={form.orbitCards.people.title}
              onChange={(e) =>
                setForm({
                  ...form,
                  orbitCards: {
                    ...form.orbitCards,
                    people: { ...form.orbitCards.people, title: e.target.value },
                  },
                })
              }
              placeholder="Title"
            />
            <input
              type="text"
              className={styles.input}
              value={form.orbitCards.people.desc}
              onChange={(e) =>
                setForm({
                  ...form,
                  orbitCards: {
                    ...form.orbitCards,
                    people: { ...form.orbitCards.people, desc: e.target.value },
                  },
                })
              }
              placeholder="Description"
            />
          </div>

          {/* Impact */}
          <div className={styles.subCard}>
            <h3 className={styles.subCardTitle}>🎯 Card 5: Impact</h3>
            <input
              type="text"
              className={styles.input}
              value={form.orbitCards.impact.title}
              onChange={(e) =>
                setForm({
                  ...form,
                  orbitCards: {
                    ...form.orbitCards,
                    impact: { ...form.orbitCards.impact, title: e.target.value },
                  },
                })
              }
              placeholder="Title"
            />
            <input
              type="text"
              className={styles.input}
              value={form.orbitCards.impact.desc}
              onChange={(e) =>
                setForm({
                  ...form,
                  orbitCards: {
                    ...form.orbitCards,
                    impact: { ...form.orbitCards.impact, desc: e.target.value },
                  },
                })
              }
              placeholder="Description"
            />
          </div>
        </div>
      </section>

      {/* 4. CORE SERVICES QUICK STRIP (5 CARDS) */}
      <section className={styles.cardSection}>
        <h2 className={styles.sectionHeader}>
          <Layers size={18} /> 4. Core Services Quick Strip (5 Cards)
        </h2>

        <div className={styles.cardsGrid5}>
          {form.services.map((srv, idx) => (
            <div key={idx} className={styles.subCard}>
              <h3 className={styles.subCardTitle}>Service #{idx + 1}</h3>
              <input
                type="text"
                className={styles.input}
                value={srv.title}
                onChange={(e) => {
                  const updated = [...form.services];
                  updated[idx] = { ...updated[idx], title: e.target.value };
                  setForm({ ...form, services: updated });
                }}
                placeholder="Title"
              />
              <textarea
                className={styles.textarea}
                style={{ minHeight: "65px" }}
                value={srv.desc}
                onChange={(e) => {
                  const updated = [...form.services];
                  updated[idx] = { ...updated[idx], desc: e.target.value };
                  setForm({ ...form, services: updated });
                }}
                placeholder="Short Description"
              />
              <input
                type="text"
                className={styles.input}
                value={srv.link}
                onChange={(e) => {
                  const updated = [...form.services];
                  updated[idx] = { ...updated[idx], link: e.target.value };
                  setForm({ ...form, services: updated });
                }}
                placeholder="Link Target (e.g. /services)"
              />
            </div>
          ))}
        </div>
      </section>

      {/* 5. PROOF STATS COUNTERS (4 METRICS) */}
      <section className={styles.cardSection}>
        <h2 className={styles.sectionHeader}>
          <BarChart3 size={18} /> 5. Proof Metrics Counters (4 Stats)
        </h2>

        <div className={styles.fieldGrid}>
          {form.metrics.map((metric, idx) => (
            <div key={idx} className={styles.subCard}>
              <h3 className={styles.subCardTitle}>Metric #{idx + 1}</h3>
              <input
                type="text"
                className={styles.input}
                value={metric.value}
                onChange={(e) => {
                  const updated = [...form.metrics];
                  updated[idx] = { ...updated[idx], value: e.target.value };
                  setForm({ ...form, metrics: updated });
                }}
                placeholder="Number Value (e.g. 100+)"
              />
              <input
                type="text"
                className={styles.input}
                value={metric.label}
                onChange={(e) => {
                  const updated = [...form.metrics];
                  updated[idx] = { ...updated[idx], label: e.target.value };
                  setForm({ ...form, metrics: updated });
                }}
                placeholder="Label (e.g. Projects Delivered)"
              />
            </div>
          ))}
        </div>
      </section>

      {/* BOTTOM FLOATING SAVE BAR */}
      <div className={styles.header} style={{ borderTop: "1px solid rgba(255, 255, 255, 0.08)", paddingTop: "1.25rem", borderBottom: "none" }}>
        <p className={styles.subtitle}>
          Clicking save writes changes directly to MongoDB and broadcasts updates to live site visitors.
        </p>
        <button
          type="button"
          className={styles.btnPrimary}
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {isSaving ? "Saving to Database..." : "Save & Publish to Live Site"}
        </button>
      </div>
    </div>
  );
}
