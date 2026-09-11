import {
  useState,
  useTransition,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  type DragEvent,
  type ChangeEvent,
  type ClipboardEvent,
} from "react";
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
  ChevronDown,
  UploadCloud,
  FileCheck,
  AlertCircle,
  AlertTriangle,
  RefreshCw,
  SlidersHorizontal,
  Save,
  Check,
  Search,
  Tag,
  Globe,
  Building2,
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
  type ServiceCategoryItem,
  type ServiceCategoryInput,
  slugifyService,
  slugifyServiceCategory,
  validateServiceInput,
  validateIndustryInput,
  validateServiceCategoryInput,
} from "@/lib/services.shared";
import { INITIAL_SERVICE_CATEGORIES } from "@/lib/services.data";
import {
  saveServiceFn,
  deleteServiceFn,
  toggleServiceActivationFn,
  toggleServiceFeaturedFn,
  saveIndustryFn,
  deleteIndustryFn,
  getServiceCategoriesFn,
  saveServiceCategoryFn,
  deleteServiceCategoryFn,
} from "@/lib/services.functions";
import { resolveCategoryName, isMongoId } from "@/services/service.service";
import styles from "./AdminServices.module.css";

interface AdminServicesProps {
  services: CompanyService[];
  industries: IndustrySector[];
  categoryItems?: ServiceCategoryItem[];
  categoryCounts?: Record<string, number>;
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

const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/jpg", "image/webp"];

function formatFileSize(bytes: number): string {
  if (!bytes || bytes <= 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function AdminServices({
  services,
  industries,
  categoryItems: initialCategoryItems,
  categoryCounts: initialCategoryCounts,
  onRefresh,
}: AdminServicesProps) {
  const [isPending, startTransition] = useTransition();
  const saveService = saveServiceFn;
  const deleteService = deleteServiceFn;
  const saveIndustry = saveIndustryFn;
  const deleteIndustry = deleteIndustryFn;

  // Active Section: Services list vs Industries list
  const [activeSection, setActiveSection] = useState<"services" | "industries">("services");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");
  const [isCatDropdownOpen, setIsCatDropdownOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const catDropdownRef = useRef<HTMLDivElement>(null);

  // Dynamic Categories State
  const [categoryList, setCategoryList] = useState<ServiceCategoryItem[]>(() => {
    if (initialCategoryItems && Array.isArray(initialCategoryItems)) {
      return initialCategoryItems;
    }
    return [];
  });

  // Refresh categories from backend API or store
  const refreshCategories = useCallback(async () => {
    try {
      const res = await getServiceCategoriesFn();
      if (res && Array.isArray(res.categories)) {
        setCategoryList(res.categories);
      }
    } catch (err) {
      console.warn("Failed to load service categories", err);
    }
  }, []);

  useEffect(() => {
    refreshCategories();
  }, [refreshCategories, services]);

  useEffect(() => {
    if (initialCategoryItems && Array.isArray(initialCategoryItems)) {
      setCategoryList(initialCategoryItems);
    }
  }, [initialCategoryItems]);

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

  // Compute category service counts dynamically
  const categoryServiceCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    services.forEach((s) => {
      const cat = s.category?.trim();
      if (cat) {
        counts[cat] = (counts[cat] || 0) + 1;
        counts[cat.toLowerCase()] = (counts[cat.toLowerCase()] || 0) + 1;
      }
    });
    return counts;
  }, [services]);

  // Active category items for dropdown selector
  const activeCategories = useMemo(() => {
    return categoryList
      .filter((c) => c.status === "active")
      .sort((a, b) => a.order_index - b.order_index);
  }, [categoryList]);

  // Currently selected category item (if any)
  const selectedCategoryItem = useMemo(() => {
    if (selectedCategoryId === "all") return null;
    return (
      categoryList.find(
        (c) => c.id === selectedCategoryId || (c as any)._id === selectedCategoryId,
      ) || null
    );
  }, [selectedCategoryId, categoryList]);

  // Dropdown trigger display label
  const dropdownTriggerLabel = useMemo(() => {
    if (!selectedCategoryItem) {
      return `All Categories (${categoryList.length})`;
    }
    return selectedCategoryItem.name;
  }, [selectedCategoryItem, categoryList.length]);

  // Filtered Services List
  const filteredServices = useMemo(() => {
    const selectedCat =
      selectedCategoryId !== "all"
        ? categoryList.find(
            (c) => c.id === selectedCategoryId || (c as any)._id === selectedCategoryId,
          )
        : null;

    return services.filter((s) => {
      // 1. Category Filter
      if (selectedCategoryId !== "all") {
        const rawCat = s.category;
        const resolvedCatName = resolveCategoryName(rawCat, categoryList).toLowerCase();
        const selectedCatName = (selectedCat?.name || "").toLowerCase();
        const selectedCatSlug = (selectedCat?.slug || "").toLowerCase();
        const targetId = selectedCat?.id || selectedCategoryId;

        const matchesId =
          rawCat === targetId ||
          (typeof rawCat === "object" && (rawCat as any)?._id === targetId);

        const matchesName =
          typeof rawCat === "string" && rawCat.toLowerCase() === selectedCatName;

        const matchesSlug =
          typeof rawCat === "string" && rawCat.toLowerCase() === selectedCatSlug;

        const matchesResolved = resolvedCatName === selectedCatName;

        if (!matchesId && !matchesName && !matchesSlug && !matchesResolved) {
          return false;
        }
      }

      // 2. Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = s.title.toLowerCase().includes(q);
        const matchSlug = s.slug.toLowerCase().includes(q);
        const matchTagline = (s.tagline || "").toLowerCase().includes(q);
        const matchSummary = (s.summary || "").toLowerCase().includes(q);
        const matchCat =
          (s.category || "").toLowerCase().includes(q) ||
          resolveCategoryName(s.category, categoryList).toLowerCase().includes(q);
        const matchTech = (s.tech_stack || []).some((t) => t.toLowerCase().includes(q));
        const matchFeatures = (s.features || []).some((f) => f.toLowerCase().includes(q));
        if (
          !matchTitle &&
          !matchSlug &&
          !matchTagline &&
          !matchSummary &&
          !matchCat &&
          !matchTech &&
          !matchFeatures
        ) {
          return false;
        }
      }
      return true;
    });
  }, [services, selectedCategoryId, categoryList, searchQuery]);

  // Filtered Industries List
  const filteredIndustries = useMemo(() => {
    if (!searchQuery.trim()) return industries;
    const q = searchQuery.toLowerCase().trim();
    return industries.filter((ind) => {
      const matchName = ind.name.toLowerCase().includes(q);
      const matchSlug = ind.slug.toLowerCase().includes(q);
      const matchTagline = (ind.tagline || "").toLowerCase().includes(q);
      const matchDesc = (ind.description || "").toLowerCase().includes(q);
      const matchBadge = (ind.badge || "").toLowerCase().includes(q);
      const matchSolutions = (ind.solutions || []).some((sol) => sol.toLowerCase().includes(q));
      return matchName || matchSlug || matchTagline || matchDesc || matchBadge || matchSolutions;
    });
  }, [industries, searchQuery]);

  // CATEGORY TAXONOMY MODAL STATE
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

  // INDUSTRY MODAL STATE
  const [showIndustryModal, setShowIndustryModal] = useState(false);
  const [editingIndustry, setEditingIndustry] = useState<IndustrySector | null>(null);
  const [indName, setIndName] = useState("");
  const [indSlug, setIndSlug] = useState("");
  const [indTagline, setIndTagline] = useState("");
  const [indDesc, setIndDesc] = useState("");
  const [indBadge, setIndBadge] = useState("");
  const [indImage, setIndImage] = useState("");
  const [indImageFile, setIndImageFile] = useState<File | null>(null);
  const [indImagePreviewUrl, setIndImagePreviewUrl] = useState<string | null>(null);
  const [indImageError, setIndImageError] = useState<string | null>(null);
  const [indSolutions, setIndSolutions] = useState<string[]>([]);
  const [newSolution, setNewSolution] = useState("");
  const [indAccentGlow, setIndAccentGlow] = useState("rgba(255, 122, 0, 0.3)");
  const [indOrderIndex, setIndOrderIndex] = useState(1);
  const [indFormError, setIndFormError] = useState<string | null>(null);
  const [indFieldErrors, setIndFieldErrors] = useState<Record<string, string>>({});
  const indFileInputRef = useRef<HTMLInputElement>(null);

  // SERVICE MODAL STATE
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingService, setEditingService] = useState<CompanyService | null>(null);
  const [modalTab, setModalTab] = useState<ServiceModalTab>("overview");

