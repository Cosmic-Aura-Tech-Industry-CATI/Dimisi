import { useState, useTransition, useRef, type DragEvent, type ChangeEvent } from "react";
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Star,
  Eye,
  EyeOff,
  Image as ImageIcon,
  ExternalLink,
  HelpCircle,
  Clock,
  Zap,
  Sparkles,
  X,
  ChevronRight,
  ChevronLeft,
  UploadCloud,
  FileCheck,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import {
  type CompanyService,
  type IndustrySector,
  type ServiceInput,
  type IndustryInput,
  type ServiceProcessStep,
  type ServiceBenefit,
  type ServiceFaq,
  type ServiceGalleryImage,
  slugifyService,
  validateServiceInput,
} from "@/lib/services.shared";
import {
  saveServiceFn,
  deleteServiceFn,
  saveIndustryFn,
  deleteIndustryFn,
} from "@/lib/services.functions";
import styles from "./AdminServices.module.css";

interface AdminServicesProps {
  services: CompanyService[];
  industries: IndustrySector[];
  onRefresh: () => void;
}

type ServiceModalTab = "overview" | "media" | "features" | "process" | "benefits";

const MODAL_STEPS: { id: ServiceModalTab; label: string; num: string }[] = [
  { id: "overview", label: "1. Overview & Core Info", num: "01" },
  { id: "media", label: "2. Service Image & Gallery", num: "02" },
  { id: "features", label: "3. Deliverables & Tech", num: "03" },
  { id: "process", label: "4. 6-Step Workflow", num: "04" },
  { id: "benefits", label: "5. Benefits & FAQs", num: "05" },
];

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/jpg", "image/webp"];

