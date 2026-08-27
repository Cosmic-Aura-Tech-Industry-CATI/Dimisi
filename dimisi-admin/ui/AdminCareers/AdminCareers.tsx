import { useState, useTransition } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  Briefcase,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Star,
  Eye,
  EyeOff,
  ExternalLink,
  MapPin,
  Clock,
  Sparkles,
  Layers,
  X,
  UserCheck,
  Send,
  Save,
  Globe,
  Heart,
  BookOpen,
  Sun,
  Laptop,
  Shield,
  Settings,
} from "lucide-react";
import {
  type JobOpening,
  type JobInput,
  type JobType,
  type WorkplaceType,
  type JobStatus,
  type HiringProcessStep,
  type CultureBenefit,
  type CareersHeroConfig,
  type CareersClosingCtaConfig,
  slugifyJob,
} from "@/lib/careers.shared";
import {
  saveJobFn,
  deleteJobFn,
  saveHiringStepsFn,
  saveBenefitsFn,
  saveCareersHeroFn,
} from "@/lib/careers.functions";
import styles from "./AdminCareers.module.css";

interface AdminCareersProps {
  jobs: JobOpening[];
  hiringSteps: HiringProcessStep[];
  benefits: CultureBenefit[];
  hero: CareersHeroConfig;
  closingCta: CareersClosingCtaConfig;
  onRefresh: () => void;
}

