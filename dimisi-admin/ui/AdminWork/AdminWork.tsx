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
  ChevronDown,
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
  toggleProjectActivationFn,
  toggleProjectFeaturedFn,
  getWorkCategoriesFn,
  saveWorkCategoryFn,
  deleteWorkCategoryFn,
  getAdminWorkData,
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
  const [isCatDropdownOpen, setIsCatDropdownOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const catDropdownRef = useRef<HTMLDivElement>(null);

  // Dynamic Projects State
  const [projectList, setProjectList] = useState<ProjectItem[]>(projects || []);
  const [isProjectsLoading, setIsProjectsLoading] = useState<boolean>(false);
  const [projectsLoadError, setProjectsLoadError] = useState<string | null>(null);

  // Dynamic Categories State
  const [categoryList, setCategoryList] = useState<WorkCategoryItem[]>(() => {
    if (initialCategoryItems && initialCategoryItems.length > 0) {
      return initialCategoryItems;
    }
    return INITIAL_WORK_CATEGORIES;
  });
  const [isCatLoading, setIsCatLoading] = useState<boolean>(false);
  const [catLoadError, setCatLoadError] = useState<string | null>(null);
  const [updatingCatId, setUpdatingCatId] = useState<string | null>(null);
  const [deletingCatId, setDeletingCatId] = useState<string | null>(null);

  // Load latest projects and categories from backend API / store
  const refreshProjects = useCallback(async () => {
    setIsProjectsLoading(true);
    setProjectsLoadError(null);
    try {
      const data = await getAdminWorkData();
      if (data && Array.isArray(data.projects)) {
        setProjectList(data.projects);
      }
      if (data && Array.isArray(data.categoryItems) && data.categoryItems.length > 0) {
        setCategoryList(data.categoryItems);
      }
    } catch (err) {
      console.warn("Failed to load projects from backend API:", err);
      setProjectsLoadError(
        err instanceof Error ? err.message : "Unable to load case studies. Please try again."
      );
    } finally {
      setIsProjectsLoading(false);
    }
  }, []);

  // Load latest categories from backend API / store
  const refreshCategories = useCallback(async () => {
    setIsCatLoading(true);
    setCatLoadError(null);
    try {
      const res = await getWorkCategoriesFn();
      if (res && res.categories && Array.isArray(res.categories)) {
        setCategoryList(res.categories);
      }
    } catch (err) {
      console.warn("Failed to load work categories from backend:", err);
      setCatLoadError(
        err instanceof Error ? err.message : "Unable to load categories. Please try again.",
      );
    } finally {
      setIsCatLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshProjects();
  }, [refreshProjects]);

  useEffect(() => {
    if (projects && Array.isArray(projects)) {
      setProjectList(projects);
    }
  }, [projects]);

  useEffect(() => {
    if (initialCategoryItems && initialCategoryItems.length > 0) {
      setCategoryList(initialCategoryItems);
    }
  }, [initialCategoryItems]);

  // Compute category project counts dynamically
  const categoryProjectCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    projectList.forEach((p) => {
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
  }, [projectList]);

  // Active category items for filter selector
  const activeCategories = useMemo(() => {
    return categoryList
      .filter((c) => c.status === "active")
      .sort((a, b) => a.order_index - b.order_index);
  }, [categoryList]);

  // Label for the category filter dropdown trigger
  const dropdownTriggerLabel = useMemo(() => {
    if (categoryFilter === "All") {
      return `All Categories (${categoryList.length})`;
    }
    const count = categoryProjectCounts[categoryFilter.toLowerCase()] || 0;
    return `${categoryFilter} (${count})`;
  }, [categoryFilter, categoryList.length, categoryProjectCounts]);

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
  const [coverAspectWarning, setCoverAspectWarning] = useState<string | null>(null);
  const [galleryAspectWarning, setGalleryAspectWarning] = useState<string | null>(null);
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
  const [galleryUrlInput, setGalleryUrlInput] = useState("");

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

  // Click outside and Escape key handler for Category Popover Dropdown
  useEffect(() => {
    const handlePointerDownOutside = (e: MouseEvent | TouchEvent) => {
      if (catDropdownRef.current && !catDropdownRef.current.contains(e.target as Node)) {
        setIsCatDropdownOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsCatDropdownOpen(false);
      }
    };
    if (isCatDropdownOpen) {
      document.addEventListener("mousedown", handlePointerDownOutside);
      document.addEventListener("touchstart", handlePointerDownOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handlePointerDownOutside);
      document.removeEventListener("touchstart", handlePointerDownOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isCatDropdownOpen]);

  const workCount = useMemo(() => projectList.filter((p) => p.type === "work").length, [projectList]);
  const productCount = useMemo(() => projectList.filter((p) => p.type === "product").length, [projectList]);

  // Filtered Projects
  const filteredProjects = useMemo(() => {
    return projectList.filter((p) => {
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
  }, [projectList, activeTabFilter, categoryFilter, searchQuery]);

  // CATEGORY TAXONOMY HANDLERS
  const handleOpenCatModal = (catToEdit?: WorkCategoryItem) => {
    setCatFormError(null);
    setCatSuccessMsg(null);
    setCatDeleteConfirm(null);
    refreshCategories();
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

    const finalSlug =
      (editingCatId
        ? categoryList.find((c) => c.id === editingCatId)?.slug
        : "") ||
      catSlug.trim() ||
      slugifyWorkCategory(catName);

    const input: WorkCategoryInput = {
      id: editingCatId || undefined,
      name: catName.trim(),
      slug: finalSlug,
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
    if (updatingCatId) return;
    const nextStatus = cat.status === "active" ? "inactive" : "active";
    setUpdatingCatId(cat.id);
    setCatFormError(null);
    setCatSuccessMsg(null);

    // Optimistic UI update
    setCategoryList((prev) =>
      prev.map((item) => (item.id === cat.id ? { ...item, status: nextStatus } : item)),
    );

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
        } else {
          // Revert optimistic update
          setCategoryList((prev) =>
            prev.map((item) => (item.id === cat.id ? { ...item, status: cat.status } : item)),
          );
          setCatFormError(res.error || "Failed to update category status.");
        }
      } catch (err) {
        setCategoryList((prev) =>
          prev.map((item) => (item.id === cat.id ? { ...item, status: cat.status } : item)),
        );
        console.warn("Failed to toggle category status", err);
        setCatFormError(err instanceof Error ? err.message : "Failed to toggle category status.");
      } finally {
        setUpdatingCatId(null);
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
    setDeletingCatId(targetId);
    setCatFormError(null);
    setCatSuccessMsg(null);

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
      } finally {
        setDeletingCatId(null);
      }
    });
  };

  // PROJECT MODAL HANDLERS
  const handleOpenCreate = (defaultType: ProjectType = "work") => {
    setEditingProject(null);
    setTitle("");
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
    setCoverAspectWarning(null);
    setGalleryAspectWarning(null);
    setUploadProgress(0);
    setIsUploadingImage(false);
    setGalleryImages([]);
    setGalleryUrlInput("");
    setWebsiteUrl("");
    setClientName(defaultType === "work" ? "" : "DIMISI Labs");
    setTimeline("4 Weeks Sprint");
    setTechStack(["React", "TypeScript", "Node.js", "PostgreSQL"]);
    setNewTech("");
    setMetrics([
      { label: "Performance Gain", value: "+120%" },
      { label: "Load Latency", value: "< 350ms" },
    ]);
    setNewMetricLabel("");
    setNewMetricValue("");
    setOrderIndex(projectList.length + 1);
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
    setCoverAspectWarning(null);
    setGalleryAspectWarning(null);
    setUploadProgress(0);
    setIsUploadingImage(false);
    setGalleryImages(p.gallery_images || []);
    setGalleryUrlInput("");
    setWebsiteUrl(p.website_url || "");
    setClientName(p.client_name || "");
    setTimeline(p.timeline || "");
    setTechStack(p.tech_stack || []);
    setNewTech("");
    setMetrics(p.metrics || []);
    setNewMetricLabel("");
    setNewMetricValue("");
    setOrderIndex(p.order_index);
    setIsFeatured(p.is_featured);
    setIsActive(p.is_active);
    setModalTab("overview");
    setFormError(null);
    setFieldErrors({});
    setShowModal(true);
  };

  // Helper to inspect image dimensions & aspect ratio without blocking
  const checkAspectRatio = useCallback((imgSrc: string, setWarning: (warn: string | null) => void) => {
    if (typeof window === "undefined") return;
    const img = new Image();
    img.onload = () => {
      if (img.naturalWidth && img.naturalHeight) {
        const ratio = img.naturalWidth / img.naturalHeight;
        // Standard 16:9 is ~1.777. Allow tolerance range [1.45, 2.1]
        if (ratio < 1.45 || ratio > 2.1) {
          setWarning("Recommended frame is 16:9 (1920 × 1080 px). Your image may be cropped or letterboxed depending on display.");
        } else {
          setWarning(null);
        }
      }
    };
    img.onerror = () => {
      // Silently ignore if remote URL cannot be preloaded
    };
    img.src = imgSrc;
  }, []);

  // Image Processing & Validation
  const processImageFile = useCallback((file: File) => {
    setImageError(null);
    setCoverAspectWarning(null);

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
      checkAspectRatio(dataUrl, setCoverAspectWarning);
      setUploadProgress(100);
      setTimeout(() => setIsUploadingImage(false), 250);
    };
    reader.onerror = () => {
      setImageError("Failed to read image file. Please try again.");
      setIsUploadingImage(false);
    };
    reader.readAsDataURL(file);
  }, [checkAspectRatio]);

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
    setImageError(null);
    if (e.target.files && e.target.files.length > 0) {
      Array.from(e.target.files).forEach((file) => {
        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
          setImageError("Unsupported format in gallery photos. Please upload JPG, JPEG, PNG, or WEBP.");
          return;
        }
        if (file.size > MAX_IMAGE_SIZE_BYTES) {
          setImageError("Gallery image exceeds maximum allowed size (10 MB).");
          return;
        }
        const reader = new FileReader();
        reader.onload = (evt) => {
          const dataUrl = evt.target?.result as string;
          checkAspectRatio(dataUrl, setGalleryAspectWarning);
          setGalleryImages((prev) => [
            ...prev,
            { url: dataUrl, caption: file.name.replace(/\.[^/.]+$/, "") },
          ]);
        };
        reader.readAsDataURL(file);
      });
      if (galleryFileInputRef.current) {
        galleryFileInputRef.current.value = "";
      }
    }
  };

  const handleAddGalleryUrl = () => {
    const url = galleryUrlInput.trim();
    if (!url) return;
    if (!url.startsWith("http://") && !url.startsWith("https://") && !url.startsWith("data:image/")) {
      setImageError("Please enter a valid image URL starting with https:// or http://");
      return;
    }
    checkAspectRatio(url, setGalleryAspectWarning);
    setGalleryImages((prev) => [
      ...prev,
      { url, caption: "Gallery Visual" },
    ]);
    setGalleryUrlInput("");
    setImageError(null);
  };

  // Tech Stack & Metrics Adders
  const handleAddTech = () => {
    const trimmed = newTech.trim();
    if (!trimmed) return;
    const exists = techStack.some((t) => t.toLowerCase() === trimmed.toLowerCase());
    if (!exists) {
      setTechStack((prev) => [...prev, trimmed]);
      setNewTech("");
    }
  };

  const handleAddMetric = () => {
    const val = newMetricValue.trim();
    const lbl = newMetricLabel.trim();
    if (!val || !lbl) return;
    setMetrics((prev) => [...prev, { label: lbl, value: val }]);
    setNewMetricValue("");
    setNewMetricLabel("");
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
    setCoverAspectWarning(null);
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

    const finalSlug =
      (editingProject ? editingProject.slug : "") ||
      slugifyProject(title);

    const input: ProjectInput = {
      id: editingProject?.id ?? undefined,
      title: title.trim(),
      slug: finalSlug,
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
          await refreshProjects();
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
        try {
          const res = await deleteProject({ data: { id } });
          if (res.success) {
            await refreshProjects();
            onRefresh();
          } else {
            alert(res.error || "Failed to delete case study.");
          }
        } catch (err) {
          alert(err instanceof Error ? err.message : "Error deleting case study.");
        }
      });
    }
  };

  const handleToggleActive = (p: ProjectItem) => {
    startTransition(async () => {
      try {
        const res = await toggleProjectActivationFn({ data: { id: p.id } });
        if (res.success) {
          await refreshProjects();
          onRefresh();
        } else {
          console.warn("Failed to toggle project status:", res.error);
        }
      } catch (err) {
        console.warn("Toggle activation error:", err);
      }
    });
  };

  const handleToggleFeatured = (p: ProjectItem) => {
    startTransition(async () => {
      try {
        const res = await toggleProjectFeaturedFn({ data: { id: p.id } });
        if (res.success) {
          await refreshProjects();
          onRefresh();
        } else {
          console.warn("Failed to toggle featured status:", res.error);
        }
      } catch (err) {
        console.warn("Toggle featured error:", err);
      }
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
              All ({projectList.length})
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

          <div className={styles.filterRightActions}>
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

            {/* Category Filter Dropdown (Right of Search) */}
            <div className={styles.catDropdownWrapper} ref={catDropdownRef}>
              <button
                type="button"
                className={[
                  styles.catDropdownTrigger,
                  categoryFilter !== "All" || isCatDropdownOpen
                    ? styles.catDropdownTriggerActive
                    : "",
                ].join(" ")}
                onClick={() => setIsCatDropdownOpen((prev) => !prev)}
                aria-expanded={isCatDropdownOpen}
                aria-haspopup="listbox"
                aria-label="Filter case studies by category"
              >
                <div className={styles.catDropdownTriggerLeft}>
                  {categoryFilter !== "All" ? (
                    <Tag size={13} className={styles.dropdownIcon} />
                  ) : (
                    <SlidersHorizontal size={13} className={styles.dropdownIcon} />
                  )}
                  <span className={styles.catDropdownTriggerText}>
                    {dropdownTriggerLabel}
                  </span>
                </div>
                <ChevronDown
                  size={14}
                  className={[
                    styles.catDropdownChevron,
                    isCatDropdownOpen ? styles.catDropdownChevronOpen : "",
                  ].join(" ")}
                />
              </button>

              {isCatDropdownOpen && (
                <div className={styles.catDropdownMenu} role="listbox" tabIndex={-1}>
                  {/* Option: All Categories */}
                  <button
                    type="button"
                    role="option"
                    aria-selected={categoryFilter === "All"}
                    className={[
                      styles.catDropdownItem,
                      categoryFilter === "All" ? styles.catDropdownItemActive : "",
                    ].join(" ")}
                    onClick={() => {
                      setCategoryFilter("All");
                      setIsCatDropdownOpen(false);
                    }}
                  >
                    <div className={styles.catDropdownItemLeft}>
                      {categoryFilter === "All" ? (
                        <Check size={14} className={styles.catDropdownCheck} />
                      ) : (
                        <span className={styles.catDropdownCheckPlaceholder} />
                      )}
                      <span>All Categories</span>
                    </div>
                    <span className={styles.catDropdownItemCount}>
                      ({categoryList.length})
                    </span>
                  </button>

                  <div className={styles.catDropdownDivider} />

                  {/* Dynamic Category List */}
                  {activeCategories.map((c) => {
                    const count =
                      categoryProjectCounts[c.name.toLowerCase()] || 0;
                    const isSelected =
                      categoryFilter.toLowerCase() === c.name.toLowerCase();
                    return (
                      <button
                        key={c.id}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        className={[
                          styles.catDropdownItem,
                          isSelected ? styles.catDropdownItemActive : "",
                        ].join(" ")}
                        onClick={() => {
                          setCategoryFilter(c.name);
                          setIsCatDropdownOpen(false);
                        }}
                      >
                        <div className={styles.catDropdownItemLeft}>
                          {isSelected ? (
                            <Check
                              size={14}
                              className={styles.catDropdownCheck}
                            />
                          ) : (
                            <span
                              className={styles.catDropdownCheckPlaceholder}
                            />
                          )}
                          <span title={c.name}>{c.name}</span>
                        </div>
                        <span className={styles.catDropdownItemCount}>
                          ({count})
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
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
              <th className={styles.thCenter}>Status</th>
              <th className={styles.thRight}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isProjectsLoading && projectList.length === 0 ? (
              <tr>
                <td colSpan={7} className={styles.emptyCell}>
                  <div className={styles.emptyState}>
                    <RefreshCw size={32} className={styles.emptyIcon} style={{ animation: "spin 1.2s linear infinite" }} />
                    <span className={styles.emptyTitle}>Connecting to live case studies database...</span>
                    <span className={styles.emptySub}>Fetching projects from backend API</span>
                  </div>
                </td>
              </tr>
            ) : projectsLoadError && projectList.length === 0 ? (
              <tr>
                <td colSpan={7} className={styles.emptyCell}>
                  <div className={styles.emptyState}>
                    <AlertTriangle size={36} className={styles.emptyIcon} style={{ color: "#ef4444" }} />
                    <span className={styles.emptyTitle}>Failed to load case studies</span>
                    <span className={styles.emptySub}>{projectsLoadError}</span>
                    <button
                      type="button"
                      className={styles.resetFiltersBtn}
                      onClick={() => refreshProjects()}
                    >
                      Retry Connection
                    </button>
                  </div>
                </td>
              </tr>
            ) : filteredProjects.length === 0 ? (
              <tr>
                <td colSpan={7} className={styles.emptyCell}>
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
                    Manage dynamic project categories, filter taxonomies, and active display states.
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
                      onChange={(e) => setCatName(e.target.value)}
                      placeholder="e.g. AI & Autonomy"
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
                      disabled={isPending || isCatLoading}
                      className={styles.saveSubmitBtn}
                    >
                      <Save size={14} />
                      <span>
                        {isPending
                          ? editingCatId
                            ? "Updating..."
                            : "Saving..."
                          : editingCatId
                            ? "Update Category"
                            : "Add Category"}
                      </span>
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
                    Active categories appear in the project filter selector and case study creation dropdown.
                  </span>
                </div>

                {catLoadError && (
                  <div className={styles.catErrorBanner}>
                    <span>{catLoadError}</span>
                    <button
                      type="button"
                      className={styles.catRetryBtn}
                      onClick={refreshCategories}
                    >
                      <RefreshCw size={12} />
                      <span>Retry</span>
                    </button>
                  </div>
                )}

                <div className={styles.catListScrollContainer}>
                  {isCatLoading && categoryList.length === 0 ? (
                    <div className={styles.catLoadingState}>
                      <RefreshCw size={22} className={styles.spinIcon} />
                      <span>Loading categories from database...</span>
                    </div>
                  ) : categoryList.length === 0 ? (
                    <div className={styles.catEmptyState}>
                      <Tag size={28} style={{ opacity: 0.4 }} />
                      <span className={styles.catEmptyText}>No categories configured yet.</span>
                    </div>
                  ) : (
                    <table className={styles.catTable}>
                      <thead>
                        <tr>
                          <th style={{ width: "50px" }}>Order</th>
                          <th>Category</th>
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
                            const isUpdating = updatingCatId === cat.id;
                            const isDeleting = deletingCatId === cat.id;
                            return (
                              <tr
                                key={cat.id}
                                className={[
                                  isBeingEdited ? styles.catRowEditing : "",
                                  cat.status === "inactive" ? styles.catRowInactive : "",
                                  isUpdating || isDeleting ? styles.catRowUpdating : "",
                                ].join(" ")}
                              >
                                <td className={styles.orderCell}>{cat.order_index}</td>
                                <td>
                                  <div className={styles.catItemMeta}>
                                    <span className={styles.catItemName}>{cat.name}</span>
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
                                    disabled={isUpdating}
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
                                    <span>
                                      {isUpdating
                                        ? "Updating..."
                                        : cat.status === "active"
                                          ? "Active"
                                          : "Inactive"}
                                    </span>
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
                                      disabled={isDeleting}
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
                  )}
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
                        }}
                        placeholder="e.g. Rudra Tours & Travels"
                      />
                      {fieldErrors.title && (
                        <span className={styles.fieldErrorText}>{fieldErrors.title}</span>
                      )}
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
                        High-resolution hero visual displayed on cards and case study banner.
                      </p>

                      {/* Primary Cover Specifications Card */}
                      <div className={styles.specCard}>
                        <div className={styles.specHeader}>
                          <span className={styles.specBadge}>PRIMARY COVER SPECIFICATIONS</span>
                          <span className={styles.specHighlight}>
                            <Sparkles size={14} style={{ color: "var(--dm-amber, #ffb300)" }} />
                            Recommended: 1920 × 1080 px (16:9)
                          </span>
                        </div>
                        <div className={styles.specGrid}>
                          <div className={styles.specItem}>
                            <span className={styles.specLabel}>Display Frame</span>
                            <span className={styles.specVal}>16:9 Landscape</span>
                          </div>
                          <div className={styles.specItem}>
                            <span className={styles.specLabel}>Resolution</span>
                            <span className={styles.specVal}>
                              1920 × 1080 px <span className={styles.specSubText}>(Min: 1280 × 720 px)</span>
                            </span>
                          </div>
                          <div className={styles.specItem}>
                            <span className={styles.specLabel}>Supported Formats</span>
                            <span className={styles.specVal}>JPG, JPEG, PNG, WEBP</span>
                          </div>
                          <div className={styles.specItem}>
                            <span className={styles.specLabel}>Max File Size</span>
                            <span className={styles.specVal}>10 MB</span>
                          </div>
                        </div>
                      </div>

                      {/* Aspect ratio non-blocking warning if detected */}
                      {coverAspectWarning && (
                        <div className={styles.aspectRatioWarning}>
                          <AlertTriangle size={15} style={{ flexShrink: 0 }} />
                          <span>{coverAspectWarning}</span>
                        </div>
                      )}

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
                            if (e.target.value) {
                              checkAspectRatio(e.target.value, setCoverAspectWarning);
                            } else {
                              setCoverAspectWarning(null);
                            }
                          }}
                          placeholder="https://images.unsplash.com/..."
                        />
                      </div>
                    </div>

                    {/* Secondary Gallery Images */}
                    <div className={styles.mediaSection} style={{ marginTop: "1.25rem" }}>
                      <div className={styles.galleryHeaderRow}>
                        <div>
                          <h4 className={styles.mediaSectionTitle}>
                            <Layers size={16} /> Screenshot &amp; UI Visual Gallery
                          </h4>
                          <p className={styles.mediaSectionSub}>
                            Add additional product screenshots or interface views for the gallery slider.
                          </p>
                        </div>
                      </div>

                      {/* Gallery Recommended Specification Box */}
                      <div className={styles.gallerySpecBox}>
                        <div className={styles.gallerySpecTitleRow}>
                          <span className={styles.specBadge}>GALLERY SPECIFICATIONS</span>
                          <span className={styles.gallerySpecNote}>
                            Use landscape 16:9 screenshots for consistent gallery presentation.
                          </span>
                        </div>
                        <div className={styles.gallerySpecChips}>
                          <span className={styles.gallerySpecChip}><strong>Frame:</strong> 16:9</span>
                          <span className={styles.gallerySpecChip}><strong>Recommended:</strong> 1600 × 900 px</span>
                          <span className={styles.gallerySpecChip}><strong>High-Res:</strong> 1920 × 1080 px</span>
                          <span className={styles.gallerySpecChip}><strong>Formats:</strong> JPG, JPEG, PNG, WEBP</span>
                          <span className={styles.gallerySpecChip}><strong>Max:</strong> 10 MB / image</span>
                        </div>
                      </div>

                      {galleryAspectWarning && (
                        <div className={styles.aspectRatioWarning}>
                          <AlertTriangle size={15} style={{ flexShrink: 0 }} />
                          <span>{galleryAspectWarning}</span>
                        </div>
                      )}

                      {/* Gallery Dual Upload & URL Actions Row */}
                      <div className={styles.galleryActionsRow}>
                        <div className={styles.galleryUrlInputBox}>
                          <input
                            type="url"
                            value={galleryUrlInput}
                            onChange={(e) => setGalleryUrlInput(e.target.value)}
                            placeholder="Enter direct image URL (https://...)"
                            className={styles.galleryUrlInput}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleAddGalleryUrl();
                              }
                            }}
                          />
                          <button
                            type="button"
                            className={styles.addGalUrlBtn}
                            onClick={handleAddGalleryUrl}
                            title="Add Image URL to Gallery"
                          >
                            <Plus size={14} />
                            <span>Add URL</span>
                          </button>
                        </div>

                        <button
                          type="button"
                          className={styles.addGalleryBtn}
                          onClick={() => galleryFileInputRef.current?.click()}
                          title="Upload images from your device"
                        >
                          <UploadCloud size={15} />
                          <span>Upload from Device</span>
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
                    {/* A. Technologies & Architecture Stack */}
                    <div className={styles.techStackBox}>
                      <h4 className={styles.techStackTitle}>
                        <Code2 size={16} /> Technologies &amp; Architecture Stack
                      </h4>
                      <p className={styles.techStackSub}>
                        Add technologies, frameworks, platforms, databases and tools used in this project.
                      </p>

                      <div className={styles.chipsContainer}>
                        {techStack.length === 0 ? (
                          <span style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.4)" }}>
                            No technologies added yet. Type below to add tools.
                          </span>
                        ) : (
                          techStack.map((tech, idx) => (
                            <span key={idx} className={styles.techChip}>
                              <span>{tech}</span>
                              <button
                                type="button"
                                onClick={() => setTechStack((prev) => prev.filter((_, i) => i !== idx))}
                                title={`Remove ${tech}`}
                                aria-label={`Remove ${tech}`}
                              >
                                <X size={12} />
                              </button>
                            </span>
                          ))
                        )}
                      </div>

                      <div className={styles.addTechRow}>
                        <input
                          type="text"
                          value={newTech}
                          onChange={(e) => setNewTech(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddTech();
                            }
                          }}
                          placeholder="Enter technology name (e.g. Next.js, Redis, Docker)..."
                        />
                        <button
                          type="button"
                          className={styles.addChipBtn}
                          onClick={handleAddTech}
                          disabled={!newTech.trim()}
                        >
                          <Plus size={14} /> Add Tech
                        </button>
                      </div>
                    </div>

                    {/* B. Measurable Impact & Performance KPIs */}
                    <div className={styles.metricsBox} style={{ marginTop: "1.25rem" }}>
                      <h4 className={styles.metricsTitle}>
                        <TrendingUp size={16} /> Measurable Impact &amp; Performance KPIs
                      </h4>
                      <p className={styles.metricsSub}>
                        Highlight quantified outcomes such as performance improvement, conversion growth, latency reduction, uptime, etc.
                      </p>

                      {metrics.length > 0 && (
                        <div className={styles.metricsList}>
                          {metrics.map((m, idx) => (
                            <div key={idx} className={styles.metricCard}>
                              <div className={styles.metricCardLeft}>
                                <span className={styles.metricValBadge}>{m.value}</span>
                                <span className={styles.metricLabelBadge}>{m.label}</span>
                              </div>
                              <button
                                type="button"
                                className={styles.delMetricBtn}
                                onClick={() => setMetrics((prev) => prev.filter((_, i) => i !== idx))}
                                title="Delete KPI metric"
                                aria-label={`Delete metric ${m.label}`}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add Metric Form Card */}
                      <div className={styles.addMetricCard}>
                        <div className={styles.addMetricInputs}>
                          <div className={styles.metricInputGroup}>
                            <label className={styles.metricSubLabel}>Value</label>
                            <input
                              type="text"
                              value={newMetricValue}
                              onChange={(e) => setNewMetricValue(e.target.value)}
                              placeholder="e.g. +120%, < 350ms"
                              className={styles.metricValInput}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  handleAddMetric();
                                }
                              }}
                            />
                          </div>
                          <div className={styles.metricInputGroupFlex}>
                            <label className={styles.metricSubLabel}>Label / Metric Description</label>
                            <input
                              type="text"
                              value={newMetricLabel}
                              onChange={(e) => setNewMetricLabel(e.target.value)}
                              placeholder="e.g. Booking Velocity Increase"
                              className={styles.metricLabelInput}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  handleAddMetric();
                                }
                              }}
                            />
                          </div>
                        </div>
                        <button
                          type="button"
                          className={styles.addMetricBtn}
                          onClick={handleAddMetric}
                          disabled={!newMetricValue.trim() || !newMetricLabel.trim()}
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
                          <span className={styles.summaryLabel}>Project Title:</span>
                          <span className={styles.summaryValue}>{title || "—"}</span>
                        </div>
                        <div className={styles.summaryItem}>
                          <span className={styles.summaryLabel}>Category Type:</span>
                          <span className={styles.summaryValue}>
                            {type === "work" ? "Our Work (Client Solution)" : "Our Product (In-House Platform)"}
                          </span>
                        </div>
                        <div className={styles.summaryItem}>
                          <span className={styles.summaryLabel}>Category Taxonomy:</span>
                          <span className={styles.summaryValue}>{category || "—"}</span>
                        </div>
                        <div className={styles.summaryItem}>
                          <span className={styles.summaryLabel}>Client Name:</span>
                          <span className={styles.summaryValue}>{clientName || "—"}</span>
                        </div>
                        <div className={styles.summaryItem}>
                          <span className={styles.summaryLabel}>Tagline:</span>
                          <span className={styles.summaryValue}>{tagline || "—"}</span>
                        </div>
                        <div className={styles.summaryItem}>
                          <span className={styles.summaryLabel}>Project Timeline:</span>
                          <span className={styles.summaryValue}>{timeline || "—"}</span>
                        </div>
                        <div className={styles.summaryItem}>
                          <span className={styles.summaryLabel}>External Live Website:</span>
                          <span className={styles.summaryValue}>{websiteUrl || "—"}</span>
                        </div>
                        <div className={styles.summaryItem}>
                          <span className={styles.summaryLabel}>Display Order:</span>
                          <span className={styles.summaryValue}>#{orderIndex}</span>
                        </div>
                        <div className={styles.summaryItem}>
                          <span className={styles.summaryLabel}>Cover Showcase Image:</span>
                          <div className={styles.reviewSummaryMediaRow}>
                            {coverPreviewUrl ? (
                              <img
                                src={coverPreviewUrl}
                                alt="Cover Preview"
                                className={styles.reviewCoverThumb}
                              />
                            ) : null}
                            <span className={styles.summaryValue}>
                              {coverPreviewUrl ? "Cover Image Attached" : "No Cover Image"}
                            </span>
                          </div>
                        </div>
                        <div className={styles.summaryItem}>
                          <span className={styles.summaryLabel}>Screenshot Gallery:</span>
                          <span className={styles.summaryValue}>
                            {galleryImages.length > 0
                              ? `${galleryImages.length} Image(s) Attached`
                              : "No Gallery Images"}
                          </span>
                        </div>
                        <div className={styles.summaryItem} style={{ gridColumn: "1 / -1" }}>
                          <span className={styles.summaryLabel}>Technologies Stack:</span>
                          <div className={styles.reviewSummaryChips}>
                            {techStack.length > 0 ? (
                              techStack.map((tech, idx) => (
                                <span key={idx} className={styles.reviewTechChip}>
                                  {tech}
                                </span>
                              ))
                            ) : (
                              <span className={styles.summaryValue}>None configured</span>
                            )}
                          </div>
                        </div>
                        <div className={styles.summaryItem} style={{ gridColumn: "1 / -1" }}>
                          <span className={styles.summaryLabel}>Measurable KPIs:</span>
                          <div className={styles.reviewSummaryChips}>
                            {metrics.length > 0 ? (
                              metrics.map((m, idx) => (
                                <span key={idx} className={styles.reviewMetricChip}>
                                  {m.value} — {m.label}
                                </span>
                              ))
                            ) : (
                              <span className={styles.summaryValue}>None configured</span>
                            )}
                          </div>
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