  // Service Form Fields
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("");
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
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    if (showServiceModal && modalTab && tabRefs.current[modalTab]) {
      tabRefs.current[modalTab]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "nearest",
      });
    }
  }, [modalTab, showServiceModal]);

  // Gallery Images State
  const [relatedImages, setRelatedImages] = useState<ServiceGalleryImage[]>([]);
  const [galleryUrlInput, setGalleryUrlInput] = useState<string>("");
  const [galleryError, setGalleryError] = useState<string | null>(null);
  const [replacingGalleryIndex, setReplacingGalleryIndex] = useState<number | null>(null);
  const galleryFileInputRef = useRef<HTMLInputElement>(null);

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

  // Body Lock & ESC Key Listener
  useEffect(() => {
    if (!showServiceModal && !showCatModal && !showIndustryModal) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showCatModal) {
          setShowCatModal(false);
        } else if (showIndustryModal) {
          setShowIndustryModal(false);
        } else if (showServiceModal) {
          setShowServiceModal(false);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [showServiceModal, showCatModal, showIndustryModal]);

  // CATEGORY TAXONOMY HANDLERS
  const handleOpenCatModal = (catToEdit?: ServiceCategoryItem) => {
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

    const input: ServiceCategoryInput = {
      id: editingCatId || undefined,
      name: catName.trim(),
      slug: catSlug.trim() || slugifyServiceCategory(catName),
      description: catDescription.trim() || undefined,
      status: catStatus,
      order_index: Number(catOrderIndex) || categoryList.length + 1,
    };

    const validation = validateServiceCategoryInput(input);
    if (!validation.valid) {
      setCatFormError(validation.error || "Please enter a valid category name.");
      return;
    }

    startTransition(async () => {
      try {
        const res = await saveServiceCategoryFn({ data: input });
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

  const handleToggleCategoryStatus = (cat: ServiceCategoryItem) => {
    const nextStatus = cat.status === "active" ? "inactive" : "active";
    setCatFormError(null);
    setCatSuccessMsg(null);

    // Optimistic UI update
    setCategoryList((prev) =>
      prev.map((item) => (item.id === cat.id ? { ...item, status: nextStatus } : item))
    );

    startTransition(async () => {
      try {
        const res = await saveServiceCategoryFn({
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
            prev.map((item) => (item.id === cat.id ? { ...item, status: cat.status } : item))
          );
          setCatFormError(res.error || "Failed to toggle category status.");
        }
      } catch (err) {
        // Revert optimistic update
        setCategoryList((prev) =>
          prev.map((item) => (item.id === cat.id ? { ...item, status: cat.status } : item))
        );
        console.warn("Failed to toggle category status", err);
        setCatFormError(err instanceof Error ? err.message : "Failed to toggle status.");
      }
    });
  };

  const handleDeleteCategoryClick = (cat: ServiceCategoryItem) => {
    const count = typeof cat.total_service_count === "number" ? cat.total_service_count : (categoryServiceCounts[cat.name.toLowerCase()] || 0);
    setCatDeleteConfirm({
      id: cat.id,
      name: cat.name,
      count,
    });
  };

  const handleConfirmDeleteCategory = () => {
    if (!catDeleteConfirm) return;
    const targetId = catDeleteConfirm.id;
    const previousList = [...categoryList];

    // Optimistically remove from list
    setCategoryList((prev) => prev.filter((c) => c.id !== targetId));

    startTransition(async () => {
      try {
        const res = await deleteServiceCategoryFn({ data: { id: targetId } });
        if (res.success) {
          setCatDeleteConfirm(null);
          setCatSuccessMsg("Category removed successfully.");
          await refreshCategories();
          onRefresh();
        } else {
          setCategoryList(previousList);
          setCatFormError(res.error || "Failed to delete category.");
        }
      } catch (err) {
        setCategoryList(previousList);
        setCatFormError(err instanceof Error ? err.message : "Error deleting category.");
      }
    });
  };

  // INDUSTRY MODAL HANDLERS
  const handleOpenCreateIndustry = () => {
    setEditingIndustry(null);
    setIndName("");
    setIndSlug("");
    setIndTagline("");
    setIndDesc("");
    setIndBadge("");
    setIndImage("https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=800&q=80");
    setIndImageFile(null);
    setIndImagePreviewUrl("https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=800&q=80");
    setIndImageError(null);
    setIndSolutions(["High-Availability Architecture", "Cloud Migration", "Compliance & Security"]);
    setNewSolution("");
    setIndAccentGlow("rgba(255, 122, 0, 0.3)");
    setIndOrderIndex(industries.length + 1);
    setIndFormError(null);
    setIndFieldErrors({});
    setShowIndustryModal(true);
  };

  const handleOpenEditIndustry = (ind: IndustrySector) => {
    setEditingIndustry(ind);
    setIndName(ind.name);
    setIndSlug(ind.slug);
    setIndTagline(ind.tagline);
    setIndDesc(ind.description);
    setIndBadge(ind.badge);
    setIndImage(ind.image_url);
    setIndImageFile(null);
    setIndImagePreviewUrl(ind.image_url);
    setIndImageError(null);
    setIndSolutions(ind.solutions || []);
    setNewSolution("");
    setIndAccentGlow(ind.accent_glow || "rgba(255, 122, 0, 0.3)");
    setIndOrderIndex(ind.order_index);
    setIndFormError(null);
    setIndFieldErrors({});
    setShowIndustryModal(true);
  };

  const handleSaveIndustry = (e: React.FormEvent) => {
    e.preventDefault();
    setIndFormError(null);
    setIndFieldErrors({});

    const input: IndustryInput = {
      id: editingIndustry?.id || undefined,
      name: indName.trim(),
      slug: indSlug.trim() || slugifyService(indName),
      tagline: indTagline.trim(),
      description: indDesc.trim(),
      badge: indBadge.trim(),
      image_url: indImage.trim(),
      solutions: indSolutions,
      accent_glow: indAccentGlow.trim() || "rgba(255, 122, 0, 0.3)",
      order_index: Number(indOrderIndex) || industries.length + 1,
    };

    const validation = validateIndustryInput(input);
    if (!validation.valid) {
      setIndFormError(validation.error || "Please complete all required fields.");
      if (validation.field) {
        setIndFieldErrors({ [validation.field]: validation.error || "Invalid field." });
      }
      return;
    }

    startTransition(async () => {
      try {
        const res = await saveIndustry({ data: input });
        if (res.success) {
          setShowIndustryModal(false);
          onRefresh();
        } else {
          setIndFormError(res.error || "Failed to save industry sector.");
        }
      } catch (err) {
        setIndFormError(err instanceof Error ? err.message : "Error saving industry sector.");
      }
    });
  };

  const handleDeleteIndustry = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete industry sector "${name}"?`)) {
      startTransition(async () => {
        await deleteIndustry({ data: { id } });
        onRefresh();
      });
    }
  };

  // SERVICE MODAL HANDLERS
  const handleOpenCreateService = () => {
    setEditingService(null);
    setTitle("");
    setSlug("");
    const defaultCatId = activeCategories[0]?.id || "";
    setCategory(defaultCatId);
    setTagline("");
    setSummary("");
    setHeroImage("https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80");
    setImageFile(null);
    setImagePreviewUrl("https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80");
    setImageError(null);
    setUploadProgress(0);
    setIsUploadingImage(false);
    setRelatedImages([]);
    setGalleryUrlInput("");
    setGalleryError(null);
    setReplacingGalleryIndex(null);
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

    let initialCatId = "";
    if (typeof srv.category === "object" && srv.category !== null) {
      initialCatId = (srv.category as any)._id || (srv.category as any).id || "";
    } else if (typeof srv.category === "string") {
      if (isMongoId(srv.category)) {
        initialCatId = srv.category;
      } else {
        const found = categoryList.find(
          (c) =>
            c.name.toLowerCase() === srv.category.toLowerCase() ||
            c.slug.toLowerCase() === srv.category.toLowerCase()
        );
        initialCatId = found?.id || srv.category;
      }
    }
    setCategory(initialCatId || activeCategories[0]?.id || "");
    setTagline(srv.tagline);
    setSummary(srv.summary);
    setHeroImage(srv.hero_image);
    setImageFile(null);
    setImagePreviewUrl(srv.hero_image);
    setImageError(null);
    setUploadProgress(0);
    setIsUploadingImage(false);
    setRelatedImages(srv.related_images || []);
    setGalleryUrlInput("");
    setGalleryError(null);
    setReplacingGalleryIndex(null);
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

  // Primary Hero Image Processing & Drag-Drop
  const handleFileProcess = (file: File) => {
    setImageError(null);
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setImageError("Unsupported image format. Please upload JPG, JPEG, PNG, or WEBP.");
      return;
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setImageError("Image size exceeds the 10 MB limit. Please choose a smaller image.");
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
      setTimeout(() => setIsUploadingImage(false), 250);
    };
    reader.onerror = () => {
      setImageError("Failed to read image file. Please try again.");
      setIsUploadingImage(false);
    };
    reader.readAsDataURL(file);
  };

  // Secondary Gallery Image File Process
  const handleGalleryFileProcess = (file: File) => {
    setGalleryError(null);
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setGalleryError("Unsupported image format. Please upload JPG, JPEG, PNG, or WEBP.");
      return;
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setGalleryError("Image size exceeds the 10 MB limit. Please choose a smaller image.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (replacingGalleryIndex !== null) {
        setRelatedImages((prev) => {
          const copy = [...prev];
          if (copy[replacingGalleryIndex]) {
            copy[replacingGalleryIndex] = {
              ...copy[replacingGalleryIndex],
              url: dataUrl,
              alt: file.name,
            };
          }
          return copy;
        });
        setReplacingGalleryIndex(null);
      } else {
        if (relatedImages.length >= 3) {
          setGalleryError("Maximum 3 gallery images allowed.");
          return;
        }
        setRelatedImages((prev) => [
          ...prev,
          {
            url: dataUrl,
            caption: `Feature workflow preview ${prev.length + 1}`,
            alt: file.name,
          },
        ]);
      }
    };
    reader.onerror = () => {
      setGalleryError("Failed to read gallery image file. Please try again.");
    };
    reader.readAsDataURL(file);
  };

  const handleGalleryFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleGalleryFileProcess(e.target.files[0]);
    }
    if (e.target) {
      e.target.value = "";
    }
  };

  const handleAddGalleryUrl = () => {
    setGalleryError(null);
    const cleanUrl = galleryUrlInput.trim();
    if (!cleanUrl) {
      setGalleryError("Please enter a valid image URL.");
      return;
    }
    if (relatedImages.length >= 3) {
      setGalleryError("Maximum 3 gallery images allowed.");
      return;
    }
    setRelatedImages((prev) => [
      ...prev,
      {
        url: cleanUrl,
        caption: "High-performance architecture workflow preview.",
        alt: "Service Architecture",
      },
    ]);
    setGalleryUrlInput("");
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

  // Step-by-Step Validation & Navigation
  const handleNextStep = () => {
    setFormError(null);
    const errors: Record<string, string> = {};

    if (modalTab === "overview") {
      if (!title.trim() || title.trim().length < 3) {
        errors.title = "Service title must be at least 3 characters long.";
      }
      if (!category.trim() || category.trim().length < 2) {
        errors.category = "Category selection is required.";
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
  const handleSaveService = (e?: React.FormEvent | React.MouseEvent) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    setFormError(null);
    setFieldErrors({});

    // Resolve category to a valid MongoDB ObjectId or fallback to first active category
    let finalCategoryId = category.trim();
    if (!finalCategoryId && activeCategories.length > 0) {
      finalCategoryId = activeCategories[0].id;
    }

    if (finalCategoryId && !isMongoId(finalCategoryId)) {
      const match = categoryList.find(
        (c) =>
          c.id === finalCategoryId ||
          c.name.toLowerCase() === finalCategoryId.toLowerCase() ||
          c.slug.toLowerCase() === finalCategoryId.toLowerCase()
      );
      if (match && isMongoId(match.id)) {
        finalCategoryId = match.id;
      }
    }

    if (!finalCategoryId || !isMongoId(finalCategoryId)) {
      const firstValid = activeCategories.find((c) => isMongoId(c.id)) || categoryList.find((c) => isMongoId(c.id));
      if (firstValid) {
        finalCategoryId = firstValid.id;
      }
    }

    const resolvedWhatIsIt = whatIsIt.trim() || summary.trim() || "Comprehensive engineering service tailored to modern business requirements.";

    const input: ServiceInput = {
      id: editingService?.id ?? undefined,
      title: title.trim(),
      slug: slug.trim() || slugifyService(title),
      category: finalCategoryId || category.trim() || activeCategories[0]?.id || "",
      tagline: tagline.trim() || summary.trim().slice(0, 80) || "Engineering service",
      summary: summary.trim(),
      hero_image: heroImage.trim() || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80",
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
      order_index: Number(orderIndex) || 1,
      is_featured: isFeatured,
      is_active: isActive,
    };

    const validation = validateServiceInput(input);
    if (!validation.valid) {
      setFormError(validation.error || "Please check the highlighted fields.");
      if (validation.field) {
        setFieldErrors({ [validation.field]: validation.error || "Invalid field." });
        if (
          validation.field === "title" ||
          validation.field === "summary" ||
          validation.field === "what_is_it"
        ) {
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
          await refreshCategories();
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
      try {
        await toggleServiceActivationFn({ data: { id: srv.id } });
        onRefresh();
      } catch (err) {
        console.warn("Failed to toggle service activation:", err);
      }
    });
  };

  const handleToggleFeatured = (srv: CompanyService) => {
    startTransition(async () => {
      try {
        await toggleServiceFeaturedFn({ data: { id: srv.id } });
        onRefresh();
      } catch (err) {
        console.warn("Failed to toggle service featured status:", err);
      }
    });
  };

  return (
    <div className={styles.wrapper}>
      {/* Header & Section Actions */}
      <div className={styles.headerRow}>
        <div>
          <h2 className={styles.title}>Services &amp; Industry Sectors</h2>
          <p className={styles.subtitle}>
            Manage dynamic service detail pages, taxonomy categories, visual workflows, and industry sectors.
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
              onClick={() => {
                setActiveSection("services");
                setSearchQuery("");
              }}
            >
              <Layers size={14} />
              <span>Services ({services.length})</span>
            </button>
            <button
              type="button"
              className={[
                styles.sectionTabBtn,
                activeSection === "industries" ? styles.sectionTabBtnActive : "",
              ].join(" ")}
              onClick={() => {
                setActiveSection("industries");
                setSearchQuery("");
              }}
            >
              <Building2 size={14} />
              <span>Industries ({industries.length})</span>
            </button>
          </div>

          {activeSection === "services" ? (
            <>
              <button
                type="button"
                className={styles.manageCatBtn}
                onClick={() => handleOpenCatModal()}
                title="Manage Dynamic Service Categories"
              >
                <SlidersHorizontal size={15} />
                <span>Manage Categories ({categoryList.length})</span>
              </button>

              <button
                type="button"
                className={styles.createBtn}
                onClick={handleOpenCreateService}
              >
                <Plus size={16} />
                <span>Add New Service</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              className={styles.createBtn}
              onClick={handleOpenCreateIndustry}
            >
              <Plus size={16} />
              <span>Add New Industry</span>
            </button>
          )}
        </div>
      </div>

      {/* SECTION 1: SERVICES TABLE & FILTERS */}
      {activeSection === "services" && (
        <>
          {/* Dynamic Filters & Search Control Bar (Search left, Category Dropdown right) */}
          <div className={styles.filtersBar}>
            {/* Search Control */}
            <div className={styles.searchBox}>
              <Search size={14} className={styles.searchIcon} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search services by title, slug, summary, or tech..."
                className={styles.searchInput}
              />
              {searchQuery && (
                <button
                  type="button"
                  className={styles.searchClearBtn}
                  onClick={() => setSearchQuery("")}
                  title="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Category Filter Dropdown (Right of Search) */}
            <div className={styles.catDropdownWrapper} ref={catDropdownRef}>
              <button
                type="button"
                className={[
                  styles.catDropdownTrigger,
                  selectedCategoryId !== "all" || isCatDropdownOpen
                    ? styles.catDropdownTriggerActive
                    : "",
                ].join(" ")}
                onClick={() => setIsCatDropdownOpen((prev) => !prev)}
                aria-expanded={isCatDropdownOpen}
                aria-haspopup="listbox"
                aria-label="Filter services by category"
              >
                <div className={styles.catDropdownTriggerLeft}>
                  {selectedCategoryId !== "all" ? (
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
                    aria-selected={selectedCategoryId === "all"}
                    className={[
                      styles.catDropdownItem,
                      selectedCategoryId === "all" ? styles.catDropdownItemActive : "",
                    ].join(" ")}
                    onClick={() => {
                      setSelectedCategoryId("all");
                      setIsCatDropdownOpen(false);
                    }}
                  >
                    <div className={styles.catDropdownItemLeft}>
                      {selectedCategoryId === "all" ? (
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
                      categoryServiceCounts[c.name.toLowerCase()] || 0;
                    const isSelected =
                      selectedCategoryId === c.id ||
                      selectedCategoryId === (c as any)._id;
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
                          setSelectedCategoryId(c.id);
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

          {/* Strict Fixed-Grid Services Table */}
          <div className={styles.tableCard}>
            <div className={styles.tableResponsive}>
              <table className={styles.table}>
                <colgroup>
                  <col style={{ width: "60px" }} />
                  <col style={{ width: "85px" }} />
                  <col style={{ width: "380px" }} />
                  <col style={{ width: "220px" }} />
                  <col style={{ width: "140px" }} />
                  <col style={{ width: "110px" }} />
                  <col style={{ width: "120px" }} />
                </colgroup>
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Visual</th>
                    <th>Service Name &amp; Tagline</th>
                    <th>Category</th>
                    <th>Deliverables</th>
                    <th>Status</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredServices.length === 0 ? (
                    <tr>
                      <td colSpan={7}>
                        <div className={styles.emptyTableCard}>
                          <div className={styles.emptyState}>
                            <Layers size={32} className={styles.emptyIcon} />
                            <h4 className={styles.emptyTitle}>No matching services found</h4>
                            <p className={styles.emptySub}>
                              {searchQuery || selectedCategoryId !== "all"
                                ? "Try adjusting your search query or category filter."
                                : "Click 'Add New Service' to create your first dynamic service page."}
                            </p>
                            {(searchQuery || selectedCategoryId !== "all") && (
                              <button
                                type="button"
                                className={styles.clearFilterBtn}
                                onClick={() => {
                                  setSearchQuery("");
                                  setSelectedCategoryId("all");
                                }}
                              >
                                Clear Filters
                              </button>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredServices.map((srv) => {
                      const resolvedCat = resolveCategoryName(srv.category, categoryList);
                      return (
                        <tr key={srv.id} className={!srv.is_active ? styles.inactiveRow : ""}>
                          <td className={styles.orderCell}>{srv.order_index}</td>
                          <td>
                            <img
                              src={srv.hero_image || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80"}
                              alt={srv.title}
                              className={styles.thumbImg}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80";
                              }}
                            />
                          </td>
                          <td>
                            <div className={styles.titleCol}>
                              <span className={styles.srvTitle}>{srv.title}</span>
                              <span className={styles.srvTagline}>{srv.tagline || srv.summary?.slice(0, 80) || "Comprehensive engineering service"}</span>
                            </div>
                          </td>
                          <td>
                            <span className={styles.categoryBadge} title={resolvedCat}>
                              {resolvedCat}
                            </span>
                          </td>
                        <td>
                          <span className={styles.featCount}>
                            {srv.features?.length || 0} features
                          </span>
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
                              {srv.is_active ? <Eye size={15} /> : <EyeOff size={15} />}
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
                              <Star size={15} />
                            </button>
                          </div>
                        </td>
                        <td>
                          <div className={styles.rowActions} style={{ justifyContent: "flex-end" }}>
                            <button
                              type="button"
                              className={styles.editBtn}
                              onClick={() => handleOpenEditService(srv)}
                              title="Edit Full Service Details"
                            >
                              <Edit2 size={14} />
                            </button>
                            <a
                              href={`/services/${srv.slug}`}
                              target="_blank"
                              rel="noreferrer"
                              className={styles.viewBtn}
                              title="View Live Service Page"
                            >
                              <ExternalLink size={14} />
                            </a>
                            <button
                              type="button"
                              className={styles.delBtn}
                              onClick={() => handleDeleteService(srv.id, srv.title)}
                              title="Delete Service"
                            >
                              <Trash2 size={14} />
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
        </>
      )}

      {/* SECTION 2: INDUSTRIES TABLE & SEARCH */}
      {activeSection === "industries" && (
        <>
          {/* Industries Search Control */}
          <div className={styles.filtersBar}>
            <div className={styles.secondaryFiltersRow}>
              <div className={styles.searchBox}>
                <Search size={14} className={styles.searchIcon} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search industries by sector, badge, tagline, or solutions..."
                  className={styles.searchInput}
                />
                {searchQuery && (
                  <button
                    type="button"
                    className={styles.searchClearBtn}
                    onClick={() => setSearchQuery("")}
                    title="Clear search"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Strict Fixed-Grid Industries Table */}
          <div className={styles.tableCard}>
            <div className={styles.tableResponsive}>
              <table className={styles.table}>
                <colgroup>
                  <col style={{ width: "60px" }} />
                  <col style={{ width: "90px" }} />
                  <col style={{ width: "240px" }} />
                  <col style={{ width: "160px" }} />
                  <col style={{ width: "280px" }} />
                  <col style={{ width: "180px" }} />
                  <col style={{ width: "100px" }} />
                </colgroup>
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Visual</th>
                    <th>Industry Sector</th>
                    <th>Badge</th>
                    <th>Tagline &amp; Overview</th>
                    <th>Solutions</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredIndustries.length === 0 ? (
                    <tr>
                      <td colSpan={7}>
                        <div className={styles.emptyTableCard}>
                          <div className={styles.emptyState}>
                            <Building2 size={32} className={styles.emptyIcon} />
                            <h4 className={styles.emptyTitle}>No matching industries found</h4>
                            <p className={styles.emptySub}>
                              {searchQuery
                                ? "Try adjusting your search query."
                                : "Click 'Add New Industry' to create your first sector card."}
                            </p>
                            {searchQuery && (
                              <button
                                type="button"
                                className={styles.clearFilterBtn}
                                onClick={() => setSearchQuery("")}
                              >
                                Clear Search
                              </button>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredIndustries.map((ind) => (
                      <tr key={ind.id}>
                        <td className={styles.orderCell}>{ind.order_index}</td>
                        <td>
                          <img
                            src={ind.image_url}
                            alt={ind.name}
                            className={styles.thumbImg}
                          />
                        </td>
                        <td>
                          <span className={styles.srvTitle}>{ind.name}</span>
                        </td>
                        <td>
                          <span className={styles.industryBadge}>{ind.badge}</span>
                        </td>
                        <td>
                          <div className={styles.titleCol}>
                            <span className={styles.srvTagline} title={ind.tagline}>
                              {ind.tagline}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span className={styles.featCount}>
                            {ind.solutions?.length || 0} solutions
                          </span>
                        </td>
                        <td>
                          <div className={styles.rowActions} style={{ justifyContent: "flex-end" }}>
                            <button
                              type="button"
                              className={styles.editBtn}
                              onClick={() => handleOpenEditIndustry(ind)}
                              title="Edit Industry Details"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              type="button"
                              className={styles.delBtn}
                              onClick={() => handleDeleteIndustry(ind.id, ind.name)}
                              title="Delete Industry"
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
          </div>
        </>
      )}

      {/* CATEGORY TAXONOMY MODAL (2-COLUMN ARCHITECTURE) */}
      {showCatModal && (
        <div className={styles.modalBackdrop} role="dialog" aria-modal="true" onClick={() => setShowCatModal(false)}>
          <div
            className={[styles.modalContent, styles.catModalContent].join(" ")}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className={styles.modalHeader}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div className={styles.uploadIconCircle} style={{ width: "38px", height: "38px" }}>
                  <SlidersHorizontal size={18} className={styles.uploadIcon} />
                </div>
                <div>
                  <h3 className={styles.modalTitle}>Service Category Taxonomy</h3>
                  <p className={styles.modalSub}>
                    Configure dynamic categories for engineering services, filter pills, and dropdown selectors.
                  </p>
                </div>
              </div>
              <button
                type="button"
                className={styles.modalClose}
                onClick={() => setShowCatModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            {/* Delete Warning Safety Banner */}
            {catDeleteConfirm && (
              <div className={styles.deleteWarningAlert}>
                <AlertTriangle size={18} className={styles.deleteWarningIcon} />
                <div className={styles.deleteWarningText}>
                  <h5>Confirm Category Deletion</h5>
                  <p>
                    Are you sure you want to delete category{" "}
                    <strong>"{catDeleteConfirm.name}"</strong>?{" "}
                    {catDeleteConfirm.count > 0 ? (
                      <span style={{ color: "#fca5a5" }}>
                        It is currently associated with <strong>{catDeleteConfirm.count} service(s)</strong>.
                      </span>
                    ) : (
                      "No services are currently assigned to this category."
                    )}
                  </p>
                  <div className={styles.deleteWarningActions}>
                    <button
                      type="button"
                      className={styles.confirmDeleteBtn}
                      onClick={handleConfirmDeleteCategory}
                      disabled={isPending}
                    >
                      {isPending ? "Deleting..." : "Confirm & Delete"}
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

            {/* 2-Column Layout */}
            <div className={styles.catTaxonomyLayout}>
              {/* Column 1: Add/Edit Category Form */}
              <div className={styles.catFormCard}>
                <h4 className={styles.catFormTitle}>
                  <Tag size={15} />
                  <span>{editingCatId ? "Edit Category" : "Add New Category"}</span>
                </h4>
                <p className={styles.catFormSub}>
                  {editingCatId
                    ? "Modify taxonomy parameters below. Service assignments update automatically."
                    : "Create a new service taxonomy category."}
                </p>

                {catFormError && (
                  <div className={[styles.catFormAlert, styles.catFormAlertError].join(" ")}>
                    <AlertCircle size={14} />
                    <span>{catFormError}</span>
                  </div>
                )}

                {catSuccessMsg && (
                  <div className={[styles.catFormAlert, styles.catFormAlertSuccess].join(" ")}>
                    <CheckCircle2 size={14} />
                    <span>{catSuccessMsg}</span>
                  </div>
                )}

                <form onSubmit={handleSaveCategory} style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                  <div className={styles.formGroup}>
                    <label>Category Name *</label>
                    <input
                      type="text"
                      required
                      value={catName}
                      onChange={(e) => {
                        setCatName(e.target.value);
                        if (!editingCatId) {
                          setCatSlug(slugifyServiceCategory(e.target.value));
                        }
                      }}
                      placeholder="e.g. Autonomous Systems"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>URL Slug *</label>
                    <input
                      type="text"
                      required
                      value={catSlug}
                      onChange={(e) => setCatSlug(e.target.value)}
                      placeholder="e.g. autonomous-systems"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Description (Optional)</label>
                    <textarea
                      rows={2}
                      value={catDescription}
                      onChange={(e) => setCatDescription(e.target.value)}
                      placeholder="High-level definition for internal taxonomy..."
                    />
                  </div>

                  <div className={styles.formGrid2}>
                    <div className={styles.formGroup}>
                      <label>Status</label>
                      <select
                        value={catStatus}
                        onChange={(e) => setCatStatus(e.target.value as "active" | "inactive")}
                        className={styles.selectInput}
                      >
                        <option value="active">Active (Visible)</option>
                        <option value="inactive">Inactive (Hidden)</option>
                      </select>
                    </div>

                    <div className={styles.formGroup}>
                      <label>Display Order</label>
                      <input
                        type="number"
                        value={catOrderIndex}
                        onChange={(e) => setCatOrderIndex(Number(e.target.value))}
                      />
                    </div>
                  </div>

                  <div className={styles.catFormActions}>
                    <button
                      type="submit"
                      disabled={isPending}
                      className={styles.catFormSubmitBtn}
                    >
                      <Save size={14} />
                      <span>{editingCatId ? "Update Category" : "Add Category"}</span>
                    </button>
                    {editingCatId && (
                      <button
                        type="button"
                        className={styles.catFormResetBtn}
                        onClick={handleResetCatForm}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Column 2: Configured Categories Table */}
              <div className={styles.catListCard}>
                <div className={styles.catListHeader}>
                  <h4 className={styles.catListTitle}>
                    <span>Configured Categories</span>
                    <span className={styles.catCountBadge}>{categoryList.length}</span>
                  </h4>
                  <span className={styles.catListSub}>
                    Active categories appear in the service filter pills and service creation dropdown.
                  </span>
                </div>

                <div className={styles.catListScrollContainer}>
                  <table className={styles.catTable}>
                    <thead>
                      <tr>
                        <th style={{ width: "50px" }}>Order</th>
                        <th>Category &amp; Slug</th>
                        <th style={{ width: "90px" }}>Services</th>
                        <th style={{ width: "95px" }}>Status</th>
                        <th style={{ width: "100px", textAlign: "right" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categoryList
                        .sort((a, b) => a.order_index - b.order_index)
                        .map((cat) => {
                          const count = typeof cat.total_service_count === "number" ? cat.total_service_count : (categoryServiceCounts[cat.name.toLowerCase()] || 0);
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
                                  {count} service{count !== 1 ? "s" : ""}
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

      {/* INDUSTRY CREATE/EDIT MODAL */}
      {showIndustryModal && (
        <div className={styles.modalBackdrop} role="dialog" aria-modal="true" onClick={() => setShowIndustryModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <h3 className={styles.modalTitle}>
                  {editingIndustry ? `Edit Industry: ${editingIndustry.name}` : "Add New Industry Sector"}
                </h3>
                <p className={styles.modalSub}>
                  Configure industry sector showcase card, solutions list, accent glow, and visual hero.
                </p>
              </div>
              <button
                type="button"
                className={styles.modalClose}
                onClick={() => setShowIndustryModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            {indFormError && (
              <div className={styles.errorAlert}>
                <AlertCircle size={16} />
                <span>{indFormError}</span>
              </div>
            )}

            <form onSubmit={handleSaveIndustry} className={styles.modalForm}>
              <div className={styles.modalBodyScroll}>
                <div className={styles.tabPane}>
                  <div className={styles.formGrid2}>
                    <div className={styles.formGroup}>
                      <label>Industry Name *</label>
                      <input
                        type="text"
                        required
                        value={indName}
                        className={indFieldErrors.name ? styles.inputError : ""}
                        onChange={(e) => {
                          setIndName(e.target.value);
                          if (!editingIndustry) setIndSlug(slugifyService(e.target.value));
                        }}
                        placeholder="e.g. Healthcare & MedTech"
                      />
                      {indFieldErrors.name && (
                        <span className={styles.fieldErrorText}>{indFieldErrors.name}</span>
                      )}
                    </div>

                    <div className={styles.formGroup}>
                      <label>URL Slug *</label>
                      <input
                        type="text"
                        required
                        value={indSlug}
                        onChange={(e) => setIndSlug(e.target.value)}
                        placeholder="e.g. healthcare"
                      />
                    </div>
                  </div>

                  <div className={styles.formGrid2}>
                    <div className={styles.formGroup}>
                      <label>Badge Label *</label>
                      <input
                        type="text"
                        required
                        value={indBadge}
                        className={indFieldErrors.badge ? styles.inputError : ""}
                        onChange={(e) => setIndBadge(e.target.value)}
                        placeholder="e.g. MedTech & Health"
                      />
                      {indFieldErrors.badge && (
                        <span className={styles.fieldErrorText}>{indFieldErrors.badge}</span>
                      )}
                    </div>

                    <div className={styles.formGroup}>
                      <label>Display Order (1, 2, 3...)</label>
                      <input
                        type="number"
                        value={indOrderIndex}
                        onChange={(e) => setIndOrderIndex(Number(e.target.value))}
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Short Tagline *</label>
                    <input
                      type="text"
                      required
                      value={indTagline}
                      className={indFieldErrors.tagline ? styles.inputError : ""}
                      onChange={(e) => setIndTagline(e.target.value)}
                      placeholder="e.g. HIPAA-compliant medical cloud architectures and telemetry pipelines."
                    />
                    {indFieldErrors.tagline && (
                      <span className={styles.fieldErrorText}>{indFieldErrors.tagline}</span>
                    )}
                  </div>

                  <div className={styles.formGroup}>
                    <label>Full Overview Description *</label>
                    <textarea
                      rows={3}
                      required
                      value={indDesc}
                      className={indFieldErrors.description ? styles.inputError : ""}
                      onChange={(e) => setIndDesc(e.target.value)}
                      placeholder="Detailed overview of engineering capabilities and industry domain expertise..."
                    />
                    {indFieldErrors.description && (
                      <span className={styles.fieldErrorText}>{indFieldErrors.description}</span>
                    )}
                  </div>

                  <div className={styles.formGrid2}>
                    <div className={styles.formGroup}>
                      <label>Showcase Image URL *</label>
                      <input
                        type="url"
                        required
                        value={indImage}
                        className={indFieldErrors.image_url ? styles.inputError : ""}
                        onChange={(e) => setIndImage(e.target.value)}
                        placeholder="https://images.unsplash.com/..."
                      />
                      {indFieldErrors.image_url && (
                        <span className={styles.fieldErrorText}>{indFieldErrors.image_url}</span>
                      )}
                    </div>

                    <div className={styles.formGroup}>
                      <label>Accent Glow (CSS color)</label>
                      <input
                        type="text"
                        value={indAccentGlow}
                        onChange={(e) => setIndAccentGlow(e.target.value)}
                        placeholder="e.g. rgba(255, 122, 0, 0.3)"
                      />
                    </div>
                  </div>

                  {/* Solutions List */}
                  <div className={styles.sectionDividerBox}>
                    <h4 className={styles.sectionDividerTitle}>
                      <Sparkles size={14} />
                      <span>Key Solutions &amp; Deliverables</span>
                    </h4>

                    {indSolutions.length > 0 && (
                      <div className={styles.chipsRow}>
                        {indSolutions.map((sol, idx) => (
                          <span key={idx} className={styles.chip}>
                            <Check size={12} className={styles.chipCheck} />
                            <span>{sol}</span>
                            <button
                              type="button"
                              className={styles.chipDel}
                              onClick={() => setIndSolutions(indSolutions.filter((_, i) => i !== idx))}
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}

                    <div className={styles.addInputRow}>
                      <input
                        type="text"
                        value={newSolution}
                        onChange={(e) => setNewSolution(e.target.value)}
                        placeholder="Add solution bullet (e.g. EHR/EMR Interoperability)"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            if (newSolution.trim() && !indSolutions.includes(newSolution.trim())) {
                              setIndSolutions([...indSolutions, newSolution.trim()]);
                              setNewSolution("");
                            }
                          }
                        }}
                      />
                      <button
                        type="button"
                        className={styles.smallAddBtn}
                        onClick={() => {
                          if (newSolution.trim() && !indSolutions.includes(newSolution.trim())) {
                            setIndSolutions([...indSolutions, newSolution.trim()]);
                            setNewSolution("");
                          }
                        }}
                      >
                        Add Solution
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.modalFooter}>
                <div className={styles.footerLeft}>
                  <button
                    type="button"
                    className={styles.cancelBtn}
                    onClick={() => setShowIndustryModal(false)}
                  >
                    Cancel
                  </button>
                </div>
                <div className={styles.footerRight}>
                  <button
                    type="submit"
                    disabled={isPending}
                    className={styles.saveSubmitBtn}
                  >
                    {isPending
                      ? "Saving..."
                      : editingIndustry
                      ? "Update Industry"
                      : "Create Industry"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FULL SERVICE CREATE/EDIT MODAL */}
      {showServiceModal && (
        <div className={styles.modalBackdrop} role="dialog" aria-modal="true" onClick={() => setShowServiceModal(false)}>
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
            <div className={styles.modalTabsBar} role="tablist" aria-label="Service Form Steps">
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

            {/* Error Banner */}
            {formError && (
              <div className={styles.errorAlert}>
                <AlertCircle size={16} />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveService} noValidate className={styles.modalForm}>
              <div className={styles.modalBodyScroll}>
                {/* STEP 1: OVERVIEW & CORE INFO */}
                {modalTab === "overview" && (
                  <div className={styles.tabPane}>
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

                    <div className={styles.formGrid2}>
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
                          value={
                            activeCategories.find((c) => c.id === category || c.name.toLowerCase() === category.toLowerCase())?.id ||
                            category
                          }
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
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                          {category &&
                            !activeCategories.some((c) => c.id === category || c.name.toLowerCase() === category.toLowerCase()) && (
                              <option value={category}>{category} (Custom / Legacy)</option>
                            )}
                        </select>
                        {fieldErrors.category && (
                          <span className={styles.fieldErrorText}>{fieldErrors.category}</span>
                        )}
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
                        <label>2. Who Is It For? (Target Audience &amp; Organizations)</label>
                        <textarea
                          rows={2}
                          value={whoIsFor}
                          onChange={(e) => setWhoIsFor(e.target.value)}
                          placeholder="e.g. Startups building MVP products, scale-ups, and enterprises modernizing legacy systems."
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label>3. Problem Solved (Core Business Pain Points Addressed)</label>
                        <textarea
                          rows={2}
                          value={problemSolved}
                          onChange={(e) => setProblemSolved(e.target.value)}
                          placeholder="e.g. Eliminates slow load times, high server costs, and poor user retention."
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label>4. Why It Matters (Commercial &amp; Strategic Impact)</label>
                        <textarea
                          rows={2}
                          value={whyItMatters}
                          onChange={(e) => setWhyItMatters(e.target.value)}
                          placeholder="e.g. Increases customer conversion rates by 35% and guarantees 99.99% uptime."
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2: MEDIA & VISUAL GALLERY */}
                {modalTab === "media" && (
                  <div className={styles.tabPane}>
                    {/* Primary Hero Showcase Media */}
                    <div className={styles.uploadSectionBox}>
                      <div className={styles.uploadSectionHeader}>
                        <h4 className={styles.uploadSectionTitle}>
                          <ImageIcon size={16} /> Primary Hero Showcase Image *
                        </h4>
                        <span className={styles.uploadBadge}>Hero Visual</span>
                      </div>
                      <div className={styles.imageSpecChips}>
                        <span className={styles.specChip}>Recommended: 1920 × 1080 px · 16:9</span>
                        <span className={styles.specChip}>Formats: JPG, JPEG, PNG, WEBP</span>
                        <span className={styles.specChip}>Maximum size: 10 MB</span>
                      </div>

                      <div
                        className={[
                          styles.dropzone,
                          isDragOver ? styles.dropzoneActive : "",
                          imageError ? styles.dropzoneError : "",
                        ].join(" ")}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => {
                          if (!imagePreviewUrl) fileInputRef.current?.click();
                        }}
                      >
                        <input
                          type="file"
                          ref={fileInputRef}
                          style={{ display: "none" }}
                          accept="image/jpeg,image/png,image/jpg,image/webp"
                          onChange={handleFileInputChange}
                        />

                        {imagePreviewUrl ? (
                          <div className={styles.previewContainer}>
                            <img
                              src={imagePreviewUrl}
                              alt="Hero Preview"
                              className={styles.dropzonePreviewImg}
                            />
                            <div className={styles.previewMetaRow}>
                              <span className={styles.fileInfoBadge}>
                                <FileCheck size={14} className={styles.checkIcon} />
                                <span>
                                  {imageFile ? `${imageFile.name} (${formatFileSize(imageFile.size)})` : "Hero Image Ready"}
                                </span>
                              </span>
                              <div className={styles.previewActions}>
                                <button
                                  type="button"
                                  className={styles.replaceImgBtn}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    fileInputRef.current?.click();
                                  }}
                                >
                                  Replace Image
                                </button>
                                <button
                                  type="button"
                                  className={styles.removeImgBtn}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveImage();
                                  }}
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className={styles.dropzoneEmpty}>
                            <div className={styles.uploadIconCircle}>
                              <UploadCloud size={24} className={styles.uploadIcon} />
                            </div>
                            <p className={styles.dropzonePrompt}>
                              Drag &amp; drop service photo here, or{" "}
                              <span className={styles.browseLink}>browse</span>
                            </p>
                            <span className={styles.dropzoneSub}>
                              JPG, PNG, JPEG, or WEBP up to 10MB
                            </span>
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
                        <span className={styles.imageErrorText}>
                          <AlertCircle size={14} />
                          <span>{imageError}</span>
                        </span>
                      )}

                      <div className={styles.manualUrlRow}>
                        <label>Or enter Direct Image URL:</label>
                        <input
                          type="url"
                          value={heroImage}
                          onChange={(e) => {
                            setHeroImage(e.target.value);
                            setImagePreviewUrl(e.target.value);
                            setImageError(null);
                          }}
                          placeholder="https://images.unsplash.com/..."
                        />
                      </div>
                    </div>

                    {/* Secondary Showcase Gallery */}
                    <div className={styles.gallerySectionBox}>
                      <input
                        type="file"
                        ref={galleryFileInputRef}
                        style={{ display: "none" }}
                        accept="image/jpeg,image/png,image/jpg,image/webp"
                        onChange={handleGalleryFileInputChange}
                      />

                      <h4 className={styles.uploadSectionTitle}>
                        <Layers size={16} />
                        <span>Secondary Gallery Showcase (Up to 3 Images)</span>
                      </h4>

                      <div className={styles.imageSpecChips}>
                        <span className={styles.specChip}>Recommended: 1600 × 900 px · 16:9</span>
                        <span className={styles.specChip}>Formats: JPG, JPEG, PNG, WEBP</span>
                        <span className={styles.specChip}>Maximum size: 10 MB</span>
                      </div>

                      {galleryError && (
                        <div className={styles.errorAlert} style={{ margin: "0.25rem 0" }}>
                          <AlertCircle size={14} />
                          <span>{galleryError}</span>
                        </div>
                      )}

                      {relatedImages.length > 0 && (
                        <div className={styles.relatedImgsGrid}>
                          {relatedImages.map((img, idx) => (
                            <div key={idx} className={styles.relatedImgCard}>
                              <div className={styles.relatedImgCardHeader}>
                                <span className={styles.relatedImgBadge}>Image #{idx + 1}</span>
                                <div className={styles.relatedImgActions}>
                                  <button
                                    type="button"
                                    className={styles.galleryReplaceBtn}
                                    title="Replace Image"
                                    onClick={() => {
                                      setReplacingGalleryIndex(idx);
                                      galleryFileInputRef.current?.click();
                                    }}
                                  >
                                    <UploadCloud size={12} /> Replace
                                  </button>
                                  <button
                                    type="button"
                                    className={styles.removeStepBtn}
                                    title="Remove Image"
                                    onClick={() => {
                                      setRelatedImages(relatedImages.filter((_, i) => i !== idx));
                                      setGalleryError(null);
                                    }}
                                  >
                                    <Trash2 size={12} /> Remove
                                  </button>
                                </div>
                              </div>
                              <img
                                src={img.url}
                                alt={img.alt || `Gallery preview ${idx + 1}`}
                                className={styles.relatedImgThumb}
                              />
                              <input
                                type="text"
                                value={img.caption || ""}
                                onChange={(e) => {
                                  const copy = [...relatedImages];
                                  copy[idx] = { ...copy[idx], caption: e.target.value };
                                  setRelatedImages(copy);
                                }}
                                placeholder="Caption description..."
                                className={styles.captionInput}
                              />
                              <input
                                type="text"
                                value={img.alt || ""}
                                onChange={(e) => {
                                  const copy = [...relatedImages];
                                  copy[idx] = { ...copy[idx], alt: e.target.value };
                                  setRelatedImages(copy);
                                }}
                                placeholder="Alt description text..."
                                className={styles.captionInput}
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      {relatedImages.length < 3 && (
                        <div className={styles.galleryAddBox}>
                          <div className={styles.galleryAddOptions}>
                            <div className={styles.galleryAddUrlRow}>
                              <input
                                type="url"
                                value={galleryUrlInput}
                                onChange={(e) => {
                                  setGalleryUrlInput(e.target.value);
                                  setGalleryError(null);
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleAddGalleryUrl();
                                  }
                                }}
                                placeholder="Add image URL (https://images.unsplash.com/...)"
                                className={styles.galleryUrlInputField}
                              />
                              <button
                                type="button"
                                className={styles.smallAddBtn}
                                onClick={handleAddGalleryUrl}
                              >
                                + Add URL
                              </button>
                            </div>
                            <div className={styles.galleryOrDivider}>OR</div>
                            <div className={styles.galleryUploadBtnWrap}>
                              <button
                                type="button"
                                className={styles.galleryUploadBtn}
                                onClick={() => {
                                  setReplacingGalleryIndex(null);
                                  galleryFileInputRef.current?.click();
                                }}
                              >
                                <UploadCloud size={14} /> Upload from Device
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* STEP 3: DELIVERABLES & TECH STACK */}
                {modalTab === "features" && (
                  <div className={styles.tabPane}>
                    {/* Deliverables Features */}
                    <div className={styles.sectionDividerBox}>
                      <h4 className={styles.sectionDividerTitle}>
                        <CheckCircle2 size={14} />
                        <span>Key Deliverables &amp; Core Features</span>
                      </h4>

                      <div className={styles.chipsRow}>
                        {features.map((feat, idx) => (
                          <span key={idx} className={styles.chip}>
                            <Check size={12} className={styles.chipCheck} />
                            <span>{feat}</span>
                            <button
                              type="button"
                              className={styles.chipDel}
                              onClick={() => setFeatures(features.filter((_, i) => i !== idx))}
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
                          placeholder="Add deliverable (e.g. High Concurrency WebSockets)"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              if (newFeature.trim() && !features.includes(newFeature.trim())) {
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
                            if (newFeature.trim() && !features.includes(newFeature.trim())) {
                              setFeatures([...features, newFeature.trim()]);
                              setNewFeature("");
                            }
                          }}
                        >
                          Add Feature
                        </button>
                      </div>
                    </div>

                    {/* Tech Stack */}
                    <div className={styles.sectionDividerBox}>
                      <h4 className={styles.sectionDividerTitle}>
                        <Zap size={14} />
                        <span>Technologies &amp; Frameworks</span>
                      </h4>

                      <div className={styles.chipsRow}>
                        {techStack.map((tech, idx) => (
                          <span key={idx} className={styles.chip}>
                            <span>{tech}</span>
                            <button
                              type="button"
                              className={styles.chipDel}
                              onClick={() => setTechStack(techStack.filter((_, i) => i !== idx))}
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
                          placeholder="Add technology (e.g. Next.js, PostgreSQL)"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              if (newTech.trim() && !techStack.includes(newTech.trim())) {
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
                            if (newTech.trim() && !techStack.includes(newTech.trim())) {
                              setTechStack([...techStack, newTech.trim()]);
                              setNewTech("");
                            }
                          }}
                        >
                          Add Tech
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 4: 6-STEP WORKFLOW */}
                {modalTab === "process" && (
                  <div className={styles.tabPane}>
                    <div className={styles.sectionDividerBox}>
                      <h4 className={styles.sectionDividerTitle}>
                        <Clock size={14} />
                        <span>Structured 6-Step Engineering Workflow</span>
                      </h4>

                      <div className={styles.stepsList}>
                        {processSteps.map((step, idx) => (
                          <div key={idx} className={styles.stepCard}>
                            <div className={styles.stepHeaderRow}>
                              <span className={styles.stepNumBadge}>Step {step.step || `0${idx + 1}`}</span>
                              <button
                                type="button"
                                className={styles.removeStepBtn}
                                onClick={() => setProcessSteps(processSteps.filter((_, i) => i !== idx))}
                              >
                                <Trash2 size={13} /> Remove Step
                              </button>
                            </div>
                            <input
                              type="text"
                              value={step.title}
                              onChange={(e) => {
                                const copy = [...processSteps];
                                copy[idx] = { ...copy[idx], title: e.target.value };
                                setProcessSteps(copy);
                              }}
                              placeholder="Step title (e.g. Discovery & Requirements)"
                            />
                            <textarea
                              rows={2}
                              value={step.description}
                              onChange={(e) => {
                                const copy = [...processSteps];
                                copy[idx] = { ...copy[idx], description: e.target.value };
                                setProcessSteps(copy);
                              }}
                              placeholder="Step description..."
                            />
                          </div>
                        ))}
                      </div>

                      {processSteps.length < 6 && (
                        <button
                          type="button"
                          className={styles.addStepBtn}
                          onClick={() =>
                            setProcessSteps([
                              ...processSteps,
                              {
                                step: `0${processSteps.length + 1}`,
                                title: "New Workflow Milestone",
                                description: "Description of milestone deliverables.",
                              },
                            ])
                          }
                        >
                          <Plus size={14} /> Add Workflow Step
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* STEP 5: BENEFITS & FAQS */}
                {modalTab === "benefits" && (
                  <div className={styles.tabPane}>
                    {/* Benefits Section */}
                    <div className={styles.sectionDividerBox}>
                      <h4 className={styles.sectionDividerTitle}>
                        <Sparkles size={14} />
                        <span>Quantified Benefits &amp; Metrics</span>
                      </h4>

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
                                placeholder="Benefit title (e.g. Sub-Second TTFB)"
                              />
                              <input
                                type="text"
                                value={b.metric || ""}
                                onChange={(e) => {
                                  const copy = [...benefits];
                                  copy[idx] = { ...copy[idx], metric: e.target.value };
                                  setBenefits(copy);
                                }}
                                placeholder="Metric highlight (e.g. < 400ms)"
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
                              placeholder="Description..."
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
                            { title: "High Reliability", description: "Engineered for 99.99% uptime.", metric: "99.99% SLA" },
                          ])
                        }
                      >
                        <Plus size={14} /> Add Benefit
                      </button>
                    </div>

                    {/* FAQs Section */}
                    <div className={styles.sectionDividerBox}>
                      <h4 className={styles.sectionDividerTitle}>
                        <HelpCircle size={14} />
                        <span>Frequently Asked Questions</span>
                      </h4>

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
                            { question: "How do we get started?", answer: "Schedule an architecture discovery session with our engineering team." },
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
                      onClick={handleSaveService}
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