export function AdminServices({ services, industries, onRefresh }: AdminServicesProps) {
  const [isPending, startTransition] = useTransition();
  const saveService = saveServiceFn;
  const deleteService = deleteServiceFn;
  const saveIndustry = saveIndustryFn;
  const deleteIndustry = deleteIndustryFn;

  // Active Tab: Services list vs Industries list
  const [activeSection, setActiveSection] = useState<"services" | "industries">("services");

  // Edit/Create Service Modal
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingService, setEditingService] = useState<CompanyService | null>(null);
  const [modalTab, setModalTab] = useState<ServiceModalTab>("overview");

  // Service Form State
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("Full-Stack Engineering");
  const [tagline, setTagline] = useState("");
  const [summary, setSummary] = useState("");
  
  // Primary Image State
  const [heroImage, setHeroImage] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imageError, setImageError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Gallery Images State
  const [relatedImages, setRelatedImages] = useState<ServiceGalleryImage[]>([]);

  // 4-Point Architecture Overview State
  const [whatIsIt, setWhatIsIt] = useState("");
  const [whoIsFor, setWhoIsFor] = useState("");
  const [problemSolved, setProblemSolved] = useState("");
  const [whyItMatters, setWhyItMatters] = useState("");

  // Deliverables, Process, Benefits, FAQs State
  const [features, setFeatures] = useState<string[]>([]);
  const [newFeature, setNewFeature] = useState("");
  const [processSteps, setProcessSteps] = useState<ServiceProcessStep[]>([]);
  const [benefits, setBenefits] = useState<ServiceBenefit[]>([]);
  const [faqs, setFaqs] = useState<ServiceFaq[]>([]);
  const [techStack, setTechStack] = useState<string[]>([]);
  const [newTech, setNewTech] = useState("");
  const [orderIndex, setOrderIndex] = useState(1);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);

  // Validation State
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Industry Modal State
  const [showIndustryModal, setShowIndustryModal] = useState(false);
  const [editingIndustry, setEditingIndustry] = useState<IndustrySector | null>(null);
  const [indName, setIndName] = useState("");
  const [indTagline, setIndTagline] = useState("");
  const [indDesc, setIndDesc] = useState("");
  const [indBadge, setIndBadge] = useState("");
  const [indImage, setIndImage] = useState("");
  const [indSolutions, setIndSolutions] = useState<string[]>([]);
  const [newSolution, setNewSolution] = useState("");

  // Clean initialization when creating new service
  const handleOpenCreateService = () => {
    setEditingService(null);
    setTitle("");
    setSlug("");
    setCategory("Full-Stack Engineering");
    setTagline("");
    setSummary("");
    setHeroImage("https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80");
    setImageFile(null);
    setImagePreviewUrl("https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80");
    setImageError(null);
    setUploadProgress(0);
    setIsUploadingImage(false);
    setRelatedImages([]);
    
    // Sensible defaults for overview
    setWhatIsIt("");
    setWhoIsFor("");
    setProblemSolved("");
    setWhyItMatters("");

    setFeatures(["Custom Full-Stack Architecture", "High Concurrency Support", "Sub-Second Latency"]);
    setProcessSteps([
      { step: "01", title: "Discovery & Audit", description: "Audit requirements, user journeys, and technical constraints." },
      { step: "02", title: "Architecture & Wireframes", description: "Interactive UI/UX prototypes and low-latency database modeling." },
      { step: "03", title: "Modular Engineering", description: "Modern TypeScript development with continuous integration builds." },
      { step: "04", title: "Automated Testing", description: "Rigorous unit, performance, and accessibility verification." },
      { step: "05", title: "Edge Deployment", description: "Zero-downtime blue/green rollout with global CDN caching." },
      { step: "06", title: "24/7 SLA Support", description: "Continuous telemetry monitoring and proactive dependency tuning." },
    ]);
    setBenefits([
      { title: "Sub-Second Response", description: "Edge-cached SSR rendering achieving 95+ Google Lighthouse scores.", metric: "< 300ms TTFB" },
      { title: "Zero Tech Debt", description: "100% type-safe modular codebase engineered for rapid extension.", metric: "100% Type-Safe" },
    ]);
    setFaqs([
      { question: "What is the typical deployment timeline?", answer: "Most custom production builds ship within 3 to 6 weeks." },
      { question: "Do you support ongoing maintenance and SLAs?", answer: "Yes, we provide 24/7 telemetry monitoring and continuous performance upgrades." },
    ]);
    setTechStack(["React", "TypeScript", "Node.js", "PostgreSQL", "Tailwind CSS"]);
    setOrderIndex(services.length + 1);
    setIsFeatured(false);
    setIsActive(true);
    setModalTab("overview");
    setFormError(null);
    setFieldErrors({});
    setShowServiceModal(true);
  };

  const handleOpenEditService = (srv: CompanyService) => {
    setEditingService(srv);
    setTitle(srv.title);
    setSlug(srv.slug);
    setCategory(srv.category);
    setTagline(srv.tagline);
    setSummary(srv.summary);
    setHeroImage(srv.hero_image);
    setImageFile(null);
    setImagePreviewUrl(srv.hero_image);
    setImageError(null);
    setUploadProgress(0);
    setIsUploadingImage(false);
    setRelatedImages(srv.related_images || []);
    setWhatIsIt(srv.what_is_it);
    setWhoIsFor(srv.who_is_for);
    setProblemSolved(srv.problem_solved);
    setWhyItMatters(srv.why_it_matters);
    setFeatures(srv.features || []);
    setProcessSteps(srv.process_steps || []);
    setBenefits(srv.benefits || []);
    setFaqs(srv.faqs || []);
    setTechStack(srv.tech_stack || []);
    setOrderIndex(srv.order_index);
    setIsFeatured(srv.is_featured);
    setIsActive(srv.is_active);
    setModalTab("overview");
    setFormError(null);
    setFieldErrors({});
    setShowServiceModal(true);
  };

  // Image validation and file processing
  const handleFileProcess = (file: File) => {
    setImageError(null);

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setImageError("Unsupported image format. Use JPG, PNG, JPEG, or WEBP.");
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setImageError("Image is too large. Maximum allowed size is 5 MB.");
      return;
    }

    setImageFile(file);
    setIsUploadingImage(true);
    setUploadProgress(20);

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setImagePreviewUrl(dataUrl);
      setHeroImage(dataUrl);
      setUploadProgress(100);
      setTimeout(() => setIsUploadingImage(false), 300);
    };
    reader.onerror = () => {
      setImageError("Failed to read image file. Please try again.");
      setIsUploadingImage(false);
    };
    reader.readAsDataURL(file);
  };

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
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileProcess(e.target.files[0]);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreviewUrl(null);
    setHeroImage("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Step-by-step navigation with validation
  const handleNextStep = () => {
    setFormError(null);
    const errors: Record<string, string> = {};

    if (modalTab === "overview") {
      if (!title.trim() || title.trim().length < 3) {
        errors.title = "Service title must be at least 3 characters long.";
      }
      if (!summary.trim() || summary.trim().length < 10) {
        errors.summary = "Full summary description must be at least 10 characters long.";
      }
      if (whatIsIt.trim().length > 0 && whatIsIt.trim().length < 10) {
        errors.what_is_it = "What Is It description must be at least 10 characters long.";
      }
      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        setFormError("Please complete the required Overview fields before proceeding.");
        return;
      }
      setFieldErrors({});
      setModalTab("media");
      return;
    }

    if (modalTab === "media") {
      if (!heroImage.trim() && !imageFile) {
        setImageError("Primary service image is required.");
        setFormError("Please select or upload a primary service image.");
        return;
      }
      setModalTab("features");
      return;
    }

    if (modalTab === "features") {
      setModalTab("process");
      return;
    }

    if (modalTab === "process") {
      setModalTab("benefits");
      return;
    }
  };

  const handlePrevStep = () => {
    setFormError(null);
    if (modalTab === "benefits") setModalTab("process");
    else if (modalTab === "process") setModalTab("features");
    else if (modalTab === "features") setModalTab("media");
    else if (modalTab === "media") setModalTab("overview");
  };

  // Form Submission
  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});

    // Intelligent overview resolution: fallback to summary if what_is_it is empty
    const resolvedWhatIsIt = whatIsIt.trim() || summary.trim();

    const input: ServiceInput = {
      id: editingService?.id ?? undefined,
      title: title.trim(),
      slug: slug.trim() || slugifyService(title),
      category: category.trim(),
      tagline: tagline.trim() || summary.trim().slice(0, 80),
      summary: summary.trim(),
      hero_image: heroImage.trim(),
      related_images: relatedImages,
      what_is_it: resolvedWhatIsIt,
      who_is_for: whoIsFor.trim() || "Businesses, high-growth startups, and enterprises.",
      problem_solved: problemSolved.trim() || "Eliminates operational bottlenecks and technical debt.",
      why_it_matters: whyItMatters.trim() || "Drives measurable commercial performance and scale.",
      features,
      process_steps: processSteps,
      benefits,
      faqs,
      tech_stack: techStack,
      order_index: Number(orderIndex),
      is_featured: isFeatured,
      is_active: isActive,
    };

    const validation = validateServiceInput(input);
    if (!validation.valid) {
      setFormError(validation.error || "Please check the highlighted fields.");
      if (validation.field) {
        setFieldErrors({ [validation.field]: validation.error || "Invalid field." });
        if (validation.field === "title" || validation.field === "summary" || validation.field === "what_is_it") {
          setModalTab("overview");
        } else if (validation.field === "hero_image") {
          setModalTab("media");
        }
      }
      return;
    }

    startTransition(async () => {
      try {
        const res = await saveService({ data: input });
        if (res.success) {
          setShowServiceModal(false);
          onRefresh();
        } else {
          setFormError(res.error || "Failed to save service.");
        }
      } catch (err) {
        setFormError(err instanceof Error ? err.message : "Error saving service.");
      }
    });
  };

  const handleDeleteService = (id: string, srvTitle: string) => {
    if (window.confirm(`Are you sure you want to delete service "${srvTitle}"?`)) {
      startTransition(async () => {
        await deleteService({ data: { id } });
        onRefresh();
      });
    }
  };

  const handleToggleActive = (srv: CompanyService) => {
    startTransition(async () => {
      await saveService({
        data: {
          id: srv.id,
          title: srv.title,
          slug: srv.slug,
          category: srv.category,
          tagline: srv.tagline,
          summary: srv.summary,
          hero_image: srv.hero_image,
          related_images: srv.related_images,
          what_is_it: srv.what_is_it,
          who_is_for: srv.who_is_for,
          problem_solved: srv.problem_solved,
          why_it_matters: srv.why_it_matters,
          features: srv.features,
          process_steps: srv.process_steps,
          benefits: srv.benefits,
          faqs: srv.faqs,
          tech_stack: srv.tech_stack,
          order_index: srv.order_index,
          is_featured: srv.is_featured,
          is_active: !srv.is_active,
        },
      });
      onRefresh();
    });
  };

  const handleToggleFeatured = (srv: CompanyService) => {
    startTransition(async () => {
      await saveService({
        data: {
          id: srv.id,
          title: srv.title,
          slug: srv.slug,
          category: srv.category,
          tagline: srv.tagline,
          summary: srv.summary,
          hero_image: srv.hero_image,
          related_images: srv.related_images,
          what_is_it: srv.what_is_it,
          who_is_for: srv.who_is_for,
          problem_solved: srv.problem_solved,
          why_it_matters: srv.why_it_matters,
          features: srv.features,
          process_steps: srv.process_steps,
          benefits: srv.benefits,
          faqs: srv.faqs,
          tech_stack: srv.tech_stack,
          order_index: srv.order_index,
          is_featured: !srv.is_featured,
          is_active: srv.is_active,
        },
      });
      onRefresh();
    });
  };

  return (
    <div className={styles.wrapper}>
      {/* Header & Stats */}
      <div className={styles.headerRow}>
        <div>
          <h2 className={styles.title}>Services &amp; Industry Sectors</h2>
          <p className={styles.subtitle}>
            Manage dynamic service detail pages, primary hero media, 6-step workflows, FAQs, and industry sector cards.
          </p>
        </div>

        <div className={styles.actions}>
          <div className={styles.sectionTabs}>
            <button
              type="button"
              className={[
                styles.sectionTabBtn,
                activeSection === "services" ? styles.sectionTabBtnActive : "",
              ].join(" ")}
              onClick={() => setActiveSection("services")}
            >
              Services ({services.length})
            </button>
            <button
              type="button"
              className={[
                styles.sectionTabBtn,
                activeSection === "industries" ? styles.sectionTabBtnActive : "",
              ].join(" ")}
              onClick={() => setActiveSection("industries")}
            >
              Industries ({industries.length})
            </button>
          </div>

          {activeSection === "services" && (
            <button
              type="button"
              className={styles.createBtn}
              onClick={handleOpenCreateService}
            >
              <Plus size={16} />
              <span>Add New Service</span>
            </button>
          )}
        </div>
      </div>

      {/* SECTION 1: SERVICES TABLE */}
      {activeSection === "services" && (
        <div className={styles.tableCard}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: "60px" }}>Order</th>
                <th style={{ width: "90px" }}>Visual</th>
                <th>Service Name</th>
                <th>Category</th>
                <th>Slug</th>
                <th>Deliverables</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {services.map((srv) => (
                <tr key={srv.id} className={!srv.is_active ? styles.inactiveRow : ""}>
                  <td className={styles.orderCell}>{srv.order_index}</td>
                  <td>
                    <img
                      src={srv.hero_image}
                      alt={srv.title}
                      className={styles.thumbImg}
                    />
                  </td>
                  <td>
                    <div className={styles.titleCol}>
                      <span className={styles.srvTitle}>{srv.title}</span>
                      <span className={styles.srvTagline}>{srv.tagline}</span>
                    </div>
                  </td>
                  <td>
                    <span className={styles.categoryBadge}>{srv.category}</span>
                  </td>
                  <td>
                    <code className={styles.slugCode}>/services/{srv.slug}</code>
                  </td>
                  <td>
                    <span className={styles.featCount}>{srv.features?.length || 0} features</span>
                  </td>
                  <td>
                    <div className={styles.statusCell}>
                      <button
                        type="button"
                        className={[
                          styles.toggleIconBtn,
                          srv.is_active ? styles.activeIcon : styles.inactiveIcon,
                        ].join(" ")}
                        onClick={() => handleToggleActive(srv)}
                        title={srv.is_active ? "Click to deactivate" : "Click to activate"}
                      >
                        {srv.is_active ? <Eye size={16} /> : <EyeOff size={16} />}
                      </button>

                      <button
                        type="button"
                        className={[
                          styles.toggleIconBtn,
                          srv.is_featured ? styles.starActive : styles.starInactive,
                        ].join(" ")}
                        onClick={() => handleToggleFeatured(srv)}
                        title={srv.is_featured ? "Featured spotlight" : "Click to feature"}
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
                        onClick={() => handleOpenEditService(srv)}
                        title="Edit Full Service Details"
                      >
                        <Edit2 size={15} />
                      </button>
                      <a
                        href={`/services/${srv.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className={styles.viewBtn}
                        title="View Live Service Page"
                      >
                        <ExternalLink size={15} />
                      </a>
                      <button
                        type="button"
                        className={styles.delBtn}
                        onClick={() => handleDeleteService(srv.id, srv.title)}
                        title="Delete Service"
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

      {/* SECTION 2: INDUSTRIES TABLE */}
      {activeSection === "industries" && (
        <div className={styles.tableCard}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: "60px" }}>Order</th>
                <th style={{ width: "90px" }}>Visual</th>
                <th>Industry Sector</th>
                <th>Badge</th>
                <th>Tagline</th>
                <th>Solutions</th>
              </tr>
            </thead>
            <tbody>
              {industries.map((ind) => (
                <tr key={ind.id}>
                  <td className={styles.orderCell}>{ind.order_index}</td>
                  <td>
                    <img src={ind.image_url} alt={ind.name} className={styles.thumbImg} />
                  </td>
                  <td>
                    <span className={styles.srvTitle}>{ind.name}</span>
                  </td>
                  <td>
                    <span className={styles.categoryBadge}>{ind.badge}</span>
                  </td>
                  <td>
                    <span className={styles.srvTagline}>{ind.tagline}</span>
                  </td>
                  <td>
                    <span className={styles.featCount}>{ind.solutions?.length || 0} solutions</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* FULL SERVICE CREATE/EDIT MODAL */}
      {showServiceModal && (
        <div className={styles.modalBackdrop} role="dialog" aria-modal="true">
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className={styles.modalHeader}>
              <div>
                <h3 className={styles.modalTitle}>
                  {editingService ? `Edit Service: ${editingService.title}` : "Add New Dynamic Service"}
                </h3>
                <p className={styles.modalSub}>
                  Configure full architecture overviews, service hero images, 6-step workflows, and FAQs.
                </p>
              </div>
              <button
                type="button"
                className={styles.modalClose}
                onClick={() => setShowServiceModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            {/* Stepper Progress Bar */}
            <div className={styles.modalTabsBar}>
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

            {/* Error Banner */}
            {formError && (
              <div className={styles.errorAlert}>
                <AlertCircle size={16} />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveService} className={styles.modalForm}>
              <div className={styles.modalBodyScroll}>
                {/* STEP 1: OVERVIEW & CORE INFO */}
                {modalTab === "overview" && (
                  <div className={styles.tabPane}>
                    <div className={styles.formGrid2}>
                      <div className={styles.formGroup}>
                        <label>Service Title *</label>
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
                            if (!editingService) setSlug(slugifyService(e.target.value));
                          }}
                          placeholder="e.g. Artificial Intelligence & Multi-Agent Systems"
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
                          placeholder="e.g. ai"
                        />
                      </div>
                    </div>

                    <div className={styles.formGrid2}>
                      <div className={styles.formGroup}>
                        <label>Category *</label>
                        <input
                          type="text"
                          required
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          placeholder="e.g. Autonomous Systems"
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label>Display Order (1, 2, 3...)</label>
                        <input
                          type="number"
                          value={orderIndex}
                          onChange={(e) => setOrderIndex(Number(e.target.value))}
                        />
                      </div>
                    </div>

                    <div className={styles.formGroup}>
                      <label>Short Tagline *</label>
                      <input
                        type="text"
                        required
                        value={tagline}
                        onChange={(e) => setTagline(e.target.value)}
                        placeholder="e.g. Scalable, high-performance web systems built for business scale."
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label>Full Summary Description *</label>
                      <textarea
                        rows={3}
                        required
                        value={summary}
                        className={fieldErrors.summary ? styles.inputError : ""}
                        onChange={(e) => {
                          setSummary(e.target.value);
                          if (fieldErrors.summary) {
                            setFieldErrors((prev) => {
                              const copy = { ...prev };
                              delete copy.summary;
                              return copy;
                            });
                          }
                          // Auto-sync what_is_it if user hasn't typed custom what_is_it
                          if (!whatIsIt || whatIsIt === summary) {
                            setWhatIsIt(e.target.value);
                          }
                        }}
                        placeholder="Detailed high-level summary of the service offering..."
                      />
                      {fieldErrors.summary && (
                        <span className={styles.fieldErrorText}>{fieldErrors.summary}</span>
                      )}
                    </div>

                    {/* 4-Pillar Architecture Overview Fields */}
                    <div className={styles.sectionDividerBox}>
                      <h4 className={styles.sectionDividerTitle}>
                        <Sparkles size={14} />
                        <span>4-Pillar Architecture Overview</span>
                      </h4>
                      <p className={styles.sectionDividerSub}>
                        Detailed architecture insights shown on the dynamic service detail page.
                      </p>

                      <div className={styles.formGroup}>
                        <label>1. What Is It? (Core Technical Definition) *</label>
                        <textarea
                          rows={2}
                          value={whatIsIt}
                          className={fieldErrors.what_is_it ? styles.inputError : ""}
                          onChange={(e) => {
                            setWhatIsIt(e.target.value);
                            if (fieldErrors.what_is_it) {
                              setFieldErrors((prev) => {
                                const copy = { ...prev };
                                delete copy.what_is_it;
                                return copy;
                              });
                            }
                          }}
                          placeholder="Explain what the service is from an engineering & architecture standpoint..."
                        />
                        {fieldErrors.what_is_it && (
                          <span className={styles.fieldErrorText}>{fieldErrors.what_is_it}</span>
                        )}
                      </div>

                      <div className={styles.formGroup}>
                        <label>2. Who Is It For? (Target Audience &amp; Clients)</label>
                        <textarea
                          rows={2}
                          value={whoIsFor}
                          onChange={(e) => setWhoIsFor(e.target.value)}
                          placeholder="e.g. Startups launching MVPs, high-volume e-commerce, enterprise modernizing legacy apps..."
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label>3. What Problem Does It Solve? (Bottlenecks Eliminated)</label>
                        <textarea
                          rows={2}
                          value={problemSolved}
                          onChange={(e) => setProblemSolved(e.target.value)}
                          placeholder="e.g. Eliminates slow load speeds, poor responsiveness, and inflexible template tech debt..."
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label>4. Why It Matters For The Client? (Business ROI &amp; Value)</label>
                        <textarea
                          rows={2}
                          value={whyItMatters}
                          onChange={(e) => setWhyItMatters(e.target.value)}
                          placeholder="e.g. Increases conversion rates by up to 27% and provides zero-downtime scaling..."
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2: SERVICE IMAGE & GALLERY */}
                {modalTab === "media" && (
                  <div className={styles.tabPane}>
                    {/* Dedicated Primary Service Image Upload Dropzone */}
                    <div className={styles.uploadSectionBox}>
                      <div className={styles.uploadSectionHeader}>
                        <h4 className={styles.uploadSectionTitle}>
                          <ImageIcon size={16} />
                          <span>SERVICE IMAGE *</span>
                        </h4>
                        <span className={styles.uploadBadge}>Hero / Thumbnail (16:9 Recommended)</span>
                      </div>
                      <p className={styles.uploadInstruction}>
                        Upload a high-quality service image. Supported formats: <strong>JPG, JPEG, PNG, WEBP</strong> (Max <strong>5 MB</strong>).
                      </p>

                      {/* Dropzone Area */}
                      <div
                        className={[
                          styles.dropzone,
                          isDragOver ? styles.dropzoneActive : "",
                          fieldErrors.hero_image || imageError ? styles.dropzoneError : "",
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

                        {imagePreviewUrl ? (
                          <div className={styles.previewContainer}>
                            <img src={imagePreviewUrl} alt="Service Preview" className={styles.dropzonePreviewImg} />
                            
                            <div className={styles.previewMetaRow}>
                              <div className={styles.fileInfoBadge}>
                                <FileCheck size={14} className={styles.checkIcon} />
                                <span>{imageFile ? `${imageFile.name} (${(imageFile.size / (1024 * 1024)).toFixed(2)} MB)` : "Active Service Image"}</span>
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
                                  onClick={handleRemoveImage}
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
                              Drag and drop your service image here, or <span className={styles.browseLink}>Choose Image</span>
                            </h5>
                            <span className={styles.dropzoneSub}>Supports JPG, PNG, WEBP up to 5MB</span>
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
                        <label>Or Paste Direct Image URL (CDN / Unsplash)</label>
                        <input
                          type="url"
                          value={heroImage}
                          onChange={(e) => {
                            setHeroImage(e.target.value);
                            setImagePreviewUrl(e.target.value);
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
                          <span>GALLERY &amp; WORKFLOW PLATES ({relatedImages.length})</span>
                        </h4>
                        <span className={styles.uploadBadge}>Optional</span>
                      </div>
                      <p className={styles.uploadInstruction}>
                        Add architecture schematics, user flow diagrams, or product screenshots.
                      </p>

                      <div className={styles.relatedImgsGrid}>
                        {relatedImages.map((img, idx) => (
                          <div key={idx} className={styles.relatedImgCard}>
                            <img src={img.url} alt="Related" className={styles.relatedImgThumb} />
                            <input
                              type="text"
                              value={img.caption || ""}
                              onChange={(e) => {
                                const copy = [...relatedImages];
                                copy[idx] = { ...copy[idx], caption: e.target.value };
                                setRelatedImages(copy);
                              }}
                              placeholder="Caption / Alt description..."
                              className={styles.captionInput}
                            />
                            <button
                              type="button"
                              className={styles.removeImgBtn}
                              onClick={() => setRelatedImages(relatedImages.filter((_, i) => i !== idx))}
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>

                      <button
                        type="button"
                        className={styles.addStepBtn}
                        onClick={() => {
                          const url = window.prompt("Enter image URL (CDN / Unsplash):");
                          if (url && url.trim().startsWith("http")) {
                            setRelatedImages([...relatedImages, { url: url.trim(), caption: "Architecture diagram" }]);
                          }
                        }}
                      >
                        <Plus size={14} /> Add Gallery Image
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 3: DELIVERABLES & TECH STACK */}
                {modalTab === "features" && (
                  <div className={styles.tabPane}>
                    <div className={styles.formGroup}>
                      <label>Key Features &amp; Deliverables ({features.length})</label>
                      <div className={styles.chipsRow}>
                        {features.map((f, i) => (
                          <span key={i} className={styles.chip}>
                            <CheckCircle2 size={12} className={styles.chipCheck} />
                            <span>{f}</span>
                            <button
                              type="button"
                              onClick={() => setFeatures(features.filter((_, idx) => idx !== i))}
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
                          value={newFeature}
                          onChange={(e) => setNewFeature(e.target.value)}
                          placeholder="Add deliverable feature..."
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              if (newFeature.trim()) {
                                setFeatures([...features, newFeature.trim()]);
                                setNewFeature("");
                              }
                            }
                          }}
                        />
                        <button
                          type="button"
                          className={styles.smallAddBtn}
                          onClick={() => {
                            if (newFeature.trim()) {
                              setFeatures([...features, newFeature.trim()]);
                              setNewFeature("");
                            }
                          }}
                        >
                          Add
                        </button>
                      </div>
                    </div>

                    <div className={styles.formGroup}>
                      <label>Core Tech Stack ({techStack.length})</label>
                      <div className={styles.chipsRow}>
                        {techStack.map((t, i) => (
                          <span key={i} className={styles.chip}>
                            <Zap size={12} className={styles.chipCheck} />
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
                          placeholder="Add technology (e.g. Next.js, Redis, PyTorch)..."
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
                  </div>
                )}

                {/* STEP 4: 6-STEP WORKFLOW */}
                {modalTab === "process" && (
                  <div className={styles.tabPane}>
                    <div className={styles.stepsList}>
                      {processSteps.map((s, idx) => (
                        <div key={idx} className={styles.stepCard}>
                          <div className={styles.stepHeaderRow}>
                            <span className={styles.stepNumBadge}>Step {s.step}</span>
                            <button
                              type="button"
                              className={styles.removeStepBtn}
                              onClick={() => setProcessSteps(processSteps.filter((_, i) => i !== idx))}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                          <div className={styles.formGrid2}>
                            <input
                              type="text"
                              value={s.title}
                              onChange={(e) => {
                                const copy = [...processSteps];
                                copy[idx] = { ...copy[idx], title: e.target.value };
                                setProcessSteps(copy);
                              }}
                              placeholder="Step Title (e.g. Architecture)"
                              className={styles.stepInput}
                            />
                            <input
                              type="text"
                              value={s.step}
                              onChange={(e) => {
                                const copy = [...processSteps];
                                copy[idx] = { ...copy[idx], step: e.target.value };
                                setProcessSteps(copy);
                              }}
                              placeholder="01"
                              className={styles.stepInput}
                            />
                          </div>
                          <textarea
                            rows={2}
                            value={s.description}
                            onChange={(e) => {
                              const copy = [...processSteps];
                              copy[idx] = { ...copy[idx], description: e.target.value };
                              setProcessSteps(copy);
                            }}
                            placeholder="Detailed description of what occurs during this phase..."
                            className={styles.stepInput}
                          />
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      className={styles.addStepBtn}
                      onClick={() =>
                        setProcessSteps([
                          ...processSteps,
                          {
                            step: `0${processSteps.length + 1}`,
                            title: "New Phase",
                            description: "Description of the milestone deliverables.",
                          },
                        ])
                      }
                    >
                      <Plus size={14} /> Add Workflow Step
                    </button>
                  </div>
                )}

                {/* STEP 5: BENEFITS, FAQS & REVIEW */}
                {modalTab === "benefits" && (
                  <div className={styles.tabPane}>
                    {/* Benefits List */}
                    <div className={styles.formGroup}>
                      <label>Business Benefits &amp; Metric Highlights ({benefits.length})</label>
                      <div className={styles.benefitsList}>
                        {benefits.map((b, idx) => (
                          <div key={idx} className={styles.benefitCard}>
                            <div className={styles.formGrid2}>
                              <input
                                type="text"
                                value={b.title}
                                onChange={(e) => {
                                  const copy = [...benefits];
                                  copy[idx] = { ...copy[idx], title: e.target.value };
                                  setBenefits(copy);
                                }}
                                placeholder="Benefit Title (e.g. Sub-Second Latency)"
                              />
                              <input
                                type="text"
                                value={b.metric || ""}
                                onChange={(e) => {
                                  const copy = [...benefits];
                                  copy[idx] = { ...copy[idx], metric: e.target.value };
                                  setBenefits(copy);
                                }}
                                placeholder="Metric Badge (e.g. < 300ms, +35% ROI)"
                              />
                            </div>
                            <textarea
                              rows={2}
                              value={b.description}
                              onChange={(e) => {
                                const copy = [...benefits];
                                copy[idx] = { ...copy[idx], description: e.target.value };
                                setBenefits(copy);
                              }}
                              placeholder="Explanation of commercial leverage..."
                            />
                            <button
                              type="button"
                              className={styles.removeStepBtn}
                              onClick={() => setBenefits(benefits.filter((_, i) => i !== idx))}
                            >
                              <Trash2 size={13} /> Remove Benefit
                            </button>
                          </div>
                        ))}
                      </div>

                      <button
                        type="button"
                        className={styles.addStepBtn}
                        onClick={() =>
                          setBenefits([
                            ...benefits,
                            { title: "High Scalability", description: "Engineered to scale effortlessly under peak traffic.", metric: "99.99% SLA" },
                          ])
                        }
                      >
                        <Plus size={14} /> Add Business Benefit
                      </button>
                    </div>

                    {/* FAQs List */}
                    <div className={styles.formGroup}>
                      <label>Frequently Asked Questions ({faqs.length})</label>
                      <div className={styles.faqsList}>
                        {faqs.map((faq, idx) => (
                          <div key={idx} className={styles.faqCard}>
                            <input
                              type="text"
                              value={faq.question}
                              onChange={(e) => {
                                const copy = [...faqs];
                                copy[idx] = { ...copy[idx], question: e.target.value };
                                setFaqs(copy);
                              }}
                              placeholder="Question (e.g. What is the typical project timeline?)"
                            />
                            <textarea
                              rows={2}
                              value={faq.answer}
                              onChange={(e) => {
                                const copy = [...faqs];
                                copy[idx] = { ...copy[idx], answer: e.target.value };
                                setFaqs(copy);
                              }}
                              placeholder="Answer..."
                            />
                            <button
                              type="button"
                              className={styles.removeStepBtn}
                              onClick={() => setFaqs(faqs.filter((_, i) => i !== idx))}
                            >
                              <Trash2 size={13} /> Remove FAQ
                            </button>
                          </div>
                        ))}
                      </div>

                      <button
                        type="button"
                        className={styles.addStepBtn}
                        onClick={() =>
                          setFaqs([
                            ...faqs,
                            { question: "How do we get started?", answer: "Schedule an architecture discovery session with our team." },
                          ])
                        }
                      >
                        <Plus size={14} /> Add FAQ
                      </button>
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

              {/* Modal Sticky Footer */}
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
                    onClick={() => setShowServiceModal(false)}
                  >
                    Cancel
                  </button>

                  {modalTab !== "benefits" ? (
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
                        ? "Saving Service..."
                        : editingService
                        ? "Update Service"
                        : "Create Service"}
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
