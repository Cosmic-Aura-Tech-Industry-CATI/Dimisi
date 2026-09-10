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
  AlertTriangle,
  RefreshCw,
  Clipboard,
  SlidersHorizontal,
  FolderPlus,
  Save,
  Check,
  Search,
  Tag,
} from "lucide-react";
import {
  type ProjectItem,
  type ProjectInput,
  type ProjectType,
  type ProjectGalleryImage,
  type ProjectMetric,
  type WorkCategoryItem,
  type WorkCategoryInput,
  slugifyProject,
  slugifyWorkCategory,
  validateProjectInput,
  validateWorkCategoryInput,
} from "@/lib/work.shared";
import { INITIAL_WORK_CATEGORIES } from "@/lib/work.data";
import {
  saveProjectFn,
  deleteProjectFn,
  getWorkCategoriesFn,
  saveWorkCategoryFn,
  deleteWorkCategoryFn,
} from "@/lib/work.functions";
import styles from "./AdminWork.module.css";

interface AdminWorkProps {
  projects: ProjectItem[];
  categoryItems?: WorkCategoryItem[];
  categoryCounts?: Record<string, number>;
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

export function AdminWork({
  projects,
  categoryItems: initialCategoryItems,
  categoryCounts: initialCategoryCounts,
  onRefresh,
}: AdminWorkProps) {
  const [isPending, startTransition] = useTransition();
  const saveProject = saveProjectFn;
  const deleteProject = deleteProjectFn;

  const [activeTabFilter, setActiveTabFilter] = useState<"all" | ProjectType>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Dynamic Categories State
  const [categoryList, setCategoryList] = useState<WorkCategoryItem[]>(() => {
    if (initialCategoryItems && initialCategoryItems.length > 0) {
      return initialCategoryItems;
    }
    return INITIAL_WORK_CATEGORIES;
  });

  // Load latest categories from store
  const refreshCategories = useCallback(async () => {
    try {
      const res = await getWorkCategoriesFn();
      if (res && res.categories && res.categories.length > 0) {
        setCategoryList(res.categories);
      }
    } catch (err) {
      console.warn("Failed to load work categories", err);
    }
  }, []);

  useEffect(() => {
    refreshCategories();
  }, [refreshCategories, projects]);

  useEffect(() => {
    if (initialCategoryItems && initialCategoryItems.length > 0) {
      setCategoryList(initialCategoryItems);
    }
  }, [initialCategoryItems]);

  // Compute category project counts dynamically
  const categoryProjectCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    projects.forEach((p) => {
      const cat = p.category?.trim();
      if (cat) {
        counts[cat] = (counts[cat] || 0) + 1;
        counts[cat.toLowerCase()] = (counts[cat.toLowerCase()] || 0) + 1;
        const parts = cat.split(/·|\/|,|-/).map((s) => s.trim().toLowerCase()).filter(Boolean);
        parts.forEach((part) => {
          if (!counts[part]) {
            counts[part] = (counts[part] || 0) + 1;
          }
        });
      }
    });
    return counts;
  }, [projects]);

  // Active category items for filter pills & project selector
  const activeCategories = useMemo(() => {
    return categoryList
      .filter((c) => c.status === "active")
      .sort((a, b) => a.order_index - b.order_index);
  }, [categoryList]);

  // Category Taxonomy Modal State
  const [showCatModal, setShowCatModal] = useState(false);
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [catName, setCatName] = useState("");
  const [catSlug, setCatSlug] = useState("");
  const [catDescription, setCatDescription] = useState("");
  const [catStatus, setCatStatus] = useState<"active" | "inactive">("active");
  const [catOrderIndex, setCatOrderIndex] = useState(1);
  const [catFormError, setCatFormError] = useState<string | null>(null);
  const [catSuccessMsg, setCatSuccessMsg] = useState<string | null>(null);
  const [catDeleteConfirm, setCatDeleteConfirm] = useState<{
    id: string;
    name: string;
    count: number;
  } | null>(null);

  // Edit / Create Project Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectItem | null>(null);
  const [modalTab, setModalTab] = useState<WorkModalTab>("overview");

  // Project Form State
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [type, setType] = useState<ProjectType>("work");
  const [category, setCategory] = useState("Web Application");
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
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    if (showModal && modalTab && tabRefs.current[modalTab]) {
      tabRefs.current[modalTab]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "nearest",
      });
    }
  }, [modalTab, showModal]);

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
    if (!showModal && !showCatModal) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showCatModal) {
          setShowCatModal(false);
        } else {
          setShowModal(false);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [showModal, showCatModal]);

  const workCount = useMemo(() => projects.filter((p) => p.type === "work").length, [projects]);
  const productCount = useMemo(() => projects.filter((p) => p.type === "product").length, [projects]);

  // Filtered Projects
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      // Type Tab Filter
      if (activeTabFilter !== "all" && p.type !== activeTabFilter) {
        return false;
      }
      // Category Filter
      if (categoryFilter !== "All") {
        const catLower = categoryFilter.toLowerCase();
        const projCatLower = p.category.toLowerCase();
        if (projCatLower !== catLower && !projCatLower.includes(catLower)) {
          return false;
        }
      }
      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = p.title.toLowerCase().includes(q);
        const matchSlug = p.slug.toLowerCase().includes(q);
        const matchTagline = (p.tagline || "").toLowerCase().includes(q);
        const matchOverview = p.overview.toLowerCase().includes(q);
        const matchClient = (p.client_name || "").toLowerCase().includes(q);
        const matchCategory = p.category.toLowerCase().includes(q);
        const matchTech = (p.tech_stack || []).some((t) => t.toLowerCase().includes(q));
        if (
          !matchTitle &&
          !matchSlug &&
          !matchTagline &&
          !matchOverview &&
          !matchClient &&
          !matchCategory &&
          !matchTech
        ) {
          return false;
        }
      }
      return true;
    });
  }, [projects, activeTabFilter, categoryFilter, searchQuery]);

  // CATEGORY TAXONOMY HANDLERS
  const handleOpenCatModal = (catToEdit?: WorkCategoryItem) => {
    setCatFormError(null);
    setCatSuccessMsg(null);
    setCatDeleteConfirm(null);
    if (catToEdit) {
      setEditingCatId(catToEdit.id);
      setCatName(catToEdit.name);
      setCatSlug(catToEdit.slug);
      setCatDescription(catToEdit.description || "");
      setCatStatus(catToEdit.status);
      setCatOrderIndex(catToEdit.order_index);
    } else {
      setEditingCatId(null);
      setCatName("");
      setCatSlug("");
      setCatDescription("");
      setCatStatus("active");
      setCatOrderIndex(categoryList.length + 1);
    }
    setShowCatModal(true);
  };

  const handleResetCatForm = () => {
    setEditingCatId(null);
    setCatName("");
    setCatSlug("");
    setCatDescription("");
    setCatStatus("active");
    setCatOrderIndex(categoryList.length + 1);
    setCatFormError(null);
    setCatSuccessMsg(null);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    setCatFormError(null);
    setCatSuccessMsg(null);

    const input: WorkCategoryInput = {
      id: editingCatId || undefined,
      name: catName.trim(),
      slug: catSlug.trim() || slugifyWorkCategory(catName),
      description: catDescription.trim() || undefined,
      status: catStatus,
      order_index: Number(catOrderIndex) || categoryList.length + 1,
    };

    const validation = validateWorkCategoryInput(input);
    if (!validation.valid) {
      setCatFormError(validation.error || "Please enter a valid category name.");
      return;
    }

    startTransition(async () => {
      try {
        const res = await saveWorkCategoryFn({ data: input });
        if (res.success && res.category) {
          setCatSuccessMsg(
            editingCatId
              ? `Category "${res.category.name}" updated successfully.`
              : `Category "${res.category.name}" added successfully.`
          );
          await refreshCategories();
          onRefresh();
          handleResetCatForm();
        } else {
          setCatFormError(res.error || "Failed to save category.");
        }
      } catch (err) {
        setCatFormError(err instanceof Error ? err.message : "Error saving category.");
      }
    });
  };

  const handleToggleCategoryStatus = (cat: WorkCategoryItem) => {
    const nextStatus = cat.status === "active" ? "inactive" : "active";
    startTransition(async () => {
      try {
        const res = await saveWorkCategoryFn({
          data: {
            id: cat.id,
            name: cat.name,
            slug: cat.slug,
            description: cat.description,
            order_index: cat.order_index,
            status: nextStatus,
          },
        });
        if (res.success) {
          await refreshCategories();
          onRefresh();
        }
      } catch (err) {
        console.warn("Failed to toggle category status", err);
      }
    });
  };

  const handleDeleteCategoryClick = (cat: WorkCategoryItem) => {
    const count = categoryProjectCounts[cat.name.toLowerCase()] || 0;
    setCatDeleteConfirm({
      id: cat.id,
      name: cat.name,
      count,
    });
  };

  const handleConfirmDeleteCategory = () => {
    if (!catDeleteConfirm) return;
    const targetId = catDeleteConfirm.id;

    startTransition(async () => {
      try {
        const res = await deleteWorkCategoryFn({ data: { id: targetId } });
        if (res.success) {
          setCatDeleteConfirm(null);
          setCatSuccessMsg("Category removed successfully.");
          await refreshCategories();
          onRefresh();
        } else {
          setCatFormError(res.error || "Failed to delete category.");
        }
      } catch (err) {
        setCatFormError(err instanceof Error ? err.message : "Error deleting category.");
      }
    });
  };

  // PROJECT MODAL HANDLERS
  const handleOpenCreate = (defaultType: ProjectType = "work") => {
    setEditingProject(null);
    setTitle("");
    setSlug("");
    setType(defaultType);
    const defaultCat =
      activeCategories[0]?.name ||
      (defaultType === "work" ? "Web Application" : "SaaS Platform");
    setCategory(defaultCat);
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
  const handlePaste = useCallback(
    (e: ClipboardEvent<HTMLDivElement>) => {
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
    },
    [processImageFile]
  );

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
        errors.category = "Project category is required.";
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
        if (
          validation.field === "title" ||
          validation.field === "category" ||
          validation.field === "type"
        ) {
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
            className={styles.manageCatBtn}
            onClick={() => handleOpenCatModal()}
            title="Manage Dynamic Work & Product Categories"
          >
            <SlidersHorizontal size={15} />
            <span>Manage Categories ({categoryList.length})</span>
          </button>

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

      {/* Dynamic Filters & Search Control Bar */}
      <div className={styles.filtersBar}>
        {/* Dynamic Category Filter Pills */}
        <div className={styles.catPillsScroll}>
          <button
            type="button"
            className={[
              styles.catPill,
              categoryFilter === "All" ? styles.catPillActive : "",
            ].join(" ")}
            onClick={() => setCategoryFilter("All")}
          >
            All Categories ({categoryList.length})
          </button>
          {activeCategories.map((c) => {
            const count = categoryProjectCounts[c.name.toLowerCase()] || 0;
            const isActive = categoryFilter.toLowerCase() === c.name.toLowerCase();
            return (
              <button
                key={c.id}
                type="button"
                className={[
                  styles.catPill,
                  isActive ? styles.catPillActive : "",
                ].join(" ")}
                onClick={() => setCategoryFilter(c.name)}
              >
                <span>{c.name}</span>
                <span className={styles.catPillCount}>({count})</span>
              </button>
            );
          })}
        </div>

        {/* Search Control */}
        <div className={styles.secondaryFiltersRow}>
          <div className={styles.searchBox}>
            <Search size={14} className={styles.searchIcon} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search case studies by title, client, or tech..."
              className={styles.searchInput}
            />
            {searchQuery && (
              <button
                type="button"
                className={styles.searchClearBtn}
                onClick={() => setSearchQuery("")}
                title="Clear search"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {(categoryFilter !== "All" || searchQuery) && (
            <button
              type="button"
              className={styles.resetFiltersBtn}
              onClick={() => {
                setCategoryFilter("All");
                setSearchQuery("");
              }}
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Projects Table */}
      <div className={styles.tableCard} data-lenis-prevent>
        <table className={styles.table}>
          <colgroup>
            <col className={styles.colOrder} />
            <col className={styles.colCover} />
            <col className={styles.colTitle} />
            <col className={styles.colType} />
            <col className={styles.colCategory} />
            <col className={styles.colSlug} />
            <col className={styles.colStatus} />
            <col className={styles.colActions} />
          </colgroup>
          <thead>
            <tr>
              <th className={styles.thCenter}>Order</th>
              <th className={styles.thCenter}>Cover</th>
              <th>Project Title</th>
              <th>Type</th>
              <th>Category</th>
              <th>URL Slug / Live Link</th>
              <th className={styles.thCenter}>Status</th>
              <th className={styles.thRight}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProjects.length === 0 ? (
              <tr>
                <td colSpan={8} className={styles.emptyCell}>
                  <div className={styles.emptyState}>
                    <FolderGit2 size={36} className={styles.emptyIcon} />
                    <span className={styles.emptyTitle}>No projects or case studies found</span>
                    <span className={styles.emptySub}>
                      {categoryFilter !== "All" || searchQuery || activeTabFilter !== "all"
                        ? "Try adjusting your filter criteria or search query."
                        : "Get started by adding your first showcase case study or product."}
                    </span>
                    {(categoryFilter !== "All" || searchQuery || activeTabFilter !== "all") ? (
                      <button
                        type="button"
                        className={styles.resetFiltersBtn}
                        onClick={() => {
                          setActiveTabFilter("all");
                          setCategoryFilter("All");
                          setSearchQuery("");
                        }}
                      >
                        Reset All Filters
                      </button>
                    ) : (
                      <button
                        type="button"
                        className={styles.emptyAddBtn}
                        onClick={() => handleOpenCreate(activeTabFilter === "product" ? "product" : "work")}
                      >
                        <Plus size={14} />
                        <span>Add New Case Study</span>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              filteredProjects.map((p) => (
                <tr key={p.id} className={!p.is_active ? styles.inactiveRow : ""}>
                  <td className={styles.orderCell}>{p.order_index}</td>
                  <td className={styles.coverCell}>
                    {p.cover_image ? (
                      <img
                        src={p.cover_image}
                        alt={p.title}
                        className={styles.thumbImg}
                        loading="lazy"
                        onError={(e) => {
                          (e.currentTarget as HTMLElement).style.display = "none";
                          const fallback = e.currentTarget.nextElementSibling as HTMLElement | null;
                          if (fallback) fallback.style.display = "flex";
                        }}
                      />
                    ) : null}
                    <div
                      className={styles.coverFallback}
                      style={{ display: p.cover_image ? "none" : "flex" }}
                    >
                      <ImageIcon size={18} />
                    </div>
                  </td>
                  <td>
                    <div className={styles.titleCol}>
                      <span className={styles.projTitle} title={p.title}>
                        {p.title}
                      </span>
                      {p.tagline ? (
                        <span className={styles.projTagline} title={p.tagline}>
                          {p.tagline}
                        </span>
                      ) : p.overview ? (
                        <span className={styles.projTagline} title={p.overview}>
                          {p.overview}
                        </span>
                      ) : null}
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
                    <span className={styles.categoryBadge} title={p.category}>
                      <Tag size={11} className={styles.badgeTagIcon} />
                      <span>{p.category}</span>
                    </span>
                  </td>
                  <td>
                    <div className={styles.slugCol}>
                      <code className={styles.slugCode} title={`/work/${p.slug}`}>
                        /work/{p.slug}
                      </code>
                      {p.website_url ? (
                        <a
                          href={p.website_url}
                          target="_blank"
                          rel="noreferrer"
                          className={styles.extLinkA}
                          title={`Open live site: ${p.website_url}`}
                        >
                          <Globe size={11} />
                          <span>Live Site</span>
                        </a>
                      ) : (
                        <span className={styles.noLiveLink}>—</span>
                      )}
                    </div>
                  </td>
                  <td className={styles.statusCellCol}>
                    <div className={styles.statusCell}>
                      <button
                        type="button"
                        className={[
                          styles.toggleIconBtn,
                          p.is_active ? styles.activeIcon : styles.inactiveIcon,
                        ].join(" ")}
                        onClick={() => handleToggleActive(p)}
                        title={p.is_active ? "Active: Click to deactivate" : "Inactive: Click to activate"}
                        aria-label={p.is_active ? `Deactivate ${p.title}` : `Activate ${p.title}`}
                      >
                        {p.is_active ? <Eye size={15} /> : <EyeOff size={15} />}
                      </button>

                      <button
                        type="button"
                        className={[
                          styles.toggleIconBtn,
                          p.is_featured ? styles.starActive : styles.starInactive,
                        ].join(" ")}
                        onClick={() => handleToggleFeatured(p)}
                        title={p.is_featured ? "Featured spotlight: Click to unfeature" : "Click to feature spotlight"}
                        aria-label={p.is_featured ? `Unfeature ${p.title}` : `Feature ${p.title}`}
                      >
                        <Star size={15} />
                      </button>
                    </div>
                  </td>
                  <td className={styles.actionsCellCol}>
                    <div className={styles.rowActions}>
                      <button
                        type="button"
                        className={styles.editBtn}
                        onClick={() => handleOpenEdit(p)}
                        title="Edit Case Study"
                        aria-label={`Edit ${p.title}`}
                      >
                        <Edit2 size={14} />
                      </button>
                      <a
                        href={`/work/${p.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className={styles.viewBtn}
                        title="View Live Page"
                        aria-label={`View live page for ${p.title}`}
                      >
                        <ExternalLink size={14} />
                      </a>
                      <button
                        type="button"
                        className={styles.delBtn}
                        onClick={() => handleDelete(p.id, p.title)}
                        title="Delete Project"
                        aria-label={`Delete ${p.title}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* CATEGORY TAXONOMY MANAGEMENT MODAL */}
      {showCatModal && (
        <div
          className={styles.modalBackdrop}
          role="dialog"
          aria-modal="true"
          data-lenis-prevent
          onClick={() => setShowCatModal(false)}
        >
          <div
            className={[styles.modalContent, styles.catModalContent].join(" ")}
            data-lenis-prevent
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className={styles.modalHeader}>
              <div className={styles.catModalHeaderTitle}>
                <div className={styles.catModalIconBox}>
                  <SlidersHorizontal size={20} className={styles.catModalIcon} />
                </div>
                <div>
                  <h3 className={styles.modalTitle}>Work &amp; Product Categories Taxonomy</h3>
                  <p className={styles.modalSub}>
                    Manage dynamic project categories, slugs, filter taxonomies, and active display states.
                  </p>
                </div>
              </div>
              <button
                type="button"
                className={styles.modalClose}
                onClick={() => setShowCatModal(false)}
                title="Close Modal (Esc)"
              >
                <X size={18} />
              </button>
            </div>

            {/* Notification Messages */}
            {catFormError && (
              <div className={styles.errorAlert} style={{ margin: "1rem 1.75rem 0" }}>
                <AlertCircle size={16} />
                <span>{catFormError}</span>
              </div>
            )}

            {catSuccessMsg && (
              <div className={styles.successAlert} style={{ margin: "1rem 1.75rem 0" }}>
                <CheckCircle2 size={16} />
                <span>{catSuccessMsg}</span>
              </div>
            )}

            {/* Category Safety Warning Prompt */}
            {catDeleteConfirm && (
              <div className={styles.deleteWarningAlert}>
                <AlertTriangle size={20} className={styles.deleteWarningIcon} />
                <div className={styles.deleteWarningText}>
                  <h5>Delete Category: "{catDeleteConfirm.name}"?</h5>
                  <p>
                    {catDeleteConfirm.count > 0
                      ? `Warning: There are currently ${catDeleteConfirm.count} case study project(s) tagged with this category. Deleting this category will remove it from active filters and taxonomies.`
                      : "Are you sure you want to permanently delete this category?"}
                  </p>
                  <div className={styles.deleteWarningActions}>
                    <button
                      type="button"
                      className={styles.confirmDeleteBtn}
                      onClick={handleConfirmDeleteCategory}
                      disabled={isPending}
                    >
                      {isPending ? "Deleting..." : "Yes, Delete Category"}
                    </button>
                    <button
                      type="button"
                      className={styles.cancelDeleteBtn}
                      onClick={() => setCatDeleteConfirm(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Modal Two-Column Layout */}
            <div className={styles.catModalBody} data-lenis-prevent>
              {/* Left Column: Category Form */}
              <div className={styles.catFormCard}>
                <div className={styles.catFormHeader}>
                  <h4 className={styles.catFormTitle}>
                    {editingCatId ? (
                      <>
                        <Edit2 size={15} /> Edit Category
                      </>
                    ) : (
                      <>
                        <FolderPlus size={15} /> Create New Category
                      </>
                    )}
                  </h4>
                  {editingCatId && (
                    <button
                      type="button"
                      className={styles.resetFormBtn}
                      onClick={handleResetCatForm}
                    >
                      + Create New Instead
                    </button>
                  )}
                </div>

                <form onSubmit={handleSaveCategory} className={styles.catInnerForm}>
                  <div className={styles.formGroup}>
                    <label>Category Display Name *</label>
                    <input
                      type="text"
                      required
                      value={catName}
                      onChange={(e) => {
                        setCatName(e.target.value);
                        if (!editingCatId) {
                          setCatSlug(slugifyWorkCategory(e.target.value));
                        }
                      }}
                      placeholder="e.g. AI & Autonomy"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>URL / Filter Slug *</label>
                    <input
                      type="text"
                      required
                      value={catSlug}
                      onChange={(e) => setCatSlug(e.target.value)}
                      placeholder="e.g. ai-autonomy"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Short Description (Optional)</label>
                    <textarea
                      rows={2}
                      value={catDescription}
                      onChange={(e) => setCatDescription(e.target.value)}
                      placeholder="e.g. Autonomous AI agents, perception systems, and neural architectures..."
                    />
                  </div>

                  <div className={styles.formGrid2}>
                    <div className={styles.formGroup}>
                      <label>Display Order Index</label>
                      <input
                        type="number"
                        min={1}
                        value={catOrderIndex}
                        onChange={(e) => setCatOrderIndex(Number(e.target.value))}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label>Taxonomy Status</label>
                      <select
                        value={catStatus}
                        onChange={(e) =>
                          setCatStatus(e.target.value as "active" | "inactive")
                        }
                        className={styles.selectInput}
                      >
                        <option value="active">Active (Visible in Filter &amp; Selector)</option>
                        <option value="inactive">Inactive (Hidden)</option>
                      </select>
                    </div>
                  </div>

                  <div className={styles.catFormSubmitRow}>
                    {editingCatId && (
                      <button
                        type="button"
                        className={styles.cancelBtn}
                        onClick={handleResetCatForm}
                      >
                        Cancel Edit
                      </button>
                    )}
                    <button
                      type="submit"
                      disabled={isPending}
                      className={styles.saveSubmitBtn}
                    >
                      <Save size={14} />
                      <span>{editingCatId ? "Update Category" : "Add Category"}</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Right Column: Configured Categories List Table */}
              <div className={styles.catListCard}>
                <div className={styles.catListHeader}>
                  <h4 className={styles.catListTitle}>
                    <span>Configured Categories</span>
                    <span className={styles.catCountBadge}>{categoryList.length}</span>
                  </h4>
                  <span className={styles.catListSub}>
                    Active categories appear in the project filter pills and case study creation dropdown.
                  </span>
                </div>

                <div className={styles.catListScrollContainer}>
                  <table className={styles.catTable}>
                    <thead>
                      <tr>
                        <th style={{ width: "50px" }}>Order</th>
                        <th>Category &amp; Slug</th>
                        <th style={{ width: "90px" }}>Projects</th>
                        <th style={{ width: "95px" }}>Status</th>
                        <th style={{ width: "110px", textAlign: "right" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categoryList
                        .sort((a, b) => a.order_index - b.order_index)
                        .map((cat) => {
                          const count = categoryProjectCounts[cat.name.toLowerCase()] || 0;
                          const isBeingEdited = editingCatId === cat.id;
                          return (
                            <tr
                              key={cat.id}
                              className={[
                                isBeingEdited ? styles.catRowEditing : "",
                                cat.status === "inactive" ? styles.catRowInactive : "",
                              ].join(" ")}
                            >
                              <td className={styles.orderCell}>{cat.order_index}</td>
                              <td>
                                <div className={styles.catItemMeta}>
                                  <span className={styles.catItemName}>{cat.name}</span>
                                  <code className={styles.catItemSlug}>#{cat.slug}</code>
                                  {cat.description && (
                                    <span className={styles.catItemDesc}>
                                      {cat.description}
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td>
                                <span className={styles.catPostCountBadge}>
                                  {count} project{count !== 1 ? "s" : ""}
                                </span>
                              </td>
                              <td>
                                <button
                                  type="button"
                                  className={[
                                    styles.catStatusPill,
                                    cat.status === "active"
                                      ? styles.catStatusPillActive
                                      : styles.catStatusPillInactive,
                                  ].join(" ")}
                                  onClick={() => handleToggleCategoryStatus(cat)}
                                  title={
                                    cat.status === "active"
                                      ? "Active — Click to Deactivate"
                                      : "Inactive — Click to Activate"
                                  }
                                >
                                  {cat.status === "active" ? (
                                    <Check size={11} />
                                  ) : (
                                    <EyeOff size={11} />
                                  )}
                                  <span>{cat.status === "active" ? "Active" : "Inactive"}</span>
                                </button>
                              </td>
                              <td>
                                <div className={styles.catRowActions}>
                                  <button
                                    type="button"
                                    className={styles.editBtn}
                                    onClick={() => handleOpenCatModal(cat)}
                                    title="Edit Category Details"
                                  >
                                    <Edit2 size={13} />
                                  </button>
                                  <button
                                    type="button"
                                    className={styles.delBtn}
                                    onClick={() => handleDeleteCategoryClick(cat)}
                                    title="Delete Category"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FULL APPLICATION-STYLE CASE STUDY MODAL */}
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
            <div className={styles.modalTabsBar} role="tablist" aria-label="Case Study Creation Steps" data-lenis-prevent>
              {MODAL_STEPS.map((t) => (
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
                              const defaultCat =
                                activeCategories[0]?.name ||
                                (newType === "work" ? "Web Application" : "SaaS Platform");
                              setCategory(defaultCat);
                            }
                          }}
                          className={styles.selectInput}
                        >
                          <option value="work">Our Work (Bespoke Client Solution)</option>
                          <option value="product">Our Product (In-House Proprietary Platform)</option>
                        </select>
                      </div>

                      <div className={styles.formGroup}>
                        <div className={styles.labelWithAction}>
                          <label>Category Taxonomy *</label>
                          <button
                            type="button"
                            className={styles.manageCatInlineLink}
                            onClick={() => handleOpenCatModal()}
                          >
                            + Manage Categories
                          </button>
                        </div>
                        <select
                          value={category}
                          required
                          className={[styles.selectInput, fieldErrors.category ? styles.inputError : ""].join(" ")}
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
                        >
                          {activeCategories.map((c) => (
                            <option key={c.id} value={c.name}>
                              {c.name}
                            </option>
                          ))}
                          {category && !activeCategories.some((c) => c.name === category) && (
                            <option value={category}>{category} (Custom / Legacy)</option>
                          )}
                        </select>
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
                    {/* Primary Showcase Cover */}
                    <div className={styles.mediaSection}>
                      <h4 className={styles.mediaSectionTitle}>
                        <ImageIcon size={16} /> Primary Cover Showcase Image *
                      </h4>
                      <p className={styles.mediaSectionSub}>
                        High-resolution hero visual displayed on cards and case study banner (Max 10MB; JPG, PNG, WEBP).
                      </p>

                      <div
                        className={[
                          styles.dropzone,
                          isDragOver ? styles.dropzoneActive : "",
                          coverPreviewUrl ? styles.dropzoneHasImage : "",
                        ].join(" ")}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <input
                          type="file"
                          ref={fileInputRef}
                          style={{ display: "none" }}
                          accept="image/jpeg,image/png,image/jpg,image/webp"
                          onChange={handleFileInputChange}
                        />

                        {coverPreviewUrl ? (
                          <div className={styles.previewContainer}>
                            <img
                              src={coverPreviewUrl}
                              alt="Cover Preview"
                              className={styles.dropzonePreviewImg}
                            />
                            <div className={styles.previewMetaRow}>
                              <span className={styles.fileInfoBadge}>
                                <FileCheck size={14} className={styles.checkIcon} />
                                <span>{coverFile ? coverFile.name : "Cover Image Ready"}</span>
                              </span>
                              <div className={styles.previewActions} onClick={(e) => e.stopPropagation()}>
                                <button
                                  type="button"
                                  className={styles.replaceImgBtn}
                                  onClick={() => fileInputRef.current?.click()}
                                >
                                  Replace
                                </button>
                                <button
                                  type="button"
                                  className={styles.removeImgBtn}
                                  onClick={handleRemoveCoverImage}
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className={styles.dropzonePlaceholder}>
                            <div className={styles.uploadIconCircle}>
                              <UploadCloud size={24} />
                            </div>
                            <p className={styles.dropzoneMainText}>
                              Drag &amp; drop case study image here, or{" "}
                              <span className={styles.browseLink}>browse</span>
                            </p>
                            <p className={styles.dropzoneSub}>
                              Supports clipboard paste (Ctrl + V), JPG, PNG, WEBP up to 10MB
                            </p>
                          </div>
                        )}
                      </div>

                      {isUploadingImage && (
                        <div className={styles.uploadProgressBar}>
                          <div
                            className={styles.uploadProgressFill}
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      )}

                      {imageError && (
                        <div className={styles.imageErrorText}>
                          <AlertCircle size={14} />
                          <span>{imageError}</span>
                        </div>
                      )}

                      {/* Manual Image URL Input fallback */}
                      <div className={styles.manualUrlRow}>
                        <label>Or enter direct Image URL:</label>
                        <input
                          type="url"
                          value={coverImage}
                          onChange={(e) => {
                            setCoverImage(e.target.value);
                            setCoverPreviewUrl(e.target.value);
                          }}
                          placeholder="https://images.unsplash.com/..."
                        />
                      </div>
                    </div>

                    {/* Secondary Gallery Images */}
                    <div className={styles.mediaSection} style={{ marginTop: "1.5rem" }}>
                      <div className={styles.galleryHeaderRow}>
                        <div>
                          <h4 className={styles.mediaSectionTitle}>
                            <Layers size={16} /> Screenshot &amp; UI Visual Gallery
                          </h4>
                          <p className={styles.mediaSectionSub}>
                            Add additional product screenshots or interface views for the gallery slider.
                          </p>
                        </div>
                        <button
                          type="button"
                          className={styles.addGalleryBtn}
                          onClick={() => galleryFileInputRef.current?.click()}
                        >
                          <Plus size={14} />
                          <span>Add Gallery Photos</span>
                        </button>
                        <input
                          type="file"
                          ref={galleryFileInputRef}
                          style={{ display: "none" }}
                          multiple
                          accept="image/jpeg,image/png,image/jpg,image/webp"
                          onChange={handleGalleryFileAdd}
                        />
                      </div>

                      {galleryImages.length > 0 && (
                        <div className={styles.galleryThumbGrid}>
                          {galleryImages.map((img, idx) => (
                            <div key={idx} className={styles.galleryThumbCard}>
                              <img src={img.url} alt={img.caption || `Gallery image ${idx + 1}`} />
                              <div className={styles.galleryThumbOverlay}>
                                <span className={styles.galleryThumbBadge}>#{idx + 1}</span>
                                <button
                                  type="button"
                                  className={styles.removeGalThumbBtn}
                                  onClick={() =>
                                    setGalleryImages((prev) => prev.filter((_, i) => i !== idx))
                                  }
                                  title="Remove image"
                                >
                                  <X size={12} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* STEP 4: TECH STACK & METRICS */}
                {modalTab === "tech_metrics" && (
                  <div className={styles.tabPane}>
                    {/* Tech Stack Chips */}
                    <div className={styles.techStackBox}>
                      <h4 className={styles.techStackTitle}>
                        <Code2 size={16} /> Technologies &amp; Architecture Stack
                      </h4>
                      <p className={styles.techStackSub}>
                        Tag technologies used in this client solution (e.g. Next.js, FastAPI, PostgreSQL, WebSockets).
                      </p>

                      <div className={styles.chipsContainer}>
                        {techStack.map((tech, idx) => (
                          <span key={idx} className={styles.techChip}>
                            <span>{tech}</span>
                            <button
                              type="button"
                              onClick={() => setTechStack((prev) => prev.filter((_, i) => i !== idx))}
                            >
                              <X size={12} />
                            </button>
                          </span>
                        ))}
                      </div>

                      <div className={styles.addTechRow}>
                        <input
                          type="text"
                          value={newTech}
                          onChange={(e) => setNewTech(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              if (newTech.trim() && !techStack.includes(newTech.trim())) {
                                setTechStack([...techStack, newTech.trim()]);
                                setNewTech("");
                              }
                            }
                          }}
                          placeholder="Type tech name and press Enter..."
                        />
                        <button
                          type="button"
                          className={styles.addChipBtn}
                          onClick={() => {
                            if (newTech.trim() && !techStack.includes(newTech.trim())) {
                              setTechStack([...techStack, newTech.trim()]);
                              setNewTech("");
                            }
                          }}
                        >
                          <Plus size={14} /> Add Tech
                        </button>
                      </div>
                    </div>

                    {/* Key Metrics & ROI KPIs */}
                    <div className={styles.metricsBox} style={{ marginTop: "1.5rem" }}>
                      <h4 className={styles.metricsTitle}>
                        <TrendingUp size={16} /> Measurable Impact &amp; Performance KPIs
                      </h4>
                      <p className={styles.metricsSub}>
                        Highlight quantified outcomes (e.g. +140% Conversion, &lt; 350ms Latency, 99.99% Uptime).
                      </p>

                      <div className={styles.metricsList}>
                        {metrics.map((m, idx) => (
                          <div key={idx} className={styles.metricItemRow}>
                            <div className={styles.metricValueBadge}>{m.value}</div>
                            <div className={styles.metricLabelText}>{m.label}</div>
                            <button
                              type="button"
                              className={styles.delMetricBtn}
                              onClick={() => setMetrics((prev) => prev.filter((_, i) => i !== idx))}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        ))}
                      </div>

                      <div className={styles.addMetricRow}>
                        <input
                          type="text"
                          value={newMetricValue}
                          onChange={(e) => setNewMetricValue(e.target.value)}
                          placeholder="Value (e.g. +120%)"
                          className={styles.metricValInput}
                        />
                        <input
                          type="text"
                          value={newMetricLabel}
                          onChange={(e) => setNewMetricLabel(e.target.value)}
                          placeholder="Label (e.g. Booking Velocity Increase)"
                          className={styles.metricLabelInput}
                        />
                        <button
                          type="button"
                          className={styles.addMetricBtn}
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
                          <Plus size={14} /> Add Metric
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 5: REVIEW & PUBLISH */}
                {modalTab === "review" && (
                  <div className={styles.tabPane}>
                    <div className={styles.reviewSummaryCard}>
                      <h4 className={styles.reviewSummaryTitle}>
                        <CheckCircle2 size={18} /> Review &amp; Publishing Configuration
                      </h4>

                      <div className={styles.summaryGrid}>
                        <div className={styles.summaryItem}>
                          <span className={styles.summaryLabel}>Title:</span>
                          <span className={styles.summaryValue}>{title || "—"}</span>
                        </div>
                        <div className={styles.summaryItem}>
                          <span className={styles.summaryLabel}>Category:</span>
                          <span className={styles.summaryValue}>{category || "—"}</span>
                        </div>
                        <div className={styles.summaryItem}>
                          <span className={styles.summaryLabel}>Type:</span>
                          <span className={styles.summaryValue}>
                            {type === "work" ? "Our Work (Client)" : "Product (In-House)"}
                          </span>
                        </div>
                        <div className={styles.summaryItem}>
                          <span className={styles.summaryLabel}>URL Slug:</span>
                          <code className={styles.summaryValue}>/work/{slug || "—"}</code>
                        </div>
                        <div className={styles.summaryItem}>
                          <span className={styles.summaryLabel}>Client Name:</span>
                          <span className={styles.summaryValue}>{clientName || "—"}</span>
                        </div>
                        <div className={styles.summaryItem}>
                          <span className={styles.summaryLabel}>Timeline:</span>
                          <span className={styles.summaryValue}>{timeline || "—"}</span>
                        </div>
                      </div>

                      <div className={styles.toggleRow}>
                        <label className={styles.checkboxLabel}>
                          <input
                            type="checkbox"
                            checked={isActive}
                            onChange={(e) => setIsActive(e.target.checked)}
                          />
                          <span>Publish Immediately (Active on public portal)</span>
                        </label>

                        <label className={styles.checkboxLabel}>
                          <input
                            type="checkbox"
                            checked={isFeatured}
                            onChange={(e) => setIsFeatured(e.target.checked)}
                          />
                          <span>Spotlight / Featured Showcase</span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Sticky Modal Footer with Step Controls */}
              <div className={styles.modalFooter}>
                <div className={styles.footerLeft}>
                  {modalTab !== "overview" ? (
                    <button
                      type="button"
                      className={styles.prevBtn}
                      onClick={handlePrevStep}
                    >
                      <ChevronLeft size={16} />
                      <span>Previous Step</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      className={styles.cancelBtn}
                      onClick={() => setShowModal(false)}
                    >
                      Cancel
                    </button>
                  )}
                </div>

                <div className={styles.footerRight}>
                  {modalTab !== "review" ? (
                    <button
                      type="button"
                      className={styles.nextBtn}
                      onClick={handleNextStep}
                    >
                      <span>Continue</span>
                      <ChevronRight size={16} />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isPending}
                      className={styles.saveSubmitBtn}
                    >
                      <CheckCircle2 size={16} />
                      <span>
                        {isPending
                          ? "Saving..."
                          : editingProject
                          ? "Update Case Study"
                          : "Publish Case Study"}
                      </span>
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