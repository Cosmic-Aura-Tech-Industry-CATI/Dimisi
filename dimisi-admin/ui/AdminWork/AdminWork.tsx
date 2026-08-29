import {
  useState,
  useTransition,
  useMemo,
  useRef,
  useEffect,
  useCallback,
  type DragEvent,
  type ChangeEvent,
  type ClipboardEvent,
} from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  FolderGit2,
  Rocket,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Star,
  Eye,
  EyeOff,
  Image as ImageIcon,
  ExternalLink,
  Globe,
  TrendingUp,
  Target,
  Zap,
  Code2,
  Sparkles,
  X,
  Layers,
  ChevronRight,
  ChevronLeft,
  UploadCloud,
  FileCheck,
  AlertCircle,
  RefreshCw,
  Clipboard,
} from "lucide-react";
import {
  type ProjectItem,
  type ProjectInput,
  type ProjectType,
  type ProjectGalleryImage,
  type ProjectMetric,
  slugifyProject,
  validateProjectInput,
} from "@/lib/work.shared";
import { saveProjectFn, deleteProjectFn } from "@/lib/work.functions";
import styles from "./AdminWork.module.css";

interface AdminWorkProps {
  projects: ProjectItem[];
  onRefresh: () => void;
}

type WorkModalTab = "overview" | "narrative" | "media" | "tech_metrics" | "review";

const MODAL_STEPS: { id: WorkModalTab; label: string; num: string }[] = [
  { id: "overview", label: "1. Overview & Meta", num: "01" },
  { id: "narrative", label: "2. 4-Pillar Narrative", num: "02" },
  { id: "media", label: "3. Cover & Visual Gallery", num: "03" },
  { id: "tech_metrics", label: "4. Tech Stack & Metrics", num: "04" },
  { id: "review", label: "5. Review & Publish", num: "05" },
];

const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/jpg", "image/webp"];