export function AdminCareers({
  jobs,
  hiringSteps,
  benefits,
  hero,
  closingCta,
  onRefresh,
}: AdminCareersProps) {
  const [isPending, startTransition] = useTransition();
  const saveJob = useServerFn(saveJobFn);
  const deleteJob = useServerFn(deleteJobFn);
  const saveSteps = useServerFn(saveHiringStepsFn);
  const saveBenefitsList = useServerFn(saveBenefitsFn);
  const saveHeroSettings = useServerFn(saveCareersHeroFn);

  // Active sub-section
  const [activeSection, setActiveSection] = useState<"jobs" | "steps" | "benefits" | "hero">("jobs");

  // Job Modal State
  const [showJobModal, setShowJobModal] = useState(false);
  const [editingJob, setEditingJob] = useState<JobOpening | null>(null);
  const [modalTab, setModalTab] = useState<"basic" | "details" | "requirements">("basic");

  // Job Form State
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [department, setDepartment] = useState("Content & Editorial");
  const [type, setType] = useState<JobType>("Internship");
  const [workplace, setWorkplace] = useState<WorkplaceType>("Remote");
  const [location, setLocation] = useState("Remote / Noida");
  const [summary, setSummary] = useState("");
  const [responsibilities, setResponsibilities] = useState<string[]>([]);
  const [newResp, setNewResp] = useState("");
  const [requirements, setRequirements] = useState<string[]>([]);
  const [newReq, setNewReq] = useState("");
  const [jobBenefits, setJobBenefits] = useState<string[]>([]);
  const [newJobBenefit, setNewJobBenefit] = useState("");
  const [applyUrl, setApplyUrl] = useState("https://www.thekalesh.com/careers");
  const [orderIndex, setOrderIndex] = useState(1);
  const [isFeatured, setIsFeatured] = useState(false);
  const [status, setStatus] = useState<JobStatus>("open");
  const [formError, setFormError] = useState<string | null>(null);

  // Editable Steps State
  const [stepsList, setStepsList] = useState<HiringProcessStep[]>(hiringSteps);
  // Editable Benefits State
  const [benefitsList, setBenefitsList] = useState<CultureBenefit[]>(benefits);
  // Editable Hero / CTA State
  const [heroHeading, setHeroHeading] = useState(hero.heading);
  const [heroSubline, setHeroSubline] = useState(hero.subline);
  const [heroCaption, setHeroCaption] = useState(hero.illustration_caption);
  const [heroCtaText, setHeroCtaText] = useState(hero.cta_text);
  const [heroCtaLink, setHeroCtaLink] = useState(hero.cta_link);
  const [closingHeading, setClosingHeading] = useState(closingCta.heading);
  const [closingSubline, setClosingSubline] = useState(closingCta.subline);
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  const handleOpenCreateJob = () => {
    setEditingJob(null);
    setTitle("");
    setSlug("");
    setDepartment("Engineering");
    setType("Full-time");
    setWorkplace("Remote");
    setLocation("Remote / Noida");
    setSummary("");
    setResponsibilities(["Architect scalable backend workflows.", "Collaborate with UI/UX designers."]);
    setRequirements(["2+ years with TypeScript & React/Node.", "Passion for clean modular architecture."]);
    setJobBenefits(["Competitive compensation & bonuses.", "Flexible remote working hours."]);
    setApplyUrl("https://www.thekalesh.com/careers");
    setOrderIndex(jobs.length + 1);
    setIsFeatured(false);
    setStatus("open");
    setModalTab("basic");
    setFormError(null);
    setShowJobModal(true);
  };

  const handleOpenEditJob = (j: JobOpening) => {
    setEditingJob(j);
    setTitle(j.title);
    setSlug(j.slug);
    setDepartment(j.department);
    setType(j.type);
    setWorkplace(j.workplace);
    setLocation(j.location);
    setSummary(j.summary);
    setResponsibilities(j.responsibilities || []);
    setRequirements(j.requirements || []);
    setJobBenefits(j.benefits || []);
    setApplyUrl(j.apply_url);
    setOrderIndex(j.order_index);
    setIsFeatured(j.is_featured);
    setStatus(j.status);
    setModalTab("basic");
    setFormError(null);
    setShowJobModal(true);
  };

  const handleSaveJob = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const input: JobInput = {
      id: editingJob?.id ?? undefined,
      title,
      slug: slug || slugifyJob(title),
      department,
      type,
      workplace,
      location,
      summary,
      responsibilities,
      requirements,
      benefits: jobBenefits,
      apply_url: applyUrl,
      order_index: Number(orderIndex),
      is_featured: isFeatured,
      status,
    };

    startTransition(async () => {
      try {
        const res = await saveJob({ data: input });
        if (res.success) {
          setShowJobModal(false);
          onRefresh();
        } else {
          setFormError(res.error || "Failed to save job opening.");
        }
      } catch (err) {
        setFormError(err instanceof Error ? err.message : "Error saving job.");
      }
    });
  };

  const handleDeleteJob = (id: string, jobTitle: string) => {
    if (window.confirm(`Are you sure you want to delete role "${jobTitle}"?`)) {
      startTransition(async () => {
        await deleteJob({ data: { id } });
        onRefresh();
      });
    }
  };

  const handleToggleStatus = (j: JobOpening) => {
    const nextStatus: JobStatus = j.status === "open" ? "closed" : "open";
    startTransition(async () => {
      await saveJob({
        data: {
          id: j.id,
          title: j.title,
          slug: j.slug,
          department: j.department,
          type: j.type,
          workplace: j.workplace,
          location: j.location,
          summary: j.summary,
          responsibilities: j.responsibilities,
          requirements: j.requirements,
          benefits: j.benefits,
          apply_url: j.apply_url,
          order_index: j.order_index,
          is_featured: j.is_featured,
          status: nextStatus,
        },
      });
      onRefresh();
    });
  };

  const handleToggleFeatured = (j: JobOpening) => {
    startTransition(async () => {
      await saveJob({
        data: {
          id: j.id,
          title: j.title,
          slug: j.slug,
          department: j.department,
          type: j.type,
          workplace: j.workplace,
          location: j.location,
          summary: j.summary,
          responsibilities: j.responsibilities,
          requirements: j.requirements,
          benefits: j.benefits,
          apply_url: j.apply_url,
          order_index: j.order_index,
          is_featured: !j.is_featured,
          status: j.status,
        },
      });
      onRefresh();
    });
  };

  const handleSaveAllSteps = () => {
    startTransition(async () => {
      await saveSteps({ data: { steps: stepsList } });
      onRefresh();
      alert("Hiring process steps saved successfully!");
    });
  };

  const handleSaveAllBenefits = () => {
    startTransition(async () => {
      await saveBenefitsList({ data: { benefits: benefitsList } });
      onRefresh();
      alert("Culture and benefits saved successfully!");
    });
  };

  const handleSaveHeroAndCta = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      await saveHeroSettings({
        data: {
          hero: {
            heading: heroHeading,
            subline: heroSubline,
            illustration_caption: heroCaption,
            cta_text: heroCtaText,
            cta_link: heroCtaLink,
          },
          closing_cta: {
            heading: closingHeading,
            subline: closingSubline,
            cta_link: heroCtaLink,
          },
        },
      });
      setSettingsSuccess(true);
      setTimeout(() => setSettingsSuccess(false), 3000);
      onRefresh();
    });
  };

  return (
    <div className={styles.wrapper}>
      {/* Top Header Row */}
      <div className={styles.headerRow}>
        <div>
          <h2 className={styles.title}>Careers &amp; Recruitment Management</h2>
          <p className={styles.subtitle}>
            Manage open positions, 5-step hiring workflow, culture &amp; benefits, and direct application CTAs.
          </p>
        </div>

        <div className={styles.actions}>
          <div className={styles.navTabs}>
            <button
              type="button"
              className={[
                styles.navTabBtn,
                activeSection === "jobs" ? styles.navTabBtnActive : "",
              ].join(" ")}
              onClick={() => setActiveSection("jobs")}
            >
              Open Roles ({jobs.length})
            </button>
            <button
              type="button"
              className={[
                styles.navTabBtn,
                activeSection === "steps" ? styles.navTabBtnActive : "",
              ].join(" ")}
              onClick={() => setActiveSection("steps")}
            >
              Hiring Process ({stepsList.length})
            </button>
            <button
              type="button"
              className={[
                styles.navTabBtn,
                activeSection === "benefits" ? styles.navTabBtnActive : "",
              ].join(" ")}
              onClick={() => setActiveSection("benefits")}
            >
              Culture &amp; Benefits ({benefitsList.length})
            </button>
            <button
              type="button"
              className={[
                styles.navTabBtn,
                activeSection === "hero" ? styles.navTabBtnActive : "",
              ].join(" ")}
              onClick={() => setActiveSection("hero")}
            >
              Hero &amp; CTA Settings
            </button>
          </div>

          {activeSection === "jobs" && (
            <button type="button" className={styles.createBtn} onClick={handleOpenCreateJob}>
              <Plus size={16} />
              <span>Add New Role</span>
            </button>
          )}
        </div>
      </div>

      {/* SUB-SECTION 1: JOBS TABLE */}
      {activeSection === "jobs" && (
        <div className={styles.tableCard}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: "60px" }}>Order</th>
                <th>Role Title</th>
                <th>Department</th>
                <th>Type</th>
                <th>Location</th>
                <th>Apply URL</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((j) => (
                <tr key={j.id} className={j.status !== "open" ? styles.inactiveRow : ""}>
                  <td className={styles.orderCell}>{j.order_index}</td>
                  <td>
                    <div className={styles.titleCol}>
                      <span className={styles.jobName}>{j.title}</span>
                      <span className={styles.jobSummarySnippet}>{j.summary}</span>
                    </div>
                  </td>
                  <td>
                    <span className={styles.departmentTag}>{j.department}</span>
                  </td>
                  <td>
                    <span className={styles.typeTag}>{j.type}</span>
                  </td>
                  <td>
                    <span className={styles.locText}>{j.location}</span>
                  </td>
                  <td>
                    <a
                      href={j.apply_url}
                      target="_blank"
                      rel="noreferrer"
                      className={styles.applyLinkA}
                    >
                      <span>Apply Link</span>
                      <ExternalLink size={11} />
                    </a>
                  </td>
                  <td>
                    <div className={styles.statusCell}>
                      <button
                        type="button"
                        className={[
                          styles.toggleIconBtn,
                          j.status === "open" ? styles.activeIcon : styles.inactiveIcon,
                        ].join(" ")}
                        onClick={() => handleToggleStatus(j)}
                        title={j.status === "open" ? "Click to close role" : "Click to open role"}
                      >
                        {j.status === "open" ? <Eye size={16} /> : <EyeOff size={16} />}
                      </button>

                      <button
                        type="button"
                        className={[
                          styles.toggleIconBtn,
                          j.is_featured ? styles.starActive : styles.starInactive,
                        ].join(" ")}
                        onClick={() => handleToggleFeatured(j)}
                        title={j.is_featured ? "Featured spotlight" : "Click to feature"}
                      >
                        <Star size={16} />
                      </button>
                    </div>
                  </td>
                  <td>
                    <div className={styles.rowActions}>
                      <button
                        type="button"
                        className={styles.editBtn}
                        onClick={() => handleOpenEditJob(j)}
                        title="Edit Full Role"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        type="button"
                        className={styles.delBtn}
                        onClick={() => handleDeleteJob(j.id, j.title)}
                        title="Delete Role"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* SUB-SECTION 2: HIRING PROCESS STEPS EDITOR */}
      {activeSection === "steps" && (
        <div className={styles.editorCard}>
          <div className={styles.editorHeader}>
            <div>
              <h3 className={styles.editorTitle}>5-Step Recruitment Process</h3>
              <p className={styles.editorSub}>Customize step names, details, and expected turnaround durations.</p>
            </div>
            <button type="button" className={styles.saveBtn} onClick={handleSaveAllSteps}>
              <Save size={15} />
              <span>Save Hiring Steps</span>
            </button>
          </div>

          <div className={styles.stepsList}>
            {stepsList.map((step, idx) => (
              <div key={idx} className={styles.stepEditorRow}>
                <div className={styles.stepBadgeBox}>
                  <span>Step</span>
                  <strong>{step.step}</strong>
                </div>

                <div className={styles.stepFields}>
                  <div className={styles.formGrid2}>
                    <input
                      type="text"
                      value={step.title}
                      onChange={(e) => {
                        const copy = [...stepsList];
                        copy[idx] = { ...copy[idx], title: e.target.value };
                        setStepsList(copy);
                      }}
                      placeholder="Step Title (e.g. Intro Call)"
                      className={styles.stepTitleInput}
                    />
                    <input
                      type="text"
                      value={step.duration || ""}
                      onChange={(e) => {
                        const copy = [...stepsList];
                        copy[idx] = { ...copy[idx], duration: e.target.value };
                        setStepsList(copy);
                      }}
                      placeholder="Duration (e.g. 20 Minutes or 48 Hours)"
                    />
                  </div>
                  <textarea
                    rows={2}
                    value={step.detail}
                    onChange={(e) => {
                      const copy = [...stepsList];
                      copy[idx] = { ...copy[idx], detail: e.target.value };
                      setStepsList(copy);
                    }}
                    placeholder="Step Description..."
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-SECTION 3: CULTURE & BENEFITS EDITOR */}
      {activeSection === "benefits" && (
        <div className={styles.editorCard}>
          <div className={styles.editorHeader}>
            <div>
              <h3 className={styles.editorTitle}>Culture &amp; Benefits Cards</h3>
              <p className={styles.editorSub}>Configure the 6 core pillars that describe our workplace value.</p>
            </div>
            <button type="button" className={styles.saveBtn} onClick={handleSaveAllBenefits}>
              <Save size={15} />
              <span>Save Culture &amp; Benefits</span>
            </button>
          </div>

          <div className={styles.benefitsGridEditor}>
            {benefitsList.map((b, idx) => (
              <div key={b.id} className={styles.benefitEditorCard}>
                <div className={styles.formGrid2}>
                  <input
                    type="text"
                    value={b.title}
                    onChange={(e) => {
                      const copy = [...benefitsList];
                      copy[idx] = { ...copy[idx], title: e.target.value };
                      setBenefitsList(copy);
                    }}
                    placeholder="Benefit Title (e.g. Remote-First)"
                    className={styles.benefitTitleInput}
                  />
                  <select
                    value={b.icon_tag || "globe"}
                    onChange={(e) => {
                      const copy = [...benefitsList];
                      copy[idx] = { ...copy[idx], icon_tag: e.target.value };
                      setBenefitsList(copy);
                    }}
                    className={styles.iconSelect}
                  >
                    <option value="globe">Globe (Remote)</option>
                    <option value="heart">Heart (Wellness)</option>
                    <option value="book">Book (Learning)</option>
                    <option value="sun">Sun (PTO)</option>
                    <option value="laptop">Laptop (Gear)</option>
                    <option value="shield">Shield (Ownership)</option>
                  </select>
                </div>
                <textarea
                  rows={3}
                  value={b.description}
                  onChange={(e) => {
                    const copy = [...benefitsList];
                    copy[idx] = { ...copy[idx], description: e.target.value };
                    setBenefitsList(copy);
                  }}
                  placeholder="Benefit description..."
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-SECTION 4: HERO & CTA CONFIG */}
      {activeSection === "hero" && (
        <div className={styles.editorCard}>
          <div className={styles.editorHeader}>
            <div>
              <h3 className={styles.editorTitle}>Hero &amp; Closing CTA Settings</h3>
              <p className={styles.editorSub}>Manage headings, sublines, Bhootdev Careers caption, and global apply link.</p>
            </div>
            {settingsSuccess && <span className={styles.successBadge}>Saved Successfully!</span>}
          </div>

          <form onSubmit={handleSaveHeroAndCta} className={styles.settingsForm}>
            <div className={styles.formSection}>
              <h4 className={styles.sectionHeader}>Hero Section</h4>
              <div className={styles.formGrid2}>
                <div className={styles.formGroup}>
                  <label>Hero Heading</label>
                  <input
                    type="text"
                    required
                    value={heroHeading}
                    onChange={(e) => setHeroHeading(e.target.value)}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Illustration Caption</label>
                  <input
                    type="text"
                    required
                    value={heroCaption}
                    onChange={(e) => setHeroCaption(e.target.value)}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Hero Subtitle</label>
                <textarea
                  rows={2}
                  required
                  value={heroSubline}
                  onChange={(e) => setHeroSubline(e.target.value)}
                />
              </div>

              <div className={styles.formGrid2}>
                <div className={styles.formGroup}>
                  <label>Hero Primary Button Text</label>
                  <input
                    type="text"
                    required
                    value={heroCtaText}
                    onChange={(e) => setHeroCtaText(e.target.value)}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Global Apply Link URL</label>
                  <input
                    type="url"
                    required
                    value={heroCtaLink}
                    onChange={(e) => setHeroCtaLink(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className={styles.formSection}>
              <h4 className={styles.sectionHeader}>Closing Call To Action</h4>
              <div className={styles.formGroup}>
                <label>Closing Heading</label>
                <input
                  type="text"
                  required
                  value={closingHeading}
                  onChange={(e) => setClosingHeading(e.target.value)}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Closing Subtitle</label>
                <textarea
                  rows={2}
                  required
                  value={closingSubline}
                  onChange={(e) => setClosingSubline(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" disabled={isPending} className={styles.saveSubmitBtn}>
              {isPending ? "Saving..." : "Update Settings"}
            </button>
          </form>
        </div>
      )}

      {/* FULL JOB CREATE / EDIT MODAL */}
      {showJobModal && (
        <div className={styles.modalBackdrop} role="dialog" aria-modal="true">
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <h3 className={styles.modalTitle}>
                  {editingJob ? `Edit Role: ${editingJob.title}` : "Add New Open Position"}
                </h3>
                <p className={styles.modalSub}>
                  Define role requirements, responsibilities, department, and custom apply links.
                </p>
              </div>
              <button
                type="button"
                className={styles.modalClose}
                onClick={() => setShowJobModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className={styles.modalTabsBar}>
              {[
                { id: "basic", label: "1. Basic Info & Setup" },
                { id: "details", label: "2. Summary & Responsibilities" },
                { id: "requirements", label: "3. Qualifications & Perks" },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={[
                    styles.modalTabBtn,
                    modalTab === t.id ? styles.modalTabBtnActive : "",
                  ].join(" ")}
                  onClick={() => setModalTab(t.id as typeof modalTab)}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {formError && <div className={styles.errorAlert}>{formError}</div>}

            <form onSubmit={handleSaveJob} className={styles.modalForm}>
              {/* TAB 1: BASIC INFO */}
              {modalTab === "basic" && (
                <div className={styles.tabPane}>
                  <div className={styles.formGrid2}>
                    <div className={styles.formGroup}>
                      <label>Job Title *</label>
                      <input
                        type="text"
                        required
                        value={title}
                        onChange={(e) => {
                          setTitle(e.target.value);
                          if (!editingJob) setSlug(slugifyJob(e.target.value));
                        }}
                        placeholder="e.g. Content Writer Intern"
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label>URL Slug *</label>
                      <input
                        type="text"
                        required
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        placeholder="e.g. content-writer-intern"
                      />
                    </div>
                  </div>

                  <div className={styles.formGrid3}>
                    <div className={styles.formGroup}>
                      <label>Department *</label>
                      <input
                        type="text"
                        required
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        placeholder="e.g. Content & Editorial"
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label>Job Type *</label>
                      <select
                        value={type}
                        onChange={(e) => setType(e.target.value as JobType)}
                        className={styles.selectInput}
                      >
                        <option value="Internship">Internship</option>
                        <option value="Full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Contract">Contract</option>
                        <option value="Remote">Remote</option>
                      </select>
                    </div>

                    <div className={styles.formGroup}>
                      <label>Workplace Mode</label>
                      <select
                        value={workplace}
                        onChange={(e) => setWorkplace(e.target.value as WorkplaceType)}
                        className={styles.selectInput}
                      >
                        <option value="Remote">Remote</option>
                        <option value="Hybrid">Hybrid</option>
                        <option value="On-site">On-site</option>
                      </select>
                    </div>
                  </div>

                  <div className={styles.formGrid2}>
                    <div className={styles.formGroup}>
                      <label>Location *</label>
                      <input
                        type="text"
                        required
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g. Remote / Noida"
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label>Display Order</label>
                      <input
                        type="number"
                        value={orderIndex}
                        onChange={(e) => setOrderIndex(Number(e.target.value))}
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Application Link URL *</label>
                    <input
                      type="url"
                      required
                      value={applyUrl}
                      onChange={(e) => setApplyUrl(e.target.value)}
                      placeholder="https://www.thekalesh.com/careers"
                    />
                  </div>

                  <div className={styles.toggleRow}>
                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={status === "open"}
                        onChange={(e) => setStatus(e.target.checked ? "open" : "closed")}
                      />
                      <span>Active &amp; Open for Applications</span>
                    </label>

                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={isFeatured}
                        onChange={(e) => setIsFeatured(e.target.checked)}
                      />
                      <span>Featured Spotlight Badge</span>
                    </label>
                  </div>
                </div>
              )}

              {/* TAB 2: SUMMARY & RESPONSIBILITIES */}
              {modalTab === "details" && (
                <div className={styles.tabPane}>
                  <div className={styles.formGroup}>
                    <label>Short Role Summary *</label>
                    <textarea
                      rows={3}
                      required
                      value={summary}
                      onChange={(e) => setSummary(e.target.value)}
                      placeholder="Research, write, and craft compelling narratives, tech articles, case studies, and engaging social content..."
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Key Responsibilities ({responsibilities.length})</label>
                    <div className={styles.chipsList}>
                      {responsibilities.map((r, idx) => (
                        <div key={idx} className={styles.chipItem}>
                          <CheckCircle2 size={13} className={styles.chipCheck} />
                          <span>{r}</span>
                          <button
                            type="button"
                            className={styles.chipDelBtn}
                            onClick={() => setResponsibilities(responsibilities.filter((_, i) => i !== idx))}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className={styles.addInputRow}>
                      <input
                        type="text"
                        value={newResp}
                        onChange={(e) => setNewResp(e.target.value)}
                        placeholder="Add responsibility..."
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            if (newResp.trim()) {
                              setResponsibilities([...responsibilities, newResp.trim()]);
                              setNewResp("");
                            }
                          }
                        }}
                      />
                      <button
                        type="button"
                        className={styles.smallAddBtn}
                        onClick={() => {
                          if (newResp.trim()) {
                            setResponsibilities([...responsibilities, newResp.trim()]);
                            setNewResp("");
                          }
                        }}
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: REQUIREMENTS & PERKS */}
              {modalTab === "requirements" && (
                <div className={styles.tabPane}>
                  <div className={styles.formGroup}>
                    <label>Qualifications &amp; Requirements ({requirements.length})</label>
                    <div className={styles.chipsList}>
                      {requirements.map((req, idx) => (
                        <div key={idx} className={styles.chipItem}>
                          <CheckCircle2 size={13} className={styles.chipCheck} />
                          <span>{req}</span>
                          <button
                            type="button"
                            className={styles.chipDelBtn}
                            onClick={() => setRequirements(requirements.filter((_, i) => i !== idx))}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className={styles.addInputRow}>
                      <input
                        type="text"
                        value={newReq}
                        onChange={(e) => setNewReq(e.target.value)}
                        placeholder="Add qualification..."
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            if (newReq.trim()) {
                              setRequirements([...requirements, newReq.trim()]);
                              setNewReq("");
                            }
                          }
                        }}
                      />
                      <button
                        type="button"
                        className={styles.smallAddBtn}
                        onClick={() => {
                          if (newReq.trim()) {
                            setRequirements([...requirements, newReq.trim()]);
                            setNewReq("");
                          }
                        }}
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Perks &amp; Offerings ({jobBenefits.length})</label>
                    <div className={styles.chipsList}>
                      {jobBenefits.map((b, idx) => (
                        <div key={idx} className={styles.chipItem}>
                          <Sparkles size={13} className={styles.chipSparkle} />
                          <span>{b}</span>
                          <button
                            type="button"
                            className={styles.chipDelBtn}
                            onClick={() => setJobBenefits(jobBenefits.filter((_, i) => i !== idx))}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className={styles.addInputRow}>
                      <input
                        type="text"
                        value={newJobBenefit}
                        onChange={(e) => setNewJobBenefit(e.target.value)}
                        placeholder="Add offering (e.g. Stipend with performance bonus)..."
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            if (newJobBenefit.trim()) {
                              setJobBenefits([...jobBenefits, newJobBenefit.trim()]);
                              setNewJobBenefit("");
                            }
                          }
                        }}
                      />
                      <button
                        type="button"
                        className={styles.smallAddBtn}
                        onClick={() => {
                          if (newJobBenefit.trim()) {
                            setJobBenefits([...jobBenefits, newJobBenefit.trim()]);
                            setNewJobBenefit("");
                          }
                        }}
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => setShowJobModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" disabled={isPending} className={styles.saveSubmitBtn}>
                  {isPending ? "Saving Role..." : editingJob ? "Update Role" : "Publish Open Role"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
