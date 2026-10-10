import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  type ChangeEvent,
} from "react";
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Star,
  Image as ImageIcon,
  ExternalLink,
  HelpCircle,
  Zap,
  Sparkles,
  X,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  AlertTriangle,
  RefreshCw,
  Search,
  Tag,
  Settings,
} from "lucide-react";
import {
  type CompanyService,
  type ServiceInput,
  type ServiceProcessStep,
  type ServiceBenefit,
  type ServiceFaq,
  type ServiceCategoryItem,
  type ServiceCategoryInput,
  slugifyService,
  slugifyServiceCategory,
  validateServiceInput,
  validateServiceCategoryInput,
} from "@/lib/services.shared";
import {
  saveServiceFn,
  deleteServiceFn,
  toggleServiceActivationFn,
  toggleServiceFeaturedFn,
  getServiceCategoriesFn,
  saveServiceCategoryFn,
  deleteServiceCategoryFn,
} from "@/lib/services.functions";
import { resolveCategoryName, isMongoId, DEFAULT_SERVICE_FALLBACK_IMAGE } from "@/services/service.service";
import shared from "../styles/admin.module.css";
import styles from "./AdminServices.module.css";

interface AdminServicesProps {
  services: CompanyService[];
  categoryItems?: ServiceCategoryItem[];
  /** @deprecated Dynamic counts are calculated directly from MongoDB docs and filter count */
  categoryCounts?: Record<string, number>;
  onRefresh: () => void;
}

type ServiceModalTab = "overview" | "media" | "features" | "process" | "benefits";

const MODAL_STEPS: { id: ServiceModalTab; label: string; num: string }[] = [
  { id: "overview", label: "Overview & Core Info", num: "01" },
  { id: "media", label: "Service Image & Gallery", num: "02" },
  { id: "features", label: "Deliverables & Tech", num: "03" },
  { id: "process", label: "6-Step Workflow", num: "04" },
  { id: "benefits", label: "Benefits & FAQs", num: "05" },
];