export function AdminWork({ projects, onRefresh }: AdminWorkProps) {
  const [isPending, startTransition] = useTransition();
  const saveProject = useServerFn(saveProjectFn);
  const deleteProject = useServerFn(deleteProjectFn);

  const [activeTabFilter, setActiveTabFilter] = useState<"all" | ProjectType>("all");

  // Edit / Create Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectItem | null>(null);
  const [modalTab, setModalTab] = useState<WorkModalTab>("overview");

  // Form State
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [type, setType] = useState<ProjectType>("work");
  const [category, setCategory] = useState("Web Application · Bespoke Solution");
  const [tagline, setTagline] = useState("");
  const [overview, setOverview] = useState("");
  const [challenge, setChallenge] = useState("");
  const [solution, setSolution] = useState("");
  const [outcome, setOutcome] = useState("");
  
  // Primary Cover Image State
  const [coverImage, setCoverImage] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imageError, setImageError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryFileInputRef = useRef<HTMLInputElement>(null);

  // Gallery Images State
  const [galleryImages, setGalleryImages] = useState<ProjectGalleryImage[]>([]);

  // Metadata & Metrics State
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [clientName, setClientName] = useState("");
  const [timeline, setTimeline] = useState("");
  const [techStack, setTechStack] = useState<string[]>([]);
  const [newTech, setNewTech] = useState("");
  const [metrics, setMetrics] = useState<ProjectMetric[]>([]);
  const [newMetricLabel, setNewMetricLabel] = useState("");
  const [newMetricValue, setNewMetricValue] = useState("");
  const [orderIndex, setOrderIndex] = useState(1);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);

  // Validation State
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Body Lock & ESC Key Listener
  useEffect(() => {
    if (!showModal) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowModal(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [showModal]);

  const workCount = useMemo(() => projects.filter((p) => p.type === "work").length, [projects]);
  const productCount = useMemo(() => projects.filter((p) => p.type === "product").length, [projects]);

  const filteredProjects = useMemo(() => {
    if (activeTabFilter === "all") return projects;
    return projects.filter((p) => p.type === activeTabFilter);
  }, [projects, activeTabFilter]);

  const handleOpenCreate = (defaultType: ProjectType = "work") => {
    setEditingProject(null);
    setTitle("");
    setSlug("");
    setType(defaultType);
    setCategory(defaultType === "work" ? "Web Application · Bespoke Solution" : "SaaS Platform · AI Architecture");
    setTagline("");
    setOverview("");
    setChallenge("");
    setSolution("");
    setOutcome("");
    setCoverImage("https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80");
    setCoverFile(null);
    setCoverPreviewUrl("https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80");
    setImageError(null);
    setUploadProgress(0);
    setIsUploadingImage(false);
    setGalleryImages([]);
    setWebsiteUrl("");
    setClientName(defaultType === "work" ? "" : "DIMISI Labs");
    setTimeline("4 Weeks Sprint");
    setTechStack(["React", "TypeScript", "Node.js", "PostgreSQL"]);
    setMetrics([
      { label: "Performance Gain", value: "+120%" },
      { label: "Load Latency", value: "< 350ms" },
    ]);
    setOrderIndex(projects.length + 1);
    setIsFeatured(false);
    setIsActive(true);
    setModalTab("overview");
    setFormError(null);
    setFieldErrors({});
    setShowModal(true);
  };

  const handleOpenEdit = (p: ProjectItem) => {
    setEditingProject(p);
    setTitle(p.title);
    setSlug(p.slug);
    setType(p.type);
    setCategory(p.category);
    setTagline(p.tagline || "");
    setOverview(p.overview);
    setChallenge(p.challenge);
    setSolution(p.solution);
    setOutcome(p.outcome);
    setCoverImage(p.cover_image);
    setCoverFile(null);
    setCoverPreviewUrl(p.cover_image);
    setImageError(null);
    setUploadProgress(0);
    setIsUploadingImage(false);
    setGalleryImages(p.gallery_images || []);
    setWebsiteUrl(p.website_url || "");
    setClientName(p.client_name || "");
    setTimeline(p.timeline || "");
    setTechStack(p.tech_stack || []);
    setMetrics(p.metrics || []);
    setOrderIndex(p.order_index);
    setIsFeatured(p.is_featured);
    setIsActive(p.is_active);
    setModalTab("overview");
    setFormError(null);
    setFieldErrors({});
    setShowModal(true);
  };

  // Image Processing & Validation
  const processImageFile = useCallback((file: File) => {
    setImageError(null);

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setImageError("Unsupported image format. Please upload JPG, JPEG, PNG, or WEBP.");
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setImageError("Image size exceeds the maximum allowed limit (10 MB).");
      return;
    }

    setCoverFile(file);
    setIsUploadingImage(true);
    setUploadProgress(25);

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setCoverPreviewUrl(dataUrl);
      setCoverImage(dataUrl);
      setUploadProgress(100);
      setTimeout(() => setIsUploadingImage(false), 250);
    };
    reader.onerror = () => {
      setImageError("Failed to read image file. Please try again.");
      setIsUploadingImage(false);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processImageFile(e.target.files[0]);
    }
  };

  const handleGalleryFileAdd = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      Array.from(e.target.files).forEach((file) => {
        if (ALLOWED_IMAGE_TYPES.includes(file.type) && file.size <= MAX_IMAGE_SIZE_BYTES) {
          const reader = new FileReader();
          reader.onload = (evt) => {
            const dataUrl = evt.target?.result as string;
            setGalleryImages((prev) => [
              ...prev,
              { url: dataUrl, caption: file.name.replace(/\.[^/.]+$/, "") },
            ]);
          };
          reader.readAsDataURL(file);
        }
      });
    }
  };

  // Clipboard Paste Support (Ctrl + V)
  const handlePaste = useCallback((e: ClipboardEvent<HTMLDivElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const blob = items[i].getAsFile();
        if (blob) {
          e.preventDefault();
          processImageFile(blob);
          break;
        }
      }
    }
  }, [processImageFile]);

  const handleRemoveCoverImage = () => {
    setCoverFile(null);
    setCoverPreviewUrl(null);
    setCoverImage("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Step-by-Step Validation & Navigation
  const handleNextStep = () => {
    setFormError(null);
    const errors: Record<string, string> = {};

    if (modalTab === "overview") {
      if (!title.trim() || title.trim().length < 2) {
        errors.title = "Project title must be at least 2 characters long.";
      }
      if (!category.trim() || category.trim().length < 2) {
        errors.category = "Project category label is required.";
      }
      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        setFormError("Please complete the required Overview & Meta fields.");
        return;
      }
      setFieldErrors({});
      setModalTab("narrative");
      return;
    }

    if (modalTab === "narrative") {
      if (!overview.trim() || overview.trim().length < 10) {
        errors.overview = "Overview must be at least 10 characters long.";
      }
      if (!challenge.trim() || challenge.trim().length < 10) {
        errors.challenge = "Challenge description must be at least 10 characters long.";
      }
      if (!solution.trim() || solution.trim().length < 10) {
        errors.solution = "Solution description must be at least 10 characters long.";
      }
      if (!outcome.trim() || outcome.trim().length < 10) {
        errors.outcome = "Outcome description must be at least 10 characters long.";
      }
      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        setFormError("Please complete all 4 narrative pillars before proceeding.");
        return;
      }
      setFieldErrors({});
      setModalTab("media");
      return;
    }

    if (modalTab === "media") {
      if (!coverImage.trim() && !coverFile) {
        setImageError("Primary cover image is required.");
        setFormError("Please select or upload a primary case study image.");
        return;
      }
      setModalTab("tech_metrics");
      return;
    }

    if (modalTab === "tech_metrics") {
      setModalTab("review");
      return;
    }
  };

  const handlePrevStep = () => {
    setFormError(null);
    if (modalTab === "review") setModalTab("tech_metrics");
    else if (modalTab === "tech_metrics") setModalTab("media");
    else if (modalTab === "media") setModalTab("narrative");
    else if (modalTab === "narrative") setModalTab("overview");
  };

  // Form Submission
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});

    const input: ProjectInput = {
      id: editingProject?.id ?? undefined,
      title: title.trim(),
      slug: slug.trim() || slugifyProject(title),
      type,
      category: category.trim(),
      tagline: tagline.trim() || overview.trim().slice(0, 80),
      overview: overview.trim(),
      challenge: challenge.trim(),
      solution: solution.trim(),
      outcome: outcome.trim(),
      cover_image: coverImage.trim(),
      gallery_images: galleryImages,
      website_url: websiteUrl.trim() || undefined,
      client_name: clientName.trim() || undefined,
      timeline: timeline.trim() || undefined,
      tech_stack: techStack,
      metrics,
      order_index: Number(orderIndex),
      is_featured: isFeatured,
      is_active: isActive,
    };

    const validation = validateProjectInput(input);
    if (!validation.valid) {
      setFormError(validation.error || "Please check the highlighted fields.");
      if (validation.field) {
        setFieldErrors({ [validation.field]: validation.error || "Invalid field." });
        if (validation.field === "title" || validation.field === "category" || validation.field === "type") {
          setModalTab("overview");
        } else if (
          validation.field === "overview" ||
          validation.field === "challenge" ||
          validation.field === "solution" ||
          validation.field === "outcome"
        ) {
          setModalTab("narrative");
        } else if (validation.field === "cover_image") {
          setModalTab("media");
        }
      }
      return;
    }

    startTransition(async () => {
      try {
        const res = await saveProject({ data: input });
        if (res.success) {
          setShowModal(false);
          onRefresh();
        } else {
          setFormError(res.error || "Failed to save project.");
        }
      } catch (err) {
        setFormError(err instanceof Error ? err.message : "Error saving project.");
      }
    });
  };

  const handleDelete = (id: string, projTitle: string) => {
    if (window.confirm(`Are you sure you want to delete case study "${projTitle}"?`)) {
      startTransition(async () => {
        await deleteProject({ data: { id } });
        onRefresh();
      });
    }
  };

  const handleToggleActive = (p: ProjectItem) => {
    startTransition(async () => {
      await saveProject({
        data: {
          id: p.id,
          title: p.title,
          slug: p.slug,
          type: p.type,
          category: p.category,
          tagline: p.tagline,
          overview: p.overview,
          challenge: p.challenge,
          solution: p.solution,
          outcome: p.outcome,
          cover_image: p.cover_image,
          gallery_images: p.gallery_images,
          website_url: p.website_url,
          client_name: p.client_name,
          timeline: p.timeline,
          tech_stack: p.tech_stack,
          metrics: p.metrics,
          order_index: p.order_index,
          is_featured: p.is_featured,
          is_active: !p.is_active,
        },
      });
      onRefresh();
    });
  };

  const handleToggleFeatured = (p: ProjectItem) => {
    startTransition(async () => {
      await saveProject({
        data: {
          id: p.id,
          title: p.title,
          slug: p.slug,
          type: p.type,
          category: p.category,
          tagline: p.tagline,
          overview: p.overview,
          challenge: p.challenge,
          solution: p.solution,
          outcome: p.outcome,
          cover_image: p.cover_image,
          gallery_images: p.gallery_images,
          website_url: p.website_url,
          client_name: p.client_name,
          timeline: p.timeline,
          tech_stack: p.tech_stack,
          metrics: p.metrics,
          order_index: p.order_index,
          is_featured: !p.is_featured,
          is_active: p.is_active,
        },
      });
      onRefresh();
    });
  };

  return (
    <div className={styles.wrapper}>
      {/* Header & Controls */}
      <div className={styles.headerRow}>
        <div>
          <h2 className={styles.title}>Our Work &amp; In-House Products</h2>
          <p className={styles.subtitle}>
            Manage bespoke client solution case studies and proprietary digital platforms with 4-pillar narratives, media, and live links.
          </p>
        </div>

        <div className={styles.actions}>
          <div className={styles.filterTabs}>
            <button
              type="button"
              className={[
                styles.filterTabBtn,
                activeTabFilter === "all" ? styles.filterTabBtnActive : "",
              ].join(" ")}
              onClick={() => setActiveTabFilter("all")}
            >
              All ({projects.length})
            </button>
            <button
              type="button"
              className={[
                styles.filterTabBtn,
                activeTabFilter === "work" ? styles.filterTabBtnActive : "",
              ].join(" ")}
              onClick={() => setActiveTabFilter("work")}
            >
              <FolderGit2 size={14} />
              <span>Our Work ({workCount})</span>
            </button>
            <button
              type="button"
              className={[
                styles.filterTabBtn,
                activeTabFilter === "product" ? styles.filterTabBtnActive : "",
              ].join(" ")}
              onClick={() => setActiveTabFilter("product")}
            >
              <Rocket size={14} />
              <span>Products ({productCount})</span>
            </button>
          </div>

          <button
            type="button"
            className={styles.createBtn}
            onClick={() => handleOpenCreate(activeTabFilter === "product" ? "product" : "work")}
          >
            <Plus size={16} />
            <span>Add New Case Study</span>
          </button>
        </div>
      </div>

      {/* Projects Table */}
      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th style={{ width: "60px" }}>Order</th>
              <th style={{ width: "80px" }}>Cover</th>
              <th>Project Title</th>
              <th>Type</th>
              <th>Category</th>
              <th>URL Slug / Live Link</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProjects.map((p) => (
              <tr key={p.id} className={!p.is_active ? styles.inactiveRow : ""}>
                <td className={styles.orderCell}>{p.order_index}</td>
                <td>
                  <img src={p.cover_image} alt={p.title} className={styles.thumbImg} />
                </td>
                <td>
                  <div className={styles.titleCol}>
                    <span className={styles.projTitle}>{p.title}</span>
                    <span className={styles.projTagline}>{p.tagline}</span>
                  </div>
                </td>
                <td>
                  <span
                    className={[
                      styles.typeBadge,
                      p.type === "work" ? styles.workBadge : styles.productBadge,
                    ].join(" ")}
                  >
                    {p.type === "work" ? "Our Work" : "Product"}
                  </span>
                </td>
                <td>
                  <span className={styles.categoryBadge}>{p.category}</span>
                </td>
                <td>
                  <div className={styles.slugCol}>
                    <code className={styles.slugCode}>/work/{p.slug}</code>
                    {p.website_url && (
                      <a
                        href={p.website_url}
                        target="_blank"
                        rel="noreferrer"
                        className={styles.extLinkA}
                      >
                        <Globe size={11} />
                        <span>Live Site</span>
                      </a>
                    )}
                  </div>
                </td>
                <td>
                  <div className={styles.statusCell}>
                    <button
                      type="button"
                      className={[
                        styles.toggleIconBtn,
                        p.is_active ? styles.activeIcon : styles.inactiveIcon,
                      ].join(" ")}
                      onClick={() => handleToggleActive(p)}
                      title={p.is_active ? "Click to deactivate" : "Click to activate"}
                    >
                      {p.is_active ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>

                    <button
                      type="button"
                      className={[
                        styles.toggleIconBtn,
                        p.is_featured ? styles.starActive : styles.starInactive,
                      ].join(" ")}
                      onClick={() => handleToggleFeatured(p)}
                      title={p.is_featured ? "Featured spotlight" : "Click to feature"}
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
                      onClick={() => handleOpenEdit(p)}
                      title="Edit Case Study"
                    >
                      <Edit2 size={15} />
                    </button>
                    <a
                      href={`/work/${p.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className={styles.viewBtn}
                      title="View Live Page"
                    >
                      <ExternalLink size={15} />
                    </a>
                    <button
                      type="button"
                      className={styles.delBtn}
                      onClick={() => handleDelete(p.id, p.title)}
                      title="Delete Project"
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

      {/* FULL APPLICATION-STYLE MODAL */}
      {showModal && (
        <div
          className={styles.modalBackdrop}
          role="dialog"
          aria-modal="true"
          data-lenis-prevent
          onClick={() => setShowModal(false)}
        >
          <div
            className={styles.modalContent}
            data-lenis-prevent
            onClick={(e) => e.stopPropagation()}
            onPaste={handlePaste}
          >
            {/* Sticky Modal Header */}
            <div className={styles.modalHeader}>
              <div>
                <h3 className={styles.modalTitle}>
                  {editingProject ? `Edit Case Study: ${editingProject.title}` : "Add New Case Study"}
                </h3>
                <p className={styles.modalSub}>
                  Configure 4-pillar case study narrative (*Overview, Challenge, Solution, Outcome*), media, and live links.
                </p>
              </div>
              <button
                type="button"
                className={styles.modalClose}
                onClick={() => setShowModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            {/* Sticky Step Navigation Bar */}
            <div className={styles.modalTabsBar} data-lenis-prevent>
              {MODAL_STEPS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={[
                    styles.modalTabBtn,
                    modalTab === t.id ? styles.modalTabBtnActive : "",
                  ].join(" ")}
                  onClick={() => setModalTab(t.id)}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Global Error Banner */}
            {formError && (
              <div className={styles.errorAlert}>
                <AlertCircle size={16} />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSave} className={styles.modalForm}>
              {/* Single Independent Scrollable Body */}
              <div className={styles.modalBodyScroll} data-lenis-prevent>
                {/* STEP 1: OVERVIEW & META */}
                {modalTab === "overview" && (
                  <div className={styles.tabPane}>
                    <div className={styles.formGrid2}>
                      <div className={styles.formGroup}>
                        <label>Project Title *</label>
                        <input
                          type="text"
                          required
                          value={title}
                          className={fieldErrors.title ? styles.inputError : ""}
                          onChange={(e) => {
                            setTitle(e.target.value);
                            if (fieldErrors.title) {
                              setFieldErrors((prev) => {
                                const copy = { ...prev };
                                delete copy.title;
                                return copy;
                              });
                            }
                            if (!editingProject) setSlug(slugifyProject(e.target.value));
                          }}
                          placeholder="e.g. Rudra Tours & Travels"
                        />
                        {fieldErrors.title && (
                          <span className={styles.fieldErrorText}>{fieldErrors.title}</span>
                        )}
                      </div>

                      <div className={styles.formGroup}>
                        <label>URL Slug *</label>
                        <input
                          type="text"
                          required
                          value={slug}
                          onChange={(e) => setSlug(e.target.value)}
                          placeholder="e.g. rudra-tours-travels"
                        />
                      </div>
                    </div>

                    <div className={styles.formGrid2}>
                      <div className={styles.formGroup}>
                        <label>Category Type *</label>
                        <select
                          value={type}
                          onChange={(e) => {
                            const newType = e.target.value as ProjectType;
                            setType(newType);
                            if (!editingProject) {
                              setCategory(
                                newType === "work"
                                  ? "Web Application · Bespoke Solution"
                                  : "SaaS Platform · AI Architecture"
                              );
                            }
                          }}
                          className={styles.selectInput}
                        >
                          <option value="work">Our Work (Bespoke Client Solution)</option>
                          <option value="product">Our Product (In-House Proprietary Platform)</option>
                        </select>
                      </div>

                      <div className={styles.formGroup}>
                        <label>Category Label *</label>
                        <input
                          type="text"
                          required
                          value={category}
                          className={fieldErrors.category ? styles.inputError : ""}
                          onChange={(e) => {
                            setCategory(e.target.value);
                            if (fieldErrors.category) {
                              setFieldErrors((prev) => {
                                const copy = { ...prev };
                                delete copy.category;
                                return copy;
                              });
                            }
                          }}
                          placeholder="e.g. Travel · Website or Social Platform · Web App"
                        />
                        {fieldErrors.category && (
                          <span className={styles.fieldErrorText}>{fieldErrors.category}</span>
                        )}
                      </div>
                    </div>

                    <div className={styles.formGroup}>
                      <label>Tagline / Punchline *</label>
                      <input
                        type="text"
                        required
                        value={tagline}
                        onChange={(e) => setTagline(e.target.value)}
                        placeholder="e.g. Custom Travel Booking & Itinerary Platform for Northern India Expeditions"
                      />
                    </div>

                    <div className={styles.formGrid3}>
                      <div className={styles.formGroup}>
                        <label>Client / Brand Name</label>
                        <input
                          type="text"
                          value={clientName}
                          onChange={(e) => setClientName(e.target.value)}
                          placeholder="e.g. Rudra Tours Ltd or DIMISI Labs"
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label>Project Timeline</label>
                        <input
                          type="text"
                          value={timeline}
                          onChange={(e) => setTimeline(e.target.value)}
                          placeholder="e.g. 4 Weeks Sprint"
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
                      <label>External Live Website URL</label>
                      <input
                        type="url"
                        value={websiteUrl}
                        onChange={(e) => setWebsiteUrl(e.target.value)}
                        placeholder="https://toursbyrudra.com"
                      />
                    </div>
                  </div>
                )}

                {/* STEP 2: 4-PILLAR NARRATIVE */}
                {modalTab === "narrative" && (
                  <div className={styles.tabPane}>
                    <div className={styles.narrativeIntroBox}>
                      <Sparkles size={16} className={styles.sparkleIcon} />
                      <p>
                        Structured 4-pillar narrative displayed across the interactive case study detail page.
                      </p>
                    </div>

                    <div className={styles.formGroup}>
                      <label>1. Overview (Full Project Scope &amp; Purpose) *</label>
                      <textarea
                        rows={3}
                        required
                        value={overview}
                        className={fieldErrors.overview ? styles.inputError : ""}
                        onChange={(e) => {
                          setOverview(e.target.value);
                          if (fieldErrors.overview) {
                            setFieldErrors((prev) => {
                              const copy = { ...prev };
                              delete copy.overview;
                              return copy;
                            });
                          }
                        }}
                        placeholder="A travel website for India tour packages, car rentals, wedding travel, and city-based trip planning..."
                      />
                      {fieldErrors.overview && (
                        <span className={styles.fieldErrorText}>{fieldErrors.overview}</span>
                      )}
                    </div>

                    <div className={styles.formGroup}>
                      <label>2. The Challenge (Problem, Bottleneck, or Business Hurdle) *</label>
                      <textarea
                        rows={3}
                        required
                        value={challenge}
                        className={fieldErrors.challenge ? styles.inputError : ""}
                        onChange={(e) => {
                          setChallenge(e.target.value);
                          if (fieldErrors.challenge) {
                            setFieldErrors((prev) => {
                              const copy = { ...prev };
                              delete copy.challenge;
                              return copy;
                            });
                          }
                        }}
                        placeholder="Travel customers need a fast way to compare tours, vehicles, and contact options without getting lost..."
                      />
                      {fieldErrors.challenge && (
                        <span className={styles.fieldErrorText}>{fieldErrors.challenge}</span>
                      )}
                    </div>

                    <div className={styles.formGroup}>
                      <label>3. Our Solution (Engineering Architecture &amp; Execution) *</label>
                      <textarea
                        rows={3}
                        required
                        value={solution}
                        className={fieldErrors.solution ? styles.inputError : ""}
                        onChange={(e) => {
                          setSolution(e.target.value);
                          if (fieldErrors.solution) {
                            setFieldErrors((prev) => {
                              const copy = { ...prev };
                              delete copy.solution;
                              return copy;
                            });
                          }
                        }}
                        placeholder="We structured the site around clear service pages, destination guides, vehicle categories, and direct inquiry flows..."
                      />
                      {fieldErrors.solution && (
                        <span className={styles.fieldErrorText}>{fieldErrors.solution}</span>
                      )}
                    </div>

                    <div className={styles.formGroup}>
                      <label>4. The Outcome (Measurable Business Impact &amp; ROI) *</label>
                      <textarea
                        rows={3}
                        required
                        value={outcome}
                        className={fieldErrors.outcome ? styles.inputError : ""}
                        onChange={(e) => {
                          setOutcome(e.target.value);
                          if (fieldErrors.outcome) {
                            setFieldErrors((prev) => {
                              const copy = { ...prev };
                              delete copy.outcome;
                              return copy;
                            });
                          }
                        }}
                        placeholder="Visitors move from inspiration to booking or inquiry with 35% less friction..."
                      />
                      {fieldErrors.outcome && (
                        <span className={styles.fieldErrorText}>{fieldErrors.outcome}</span>
                      )}
                    </div>
                  </div>
                )}

                {/* STEP 3: COVER & VISUAL GALLERY */}
                {modalTab === "media" && (
                  <div className={styles.tabPane}>
                    {/* Primary Cover Image Dropzone */}
                    <div className={styles.uploadSectionBox}>
                      <div className={styles.uploadSectionHeader}>
                        <h4 className={styles.uploadSectionTitle}>
                          <ImageIcon size={16} />
                          <span>CASE STUDY COVER IMAGE *</span>
                        </h4>
                        <span className={styles.uploadBadge}>16:9 Aspect Ratio Recommended</span>
                      </div>
                      <p className={styles.uploadInstruction}>
                        Upload or paste a high-resolution cover image. Supported formats: <strong>JPG, JPEG, PNG, WEBP</strong> (Max <strong>10 MB</strong>).
                      </p>

                      {/* Dropzone Container */}
                      <div
                        className={[
                          styles.dropzone,
                          isDragOver ? styles.dropzoneActive : "",
                          fieldErrors.cover_image || imageError ? styles.dropzoneError : "",
                        ].join(" ")}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                      >
                        <input
                          type="file"
                          ref={fileInputRef}
                          style={{ display: "none" }}
                          accept="image/png,image/jpeg,image/jpg,image/webp"
                          onChange={handleFileInputChange}
                        />

                        {coverPreviewUrl ? (
                          <div className={styles.previewContainer}>
                            <img src={coverPreviewUrl} alt="Cover Preview" className={styles.dropzonePreviewImg} />
                            
                            <div className={styles.previewMetaRow}>
                              <div className={styles.fileInfoBadge}>
                                <FileCheck size={14} className={styles.checkIcon} />
                                <span>{coverFile ? `${coverFile.name} (${(coverFile.size / (1024 * 1024)).toFixed(2)} MB)` : "Active Cover Image"}</span>
                              </div>

                              <div className={styles.previewActions}>
                                <button
                                  type="button"
                                  className={styles.replaceImgBtn}
                                  onClick={() => fileInputRef.current?.click()}
                                >
                                  <RefreshCw size={13} />
                                  <span>Replace Image</span>
                                </button>
                                <button
                                  type="button"
                                  className={styles.removeImgBtn}
                                  onClick={handleRemoveCoverImage}
                                >
                                  <X size={13} />
                                  <span>Remove</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div
                            className={styles.dropzoneEmpty}
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <div className={styles.uploadIconCircle}>
                              <UploadCloud size={24} className={styles.uploadIcon} />
                            </div>
                            <h5 className={styles.dropzonePrompt}>
                              Drag and drop cover image, <span className={styles.browseLink}>Choose File</span>, or paste with <kbd className={styles.kbdShortcut}>Ctrl + V</kbd>
                            </h5>
                            <span className={styles.dropzoneSub}>Supports JPG, PNG, WEBP up to 10MB</span>
                          </div>
                        )}

                        {isUploadingImage && (
                          <div className={styles.uploadProgressBar}>
                            <div
                              className={styles.uploadProgressFill}
                              style={{ width: `${uploadProgress}%` }}
                            />
                          </div>
                        )}
                      </div>

                      {imageError && (
                        <div className={styles.imageErrorText}>
                          <AlertCircle size={13} />
                          <span>{imageError}</span>
                        </div>
                      )}

                      {/* Direct URL Fallback */}
                      <div className={styles.formGroup} style={{ marginTop: "1rem" }}>
                        <label>Or Use Direct Image URL (CDN / Unsplash)</label>
                        <input
                          type="url"
                          value={coverImage}
                          onChange={(e) => {
                            setCoverImage(e.target.value);
                            setCoverPreviewUrl(e.target.value);
                            setImageError(null);
                          }}
                          placeholder="https://images.unsplash.com/photo-..."
                        />
                      </div>
                    </div>

                    {/* Gallery Images List */}
                    <div className={styles.gallerySectionBox}>
                      <div className={styles.uploadSectionHeader}>
                        <h4 className={styles.uploadSectionTitle}>
                          <Layers size={16} />
                          <span>SUPPORTING SCREENSHOTS &amp; GALLERY ({galleryImages.length})</span>
                        </h4>
                        <span className={styles.uploadBadge}>Optional</span>
                      </div>
                      <p className={styles.uploadInstruction}>
                        Upload interface screenshots, workflow schematics, or responsive device mockups.
                      </p>

                      <input
                        type="file"
                        ref={galleryFileInputRef}
                        multiple
                        style={{ display: "none" }}
                        accept="image/png,image/jpeg,image/jpg,image/webp"
                        onChange={handleGalleryFileAdd}
                      />

                      <div className={styles.relatedImgsGrid}>
                        {galleryImages.map((img, idx) => (
                          <div key={idx} className={styles.relatedImgCard}>
                            <img src={img.url} alt="Gallery" className={styles.relatedImgThumb} />
                            <input
                              type="text"
                              value={img.caption || ""}
                              onChange={(e) => {
                                const copy = [...galleryImages];
                                copy[idx] = { ...copy[idx], caption: e.target.value };
                                setGalleryImages(copy);
                              }}
                              placeholder="Caption / Description..."
                              className={styles.captionInput}
                            />
                            <button
                              type="button"
                              className={styles.removeImgBtn}
                              onClick={() => setGalleryImages(galleryImages.filter((_, i) => i !== idx))}
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>

                      <div className={styles.galleryActionsRow}>
                        <button
                          type="button"
                          className={styles.addStepBtn}
                          onClick={() => galleryFileInputRef.current?.click()}
                        >
                          <UploadCloud size={14} /> Upload Gallery Images
                        </button>
                        <button
                          type="button"
                          className={styles.addStepBtn}
                          onClick={() => {
                            const url = window.prompt("Enter image URL (CDN / Unsplash):");
                            if (url && url.trim().startsWith("http")) {
                              setGalleryImages([...galleryImages, { url: url.trim(), caption: "Interface screenshot" }]);
                            }
                          }}
                        >
                          <Plus size={14} /> Add by URL
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 4: TECH STACK & METRICS */}
                {modalTab === "tech_metrics" && (
                  <div className={styles.tabPane}>
                    {/* Technology Stack */}
                    <div className={styles.formGroup}>
                      <label>Technology Stack Chips ({techStack.length})</label>
                      <div className={styles.chipsRow}>
                        {techStack.map((t, i) => (
                          <span key={i} className={styles.chip}>
                            <Code2 size={12} className={styles.chipCheck} />
                            <span>{t}</span>
                            <button
                              type="button"
                              onClick={() => setTechStack(techStack.filter((_, idx) => idx !== i))}
                              className={styles.chipDel}
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className={styles.addInputRow}>
                        <input
                          type="text"
                          value={newTech}
                          onChange={(e) => setNewTech(e.target.value)}
                          placeholder="Add technology (e.g. Next.js, PyTorch, MongoDB Atlas, Tailwind)..."
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              if (newTech.trim()) {
                                setTechStack([...techStack, newTech.trim()]);
                                setNewTech("");
                              }
                            }
                          }}
                        />
                        <button
                          type="button"
                          className={styles.smallAddBtn}
                          onClick={() => {
                            if (newTech.trim()) {
                              setTechStack([...techStack, newTech.trim()]);
                              setNewTech("");
                            }
                          }}
                        >
                          Add
                        </button>
                      </div>
                    </div>

                    {/* Key Metrics */}
                    <div className={styles.formGroup}>
                      <label>Key Outcome Metrics ({metrics.length})</label>
                      <div className={styles.metricsList}>
                        {metrics.map((m, idx) => (
                          <div key={idx} className={styles.metricItemRow}>
                            <input
                              type="text"
                              value={m.label}
                              onChange={(e) => {
                                const copy = [...metrics];
                                copy[idx] = { ...copy[idx], label: e.target.value };
                                setMetrics(copy);
                              }}
                              placeholder="Metric Label (e.g. Performance Gain)"
                              className={styles.metricInput}
                            />
                            <input
                              type="text"
                              value={m.value}
                              onChange={(e) => {
                                const copy = [...metrics];
                                copy[idx] = { ...copy[idx], value: e.target.value };
                                setMetrics(copy);
                              }}
                              placeholder="Value (e.g. +120%, < 350ms)"
                              className={styles.metricInput}
                            />
                            <button
                              type="button"
                              className={styles.stepDelBtn}
                              onClick={() => setMetrics(metrics.filter((_, i) => i !== idx))}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>

                      <div className={styles.addMetricRow}>
                        <input
                          type="text"
                          value={newMetricLabel}
                          onChange={(e) => setNewMetricLabel(e.target.value)}
                          placeholder="New Metric Label (e.g. Conversion Lift)"
                        />
                        <input
                          type="text"
                          value={newMetricValue}
                          onChange={(e) => setNewMetricValue(e.target.value)}
                          placeholder="Value (e.g. +38%)"
                        />
                        <button
                          type="button"
                          className={styles.smallAddBtn}
                          onClick={() => {
                            if (newMetricLabel.trim() && newMetricValue.trim()) {
                              setMetrics([
                                ...metrics,
                                { label: newMetricLabel.trim(), value: newMetricValue.trim() },
                              ]);
                              setNewMetricLabel("");
                              setNewMetricValue("");
                            }
                          }}
                        >
                          Add Metric
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 5: REVIEW & PUBLISH */}
                {modalTab === "review" && (
                  <div className={styles.tabPane}>
                    <div className={styles.reviewSummaryBox}>
                      <h4 className={styles.reviewSummaryTitle}>
                        <CheckCircle2 size={16} />
                        <span>Case Study Summary Review</span>
                      </h4>

                      <div className={styles.summaryGrid}>
                        <div className={styles.summaryItem}>
                          <span className={styles.summaryLabel}>Title</span>
                          <span className={styles.summaryValue}>{title || "—"}</span>
                        </div>
                        <div className={styles.summaryItem}>
                          <span className={styles.summaryLabel}>URL Slug</span>
                          <code className={styles.slugCode}>/work/{slug || slugifyProject(title) || "—"}</code>
                        </div>
                        <div className={styles.summaryItem}>
                          <span className={styles.summaryLabel}>Category Type</span>
                          <span className={styles.summaryValue}>
                            {type === "work" ? "Our Work (Client Solution)" : "Our Product (Platform)"}
                          </span>
                        </div>
                        <div className={styles.summaryItem}>
                          <span className={styles.summaryLabel}>Category Label</span>
                          <span className={styles.summaryValue}>{category || "—"}</span>
                        </div>
                        <div className={styles.summaryItem}>
                          <span className={styles.summaryLabel}>Timeline / Order</span>
                          <span className={styles.summaryValue}>{timeline || "—"} · Order #{orderIndex}</span>
                        </div>
                        <div className={styles.summaryItem}>
                          <span className={styles.summaryLabel}>Tech &amp; Metrics</span>
                          <span className={styles.summaryValue}>
                            {techStack.length} technologies · {metrics.length} metrics
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Visibility & Status Settings */}
                    <div className={styles.toggleRow} style={{ marginTop: "1rem" }}>
                      <label className={styles.checkboxLabel}>
                        <input
                          type="checkbox"
                          checked={isActive}
                          onChange={(e) => setIsActive(e.target.checked)}
                        />
                        <span>Active &amp; Visible on Public Website</span>
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
              </div>

              {/* Sticky Modal Footer */}
              <div className={styles.modalFooter}>
                <div className={styles.footerLeft}>
                  {modalTab !== "overview" && (
                    <button
                      type="button"
                      className={styles.prevBtn}
                      onClick={handlePrevStep}
                    >
                      <ChevronLeft size={16} />
                      <span>Previous Step</span>
                    </button>
                  )}
                </div>

                <div className={styles.footerRight}>
                  <button
                    type="button"
                    className={styles.cancelBtn}
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>

                  {modalTab !== "review" ? (
                    <button
                      type="button"
                      className={styles.nextBtn}
                      onClick={handleNextStep}
                    >
                      <span>Next Step</span>
                      <ChevronRight size={16} />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isPending || isUploadingImage}
                      className={styles.saveSubmitBtn}
                    >
                      {isUploadingImage
                        ? "Uploading Image..."
                        : isPending
                        ? "Saving Case Study..."
                        : editingProject
                        ? "Update Case Study"
                        : "Publish Case Study"}
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
