import { useState, useTransition, useRef, useEffect, useMemo } from "react";
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
  X,
  UserCheck,
  Save,
  Globe,
  FileText,
  Search,
  Download,
  Users,
  Mail,
  Phone,
  Filter,
  User,
  AlertCircle,
  Calendar,
  Layers,
} from "lucide-react";
import {
  type JobOpening,
  type JobInput,
  type JobType,
  type WorkplaceType,
  type JobStatus,
  type JobApplicationItem,
  type ApplicationStatus,
  type HiringProcessStep,
  type CultureBenefit,
  type CareersHeroConfig,
  type CareersClosingCtaConfig,
  APPLICATION_STATUS_META,
  slugifyJob,
} from "@/lib/careers.shared";
import {
  saveJobFn,
  deleteJobFn,
  saveHiringStepsFn,
  saveBenefitsFn,
  saveCareersHeroFn,
  updateApplicationStatusFn,
  deleteApplicationFn,
} from "@/lib/careers.functions";
import styles from "./AdminCareers.module.css";

interface AdminCareersProps {
  jobs: JobOpening[];
  applications?: JobApplicationItem[];
  hiringSteps: HiringProcessStep[];
  benefits: CultureBenefit[];
  hero: CareersHeroConfig;
  closingCta: CareersClosingCtaConfig;
  onRefresh: () => void;
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function formatFileSize(bytes: number): string {
  if (!bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function AdminCareers({
  jobs,
  applications = [],
  hiringSteps,
  benefits,
  hero,
  closingCta,
  onRefresh,
}: AdminCareersProps) {
  const [isPending, startTransition] = useTransition();
  const saveJob = saveJobFn;
  const deleteJob = deleteJobFn;
  const saveSteps = saveHiringStepsFn;
  const saveBenefitsList = saveBenefitsFn;
  const saveHeroSettings = saveCareersHeroFn;

  // Active sub-section
  const [activeSection, setActiveSection] = useState<
    "applications" | "jobs" | "steps" | "benefits" | "hero"
  >("applications");

  // --- APPLICATIONS STATE ---
  const [appSearch, setAppSearch] = useState("");
  const [appStatusFilter, setAppStatusFilter] = useState<"all" | ApplicationStatus>("all");
  const [appPositionFilter, setAppPositionFilter] = useState<string>("all");
  const [selectedApplication, setSelectedApplication] = useState<JobApplicationItem | null>(null);
  const [selectedResume, setSelectedResume] = useState<JobApplicationItem | null>(null);
  const [applicationToDelete, setApplicationToDelete] = useState<JobApplicationItem | null>(null);
  const [appNotesText, setAppNotesText] = useState("");
  const [appNotesSuccess, setAppNotesSuccess] = useState<string | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Synchronize notes when selectedApplication changes
  useEffect(() => {
    if (selectedApplication) {
      setAppNotesText(selectedApplication.notes || "");
      setAppNotesSuccess(null);
    }
  }, [selectedApplication]);

  // Keyboard accessibility for modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (applicationToDelete) {
          setApplicationToDelete(null);
        } else if (selectedResume) {
          setSelectedResume(null);
        } else if (selectedApplication) {
          setSelectedApplication(null);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [applicationToDelete, selectedResume, selectedApplication]);

  // Unique job titles for filtering
  const uniqueJobPositions = useMemo(() => {
    const set = new Set<string>();
    applications.forEach((a) => set.add(a.job_title));
    jobs.forEach((j) => set.add(j.title));
    return Array.from(set);
  }, [applications, jobs]);

  // Filtered applications
  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const query = appSearch.toLowerCase().trim();
      const matchSearch =
        !query ||
        app.full_name.toLowerCase().includes(query) ||
        app.email.toLowerCase().includes(query) ||
        app.job_title.toLowerCase().includes(query) ||
        app.location.toLowerCase().includes(query) ||
        (app.job_department && app.job_department.toLowerCase().includes(query));

      const matchStatus =
        appStatusFilter === "all" || app.status === appStatusFilter;

      const matchPosition =
        appPositionFilter === "all" ||
        app.job_title.toLowerCase() === appPositionFilter.toLowerCase();

      return matchSearch && matchStatus && matchPosition;
    });
  }, [applications, appSearch, appStatusFilter, appPositionFilter]);

  // Status Metrics
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {
      total: applications.length,
      new: 0,
      reviewing: 0,
      shortlisted: 0,
      interview: 0,
      rejected: 0,
      hired: 0,
    };
    applications.forEach((a) => {
      if (counts[a.status] !== undefined) {
        counts[a.status]++;
      }
    });
    return counts;
  }, [applications]);

  // Handle Application Actions
  const handleStatusChange = (id: string, nextStatus: ApplicationStatus) => {
    startTransition(async () => {
      await updateApplicationStatusFn({
        data: { id, status: nextStatus },
      });
      if (selectedApplication && selectedApplication.id === id) {
        setSelectedApplication({ ...selectedApplication, status: nextStatus });
      }
      onRefresh();
    });
  };

  const handleSaveNotes = (id: string) => {
    if (!selectedApplication) return;
    startTransition(async () => {
      const res = await updateApplicationStatusFn({
        data: {
          id,
          status: selectedApplication.status,
          notes: appNotesText,
        },
      });
      if (res.success && res.application) {
        setSelectedApplication(res.application);
        setAppNotesSuccess("Notes saved successfully!");
        setTimeout(() => setAppNotesSuccess(null), 3000);
        onRefresh();
      }
    });
  };

  const confirmDeleteApplication = () => {
    if (!applicationToDelete) return;
    const targetId = applicationToDelete.id;
    const candidateName = applicationToDelete.full_name;
    startTransition(async () => {
      const res = await deleteApplicationFn({ data: { id: targetId } });
      if (res.success) {
        if (selectedApplication?.id === targetId) {
          setSelectedApplication(null);
        }
        if (selectedResume?.id === targetId) {
          setSelectedResume(null);
        }
        setApplicationToDelete(null);
        setActionSuccessMsg(`Application from "${candidateName}" has been removed.`);
        setTimeout(() => setActionSuccessMsg(null), 3500);
        onRefresh();
      }
    });
  };

  const handleDownloadResume = (app: JobApplicationItem) => {
    if (!app.resume_data_url) {
      alert("Resume data is not available for this record.");
      return;
    }
    const link = document.createElement("a");
    link.href = app.resume_data_url;
    link.download = app.resume_name || `${app.full_name.replace(/\s+/g, "_")}_Resume.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- JOB MODAL STATE ---
  const [showJobModal, setShowJobModal] = useState(false);
  const [editingJob, setEditingJob] = useState<JobOpening | null>(null);
  const [modalTab, setModalTab] = useState<"basic" | "details" | "requirements">("basic");

  // Job Form State
  const [title, setTitle] = useState("");
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
  const [applyUrl, setApplyUrl] = useState("");
  const [orderIndex, setOrderIndex] = useState(1);
  const [isFeatured, setIsFeatured] = useState(false);
  const [status, setStatus] = useState<JobStatus>("open");
  const [formError, setFormError] = useState<string | null>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    if (showJobModal && modalTab && tabRefs.current[modalTab]) {
      tabRefs.current[modalTab]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "nearest",
      });
    }
  }, [modalTab, showJobModal]);

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
    setDepartment("Engineering");
    setType("Full-time");
    setWorkplace("Remote");
    setLocation("Remote / Noida");
    setSummary("");
    setResponsibilities(["Architect scalable backend workflows.", "Collaborate with UI/UX designers."]);
    setRequirements(["2+ years with TypeScript & React/Node.", "Passion for clean modular architecture."]);
    setJobBenefits(["Competitive compensation & bonuses.", "Flexible remote working hours."]);
    setApplyUrl("");
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
      slug: editingJob?.slug || slugifyJob(title),
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
            Review candidate applications, manage open roles, 5-step hiring workflow, and culture perks.
          </p>
        </div>

        <div className={styles.actions}>
          <div className={styles.navTabs}>
            <button
              type="button"
              className={[
                styles.navTabBtn,
                activeSection === "applications" ? styles.navTabBtnActive : "",
              ].join(" ")}
              onClick={() => setActiveSection("applications")}
            >
              Applications ({applications.length})
            </button>
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

      {/* SUB-SECTION 0: APPLICATIONS MANAGEMENT */}
      {activeSection === "applications" && (
        <div className={styles.applicationsWrapper}>
          {/* Status Metrics Bar */}
          <div className={styles.appMetricsRow}>
            <div className={styles.appMetricCard}>
              <span className={styles.appMetricLabel}>Total Applications</span>
              <span className={styles.appMetricVal}>{statusCounts.total}</span>
            </div>
            <div className={styles.appMetricCard}>
              <span className={styles.appMetricLabel}>New Submissions</span>
              <span className={[styles.appMetricVal, styles.valNew].join(" ")}>
                {statusCounts.new}
              </span>
            </div>
            <div className={styles.appMetricCard}>
              <span className={styles.appMetricLabel}>Under Review</span>
              <span className={[styles.appMetricVal, styles.valReviewing].join(" ")}>
                {statusCounts.reviewing}
              </span>
            </div>
            <div className={styles.appMetricCard}>
              <span className={styles.appMetricLabel}>Shortlisted</span>
              <span className={[styles.appMetricVal, styles.valShortlisted].join(" ")}>
                {statusCounts.shortlisted}
              </span>
            </div>
            <div className={styles.appMetricCard}>
              <span className={styles.appMetricLabel}>Interview Round</span>
              <span className={[styles.appMetricVal, styles.valInterview].join(" ")}>
                {statusCounts.interview}
              </span>
            </div>
            <div className={styles.appMetricCard}>
              <span className={styles.appMetricLabel}>Hired</span>
              <span className={[styles.appMetricVal, styles.valHired].join(" ")}>
                {statusCounts.hired}
              </span>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className={styles.appFilterToolbar}>
            <div className={styles.appSearchBox}>
              <Search size={16} className={styles.appSearchIcon} />
              <input
                type="text"
                value={appSearch}
                onChange={(e) => setAppSearch(e.target.value)}
                placeholder="Search by candidate name, email, role, or location..."
                className={styles.appSearchInput}
              />
              {appSearch && (
                <button
                  type="button"
                  onClick={() => setAppSearch("")}
                  className={styles.appClearSearch}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className={styles.appFiltersRow}>
              {/* Status Filter Pills */}
              <div className={styles.appStatusPills}>
                {(
                  ["all", "new", "reviewing", "shortlisted", "interview", "rejected", "hired"] as const
                ).map((st) => (
                  <button
                    key={st}
                    type="button"
                    className={[
                      styles.appStatusPill,
                      appStatusFilter === st ? styles.appStatusPillActive : "",
                    ].join(" ")}
                    onClick={() => setAppStatusFilter(st)}
                  >
                    {st === "all" ? "All Statuses" : st.charAt(0).toUpperCase() + st.slice(1)}
                  </button>
                ))}
              </div>

              {/* Role Position Dropdown */}
              {uniqueJobPositions.length > 0 && (
                <div className={styles.appPosFilterBox}>
                  <Filter size={14} className={styles.filterIcon} />
                  <select
                    value={appPositionFilter}
                    onChange={(e) => setAppPositionFilter(e.target.value)}
                    className={styles.appPosSelect}
                  >
                    <option value="all">All Job Positions</option>
                    {uniqueJobPositions.map((pos) => (
                      <option key={pos} value={pos}>
                        {pos}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Action Success Toast */}
          {actionSuccessMsg && (
            <div className={styles.appToastSuccess}>
              <CheckCircle2 size={16} />
              <span>{actionSuccessMsg}</span>
            </div>
          )}

          {/* Applications Data Table */}
          <div className={styles.tableCard}>
            {filteredApplications.length === 0 ? (
              <div className={styles.emptyTableState}>
                <Users size={36} className={styles.emptyIcon} />
                <h4 className={styles.emptyTitle}>No Applications Yet</h4>
                <p className={styles.emptySub}>
                  {applications.length === 0
                    ? "Applications submitted through the DIMISI Career page will appear here."
                    : "No applications match your search or filter criteria. Try resetting filters."}
                </p>
                {(appSearch || appStatusFilter !== "all" || appPositionFilter !== "all") && (
                  <button
                    type="button"
                    className={styles.resetFiltersBtn}
                    onClick={() => {
                      setAppSearch("");
                      setAppStatusFilter("all");
                      setAppPositionFilter("all");
                    }}
                  >
                    Reset Search &amp; Filters
                  </button>
                )}
              </div>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Applicant</th>
                    <th>Job Position</th>
                    <th>Location</th>
                    <th>Resume</th>
                    <th>Applied On</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApplications.map((app) => {
                    const statusMeta =
                      APPLICATION_STATUS_META[app.status] || APPLICATION_STATUS_META.new;
                    return (
                      <tr key={app.id}>
                        <td>
                          <div className={styles.applicantCol}>
                            <div className={styles.applicantAvatar}>
                              {app.full_name.charAt(0).toUpperCase()}
                            </div>
                            <div className={styles.applicantInfo}>
                              <span className={styles.applicantName}>{app.full_name}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div
                            className={styles.posCell}
                            title={`${app.job_title}${app.job_department ? ` (${app.job_department})` : ""}`}
                          >
                            <span className={styles.posTitle}>{app.job_title}</span>
                            <span className={styles.posDept}>{app.job_department || "General"}</span>
                          </div>
                        </td>
                        <td>
                          <div className={styles.locCell} title={app.location}>
                            <MapPin size={13} className={styles.locPin} />
                            <span className={styles.locTextTruncate}>{app.location}</span>
                          </div>
                        </td>
                        <td>
                          <button
                            type="button"
                            className={styles.resumeActionBtn}
                            onClick={() => setSelectedResume(app)}
                            title={`View Resume: ${app.resume_name || "Resume"}`}
                            aria-label={`View resume for ${app.full_name}`}
                          >
                            <FileText size={13} />
                            <span>View Resume</span>
                          </button>
                        </td>
                        <td>
                          <div className={styles.dateCell}>
                            <Calendar size={12} className={styles.calIcon} />
                            <span>{formatDate(app.applied_at)}</span>
                          </div>
                        </td>
                        <td>
                          <select
                            value={app.status}
                            onChange={(e) =>
                              handleStatusChange(app.id, e.target.value as ApplicationStatus)
                            }
                            className={styles.statusDropdown}
                            style={{
                              color: statusMeta.color,
                              background: statusMeta.bg,
                              borderColor: statusMeta.border,
                            }}
                            aria-label={`Update status for ${app.full_name}`}
                          >
                            <option value="new">New</option>
                            <option value="reviewing">Reviewing</option>
                            <option value="shortlisted">Shortlisted</option>
                            <option value="interview">Interview</option>
                            <option value="rejected">Rejected</option>
                            <option value="hired">Hired</option>
                          </select>
                        </td>
                        <td>
                          <div className={styles.rowActions}>
                            <button
                              type="button"
                              className={styles.viewDetailsIconBtn}
                              onClick={() => setSelectedApplication(app)}
                              title="View Full Application Details"
                              aria-label={`View details for ${app.full_name}`}
                            >
                              <Eye size={15} />
                            </button>
                            <button
                              type="button"
                              className={styles.downloadIconBtn}
                              onClick={() => handleDownloadResume(app)}
                              title="Download Resume File"
                              aria-label={`Download resume for ${app.full_name}`}
                            >
                              <Download size={15} />
                            </button>
                            <button
                              type="button"
                              className={styles.delBtn}
                              onClick={() => setApplicationToDelete(app)}
                              title="Delete Application"
                              aria-label={`Delete application from ${app.full_name}`}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* APPLICATION DETAILS DOSSIER MODAL */}
          {selectedApplication && (
            <div
              className={styles.modalBackdrop}
              role="dialog"
              aria-modal="true"
              onClick={() => setSelectedApplication(null)}
            >
              <div
                className={styles.appDetailsModal}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className={styles.appModalHeader}>
                  <div className={styles.appModalHeaderLeft}>
                    <div className={styles.appModalBadgeRow}>
                      <span className={styles.appModalTag}>APPLICATION DOSSIER</span>
                      <span className={styles.appModalJobBadge}>
                        {selectedApplication.job_title}
                      </span>
                      {selectedApplication.job_department && (
                        <span className={styles.appModalDeptBadge}>
                          {selectedApplication.job_department}
                        </span>
                      )}
                    </div>
                    <h3 className={styles.appModalCandidateName}>
                      {selectedApplication.full_name}
                    </h3>
                  </div>

                  <div className={styles.appModalHeaderRight}>
                    <div className={styles.appModalStatusBox}>
                      <label>Status:</label>
                      <select
                        value={selectedApplication.status}
                        onChange={(e) =>
                          handleStatusChange(
                            selectedApplication.id,
                            e.target.value as ApplicationStatus
                          )
                        }
                        className={styles.statusDropdownModal}
                        aria-label="Application Status"
                      >
                        <option value="new">New</option>
                        <option value="reviewing">Reviewing</option>
                        <option value="shortlisted">Shortlisted</option>
                        <option value="interview">Interview</option>
                        <option value="rejected">Rejected</option>
                        <option value="hired">Hired</option>
                      </select>
                    </div>

                    <button
                      type="button"
                      className={styles.modalClose}
                      onClick={() => setSelectedApplication(null)}
                      title="Close Dossier"
                      aria-label="Close Dossier"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>

                {/* Modal Body */}
                <div className={styles.appModalBody}>
                  {/* Section 1: APPLICANT PROFILE */}
                  <div className={styles.appDetailSection}>
                    <h4 className={styles.appDetailSectionTitle}>APPLICANT PROFILE</h4>
                    <div className={styles.appInfoGrid}>
                      <div className={styles.appInfoItem}>
                        <span className={styles.appInfoLabel}>Applicant Name</span>
                        <span className={styles.appInfoVal}>{selectedApplication.full_name}</span>
                      </div>
                      <div className={styles.appInfoItem}>
                        <span className={styles.appInfoLabel}>Email Address</span>
                        <a
                          href={`mailto:${selectedApplication.email}`}
                          className={styles.appInfoLink}
                          title={`Send email to ${selectedApplication.email}`}
                        >
                          <Mail size={13} />
                          <span>{selectedApplication.email}</span>
                        </a>
                      </div>
                      <div className={styles.appInfoItem}>
                        <span className={styles.appInfoLabel}>Phone Number</span>
                        <a
                          href={`tel:${selectedApplication.phone}`}
                          className={styles.appInfoLink}
                          title={`Call ${selectedApplication.phone}`}
                        >
                          <Phone size={13} />
                          <span>{selectedApplication.phone}</span>
                        </a>
                      </div>
                      <div className={styles.appInfoItem}>
                        <span className={styles.appInfoLabel}>Location</span>
                        <span className={styles.appInfoVal}>
                          <MapPin size={13} className={styles.inlinePin} />
                          {selectedApplication.location}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Section 2: APPLICATION DETAILS */}
                  <div className={styles.appDetailSection}>
                    <h4 className={styles.appDetailSectionTitle}>APPLICATION DETAILS</h4>
                    <div className={styles.appInfoGrid}>
                      <div className={styles.appInfoItem}>
                        <span className={styles.appInfoLabel}>Applied For / Role</span>
                        <span className={styles.appInfoVal}>{selectedApplication.job_title}</span>
                      </div>
                      <div className={styles.appInfoItem}>
                        <span className={styles.appInfoLabel}>Category / Department</span>
                        <span className={styles.appInfoVal}>
                          {selectedApplication.job_department || "General"}
                        </span>
                      </div>
                      <div className={styles.appInfoItem}>
                        <span className={styles.appInfoLabel}>Application Date</span>
                        <span className={styles.appInfoVal}>
                          <Calendar size={13} className={styles.inlinePin} />
                          {formatDate(selectedApplication.applied_at)}
                        </span>
                      </div>
                      <div className={styles.appInfoItem}>
                        <span className={styles.appInfoLabel}>Current Status</span>
                        <span
                          className={styles.appStatusBadge}
                          style={{
                            color:
                              APPLICATION_STATUS_META[selectedApplication.status]?.color ||
                              "#ffffff",
                            backgroundColor:
                              APPLICATION_STATUS_META[selectedApplication.status]?.bg ||
                              "rgba(255,255,255,0.1)",
                            borderColor:
                              APPLICATION_STATUS_META[selectedApplication.status]?.border ||
                              "transparent",
                          }}
                        >
                          {APPLICATION_STATUS_META[selectedApplication.status]?.label ||
                            selectedApplication.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Section 3: RESUME */}
                  <div className={styles.appDetailSection}>
                    <h4 className={styles.appDetailSectionTitle}>RESUME</h4>
                    <div className={styles.resumeDisplayCard}>
                      <div className={styles.resumeDisplayLeft}>
                        <div className={styles.resumeFileIconCircle}>
                          <FileText size={22} />
                        </div>
                        <div className={styles.resumeFileInfo}>
                          <div className={styles.resumeFileName}>
                            {selectedApplication.resume_name}
                          </div>
                          <div className={styles.resumeFileMeta}>
                            <span className={styles.formatPill}>
                              {selectedApplication.resume_name.split(".").pop()?.toUpperCase() || "PDF"}
                            </span>
                            <span>•</span>
                            <span>{formatFileSize(selectedApplication.resume_size)}</span>
                          </div>
                        </div>
                      </div>

                      <div className={styles.resumeDisplayActions}>
                        <button
                          type="button"
                          className={styles.previewResumeBtn}
                          onClick={() => setSelectedResume(selectedApplication)}
                        >
                          <Eye size={14} />
                          <span>View Resume</span>
                        </button>
                        <button
                          type="button"
                          className={styles.downloadResumeBtn}
                          onClick={() => handleDownloadResume(selectedApplication)}
                        >
                          <Download size={14} />
                          <span>Download Resume</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Section 4: ADDITIONAL INFORMATION */}
                  <div className={styles.appDetailSection}>
                    <h4 className={styles.appDetailSectionTitle}>ADDITIONAL INFORMATION</h4>

                    {/* Professional Links */}
                    <div className={styles.appLinksGrid}>
                      <div className={styles.appLinkCard}>
                        <span className={styles.appLinkLabel}>Portfolio / Live Website</span>
                        {selectedApplication.portfolio_url ? (
                          <a
                            href={selectedApplication.portfolio_url}
                            target="_blank"
                            rel="noreferrer"
                            className={styles.appExternalLink}
                          >
                            <span>{selectedApplication.portfolio_url}</span>
                            <ExternalLink size={12} />
                          </a>
                        ) : (
                          <span className={styles.appNoneText}>Not provided</span>
                        )}
                      </div>

                      <div className={styles.appLinkCard}>
                        <span className={styles.appLinkLabel}>LinkedIn Profile</span>
                        {selectedApplication.linkedin_url ? (
                          <a
                            href={selectedApplication.linkedin_url}
                            target="_blank"
                            rel="noreferrer"
                            className={styles.appExternalLink}
                          >
                            <span>{selectedApplication.linkedin_url}</span>
                            <ExternalLink size={12} />
                          </a>
                        ) : (
                          <span className={styles.appNoneText}>Not provided</span>
                        )}
                      </div>

                      <div className={styles.appLinkCard}>
                        <span className={styles.appLinkLabel}>GitHub / Behance</span>
                        {selectedApplication.github_url ? (
                          <a
                            href={selectedApplication.github_url}
                            target="_blank"
                            rel="noreferrer"
                            className={styles.appExternalLink}
                          >
                            <span>{selectedApplication.github_url}</span>
                            <ExternalLink size={12} />
                          </a>
                        ) : (
                          <span className={styles.appNoneText}>Not provided</span>
                        )}
                      </div>
                    </div>

                    {/* Cover Note */}
                    <div className={styles.appStatementCard}>
                      <span className={styles.appStatementLabel}>
                        Cover Note / Why join DIMISI?
                      </span>
                      <p className={styles.appStatementText}>
                        {selectedApplication.cover_letter || "No cover note provided."}
                      </p>
                    </div>

                    {selectedApplication.additional_info && (
                      <div className={styles.appStatementCard}>
                        <span className={styles.appStatementLabel}>Additional Information</span>
                        <p className={styles.appStatementText}>
                          {selectedApplication.additional_info}
                        </p>
                      </div>
                    )}

                    {/* Internal Recruitment Notes */}
                    <div className={styles.internalNotesCard}>
                      <div className={styles.notesSectionHeader}>
                        <span className={styles.appStatementLabel}>INTERNAL RECRUITMENT NOTES</span>
                        {appNotesSuccess && (
                          <span className={styles.notesSuccessBadge}>{appNotesSuccess}</span>
                        )}
                      </div>
                      <textarea
                        rows={3}
                        value={appNotesText}
                        onChange={(e) => setAppNotesText(e.target.value)}
                        placeholder="Add interviewer notes, technical screening feedback, or salary expectations..."
                        className={styles.notesTextarea}
                      />
                      <div className={styles.notesActionRow}>
                        <button
                          type="button"
                          className={styles.saveNotesBtn}
                          onClick={() => handleSaveNotes(selectedApplication.id)}
                          disabled={isPending}
                        >
                          <Save size={14} />
                          <span>Save Notes</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className={styles.appModalFooter}>
                  <button
                    type="button"
                    className={styles.cancelBtn}
                    onClick={() => setSelectedApplication(null)}
                  >
                    Close Dossier
                  </button>
                  <button
                    type="button"
                    className={styles.downloadModalActionBtn}
                    onClick={() => handleDownloadResume(selectedApplication)}
                  >
                    <Download size={15} />
                    <span>Download Full Resume</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* DELETE APPLICATION CONFIRMATION MODAL */}
          {applicationToDelete && (
            <div
              className={styles.modalBackdrop}
              role="dialog"
              aria-modal="true"
              aria-labelledby="deleteAppModalTitle"
              onClick={() => setApplicationToDelete(null)}
            >
              <div
                className={styles.deleteConfirmModal}
                onClick={(e) => e.stopPropagation()}
              >
                <div className={styles.deleteModalHeader}>
                  <div className={styles.deleteModalIconBox}>
                    <Trash2 size={24} className={styles.deleteModalIcon} />
                  </div>
                  <div>
                    <h3 id="deleteAppModalTitle" className={styles.deleteModalTitle}>
                      Delete Application?
                    </h3>
                    <p className={styles.deleteModalSubtitle}>
                      Are you sure you want to permanently remove this application?
                    </p>
                  </div>
                </div>

                <div className={styles.deleteModalCard}>
                  <div className={styles.deleteModalCandidateRow}>
                    <div className={styles.deleteModalAvatar}>
                      {applicationToDelete.full_name.charAt(0).toUpperCase()}
                    </div>
                    <div className={styles.deleteModalCandidateInfo}>
                      <span className={styles.deleteModalCandidateName}>
                        {applicationToDelete.full_name}
                      </span>
                      <span className={styles.deleteModalCandidateRole}>
                        {applicationToDelete.job_title}
                        {applicationToDelete.job_department
                          ? ` • ${applicationToDelete.job_department}`
                          : ""}
                      </span>
                    </div>
                  </div>
                  <p className={styles.deleteModalWarning}>
                    This action is permanent and will remove all submitted candidate details and attachments from the system.
                  </p>
                </div>

                <div className={styles.deleteModalActions}>
                  <button
                    type="button"
                    className={styles.cancelBtn}
                    onClick={() => setApplicationToDelete(null)}
                    disabled={isPending}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className={styles.deleteConfirmBtn}
                    onClick={confirmDeleteApplication}
                    disabled={isPending}
                  >
                    {isPending ? "Deleting..." : "Delete Application"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* RESUME PREVIEW MODAL */}
          {selectedResume && (
            <div
              className={styles.modalBackdrop}
              role="dialog"
              aria-modal="true"
              onClick={() => setSelectedResume(null)}
            >
              <div
                className={styles.resumePreviewModal}
                onClick={(e) => e.stopPropagation()}
              >
                <div className={styles.resumePreviewHeader}>
                  <div className={styles.resumeHeaderTitleCol}>
                    <div className={styles.resumeHeaderBadgeRow}>
                      <span className={styles.previewTag}>RESUME VIEWER</span>
                      <span className={styles.previewCandidateTag}>
                        {selectedResume.full_name}
                      </span>
                    </div>
                    <h3 className={styles.previewTitleText}>{selectedResume.resume_name}</h3>
                  </div>

                  <div className={styles.resumeHeaderActions}>
                    <button
                      type="button"
                      className={styles.downloadResumeBtn}
                      onClick={() => handleDownloadResume(selectedResume)}
                    >
                      <Download size={14} />
                      <span>Download</span>
                    </button>
                    <button
                      type="button"
                      className={styles.modalClose}
                      onClick={() => setSelectedResume(null)}
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>

                <div className={styles.resumePreviewBody}>
                  {selectedResume.resume_data_url ? (
                    selectedResume.resume_name.toLowerCase().endsWith(".pdf") ||
                    selectedResume.resume_type.includes("pdf") ? (
                      <iframe
                        src={selectedResume.resume_data_url}
                        title={`Resume Preview - ${selectedResume.full_name}`}
                        className={styles.pdfIframe}
                      />
                    ) : (
                      <div className={styles.docPreviewNotice}>
                        <FileText size={48} className={styles.docNoticeIcon} />
                        <h4>Word Document (.DOC / .DOCX)</h4>
                        <p>
                          Direct browser preview for Word documents is not natively rendered by standard iframe engines. Click the download button below to inspect the document locally.
                        </p>
                        <button
                          type="button"
                          className={styles.docDownloadBtn}
                          onClick={() => handleDownloadResume(selectedResume)}
                        >
                          <Download size={16} />
                          <span>Download {selectedResume.resume_name}</span>
                        </button>
                      </div>
                    )
                  ) : (
                    <div className={styles.docPreviewNotice}>
                      <AlertCircle size={36} className={styles.docNoticeIcon} />
                      <h4>No File Data</h4>
                      <p>Resume file data is not available for this record.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

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
              <p className={styles.editorSub}>Manage headings, sublines, Bhootdev Careers caption, and global apply links.</p>
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
                    type="text"
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
            <div className={styles.modalTabsBar} role="tablist" aria-label="Job Form Steps" data-lenis-prevent>
              {[
                { id: "basic", label: "1. Basic Info & Setup" },
                { id: "details", label: "2. Summary & Responsibilities" },
                { id: "requirements", label: "3. Qualifications & Perks" },
              ].map((t) => (
                <button
                  key={t.id}
                  ref={(el) => {
                    tabRefs.current[t.id] = el;
                  }}
                  role="tab"
                  aria-selected={modalTab === t.id}
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
                  <div className={styles.formGroup}>
                    <label>Job Title *</label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Content Writer Intern"
                    />
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