export function AdminServices({
  services,
  categoryItems: initialCategoryItems,
  categoryCounts: _initialCategoryCounts,
  onRefresh,
}: AdminServicesProps) {
  // Category Filtering & Search State
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [featuredOnly, setFeaturedOnly] = useState<boolean>(false);

  // Status & Feedback State
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Live Categories State: initialized from parent AdminPanel hydration
  const [categoryList, setCategoryList] = useState<ServiceCategoryItem[]>(() => {
    if (initialCategoryItems && Array.isArray(initialCategoryItems)) {
      return initialCategoryItems;
    }
    return [];
  });

  // WHY THIS FUNCTION IS USED:
  // Allows manual category list refresh and post-mutation (create/update/delete) syncing.
  // Supports an optional AbortSignal to abort pending HTTP requests on unmount.
  const refreshCategories = useCallback(async (signal?: AbortSignal) => {
    try {
      const res = await getServiceCategoriesFn();
      if (signal?.aborted) return;
      if (res && Array.isArray(res.categories)) {
        setCategoryList(res.categories);
      }
    } catch (err: any) {
      if (signal?.aborted || err?.name === "AbortError") return;
      console.warn("Failed to load service categories", err);
    }
  }, []);

  // SYNCHRONIZATION WITH PARENT HYDRATION (PREVENTING DUPLICATE FETCH):
  // Parent AdminPanel already fetches both services and categories via `loadServicesData()`.
  // When `initialCategoryItems` updates from parent, we sync it directly into state.
  // We intentionally do NOT trigger `refreshCategories()` when initialCategoryItems is empty on mount,
  // preventing redundant parallel HTTP calls to `/api/v1/admin-panel/service-category/all`.
  useEffect(() => {
    if (initialCategoryItems && Array.isArray(initialCategoryItems) && initialCategoryItems.length > 0) {
      setCategoryList(initialCategoryItems);
    }
  }, [initialCategoryItems]);

  // Modals State
  const [isCategoryHubOpen, setIsCategoryHubOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ServiceCategoryItem | null>(null);
  const [catName, setCatName] = useState("");
  const [catDesc, setCatDesc] = useState("");
  const [catOrder, setCatOrder] = useState<number>(1);
  const [catStatus, setCatStatus] = useState<"active" | "inactive">("active");
  const [deleteCatTarget, setDeleteCatTarget] = useState<ServiceCategoryItem | null>(null);

  // Service Creation / Editing State
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [activeStep, setActiveStep] = useState<ServiceModalTab>("overview");
  const [editingService, setEditingService] = useState<CompanyService | null>(null);
  const [deleteServiceTarget, setDeleteServiceTarget] = useState<CompanyService | null>(null);

  // ============================================================================
  // CLEANER FUNCTION: MODAL EVENT TEARDOWN & BODY SCROLL LOCK
  // WHY THIS IS USED:
  // 1. Prevents background page scrolling while modal dialogs are active.
  // 2. Adds global Escape key listener for accessible modal closing.
  // 3. The returned cleanup function ALWAYS restores body scroll and unbinds event listeners
  //    when modals close or when the component unmounts.
  // ============================================================================
  useEffect(() => {
    const hasOpenModal =
      isServiceModalOpen ||
      isCategoryHubOpen ||
      Boolean(deleteServiceTarget) ||
      Boolean(deleteCatTarget);

    if (!hasOpenModal) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (deleteServiceTarget) setDeleteServiceTarget(null);
        else if (deleteCatTarget) setDeleteCatTarget(null);
        else if (isServiceModalOpen) setIsServiceModalOpen(false);
        else if (isCategoryHubOpen) setIsCategoryHubOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isServiceModalOpen, isCategoryHubOpen, deleteServiceTarget, deleteCatTarget]);

  // Form Fields for Service Wizard
  const [formTitle, setFormTitle] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formTagline, setFormTagline] = useState("");
  const [formSummary, setFormSummary] = useState("");
  const [formOrderIndex, setFormOrderIndex] = useState<number>(1);
  const [formIsActive, setFormIsActive] = useState<boolean>(true);
  const [formIsFeatured, setFormIsFeatured] = useState<boolean>(false);

  // Media
  const [formHeroImage, setFormHeroImage] = useState("");
  const [heroImageFile, setHeroImageFile] = useState<File | null>(null);

  // Architecture 4-point
  const [formWhatIsIt, setFormWhatIsIt] = useState("");
  const [formWhoIsFor, setFormWhoIsFor] = useState("");
  const [formProblemSolved, setFormProblemSolved] = useState("");
  const [formWhyItMatters, setFormWhyItMatters] = useState("");

  // Lists
  const [formFeatures, setFormFeatures] = useState<string[]>([]);
  const [featureInput, setFeatureInput] = useState("");
  const [formTechStack, setFormTechStack] = useState<string[]>([]);
  const [techInput, setTechInput] = useState("");

  // Process Steps (6 steps)
  const [formProcessSteps, setFormProcessSteps] = useState<ServiceProcessStep[]>([
    { step: "01", title: "Discovery & Requirements", description: "Audit user journeys, technical constraints, data schemas, and business goals." },
    { step: "02", title: "Architecture & UI/UX Wireframing", description: "Interactive prototypes and low-latency database modeling." },
    { step: "03", title: "Sprint-Based Engineering", description: "Modern modular TypeScript development with bi-weekly deployable builds." },
    { step: "04", title: "End-to-End Automated Testing", description: "Rigorous unit, integration, accessibility, and performance load tests." },
    { step: "05", title: "Edge Production Deployment", description: "Zero-downtime blue/green rollouts on global CDNs with SSL & DDoS protection." },
    { step: "06", title: "Continuous SLA Monitoring", description: "24/7 telemetry monitoring, database tuning, and proactive dependency upgrades." },
  ]);

  // Benefits & FAQs
  const [formBenefits, setFormBenefits] = useState<ServiceBenefit[]>([]);
  const [benefitTitle, setBenefitTitle] = useState("");
  const [benefitDesc, setBenefitDesc] = useState("");
  const [benefitMetric, setBenefitMetric] = useState("");

  const [formFaqs, setFormFaqs] = useState<ServiceFaq[]>([]);
  const [faqQuestion, setFaqQuestion] = useState("");
  const [faqAnswer, setFaqAnswer] = useState("");

  // Helper to open Service Wizard for Create
  const handleOpenCreateService = () => {
    setEditingService(null);
    setActiveStep("overview");
    setFormTitle("");
    setFormSlug("");
    setFormCategory(categoryList[0]?.id || categoryList[0]?.name || "Full-Stack Engineering");
    setFormTagline("");
    setFormSummary("");
    const nextOrder =
      (services || []).length > 0
        ? Math.max(...(services || []).map((s) => Number(s.order_index) || 0), 0) + 1
        : 1;
    setFormOrderIndex(nextOrder);
    setFormIsActive(true);
    setFormIsFeatured(false);
    setFormHeroImage(DEFAULT_SERVICE_FALLBACK_IMAGE);
    setHeroImageFile(null);
    setFormWhatIsIt("");
    setFormWhoIsFor("");
    setFormProblemSolved("");
    setFormWhyItMatters("");
    setFormFeatures(["Custom Solution Architecture", "High-Performance Workflows", "Enterprise Security & SLA"]);
    setFormTechStack(["TypeScript", "React", "Node.js", "MongoDB"]);
    setFormBenefits([
      { title: "High Reliability", description: "Production-grade uptime and error resilience.", metric: "99.99% SLA" },
    ]);
    setFormFaqs([
      { question: "How long does implementation take?", answer: "Sprint-based delivery starts producing working builds in 2 weeks." },
    ]);
    setIsServiceModalOpen(true);
  };

  // Helper to open Service Wizard for Edit
  const handleOpenEditService = (srv: CompanyService) => {
    setEditingService(srv);
    setActiveStep("overview");
    setFormTitle(srv.title);
    setFormSlug(srv.slug);
    const matchedCategory = categoryList.find(
      (c) =>
        c.id === srv.category_id ||
        c.id === srv.category ||
        c.name.toLowerCase() === (srv.category || "").toLowerCase() ||
        c.slug.toLowerCase() === (srv.category || "").toLowerCase(),
    );
    setFormCategory(matchedCategory?.id || srv.category_id || srv.category || categoryList[0]?.id || "");
    setFormTagline(srv.tagline || "");
    setFormSummary(srv.summary || "");
    setFormOrderIndex(srv.order_index ?? 1);
    setFormIsActive(srv.is_active !== false);
    setFormIsFeatured(Boolean(srv.is_featured));
    setFormHeroImage(srv.hero_image || DEFAULT_SERVICE_FALLBACK_IMAGE);
    setHeroImageFile(null);
    setFormWhatIsIt(srv.what_is_it || srv.summary || "");
    setFormWhoIsFor(srv.who_is_for || "");
    setFormProblemSolved(srv.problem_solved || "");
    setFormWhyItMatters(srv.why_it_matters || "");
    setFormFeatures(srv.features || []);
    setFormTechStack(srv.tech_stack || []);
    setFormProcessSteps(
      srv.process_steps && srv.process_steps.length > 0
        ? srv.process_steps
        : [
            { step: "01", title: "Discovery", description: "Requirements gathering and scoping." },
            { step: "02", title: "Architecture", description: "System modeling and prototypes." },
            { step: "03", title: "Development", description: "Sprint delivery and integration." },
          ],
    );
    setFormBenefits(srv.benefits || []);
    setFormFaqs(srv.faqs || []);
    setIsServiceModalOpen(true);
  };

  // Save Service handler
  const handleSaveService = async () => {
    const cleanTitle = formTitle.trim();
    if (!cleanTitle || cleanTitle.length < 5) {
      setError("Service title must be at least 5 characters long.");
      return;
    }

    setBusy(true);
    setError(null);
    setNotice(null);

    const cleanHeroImage =
      formHeroImage.trim().startsWith("blob:") || !formHeroImage.trim()
        ? DEFAULT_SERVICE_FALLBACK_IMAGE
        : formHeroImage.trim();

    const servicePayload: ServiceInput = {
      id: editingService ? editingService.id : undefined,
      title: cleanTitle,
      slug: formSlug.trim() || slugifyService(cleanTitle),
      category: formCategory,
      tagline: formTagline.trim(),
      summary: formSummary.trim(),
      order_index: Number(formOrderIndex) || 1,
      is_active: formIsActive,
      is_featured: formIsFeatured,
      hero_image: cleanHeroImage,
      related_images: editingService?.related_images || [],
      what_is_it: formWhatIsIt.trim() || formSummary.trim(),
      who_is_for: formWhoIsFor.trim(),
      problem_solved: formProblemSolved.trim(),
      why_it_matters: formWhyItMatters.trim(),
      features: formFeatures.map((f) => f.trim()).filter(Boolean),
      tech_stack: formTechStack.map((t) => t.trim()).filter(Boolean),
      process_steps: formProcessSteps.map((s, idx) => ({
        step: String(s.step || (s as any).stepNumber || idx + 1).padStart(2, "0"),
        title: s.title.trim(),
        description: s.description.trim(),
      })),
      benefits: formBenefits.map((b) => ({
        title: b.title.trim(),
        description: b.description.trim(),
        metric: b.metric?.trim() || undefined,
      })),
      faqs: formFaqs.map((f) => ({
        question: f.question.trim(),
        answer: f.answer.trim(),
      })),
    };

    try {
      let res;
      if (heroImageFile instanceof File) {
        const fd = new FormData();
        if (editingService?.id) fd.append("id", editingService.id);
        fd.append("title", cleanTitle);
        fd.append("slug", formSlug.trim() || slugifyService(cleanTitle));
        fd.append("category", formCategory);
        if (formTagline.trim()) fd.append("tagline", formTagline.trim());
        if (formSummary.trim()) fd.append("summary", formSummary.trim());
        fd.append("orderIndex", String(Number(formOrderIndex) || 1));
        fd.append("isActive", String(formIsActive));
        fd.append("isFeatured", String(formIsFeatured));
        fd.append("heroImage", heroImageFile);
        if (formWhatIsIt.trim() || formSummary.trim()) fd.append("whatIsIt", formWhatIsIt.trim() || formSummary.trim());
        if (formWhoIsFor.trim()) fd.append("whoIsFor", formWhoIsFor.trim());
        if (formProblemSolved.trim()) fd.append("problemSolved", formProblemSolved.trim());
        if (formWhyItMatters.trim()) fd.append("whyItMatters", formWhyItMatters.trim());
        fd.append("features", JSON.stringify(formFeatures.map((f) => f.trim()).filter(Boolean)));
        fd.append("techStack", JSON.stringify(formTechStack.map((t) => t.trim()).filter(Boolean)));
        fd.append(
          "processSteps",
          JSON.stringify(
            formProcessSteps.map((s, idx) => ({
              step: String(s.step || (s as any).stepNumber || idx + 1).padStart(2, "0"),
              title: s.title.trim(),
              description: s.description.trim(),
            })),
          ),
        );
        fd.append(
          "benefits",
          JSON.stringify(
            formBenefits.map((b) => ({
              title: b.title.trim(),
              description: b.description.trim(),
              metric: b.metric?.trim() || undefined,
            })),
          ),
        );
        fd.append(
          "faqs",
          JSON.stringify(
            formFaqs.map((f) => ({
              question: f.question.trim(),
              answer: f.answer.trim(),
            })),
          ),
        );

        res = await saveServiceFn({ data: fd, serviceId: editingService?.id });
      } else {
        res = await saveServiceFn({ data: servicePayload, serviceId: editingService?.id });
      }

      if (!res.success) {
        throw new Error(res.error || "Failed to save service.");
      }

      setNotice(`Service "${cleanTitle}" saved successfully.`);
      setIsServiceModalOpen(false);
      onRefresh();
      void refreshCategories();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save service.");
    } finally {
      setBusy(false);
    }
  };

  // Toggle Activation
  const handleToggleActivation = async (srv: CompanyService) => {
    setBusy(true);
    try {
      const res = await toggleServiceActivationFn({ data: { id: srv.id } });
      if (res.success) {
        setNotice(`Service status updated for "${srv.title}".`);
        onRefresh();
      } else {
        setError(res.error || "Failed to toggle status.");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to toggle status.");
    } finally {
      setBusy(false);
    }
  };

  // Toggle Featured
  const handleToggleFeatured = async (srv: CompanyService) => {
    setBusy(true);
    try {
      const res = await toggleServiceFeaturedFn({ data: { id: srv.id } });
      if (res.success) {
        setNotice(`Featured state updated for "${srv.title}".`);
        onRefresh();
      } else {
        setError(res.error || "Failed to toggle featured.");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to toggle featured.");
    } finally {
      setBusy(false);
    }
  };

  // Delete Service
  const executeDeleteService = async () => {
    if (!deleteServiceTarget) return;
    setBusy(true);
    try {
      const res = await deleteServiceFn({ data: { id: deleteServiceTarget.id } });
      if (res.success) {
        setNotice(`Service "${deleteServiceTarget.title}" deleted.`);
        setDeleteServiceTarget(null);
        onRefresh();
        void refreshCategories();
      } else {
        setError(res.error || "Failed to delete service.");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete service.");
    } finally {
      setBusy(false);
    }
  };

  // Category Hub: Open Create Category
  const handleOpenCreateCategory = () => {
    setEditingCategory(null);
    setCatName("");
    setCatDesc("");
    setCatOrder(categoryList.length + 1);
    setCatStatus("active");
  };

  // Category Hub: Open Edit Category
  const handleOpenEditCategory = (cat: ServiceCategoryItem) => {
    setEditingCategory(cat);
    setCatName(cat.name);
    setCatDesc(cat.description || "");
    setCatOrder(cat.order_index ?? 1);
    setCatStatus(cat.status === "inactive" ? "inactive" : "active");
  };

  // Category Hub: Save Category
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = catName.trim();
    if (!cleanName || cleanName.length < 5) {
      setError("Category name must be at least 5 characters long.");
      return;
    }

    setBusy(true);
    setError(null);
    try {
      const payload: ServiceCategoryInput = {
        id: editingCategory ? editingCategory.id : undefined,
        name: cleanName,
        slug: slugifyServiceCategory(cleanName),
        description: catDesc.trim() || undefined,
        order_index: Number(catOrder) || 1,
        status: catStatus,
      };

      const res = await saveServiceCategoryFn({ data: payload });
      if (!res.success) {
        throw new Error(res.error || "Failed to save service category.");
      }

      setNotice(`Category "${cleanName}" saved successfully.`);
      handleOpenCreateCategory();
      void refreshCategories();
      onRefresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save category.");
    } finally {
      setBusy(false);
    }
  };

  // Category Hub: Delete Category
  const executeDeleteCategory = async () => {
    if (!deleteCatTarget) return;
    setBusy(true);
    const targetId = deleteCatTarget.id;
    const targetName = deleteCatTarget.name;
    try {
      const res = await deleteServiceCategoryFn({ data: { id: targetId } });
      if (!res.success) {
        throw new Error(res.error || "Failed to delete category.");
      }
      setCategoryList((prev) =>
        prev.filter((c) => c.id !== targetId && c.name.toLowerCase() !== targetName.toLowerCase()),
      );
      setNotice(`Category "${targetName}" and all attached services deleted.`);
      setDeleteCatTarget(null);
      await refreshCategories();
      onRefresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete category.");
    } finally {
      setBusy(false);
    }
  };

  // Filtered Services computation
  const filteredServices = useMemo(() => {
    return (services ?? []).filter((srv) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const titleMatch = srv.title.toLowerCase().includes(q);
        const taglineMatch = srv.tagline?.toLowerCase().includes(q) ?? false;
        const slugMatch = srv.slug.toLowerCase().includes(q);
        const catMatch = srv.category.toLowerCase().includes(q);
        const techMatch = srv.tech_stack?.some((t) => t.toLowerCase().includes(q)) ?? false;
        if (!titleMatch && !taglineMatch && !slugMatch && !catMatch && !techMatch) {
          return false;
        }
      }

      // Category filter
      if (selectedCategoryId !== "all") {
        const targetCat = categoryList.find(
          (c) => c.id === selectedCategoryId || c.name === selectedCategoryId || c.slug === selectedCategoryId,
        );
        const srvCatLower = srv.category.toLowerCase();
        const srvCatId = (srv as any).category_id;
        const matchesCat =
          srvCatLower === catNameLower ||
          srv.category === selectedCategoryId ||
          srvCatId === selectedCategoryId ||
          (targetCat && (srv.category === targetCat.id || srvCatId === targetCat.id));
        if (!matchesCat) {
          return false;
        }
      }

      // Status filter
      if (statusFilter === "active" && !srv.is_active) return false;
      if (statusFilter === "inactive" && srv.is_active) return false;

      // Featured filter
      if (featuredOnly && !srv.is_featured) return false;

      return true;
    });
  }, [services, searchQuery, selectedCategoryId, categoryList, statusFilter, featuredOnly]);

  return (
    <div className={styles.wrapper}>
      {/* 1. TOP HEADER BOX */}
      <div className={styles.headerBox}>
        <div>
          <h2 className={styles.pageTitle}>Services &amp; Service Categories</h2>
          <p className={styles.pageSubtitle}>
            Configure core digital engineering disciplines, deep architectural deliverables, and service categories.
          </p>
        </div>
        <div className={styles.headerActions}>
          <button
            type="button"
            className={styles.secondaryBtn}
            onClick={() => setIsCategoryHubOpen(true)}
          >
            <Settings size={16} />
            <span>Manage Categories ({categoryList.length})</span>
          </button>

          <button
            type="button"
            className={styles.primaryBtn}
            onClick={handleOpenCreateService}
          >
            <Plus size={16} />
            <span>Create New Service</span>
          </button>
        </div>
      </div>

      {/* Global Alerts */}
      {notice && (
        <div className={styles.okAlert}>
          <CheckCircle2 size={18} />
          <span>{notice}</span>
          <button
            type="button"
            className={styles.modalCloseBtn}
            onClick={() => setNotice(null)}
            style={{ marginLeft: "auto" }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {error && (
        <div className={styles.errorAlert}>
          <AlertCircle size={18} />
          <span>{error}</span>
          <button
            type="button"
            className={styles.modalCloseBtn}
            onClick={() => setError(null)}
            style={{ marginLeft: "auto" }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* 2. CATEGORY PILL FILTER BAR */}
      <div className={styles.categoryBar}>
        <button
          type="button"
          className={[
            styles.categoryChip,
            selectedCategoryId === "all" ? styles.categoryChipActive : "",
          ].join(" ")}
          onClick={() => setSelectedCategoryId("all")}
        >
          <span>All Disciplines</span>
          <span className={styles.chipCount}>{services?.length ?? 0}</span>
        </button>

        {categoryList.map((cat) => {
          const isSelected = selectedCategoryId === cat.id || selectedCategoryId === cat.name;
          const count =
            typeof cat.active_service_count === "number"
              ? cat.active_service_count
              : typeof cat.total_service_count === "number"
              ? cat.total_service_count
              : (services || []).filter(
                  (s) =>
                    s.category.toLowerCase() === cat.name.toLowerCase() ||
                    s.category === cat.id ||
                    (s as any).category_id === cat.id,
                ).length;

          return (
            <button
              key={cat.id}
              type="button"
              className={[
                styles.categoryChip,
                isSelected ? styles.categoryChipActive : "",
              ].join(" ")}
              onClick={() => setSelectedCategoryId(cat.id)}
            >
              <span>{cat.name}</span>
              <span className={styles.chipCount}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* 3. TOOLBAR (SEARCH & FILTERS) */}
      <div className={styles.toolbarCard}>
        <div className={styles.searchRow}>
          <div className={styles.searchInputWrap}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search by title, tagline, slug, tech stack, or deliverables…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className={styles.clearSearchBtn}
                onClick={() => setSearchQuery("")}
                title="Clear Search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className={styles.filterChips}>
            <button
              type="button"
              className={[
                styles.filterChip,
                statusFilter === "active" ? styles.filterChipActive : "",
              ].join(" ")}
              onClick={() => setStatusFilter(statusFilter === "active" ? "all" : "active")}
            >
              Active Only
            </button>

            <button
              type="button"
              className={[
                styles.filterChip,
                statusFilter === "inactive" ? styles.filterChipActive : "",
              ].join(" ")}
              onClick={() => setStatusFilter(statusFilter === "inactive" ? "all" : "inactive")}
            >
              Inactive Only
            </button>

            <button
              type="button"
              className={[
                styles.filterChip,
                featuredOnly ? styles.filterChipActive : "",
              ].join(" ")}
              onClick={() => setFeaturedOnly(!featuredOnly)}
            >
              <Star size={12} style={{ display: "inline", marginRight: "4px", color: featuredOnly ? "#fbbf24" : "inherit" }} />
              Featured
            </button>
          </div>
        </div>
      </div>

      {/* 4. SERVICES ROSTER TABLE */}
      <div className={styles.tableCard}>
        <div className={styles.tableCardHeader}>
          <h3 className={styles.tableTitle}>
            <Layers size={18} />
            <span>Active Services ({filteredServices.length})</span>
          </h3>
          {(searchQuery || selectedCategoryId !== "all" || statusFilter !== "all" || featuredOnly) && (
            <span className={styles.tableSummaryText}>
              Showing {filteredServices.length} of {services?.length ?? 0} total services
            </span>
          )}
        </div>

        <div className={styles.tableWrap}>
          <table className={shared.table}>
            <thead>
              <tr>
                <th>Service</th>
                <th>Category</th>
                <th>Order</th>
                <th>Status</th>
                <th>Featured</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredServices.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    style={{
                      textAlign: "center",
                      padding: "3.5rem 1rem",
                      color: "rgba(255,255,255,0.45)",
                    }}
                  >
                    {searchQuery || selectedCategoryId !== "all"
                      ? "No services match your active search filters."
                      : "No services created yet. Click 'Create New Service' above to add your first engineering discipline."}
                  </td>
                </tr>
              ) : (
                filteredServices.map((srv) => {
                  const categoryDisplayName = resolveCategoryName(srv.category, categoryList);
                  return (
                    <tr key={srv.id}>
                      {/* Service Info */}
                      <td>
                        <div className={styles.serviceCell}>
                          <img
                            src={srv.hero_image || DEFAULT_SERVICE_FALLBACK_IMAGE}
                            alt={srv.title}
                            className={styles.serviceThumb}
                            loading="lazy"
                            onError={(e) => {
                              const target = e.currentTarget as HTMLImageElement;
                              if (target.src !== DEFAULT_SERVICE_FALLBACK_IMAGE) {
                                target.src = DEFAULT_SERVICE_FALLBACK_IMAGE;
                              }
                            }}
                          />
                          <div className={styles.serviceInfoCol}>
                            <span className={styles.serviceTitleText}>{srv.title}</span>
                            {srv.tagline && (
                              <span className={styles.serviceTaglineText}>{srv.tagline}</span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td>
                        <span className={styles.catBadge}>{categoryDisplayName}</span>
                      </td>

                      {/* Order Index */}
                      <td>
                        <span className={styles.orderBadge}>#{srv.order_index ?? 1}</span>
                      </td>

                      {/* Status */}
                      <td>
                        <button
                          type="button"
                          className={[styles.pill, srv.is_active ? styles.on : styles.off].join(" ")}
                          disabled={busy}
                          onClick={() => void handleToggleActivation(srv)}
                          title="Click to toggle status"
                        >
                          <span className={styles.statusDot} />
                          <span>{srv.is_active ? "Active" : "Inactive"}</span>
                        </button>
                      </td>

                      {/* Featured */}
                      <td>
                        <button
                          type="button"
                          className={[
                            styles.featuredBtn,
                            srv.is_featured ? styles.featuredBtnActive : "",
                          ].join(" ")}
                          disabled={busy}
                          onClick={() => void handleToggleFeatured(srv)}
                          title={srv.is_featured ? "Featured on Home" : "Not Featured"}
                        >
                          <Star size={18} fill={srv.is_featured ? "#fbbf24" : "none"} />
                        </button>
                      </td>

                      {/* Actions */}
                      <td>
                        <div className={styles.rowActions}>
                          <button
                            type="button"
                            className={[shared.btn, shared.ghost, styles.actionBtn].join(" ")}
                            disabled={busy}
                            onClick={() => handleOpenEditService(srv)}
                            title="Edit Service"
                            aria-label={`Edit ${srv.title}`}
                          >
                            <Edit2 size={13} />
                          </button>

                          <a
                            href={`/services/${srv.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={[shared.btn, shared.ghost, styles.actionBtn].join(" ")}
                            title="Preview Public Page"
                          >
                            <ExternalLink size={13} />
                          </a>

                          <button
                            type="button"
                            className={[
                              shared.btn,
                              shared.ghost,
                              shared.danger,
                              styles.actionBtn,
                            ].join(" ")}
                            disabled={busy}
                            onClick={() => setDeleteServiceTarget(srv)}
                            title="Delete Service"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* =========================================================================
          CATEGORY MANAGEMENT HUB MODAL
          ========================================================================= */}
      {isCategoryHubOpen && (
        <div className={styles.modalBackdrop} role="dialog" aria-modal="true">
          <div className={styles.categoryModalCard}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalHeaderTitle}>
                <Settings size={20} />
                <span>Service Categories Management</span>
              </h3>
              <button
                type="button"
                className={styles.modalCloseBtn}
                onClick={() => setIsCategoryHubOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className={styles.modalScrollBody}>
              {/* Category Form */}
              <form onSubmit={handleSaveCategory} className={styles.categoryFormCard}>
                <h4 style={{ margin: 0, fontSize: "0.95rem", color: "#ffffff", fontWeight: 700 }}>
                  {editingCategory ? `Edit Category: "${editingCategory.name}"` : "Create New Service Category"}
                </h4>

                <div className={styles.formGrid2}>
                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="cat-name">
                      CATEGORY NAME * (5–50 Chars)
                    </label>
                    <input
                      id="cat-name"
                      type="text"
                      className={styles.input}
                      required
                      placeholder="e.g. Cloud & DevOps"
                      value={catName}
                      onChange={(e) => setCatName(e.target.value)}
                      disabled={busy}
                    />
                  </div>

                  <div className={styles.formGrid2}>
                    <div className={styles.field}>
                      <label className={styles.label} htmlFor="cat-order">
                        DISPLAY ORDER *
                      </label>
                      <input
                        id="cat-order"
                        type="number"
                        min={1}
                        max={10000}
                        className={styles.input}
                        required
                        value={catOrder}
                        onChange={(e) => setCatOrder(Number(e.target.value))}
                        disabled={busy}
                      />
                    </div>

                    <div className={styles.field}>
                      <label className={styles.label} htmlFor="cat-status">
                        STATUS *
                      </label>
                      <select
                        id="cat-status"
                        className={styles.select}
                        value={catStatus}
                        onChange={(e) => setCatStatus(e.target.value as "active" | "inactive")}
                        disabled={busy}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className={styles.field}>
                  <label className={styles.label} htmlFor="cat-desc">
                    DESCRIPTION (5–200 Chars)
                  </label>
                  <textarea
                    id="cat-desc"
                    className={styles.textarea}
                    placeholder="Brief overview of engineering disciplines in this category…"
                    value={catDesc}
                    onChange={(e) => setCatDesc(e.target.value)}
                    disabled={busy}
                  />
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.65rem" }}>
                  {editingCategory && (
                    <button
                      type="button"
                      className={styles.secondaryBtn}
                      onClick={handleOpenCreateCategory}
                    >
                      Cancel Edit
                    </button>
                  )}
                  <button type="submit" className={styles.primaryBtn} disabled={busy}>
                    {busy ? "SAVING…" : editingCategory ? "UPDATE CATEGORY" : "ADD CATEGORY"}
                  </button>
                </div>
              </form>

              {/* Category List */}
              <div className={styles.categoryListCard}>
                <h4 style={{ margin: 0, fontSize: "0.95rem", color: "#ffffff", fontWeight: 700 }}>
                  Existing Service Categories ({categoryList.length})
                </h4>

                <table className={shared.table}>
                  <thead>
                    <tr>
                      <th>Name &amp; Slug</th>
                      <th>Description</th>
                      <th>Order</th>
                      <th>Services</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categoryList.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: "center", padding: "1.5rem", color: "rgba(255,255,255,0.4)" }}>
                          No categories found. Create one above.
                        </td>
                      </tr>
                    ) : (
                      categoryList.map((c) => (
                        <tr key={c.id}>
                          <td>
                            <strong>{c.name}</strong>
                            <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)", fontFamily: "monospace" }}>
                              /{c.slug}
                            </div>
                          </td>
                          <td style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.65)", maxWidth: "220px" }}>
                            {c.description || "—"}
                          </td>
                          <td>#{c.order_index ?? 1}</td>
                          <td>
                            <span className={styles.chipCount}>
                              {typeof c.total_service_count === "number" ? c.total_service_count : 0} services
                            </span>
                          </td>
                          <td>
                            <span className={[styles.pill, c.status === "active" ? styles.on : styles.off].join(" ")}>
                              <span className={styles.statusDot} />
                              <span>{c.status}</span>
                            </span>
                          </td>
                          <td>
                            <div className={styles.rowActions}>
                              <button
                                type="button"
                                className={[shared.btn, shared.ghost, styles.actionBtn].join(" ")}
                                onClick={() => handleOpenEditCategory(c)}
                                title="Edit"
                              >
                                <Edit2 size={12} />
                              </button>
                              <button
                                type="button"
                                className={[shared.btn, shared.ghost, shared.danger, styles.actionBtn].join(" ")}
                                onClick={() => setDeleteCatTarget(c)}
                                title="Delete Category"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          5-STEP SERVICE CREATION & EDITING WIZARD MODAL
          ========================================================================= */}
      {isServiceModalOpen && (
        <div className={styles.modalBackdrop} role="dialog" aria-modal="true">
          <div className={styles.wizardModalCard}>
            {/* Modal Header */}
            <div className={styles.modalHeader}>
              <h3 className={styles.modalHeaderTitle}>
                <Sparkles size={20} className={styles.cardIcon} />
                <span>{editingService ? `Edit Service: "${editingService.title}"` : "Create New Engineering Service"}</span>
              </h3>
              <button
                type="button"
                className={styles.modalCloseBtn}
                onClick={() => setIsServiceModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            {/* Step Navigation Tabs */}
            <div className={styles.stepNav}>
              {MODAL_STEPS.map((step) => (
                <button
                  key={step.id}
                  type="button"
                  className={[
                    styles.stepTab,
                    activeStep === step.id ? styles.stepTabActive : "",
                  ].join(" ")}
                  onClick={() => setActiveStep(step.id)}
                >
                  <span className={styles.stepNum}>{step.num}</span>
                  <span>{step.label}</span>
                </button>
              ))}
            </div>

            {/* Wizard Body */}
            <div className={styles.wizardBody}>
              {/* STEP 1: OVERVIEW & CORE INFO */}
              {activeStep === "overview" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <div>
                    <h4 className={styles.stepGroupTitle}>Core Information</h4>
                    <p className={styles.stepGroupSub}>
                      Set primary titles, category mappings, and display ordering.
                    </p>
                  </div>

                  <div className={styles.formGrid2}>
                    <div className={styles.field}>
                      <label className={styles.label} htmlFor="s-title">
                        SERVICE TITLE * (5–50 Chars)
                      </label>
                      <input
                        id="s-title"
                        type="text"
                        className={styles.input}
                        required
                        placeholder="e.g. AI-Powered Workflow Automation"
                        value={formTitle}
                        onChange={(e) => {
                          setFormTitle(e.target.value);
                          if (!editingService) {
                            setFormSlug(slugifyService(e.target.value));
                          }
                        }}
                      />
                    </div>

                    <div className={styles.field}>
                      <label className={styles.label} htmlFor="s-category">
                        SERVICE CATEGORY *
                      </label>
                      <select
                        id="s-category"
                        className={styles.select}
                        value={formCategory}
                        onChange={(e) => setFormCategory(e.target.value)}
                      >
                        {categoryList.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                        {formCategory && !categoryList.some((c) => c.id === formCategory) && (
                          <option value={formCategory}>
                            {editingService?.category || formCategory} (Current)
                          </option>
                        )}
                      </select>
                    </div>
                  </div>

                  <div className={styles.formGrid2}>
                    <div className={styles.field}>
                      <label className={styles.label} htmlFor="s-slug">
                        URL SLUG * (Auto-Generated)
                      </label>
                      <input
                        id="s-slug"
                        type="text"
                        className={styles.input}
                        required
                        placeholder="e.g. ai-powered-workflow-automation"
                        value={formSlug}
                        onChange={(e) => setFormSlug(e.target.value)}
                      />
                    </div>

                    <div className={styles.formGrid2}>
                      <div className={styles.field}>
                        <label className={styles.label} htmlFor="s-order">
                          ORDER INDEX *
                        </label>
                        <input
                          id="s-order"
                          type="number"
                          min={1}
                          className={styles.input}
                          required
                          value={formOrderIndex}
                          onChange={(e) => setFormOrderIndex(Number(e.target.value))}
                        />
                      </div>

                      <div className={styles.field}>
                        <label className={styles.label} htmlFor="s-active">
                          STATUS
                        </label>
                        <select
                          id="s-active"
                          className={styles.select}
                          value={formIsActive ? "active" : "inactive"}
                          onChange={(e) => setFormIsActive(e.target.value === "active")}
                        >
                          <option value="active">Active (Published)</option>
                          <option value="inactive">Inactive (Draft)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="s-tagline">
                      TAGLINE (Max 100 Chars)
                    </label>
                    <input
                      id="s-tagline"
                      type="text"
                      className={styles.input}
                      placeholder="e.g. Autonomous AI agents engineered for enterprise throughput."
                      value={formTagline}
                      onChange={(e) => setFormTagline(e.target.value)}
                    />
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="s-summary">
                      SUMMARY * (10–200 Chars)
                    </label>
                    <textarea
                      id="s-summary"
                      className={styles.textarea}
                      required
                      placeholder="Brief overview explaining what this engineering service provides and business value…"
                      value={formSummary}
                      onChange={(e) => setFormSummary(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* STEP 2: MEDIA & GALLERY */}
              {activeStep === "media" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                  <div>
                    <h4 className={styles.stepGroupTitle}>Service Media &amp; Cloudinary Gallery</h4>
                    <p className={styles.stepGroupSub}>
                      Upload high-resolution hero banners and product imagery.
                    </p>
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label}>HERO IMAGE BANNER *</label>
                    <label className={styles.fileDropArea}>
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setHeroImageFile(file);
                            setFormHeroImage(URL.createObjectURL(file));
                          }
                        }}
                      />
                      <ImageIcon size={32} color="#ffb300" />
                      <div style={{ fontSize: "0.85rem", color: "#ffffff", fontWeight: 600 }}>
                        {heroImageFile ? heroImageFile.name : "Click to select a new Hero Image from your computer"}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)" }}>
                        Supports JPG, PNG, WEBP up to 10MB (Cloudinary processed)
                      </div>
                    </label>

                    <div style={{ marginTop: "0.85rem" }}>
                      <label className={styles.label} style={{ fontSize: "0.75rem" }}>
                        OR PASTE DIRECT IMAGE URL:
                      </label>
                      <input
                        type="url"
                        className={styles.input}
                        placeholder="https://images.unsplash.com/..."
                        value={formHeroImage.startsWith("blob:") ? "" : formHeroImage}
                        onChange={(e) => {
                          setHeroImageFile(null);
                          setFormHeroImage(e.target.value);
                        }}
                      />
                    </div>

                    {formHeroImage && (
                      <div style={{ marginTop: "0.85rem" }}>
                        <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.6)", display: "block", marginBottom: "4px" }}>
                          Current Image Preview:
                        </span>
                        <div className={styles.previewImgWrap}>
                          <img src={formHeroImage} alt="Hero Preview" className={styles.previewImg} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 3: DELIVERABLES & TECH STACK */}
              {activeStep === "features" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                  <div>
                    <h4 className={styles.stepGroupTitle}>4-Point Architecture Deep-Dive</h4>
                    <p className={styles.stepGroupSub}>
                      Detail the architectural scope, target audience, problem solved, and key deliverables.
                    </p>
                  </div>

                  <div className={styles.formGrid2}>
                    <div className={styles.field}>
                      <label className={styles.label} htmlFor="s-what">WHAT IS IT? * (Max 500 Chars)</label>
                      <textarea
                        id="s-what"
                        className={styles.textarea}
                        placeholder="Detailed technical explanation of what this service builds…"
                        value={formWhatIsIt}
                        onChange={(e) => setFormWhatIsIt(e.target.value)}
                      />
                    </div>

                    <div className={styles.field}>
                      <label className={styles.label} htmlFor="s-who">WHO IS IT FOR? (Max 500 Chars)</label>
                      <textarea
                        id="s-who"
                        className={styles.textarea}
                        placeholder="Target companies (e.g. Series-A startups, healthcare providers, fintechs)…"
                        value={formWhoIsFor}
                        onChange={(e) => setFormWhoIsFor(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className={styles.formGrid2}>
                    <div className={styles.field}>
                      <label className={styles.label} htmlFor="s-problem">PROBLEM SOLVED (Max 500 Chars)</label>
                      <textarea
                        id="s-problem"
                        className={styles.textarea}
                        placeholder="Specific pain point or bottleneck this architecture eliminates…"
                        value={formProblemSolved}
                        onChange={(e) => setFormProblemSolved(e.target.value)}
                      />
                    </div>

                    <div className={styles.field}>
                      <label className={styles.label} htmlFor="s-why">WHY IT MATTERS (Max 500 Chars)</label>
                      <textarea
                        id="s-why"
                        className={styles.textarea}
                        placeholder="Commercial impact, revenue increase, or cost reduction metrics…"
                        value={formWhyItMatters}
                        onChange={(e) => setFormWhyItMatters(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Features List */}
                  <div className={styles.field}>
                    <label className={styles.label}>KEY DELIVERABLES &amp; CAPABILITIES</label>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <input
                        type="text"
                        className={styles.input}
                        placeholder="e.g. Real-Time WebSockets & Push Engine"
                        value={featureInput}
                        onChange={(e) => setFeatureInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            if (featureInput.trim()) {
                              setFormFeatures([...formFeatures, featureInput.trim()]);
                              setFeatureInput("");
                            }
                          }
                        }}
                      />
                      <button
                        type="button"
                        className={styles.secondaryBtn}
                        onClick={() => {
                          if (featureInput.trim()) {
                            setFormFeatures([...formFeatures, featureInput.trim()]);
                            setFeatureInput("");
                          }
                        }}
                      >
                        Add
                      </button>
                    </div>

                    <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
                      {formFeatures.map((f, idx) => (
                        <span key={idx} className={styles.categoryChip}>
                          <CheckCircle2 size={12} color="#34d399" />
                          <span>{f}</span>
                          <X
                            size={12}
                            style={{ cursor: "pointer", marginLeft: "4px" }}
                            onClick={() => setFormFeatures(formFeatures.filter((_, i) => i !== idx))}
                          />
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Tech Stack Chips */}
                  <div className={styles.field}>
                    <label className={styles.label}>TECH STACK &amp; FRAMEWORKS</label>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <input
                        type="text"
                        className={styles.input}
                        placeholder="e.g. Next.js, Redis, MongoDB, GraphQL"
                        value={techInput}
                        onChange={(e) => setTechInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            if (techInput.trim()) {
                              setFormTechStack([...formTechStack, techInput.trim()]);
                              setTechInput("");
                            }
                          }
                        }}
                      />
                      <button
                        type="button"
                        className={styles.secondaryBtn}
                        onClick={() => {
                          if (techInput.trim()) {
                            setFormTechStack([...formTechStack, techInput.trim()]);
                            setTechInput("");
                          }
                        }}
                      >
                        Add
                      </button>
                    </div>

                    <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
                      {formTechStack.map((t, idx) => (
                        <span key={idx} className={styles.categoryChip}>
                          <Tag size={12} color="#ffb300" />
                          <span>{t}</span>
                          <X
                            size={12}
                            style={{ cursor: "pointer", marginLeft: "4px" }}
                            onClick={() => setFormTechStack(formTechStack.filter((_, i) => i !== idx))}
                          />
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: 6-STEP WORKFLOW */}
              {activeStep === "process" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                  <div>
                    <h4 className={styles.stepGroupTitle}>6-Step Engineering Workflow</h4>
                    <p className={styles.stepGroupSub}>
                      Define the step-by-step execution timeline presented on the public service page.
                    </p>
                  </div>

                  {formProcessSteps.map((step, idx) => (
                    <div key={idx} className={styles.itemCardRow}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <span className={styles.orderBadge}>Step {step.step}</span>
                        <input
                          type="text"
                          className={styles.input}
                          placeholder="Step Title"
                          value={step.title}
                          onChange={(e) => {
                            const next = [...formProcessSteps];
                            next[idx].title = e.target.value;
                            setFormProcessSteps(next);
                          }}
                        />
                      </div>
                      <textarea
                        className={styles.textarea}
                        placeholder="Detailed execution description for this stage…"
                        value={step.description}
                        onChange={(e) => {
                          const next = [...formProcessSteps];
                          next[idx].description = e.target.value;
                          setFormProcessSteps(next);
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* STEP 5: BENEFITS & FAQS */}
              {activeStep === "benefits" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                  {/* ROI Benefits */}
                  <div>
                    <h4 className={styles.stepGroupTitle}>ROI Value Metrics &amp; Benefits</h4>
                    <p className={styles.stepGroupSub}>Highlight measurable business outcomes.</p>

                    <div className={styles.itemCardRow} style={{ marginBottom: "1rem" }}>
                      <div className={styles.formGrid2}>
                        <input
                          type="text"
                          className={styles.input}
                          placeholder="Benefit Title (e.g. Sub-Second TTFB)"
                          value={benefitTitle}
                          onChange={(e) => setBenefitTitle(e.target.value)}
                        />
                        <input
                          type="text"
                          className={styles.input}
                          placeholder="Highlight Metric (e.g. < 400ms TTFB)"
                          value={benefitMetric}
                          onChange={(e) => setBenefitMetric(e.target.value)}
                        />
                      </div>
                      <textarea
                        className={styles.textarea}
                        placeholder="Detailed value explanation…"
                        value={benefitDesc}
                        onChange={(e) => setBenefitDesc(e.target.value)}
                      />
                      <div style={{ display: "flex", justifyContent: "flex-end" }}>
                        <button
                          type="button"
                          className={styles.secondaryBtn}
                          onClick={() => {
                            if (benefitTitle.trim()) {
                              setFormBenefits([
                                ...formBenefits,
                                { title: benefitTitle.trim(), description: benefitDesc.trim(), metric: benefitMetric.trim() || undefined },
                              ]);
                              setBenefitTitle("");
                              setBenefitDesc("");
                              setBenefitMetric("");
                            }
                          }}
                        >
                          Add Benefit
                        </button>
                      </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      {formBenefits.map((b, idx) => (
                        <div key={idx} className={styles.categoryChip} style={{ justifyContent: "space-between", borderRadius: "8px", padding: "0.6rem 0.85rem" }}>
                          <div>
                            <strong>{b.title}</strong> {b.metric && <span style={{ color: "#ffb300", marginLeft: "8px" }}>({b.metric})</span>}
                            <p style={{ margin: "2px 0 0", fontSize: "0.76rem", color: "rgba(255,255,255,0.6)" }}>{b.description}</p>
                          </div>
                          <Trash2
                            size={14}
                            color="#f87171"
                            style={{ cursor: "pointer", flexShrink: 0 }}
                            onClick={() => setFormBenefits(formBenefits.filter((_, i) => i !== idx))}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* FAQs */}
                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "1.25rem" }}>
                    <h4 className={styles.stepGroupTitle}>Frequently Asked Questions</h4>

                    <div className={styles.itemCardRow} style={{ marginBottom: "1rem" }}>
                      <input
                        type="text"
                        className={styles.input}
                        placeholder="Question (e.g. Can we integrate our existing microservices?)"
                        value={faqQuestion}
                        onChange={(e) => setFaqQuestion(e.target.value)}
                      />
                      <textarea
                        className={styles.textarea}
                        placeholder="Answer…"
                        value={faqAnswer}
                        onChange={(e) => setFaqAnswer(e.target.value)}
                      />
                      <div style={{ display: "flex", justifyContent: "flex-end" }}>
                        <button
                          type="button"
                          className={styles.secondaryBtn}
                          onClick={() => {
                            if (faqQuestion.trim() && faqAnswer.trim()) {
                              setFormFaqs([...formFaqs, { question: faqQuestion.trim(), answer: faqAnswer.trim() }]);
                              setFaqQuestion("");
                              setFaqAnswer("");
                            }
                          }}
                        >
                          Add FAQ
                        </button>
                      </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      {formFaqs.map((faq, idx) => (
                        <div key={idx} className={styles.categoryChip} style={{ justifyContent: "space-between", borderRadius: "8px", padding: "0.6rem 0.85rem" }}>
                          <div>
                            <strong>{faq.question}</strong>
                            <p style={{ margin: "2px 0 0", fontSize: "0.76rem", color: "rgba(255,255,255,0.6)" }}>{faq.answer}</p>
                          </div>
                          <Trash2
                            size={14}
                            color="#f87171"
                            style={{ cursor: "pointer", flexShrink: 0 }}
                            onClick={() => setFormFaqs(formFaqs.filter((_, i) => i !== idx))}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Wizard Footer */}
            <div className={styles.wizardFooter}>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                {activeStep !== "overview" && (
                  <button
                    type="button"
                    className={styles.secondaryBtn}
                    onClick={() => {
                      const idx = MODAL_STEPS.findIndex((s) => s.id === activeStep);
                      if (idx > 0) setActiveStep(MODAL_STEPS[idx - 1].id);
                    }}
                  >
                    <ChevronLeft size={16} />
                    <span>Previous</span>
                  </button>
                )}
                {activeStep !== "benefits" && (
                  <button
                    type="button"
                    className={styles.secondaryBtn}
                    onClick={() => {
                      const idx = MODAL_STEPS.findIndex((s) => s.id === activeStep);
                      if (idx < MODAL_STEPS.length - 1) setActiveStep(MODAL_STEPS[idx + 1].id);
                    }}
                  >
                    <span>Next</span>
                    <ChevronRight size={16} />
                  </button>
                )}
              </div>

              <button
                type="button"
                className={styles.primaryBtn}
                disabled={busy}
                onClick={handleSaveService}
              >
                {busy ? "SAVING SERVICE…" : editingService ? "UPDATE SERVICE" : "CREATE SERVICE"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          DELETE SERVICE CONFIRMATION MODAL
          ========================================================================= */}
      {deleteServiceTarget && (
        <div className={styles.modalBackdrop} role="dialog" aria-modal="true">
          <div className={styles.categoryModalCard} style={{ maxWidth: "480px" }}>
            <div className={styles.modalHeader}>
              <h4 style={{ margin: 0, color: "#f87171", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Trash2 size={18} />
                <span>Delete Engineering Service?</span>
              </h4>
              <button
                type="button"
                className={styles.modalCloseBtn}
                onClick={() => setDeleteServiceTarget(null)}
              >
                <X size={16} />
              </button>
            </div>
            <div className={styles.modalScrollBody} style={{ gap: "1rem" }}>
              <p style={{ margin: 0, fontSize: "0.86rem", color: "rgba(255,255,255,0.75)", lineHeight: 1.45 }}>
                Are you sure you want to delete <strong>&quot;{deleteServiceTarget.title}&quot;</strong>? This will remove its public page and all associated assets from Cloudinary.
              </p>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.65rem", marginTop: "0.5rem" }}>
                <button
                  type="button"
                  className={styles.secondaryBtn}
                  onClick={() => setDeleteServiceTarget(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className={styles.primaryBtn}
                  style={{ background: "#dc2626" }}
                  disabled={busy}
                  onClick={executeDeleteService}
                >
                  {busy ? "Deleting…" : "Confirm Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          DELETE CATEGORY CONFIRMATION MODAL (CASCADE WARNING)
          ========================================================================= */}
      {deleteCatTarget && (
        <div className={styles.modalBackdrop} role="dialog" aria-modal="true">
          <div className={styles.categoryModalCard} style={{ maxWidth: "520px" }}>
            <div className={styles.modalHeader}>
              <h4 style={{ margin: 0, color: "#f87171", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <AlertTriangle size={20} />
                <span>Cascade Delete Category?</span>
              </h4>
              <button
                type="button"
                className={styles.modalCloseBtn}
                onClick={() => setDeleteCatTarget(null)}
              >
                <X size={16} />
              </button>
            </div>
            <div className={styles.modalScrollBody} style={{ gap: "1rem" }}>
              <div className={styles.dangerAlertBox}>
                <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: "2px" }} />
                <span>
                  <strong>CRITICAL WARNING:</strong> Deleting category <strong>&quot;{deleteCatTarget.name}&quot;</strong> will permanently delete all services assigned to this category via an ACID MongoDB transaction on the backend.
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.65rem", marginTop: "0.5rem" }}>
                <button
                  type="button"
                  className={styles.secondaryBtn}
                  onClick={() => setDeleteCatTarget(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className={styles.primaryBtn}
                  style={{ background: "#dc2626" }}
                  disabled={busy}
                  onClick={executeDeleteCategory}
                >
                  {busy ? "Deleting…" : "Confirm Cascade Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
