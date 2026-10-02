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
  Calendar,
  MapPin,
  Clock,
  Plus,
  Trash2,
  Edit2,
  Star,
  Image as ImageIcon,
  Layers,
  Sparkles,
  CheckCircle,
  CheckCircle2,
  ExternalLink,
  X,
  AlertCircle,
  AlertTriangle,
  Loader2,
  Filter,
  ChevronRight,
  ChevronLeft,
  UploadCloud,
  FileCheck,
  RefreshCw,
  Users,
  Link as LinkIcon,
  Tag,
  ArrowUp,
  ArrowDown,
  Globe,
  SlidersHorizontal,
  FolderPlus,
  Save,
  Check,
  Eye,
  EyeOff,
  Search,
  ChevronDown,
} from "lucide-react";
import {
  type CompanyEvent,
  type EventGalleryItem,
  type EventInput,
  type GalleryItemInput,
  type EventStatus,
  type EventCategoryItem,
  type EventCategoryInput,
  EVENT_STATUSES,
  slugifyEvent,
  slugifyEventCategory,
  validateEvent,
  validateEventCategoryInput,
} from "@/lib/events.shared";
import {
  saveEventFn,
  deleteEventFn,
  saveGalleryItemFn,
  deleteGalleryItemFn,
  getEventCategoriesFn,
  saveEventCategoryFn,
  deleteEventCategoryFn,
} from "@/lib/events.functions";
import styles from "./AdminEvents.module.css";

interface AdminEventsProps {
  events: CompanyEvent[];
  gallery: EventGalleryItem[];
  categoryItems?: EventCategoryItem[];
  categoryCounts?: Record<string, number>;
  onRefresh: () => void;
}

type EventModalTab = "basic" | "details" | "media" | "publish";

const EVENT_MODAL_STEPS: { id: EventModalTab; label: string; num: string }[] = [
  { id: "basic", label: "1. Basic Info & Schedule", num: "01" },
  { id: "details", label: "2. Description & Highlights", num: "02" },
  { id: "media", label: "3. Cover & Visual Gallery", num: "03" },
  { id: "publish", label: "4. Registration & Publishing", num: "04" },
];

const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/jpg", "image/webp"];

/**
 * Optimizes and downscales uploaded image files using an off-screen HTML5 Canvas
 * to keep payload sizes small (< 150KB), avoiding Express body-size limit rejections and timeouts.
 */
function compressImageToDataUrl(file: File, maxDim = 1280, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read image file."));
    reader.onload = (e) => {
      const src = e.target?.result as string;
      if (!src) {
        reject(new Error("Empty image file data."));
        return;
      }
      const img = new Image();
      img.onerror = () => resolve(src);
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(src);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const mime = file.type === "image/png" ? "image/png" : "image/jpeg";
        const compressed = canvas.toDataURL(mime, quality);
        resolve(compressed);
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  });
}

export function AdminEvents({
  events,
  gallery,
  categoryItems: initialCategoryItems,
  categoryCounts: initialCategoryCounts,
  onRefresh,
}: AdminEventsProps) {
  const saveEvent = saveEventFn;
  const deleteEvent = deleteEventFn;
  const saveGallery = saveGalleryItemFn;
  const deleteGallery = deleteGalleryItemFn;

  const [activeTab, setActiveTab] = useState<"events" | "gallery">("events");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Dropdown Popover States
  const [isCatDropdownOpen, setIsCatDropdownOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const catDropdownRef = useRef<HTMLDivElement>(null);
  const statusDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (catDropdownRef.current && !catDropdownRef.current.contains(e.target as Node)) {
        setIsCatDropdownOpen(false);
      }
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(e.target as Node)) {
        setIsStatusDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const pendingEventsMap = useRef<Map<string, CompanyEvent>>(new Map());
  const pendingGalleryMap = useRef<Map<string, EventGalleryItem>>(new Map());

  const [localEvents, setLocalEvents] = useState<CompanyEvent[]>(() => events || []);
  const [localGallery, setLocalGallery] = useState<EventGalleryItem[]>(() => gallery || []);

  useEffect(() => {
    setLocalEvents((prev) => {
      const incoming = Array.isArray(events) ? events : [];
      const incomingIds = new Set(incoming.map((e) => e.id));
      const merged = [...incoming];
      pendingEventsMap.current.forEach((item, id) => {
        if (!incomingIds.has(id)) {
          merged.unshift(item);
        }
      });
      return merged;
    });
  }, [events]);

  useEffect(() => {
    setLocalGallery((prev) => {
      const incoming = Array.isArray(gallery) ? gallery : [];
      const incomingIds = new Set(incoming.map((g) => g.id));
      const merged = [...incoming];
      pendingGalleryMap.current.forEach((item, id) => {
        if (!incomingIds.has(id)) {
          merged.unshift(item);
        }
      });
      return merged;
    });
  }, [gallery]);

  // Dynamic Categories State
  const [categoryList, setCategoryList] = useState<EventCategoryItem[]>(() => {
    if (initialCategoryItems && Array.isArray(initialCategoryItems)) {
      return initialCategoryItems;
    }
    return [];
  });

  // Load latest categories from store
  const refreshCategories = useCallback(async () => {
    try {
      const res = await getEventCategoriesFn();
      if (res && Array.isArray(res.categories)) {
        setCategoryList(res.categories);
      }
    } catch (err) {
      console.warn("Failed to load event categories", err);
    }
  }, []);

  useEffect(() => {
    refreshCategories();
  }, [refreshCategories, localEvents]);

  useEffect(() => {
    if (initialCategoryItems && Array.isArray(initialCategoryItems)) {
      setCategoryList(initialCategoryItems);
    }
  }, [initialCategoryItems]);

  // Compute category event counts dynamically
  const categoryEventCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    localEvents.forEach((ev) => {
      const cat = ev.category?.trim();
      if (cat) {
        counts[cat] = (counts[cat] || 0) + 1;
        counts[cat.toLowerCase()] = (counts[cat.toLowerCase()] || 0) + 1;
      }
    });
    return counts;
  }, [localEvents]);

  // Compute category gallery counts dynamically
  const categoryGalleryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    localGallery.forEach((g) => {
      const cat = g.category?.trim();
      if (cat) {
        counts[cat] = (counts[cat] || 0) + 1;
        counts[cat.toLowerCase()] = (counts[cat.toLowerCase()] || 0) + 1;
      }
    });
    return counts;
  }, [localGallery]);

  // Active category items for filter pills & event selector
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
  const [eventDeleteConfirm, setEventDeleteConfirm] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [galleryDeleteConfirm, setGalleryDeleteConfirm] = useState<{
    id: string;
    title: string;
    imageUrl?: string;
    category?: string;
    caption?: string;
  } | null>(null);

  // Global success notification banner
  const [successNotification, setSuccessNotification] = useState<string | null>(null);

  useEffect(() => {
    if (successNotification) {
      const timer = setTimeout(() => {
        setSuccessNotification(null);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [successNotification]);

  // Event modal state
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CompanyEvent | null>(null);
  const [modalTab, setModalTab] = useState<EventModalTab>("basic");
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Event form fields
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("06:00 PM IST");
  const [endTime, setEndTime] = useState("09:00 PM IST");
  const [location, setLocation] = useState("");
  const [venueDetails, setVenueDetails] = useState("");
  const [mode, setMode] = useState<"offline" | "online" | "hybrid">("offline");
  const [status, setStatus] = useState<EventStatus>("upcoming");
  const [category, setCategory] = useState<string>("Product Launch");
  const [description, setDescription] = useState("");
  const [fullDescription, setFullDescription] = useState("");

  // Cover Image State
  const [coverSourceType, setCoverSourceType] = useState<"upload" | "url">("upload");
  const [coverImage, setCoverImage] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [coverUploadProgress, setCoverUploadProgress] = useState(0);
  const [coverError, setCoverError] = useState<string | null>(null);
  const [isCoverDragOver, setIsCoverDragOver] = useState(false);
  const coverFileInputRef = useRef<HTMLInputElement>(null);

  // Gallery Multiple Images State
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [newGalleryUrl, setNewGalleryUrl] = useState("");
  const [isGalleryDragOver, setIsGalleryDragOver] = useState(false);
  const galleryFileInputRef = useRef<HTMLInputElement>(null);

  // Highlights & Publishing
  const [isFeatured, setIsFeatured] = useState(false);
  const [attendeesCount, setAttendeesCount] = useState<number | "">("");
  const [registrationUrl, setRegistrationUrl] = useState("");
  const [highlights, setHighlights] = useState<string[]>([]);
  const [newHighlight, setNewHighlight] = useState("");

  // Standalone Gallery Item modal state
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [editingGalItem, setEditingGalItem] = useState<EventGalleryItem | null>(null);
  const [galTitle, setGalTitle] = useState("");
  const [galCaption, setGalCaption] = useState("");
  const [galImage, setGalImage] = useState("");
  const [galCategory, setGalCategory] = useState("Interfaces");
  const [galEventId, setGalEventId] = useState("");
  const [galAspect, setGalAspect] = useState<"normal" | "tall" | "wide">("normal");
  const [galFile, setGalFile] = useState<File | null>(null);
  const [galPreviewUrl, setGalPreviewUrl] = useState<string | null>(null);
  const [galSourceType, setGalSourceType] = useState<"upload" | "url">("upload");
  const [galFormError, setGalFormError] = useState<string | null>(null);
  const standaloneGalInputRef = useRef<HTMLInputElement>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    if (showEventModal && modalTab && tabRefs.current[modalTab]) {
      tabRefs.current[modalTab]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "nearest",
      });
    }
  }, [modalTab, showEventModal]);

  // Body Lock & ESC Key Listener
  useEffect(() => {
    if (
      !showEventModal &&
      !showGalleryModal &&
      !showCatModal &&
      !eventDeleteConfirm &&
      !galleryDeleteConfirm
    )
      return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (eventDeleteConfirm) {
          setEventDeleteConfirm(null);
        } else if (galleryDeleteConfirm) {
          setGalleryDeleteConfirm(null);
        } else if (showCatModal) {
          setShowCatModal(false);
        } else {
          setShowEventModal(false);
          setShowGalleryModal(false);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [showEventModal, showGalleryModal, showCatModal, eventDeleteConfirm, galleryDeleteConfirm]);

  // CATEGORY TAXONOMY HANDLERS
  const handleOpenCatModal = (catToEdit?: EventCategoryItem) => {
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

    const input: EventCategoryInput = {
      id: editingCatId || undefined,
      name: catName.trim(),
      slug: catSlug.trim() || slugifyEventCategory(catName),
      description: catDescription.trim() || undefined,
      status: catStatus,
      order_index: Number(catOrderIndex) || categoryList.length + 1,
    };

    const validation = validateEventCategoryInput(input);
    if (!validation.valid) {
      setCatFormError(validation.error || "Please enter a valid category name.");
      return;
    }

    startTransition(async () => {
      try {
        const res = await saveEventCategoryFn({ data: input });
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

  const handleToggleCategoryStatus = (cat: EventCategoryItem) => {
    const nextStatus = cat.status === "active" ? "inactive" : "active";
    startTransition(async () => {
      try {
        const res = await saveEventCategoryFn({
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

  const handleDeleteCategoryClick = (cat: EventCategoryItem) => {
    const count =
      activeTab === "gallery"
        ? categoryGalleryCounts[cat.name.toLowerCase()] || 0
        : categoryEventCounts[cat.name.toLowerCase()] || 0;
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
        const res = await deleteEventCategoryFn({ data: { id: targetId } });
        if (res.success) {
          setCatDeleteConfirm(null);
          setCatSuccessMsg(`Category removed successfully.`);
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

  // EVENT CRUD HANDLERS
  const openCreateEvent = () => {
    setEditingEvent(null);
    setTitle("");
    setSlug("");
    setDate(new Date().toISOString().slice(0, 10));
    setStartTime("06:00 PM IST");
    setEndTime("09:00 PM IST");
    setLocation("Grand Auditorium, New Delhi");
    setVenueDetails("Sector 62, Innovation Arena");
    setMode("offline");
    setStatus("upcoming");
    const defaultCat = activeCategories[0]?.name || "Product Launch";
    setCategory(defaultCat);
    setDescription("");
    setFullDescription("");
    setCoverSourceType("upload");
    setCoverImage("https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80");
    setCoverFile(null);
    setCoverPreviewUrl("https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80");
    setCoverError(null);
    setGalleryImages([
      "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80",
    ]);
    setIsFeatured(false);
    setAttendeesCount(500);
    setRegistrationUrl("https://dimisi.tech/contact");
    setHighlights([
      "Live keynote and product demonstration by core architecture leads",
      "Interactive attendee hands-on demo pods and hardware benches",
      "Live debate sphere and real-time voting leaderboard",
    ]);
    setModalTab("basic");
    setFormError(null);
    setFieldErrors({});
    setShowEventModal(true);
  };

  const openEditEvent = (ev: CompanyEvent) => {
    setEditingEvent(ev);
    setTitle(ev.title);
    setSlug(ev.slug);
    setDate(ev.date);
    setStartTime(ev.start_time || "06:00 PM IST");
    setEndTime(ev.end_time || "09:00 PM IST");
    setLocation(ev.location);
    setVenueDetails(ev.venue_details || "");
    setMode(ev.mode || "offline");
    setStatus(ev.status);
    setCategory(ev.category);
    setDescription(ev.description);
    setFullDescription(ev.full_description);
    setCoverSourceType("upload");
    setCoverImage(ev.cover_image);
    setCoverFile(null);
    setCoverPreviewUrl(ev.cover_image);
    setCoverError(null);
    setGalleryImages(ev.images || []);
    setIsFeatured(ev.is_featured);
    setAttendeesCount(ev.attendees_count || "");
    setRegistrationUrl(ev.registration_url || "");
    setHighlights(ev.highlights || []);
    setModalTab("basic");
    setFormError(null);
    setFieldErrors({});
    setShowEventModal(true);
  };

  // Cover Image File Processing
  const processCoverFile = useCallback((file: File) => {
    setCoverError(null);

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setCoverError("Unsupported image format. Use JPG, JPEG, PNG, or WEBP.");
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setCoverError("Image is too large. Maximum allowed size is 10 MB.");
      return;
    }

    setCoverFile(file);
    setIsUploadingCover(true);
    setCoverUploadProgress(30);

    compressImageToDataUrl(file, 1400, 0.82)
      .then((dataUrl) => {
        setCoverPreviewUrl(dataUrl);
        setCoverImage(dataUrl);
        setCoverUploadProgress(100);
        setTimeout(() => setIsUploadingCover(false), 200);
      })
      .catch(() => {
        setCoverError("Failed to read image file. Please try again.");
        setIsUploadingCover(false);
      });
  }, []);

  const handleCoverDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsCoverDragOver(true);
  };

  const handleCoverDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsCoverDragOver(false);
  };

  const handleCoverDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsCoverDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processCoverFile(e.dataTransfer.files[0]);
    }
  };

  // Batch Multi-Image Gallery File Processing
  const processGalleryFiles = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);

    fileArray.forEach((file) => {
      if (ALLOWED_IMAGE_TYPES.includes(file.type) && file.size <= MAX_IMAGE_SIZE_BYTES) {
        compressImageToDataUrl(file, 1280, 0.82)
          .then((dataUrl) => {
            if (dataUrl) {
              setGalleryImages((prev) => [...prev, dataUrl]);
            }
          })
          .catch(() => {});
      }
    });
  }, []);

  const handleGalleryDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsGalleryDragOver(true);
  };

  const handleGalleryDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsGalleryDragOver(false);
  };

  const handleGalleryDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsGalleryDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processGalleryFiles(e.dataTransfer.files);
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
          if (modalTab === "media") {
            processCoverFile(blob);
          }
          break;
        }
      }
    }
  }, [modalTab, processCoverFile]);

  // Gallery URL Addition
  const handleAddGalleryUrl = () => {
    if (newGalleryUrl.trim()) {
      setGalleryImages((prev) => [...prev, newGalleryUrl.trim()]);
      setNewGalleryUrl("");
    }
  };

  const handleRemoveGalleryImage = (index: number) => {
    setGalleryImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMoveGalleryImage = (index: number, direction: "up" | "down") => {
    setGalleryImages((prev) => {
      const copy = [...prev];
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= copy.length) return prev;
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy;
    });
  };

  // Highlights Manager
  const handleAddHighlight = () => {
    if (newHighlight.trim()) {
      setHighlights((prev) => [...prev, newHighlight.trim()]);
      setNewHighlight("");
    }
  };

  const handleRemoveHighlight = (index: number) => {
    setHighlights((prev) => prev.filter((_, i) => i !== index));
  };

  // Step Navigation & Validation
  const handleNextStep = () => {
    setFormError(null);
    const errors: Record<string, string> = {};

    if (modalTab === "basic") {
      if (!title.trim() || title.trim().length < 3) {
        errors.title = "Event title must be at least 3 characters long.";
      }
      if (!date.trim()) {
        errors.date = "Event date is required.";
      }
      if (!location.trim()) {
        errors.location = "Event location / city is required.";
      }
      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        setFormError("Please complete the required Basic Info & Schedule fields.");
        return;
      }
      setFieldErrors({});
      setModalTab("details");
      return;
    }

    if (modalTab === "details") {
      if (!description.trim() || description.trim().length < 10) {
        errors.description = "Short description must be at least 10 characters.";
        setFieldErrors(errors);
        setFormError("Please provide an event description before proceeding.");
        return;
      }
      setFieldErrors({});
      setModalTab("media");
      return;
    }

    if (modalTab === "media") {
      if (!coverImage.trim() && !coverFile) {
        setCoverError("Primary cover image is required.");
        setFormError("Please select or upload a cover image.");
        return;
      }
      setModalTab("publish");
      return;
    }
  };

  const handlePrevStep = () => {
    setFormError(null);
    if (modalTab === "publish") setModalTab("media");
    else if (modalTab === "media") setModalTab("details");
    else if (modalTab === "details") setModalTab("basic");
  };

  // Save Event
  const handleSaveEvent = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setFormError(null);
    setFieldErrors({});

    const input: EventInput = {
      id: editingEvent?.id,
      title: title.trim(),
      slug: slug.trim() || slugifyEvent(title),
      date: date.trim(),
      start_time: startTime.trim() || undefined,
      end_time: endTime.trim() || undefined,
      location: location.trim(),
      venue_details: venueDetails.trim() || undefined,
      mode,
      status,
      category: category.trim(),
      description: description.trim(),
      full_description: fullDescription.trim() || description.trim(),
      cover_image: coverImage.trim(),
      images: galleryImages.length > 0 ? galleryImages : [coverImage.trim()],
      is_featured: isFeatured,
      attendees_count: attendeesCount ? Number(attendeesCount) : undefined,
      registration_url: registrationUrl.trim() || undefined,
      highlights: highlights.filter(Boolean),
    };

    const validation = validateEvent(input);
    if (!validation.valid) {
      setFormError(validation.error || "Please check the highlighted fields.");
      if (validation.field) {
        setFieldErrors({ [validation.field]: validation.error || "Invalid field." });
        if (validation.field === "title" || validation.field === "date" || validation.field === "location") {
          setModalTab("basic");
        } else if (validation.field === "description") {
          setModalTab("details");
        } else if (validation.field === "cover_image") {
          setModalTab("media");
        }
      }
      return;
    }

    startTransition(async () => {
      try {
        const res = await saveEvent({ data: input });
        if (res.success) {
          if (res.event) {
            const savedEvent = res.event;
            pendingEventsMap.current.set(savedEvent.id, savedEvent);
            setLocalEvents((prev) => {
              const idx = prev.findIndex((e) => e.id === savedEvent.id);
              if (idx >= 0) {
                const next = [...prev];
                next[idx] = savedEvent;
                return next;
              }
              return [savedEvent, ...prev];
            });
          }
          if (!editingEvent) {
            setActiveTab("events");
            setStatusFilter("All");
            setCategoryFilter("All");
            setSearchQuery("");
          }
          setShowEventModal(false);
          setFormError(null);
          if ((res as any).verified !== false) {
            setSuccessNotification(
              editingEvent
                ? `Event "${res.event?.title || title}" updated successfully!`
                : `Event "${res.event?.title || title}" published successfully!`
            );
          } else {
            setSuccessNotification(
              "Event creation request succeeded, but the item could not be confirmed in the database. Please check the server response."
            );
          }
          onRefresh();
        } else {
          setFormError(res.error || "Failed to save event.");
        }
      } catch (err) {
        setFormError(err instanceof Error ? err.message : "Error saving event.");
      }
    });
  };

  const handleDeleteEventClick = (id: string, evTitle: string) => {
    setEventDeleteConfirm({ id, title: evTitle });
  };

  const handleConfirmDeleteEvent = () => {
    if (!eventDeleteConfirm) return;
    const { id, title: evTitle } = eventDeleteConfirm;

    startTransition(async () => {
      try {
        const res = await deleteEvent({ data: { id } });
        if (res.success) {
          pendingEventsMap.current.delete(id);
          setLocalEvents((prev) => prev.filter((e) => e.id !== id));
          setSuccessNotification(`Company event "${evTitle}" removed successfully.`);
          setEventDeleteConfirm(null);
        } else {
          setSuccessNotification(res.error || `Failed to delete event "${evTitle}".`);
        }
        onRefresh();
      } catch (err) {
        setSuccessNotification(err instanceof Error ? err.message : `Failed to delete event "${evTitle}".`);
      }
    });
  };

  // STANDALONE GALLERY ACTIONS
  const openCreateGalleryItem = () => {
    setEditingGalItem(null);
    setGalTitle("");
    setGalCaption("");
    const defaultCat = activeCategories[0]?.name || categoryList[0]?.name || "General";
    setGalCategory(defaultCat);
    setGalEventId("");
    setGalAspect("normal");
    setGalFile(null);
    setGalPreviewUrl("https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80");
    setGalImage("https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80");
    setGalSourceType("upload");
    setGalFormError(null);
    setShowGalleryModal(true);
  };

  const handleSaveGalleryItem = (e: React.FormEvent) => {
    e.preventDefault();
    setGalFormError(null);

    const effectiveTitle = galTitle.trim() || `${galCategory || "DIMISI"} Photo`;
    const effectiveCaption = galCaption.trim() || `${effectiveTitle} Archive`;
    const effectiveImage = galImage.trim() || galPreviewUrl || DEFAULT_EVENT_FALLBACK_IMAGE;

    if (!effectiveImage) {
      setGalFormError("Please select or upload a photo image.");
      return;
    }

    const input: GalleryItemInput = {
      id: editingGalItem?.id,
      title: effectiveTitle,
      caption: effectiveCaption,
      image_url: effectiveImage,
      category: galCategory || activeCategories[0]?.name || categoryList[0]?.name || "General",
      event_id: galEventId || undefined,
      aspect_ratio: galAspect,
      file: galFile || undefined,
    };

    startTransition(async () => {
      try {
        const res = await saveGallery({ data: input });
        if (res.success) {
          if (res.item) {
            const savedItem = res.item;
            pendingGalleryMap.current.set(savedItem.id, savedItem);
            setLocalGallery((prev) => {
              const idx = prev.findIndex((g) => g.id === savedItem.id);
              if (idx >= 0) {
                const next = [...prev];
                next[idx] = savedItem;
                return next;
              }
              return [savedItem, ...prev];
            });
          }
          if (!editingGalItem) {
            setActiveTab("gallery");
            setStatusFilter("All");
            setCategoryFilter("All");
            setSearchQuery("");
          }
          setShowGalleryModal(false);
          setGalFormError(null);
          if ((res as any).verified !== false) {
            setSuccessNotification(
              editingGalItem
                ? "Photo updated in gallery successfully!"
                : "Photo added to gallery successfully!"
            );
          } else {
            setSuccessNotification(
              "Photo creation request succeeded, but the item could not be confirmed in the database. Please check the server response."
            );
          }
          onRefresh();
        } else {
          setGalFormError(res.error || "Failed to add photo to gallery.");
        }
      } catch (err) {
        setGalFormError(err instanceof Error ? err.message : "Failed to add photo to gallery.");
      }
    });
  };

  const handleDeleteGalleryClick = (item: EventGalleryItem) => {
    setGalleryDeleteConfirm({
      id: item.id,
      title: item.title,
      imageUrl: item.image_url,
      category: item.category,
      caption: item.caption,
    });
  };

  const handleConfirmDeleteGallery = () => {
    if (!galleryDeleteConfirm) return;
    const { id, title: gTitle } = galleryDeleteConfirm;

    startTransition(async () => {
      try {
        const res = await deleteGallery({ data: { id } });
        if (res.success) {
          pendingGalleryMap.current.delete(id);
          setLocalGallery((prev) => prev.filter((g) => g.id !== id));
          setSuccessNotification(`Photo "${gTitle}" removed from gallery successfully.`);
          setGalleryDeleteConfirm(null);
        } else {
          setSuccessNotification(res.error || "Failed to remove photo.");
        }
        onRefresh();
      } catch (err) {
        setSuccessNotification(err instanceof Error ? err.message : "Failed to remove photo.");
      }
    });
  };

  // Filtered Events List
  const filteredEvents = useMemo(() => {
    return localEvents.filter((ev) => {
      // Status filter
      if (statusFilter !== "All" && (ev.status || "").toLowerCase() !== statusFilter.toLowerCase()) {
        return false;
      }
      // Category filter
      if (
        categoryFilter !== "All" &&
        (ev.category || "").trim().toLowerCase() !== categoryFilter.trim().toLowerCase()
      ) {
        return false;
      }
      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = (ev.title || "").toLowerCase().includes(q);
        const matchLoc = (ev.location || "").toLowerCase().includes(q);
        const matchSlug = (ev.slug || "").toLowerCase().includes(q);
        const matchDesc = (ev.description || "").toLowerCase().includes(q);
        if (!matchTitle && !matchLoc && !matchSlug && !matchDesc) return false;
      }
      return true;
    });
  }, [localEvents, statusFilter, categoryFilter, searchQuery]);

  return (
    <div className={styles.wrapper}>
      {/* Top Header Row */}
      <div className={styles.headerRow}>
        <div>
          <h2 className={styles.title}>Company Events &amp; Gallery</h2>
          <p className={styles.subtitle}>
            Manage public events, launches, summits, retreat galleries, and live registration portals.
          </p>
        </div>

        <div className={styles.actions}>
          <div className={styles.sectionTabs}>
            <button
              type="button"
              className={[
                styles.sectionTabBtn,
                activeTab === "events" ? styles.sectionTabBtnActive : "",
              ].join(" ")}
              onClick={() => setActiveTab("events")}
            >
              <Calendar size={14} />
              <span>Events ({localEvents.length})</span>
            </button>
            <button
              type="button"
              className={[
                styles.sectionTabBtn,
                activeTab === "gallery" ? styles.sectionTabBtnActive : "",
              ].join(" ")}
              onClick={() => setActiveTab("gallery")}
            >
              <ImageIcon size={14} />
              <span>Photo Gallery ({localGallery.length})</span>
            </button>
          </div>

          {activeTab === "events" ? (
            <button
              type="button"
              className={styles.manageCatBtn}
              onClick={() => handleOpenCatModal()}
              title="Manage Dynamic Event Categories & Taxonomies"
            >
              <SlidersHorizontal size={15} />
              <span>Manage Event Categories ({categoryList.length})</span>
            </button>
          ) : (
            <button
              type="button"
              className={styles.manageCatBtn}
              onClick={() => handleOpenCatModal()}
              title="Manage Dynamic Gallery Categories & Taxonomies"
            >
              <SlidersHorizontal size={15} />
              <span>Manage Gallery Categories ({categoryList.length})</span>
            </button>
          )}

          {activeTab === "events" ? (
            <button type="button" className={styles.createBtn} onClick={openCreateEvent}>
              <Plus size={16} />
              <span>Create New Company Event</span>
            </button>
          ) : (
            <button type="button" className={styles.createBtn} onClick={openCreateGalleryItem}>
              <Plus size={16} />
              <span>Add Gallery Photo</span>
            </button>
          )}
        </div>
      </div>

      {/* Top Global Success / Info Notification */}
      {successNotification && (
        <div className={styles.successBanner} role="status">
          <div className={styles.successBannerContent}>
            <CheckCircle2 size={16} />
            <span>{successNotification}</span>
          </div>
          <button
            type="button"
            className={styles.alertCloseBtn}
            onClick={() => setSuccessNotification(null)}
            title="Dismiss notification"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* TAB 1: EVENTS LIST */}
      {activeTab === "events" && (
        <div className={styles.postsSection}>
          {/* Filters Bar: Search + Status Dropdown + Category Dropdown */}
          <div className={styles.filtersBar}>
            <div className={styles.secondaryFiltersRow}>
              {/* Search Box */}
              <div className={styles.searchBox}>
                <Search size={15} className={styles.searchIcon} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search events by title or location..."
                  className={styles.searchInput}
                />
                {searchQuery && (
                  <button
                    type="button"
                    className={styles.clearSearchBtn}
                    onClick={() => setSearchQuery("")}
                    title="Clear search"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              {/* Right Filter Controls: Status Dropdown + Category Dropdown */}
              <div className={styles.filterRightActions}>
                {(categoryFilter !== "All" || statusFilter !== "All" || searchQuery) && (
                  <button
                    type="button"
                    className={styles.resetFiltersBtn}
                    onClick={() => {
                      setCategoryFilter("All");
                      setStatusFilter("All");
                      setSearchQuery("");
                    }}
                  >
                    Reset Filters
                  </button>
                )}

                {/* Status Dropdown */}
                <div className={styles.statusDropdownWrapper} ref={statusDropdownRef}>
                  <button
                    type="button"
                    className={[
                      styles.statusDropdownTrigger,
                      statusFilter !== "All" || isStatusDropdownOpen
                        ? styles.statusDropdownTriggerActive
                        : "",
                    ].join(" ")}
                    onClick={() => setIsStatusDropdownOpen((prev) => !prev)}
                    aria-expanded={isStatusDropdownOpen}
                    aria-haspopup="listbox"
                    aria-label="Filter events by status"
                  >
                    <div className={styles.catDropdownTriggerLeft}>
                      <Eye size={13} className={styles.dropdownIcon} />
                      <span className={styles.catDropdownTriggerText}>
                        {statusFilter === "All"
                          ? "All Status"
                          : statusFilter === "upcoming"
                            ? "Upcoming"
                            : statusFilter === "ongoing"
                              ? "Live Now"
                              : statusFilter === "completed"
                                ? "Concluded"
                                : statusFilter}
                      </span>
                    </div>
                    <ChevronDown
                      size={14}
                      className={[
                        styles.catDropdownChevron,
                        isStatusDropdownOpen ? styles.catDropdownChevronOpen : "",
                      ].join(" ")}
                    />
                  </button>

                  {isStatusDropdownOpen && (
                    <div className={styles.statusDropdownMenu} role="listbox">
                      <button
                        type="button"
                        className={[
                          styles.catDropdownItem,
                          statusFilter === "All" ? styles.catDropdownItemActive : "",
                        ].join(" ")}
                        onClick={() => {
                          setStatusFilter("All");
                          setIsStatusDropdownOpen(false);
                        }}
                      >
                        <div className={styles.catDropdownItemLeft}>
                          {statusFilter === "All" ? (
                            <Check size={14} className={styles.catDropdownCheck} />
                          ) : (
                            <span className={styles.catDropdownCheckPlaceholder} />
                          )}
                          <span>All Status</span>
                        </div>
                        <span className={styles.catDropdownItemCount}>({localEvents.length})</span>
                      </button>

                      <div className={styles.catDropdownDivider} />

                      {[
                        { id: "upcoming", label: "Upcoming" },
                        { id: "ongoing", label: "Live Now" },
                        { id: "completed", label: "Concluded" },
                      ].map((st) => {
                        const count = localEvents.filter((e) => e.status === st.id).length;
                        const isSelected = statusFilter.toLowerCase() === st.id.toLowerCase();
                        return (
                          <button
                            key={st.id}
                            type="button"
                            className={[
                              styles.catDropdownItem,
                              isSelected ? styles.catDropdownItemActive : "",
                            ].join(" ")}
                            onClick={() => {
                              setStatusFilter(st.id);
                              setIsStatusDropdownOpen(false);
                            }}
                          >
                            <div className={styles.catDropdownItemLeft}>
                              {isSelected ? (
                                <Check size={14} className={styles.catDropdownCheck} />
                              ) : (
                                <span className={styles.catDropdownCheckPlaceholder} />
                              )}
                              <span>{st.label}</span>
                            </div>
                            <span className={styles.catDropdownItemCount}>({count})</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Category Dropdown */}
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
                    aria-label="Filter events by category"
                  >
                    <div className={styles.catDropdownTriggerLeft}>
                      {categoryFilter !== "All" ? (
                        <Tag size={13} className={styles.dropdownIcon} />
                      ) : (
                        <SlidersHorizontal size={13} className={styles.dropdownIcon} />
                      )}
                      <span className={styles.catDropdownTriggerText}>
                        {categoryFilter === "All" ? "All Categories" : categoryFilter}
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
                    <div className={styles.catDropdownMenu} role="listbox">
                      <button
                        type="button"
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
                        <span className={styles.catDropdownItemCount}>({localEvents.length})</span>
                      </button>

                      <div className={styles.catDropdownDivider} />

                      {activeCategories.map((c) => {
                        const count = categoryEventCounts[c.name.toLowerCase()] || 0;
                        const isSelected = categoryFilter.toLowerCase() === c.name.toLowerCase();
                        return (
                          <button
                            key={c.id}
                            type="button"
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
                                <Check size={14} className={styles.catDropdownCheck} />
                              ) : (
                                <span className={styles.catDropdownCheckPlaceholder} />
                              )}
                              <span>{c.name}</span>
                            </div>
                            <span className={styles.catDropdownItemCount}>({count})</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Table Container Card */}
          <div className={styles.tableCard}>
            <div className={styles.tableScrollContainer}>
              <table className={styles.table}>
                <colgroup>
                  <col style={{ width: "90px" }} />
                  <col style={{ width: "320px" }} />
                  <col style={{ width: "160px" }} />
                  <col style={{ width: "170px" }} />
                  <col style={{ width: "220px" }} />
                  <col style={{ width: "130px" }} />
                  <col style={{ width: "150px" }} />
                </colgroup>
                <thead>
                  <tr>
                    <th className={styles.thCenter}>Cover</th>
                    <th>Event Title</th>
                    <th>Category</th>
                    <th>Date &amp; Timing</th>
                    <th>Location &amp; Venue</th>
                    <th className={styles.thCenter}>Status</th>
                    <th className={styles.thCenter}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEvents.length === 0 ? (
                    <tr>
                      <td colSpan={7} className={styles.emptyTableTd}>
                        <div className={styles.emptyStateContainer}>
                          <Calendar size={32} className={styles.emptyIcon} />
                          <h4>No company events found</h4>
                          <p>
                            {searchQuery || categoryFilter !== "All" || statusFilter !== "All"
                              ? "Try adjusting your filter criteria or search query."
                              : "Get started by creating your first company event."}
                          </p>
                          {(searchQuery || categoryFilter !== "All" || statusFilter !== "All") && (
                            <button
                              type="button"
                              className={styles.resetFiltersBtn}
                              onClick={() => {
                                setSearchQuery("");
                                setCategoryFilter("All");
                                setStatusFilter("All");
                              }}
                            >
                              Reset All Filters
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredEvents.map((ev) => (
                      <tr key={ev.id}>
                        {/* 1. Cover Thumbnail */}
                        <td className={styles.coverCell}>
                          <img
                            src={ev.cover_image}
                            alt={ev.title}
                            className={styles.thumbImg}
                            loading="lazy"
                            decoding="async"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = DEFAULT_EVENT_FALLBACK_IMAGE;
                            }}
                          />
                        </td>

                        {/* 2. Event Title */}
                        <td>
                          <div className={styles.titleCol}>
                            <span className={styles.postTitle}>{ev.title}</span>
                            {ev.is_featured && (
                              <div className={styles.spotlightRow}>
                                <span className={styles.featuredSpotlightBadge}>
                                  <Star size={10} style={{ fill: "currentColor" }} />
                                  <span>SPOTLIGHT</span>
                                </span>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* 3. Category Badge */}
                        <td>
                          <span className={styles.categoryBadge}>
                            <Tag size={12} className={styles.badgeTagIcon} />
                            <span>{ev.category}</span>
                          </span>
                        </td>

                        {/* 4. Date & Timing */}
                        <td>
                          <div className={styles.timeCol}>
                            <div className={styles.dateRow}>
                              <Calendar size={13} className={styles.dateIcon} />
                              <span className={styles.dateText}>{ev.date}</span>
                            </div>
                            {ev.start_time && (
                              <div className={styles.timeRow}>
                                <Clock size={12} className={styles.clockIcon} />
                                <span className={styles.subTime}>
                                  {ev.start_time}
                                  {ev.end_time ? ` – ${ev.end_time}` : ""}
                                </span>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* 5. Location & Venue */}
                        <td>
                          <div className={styles.locationCell}>
                            <div className={styles.locMain}>
                              <MapPin size={13} className={styles.mapIcon} />
                              <span className={styles.locText}>{ev.location}</span>
                            </div>
                            {ev.venue_details && (
                              <span className={styles.venueSubText}>{ev.venue_details}</span>
                            )}
                          </div>
                        </td>

                        {/* 6. Status */}
                        <td className={styles.thCenter}>
                          <span
                            className={[
                              styles.statusBadge,
                              ev.status === "upcoming"
                                ? styles.statusUpcoming
                                : ev.status === "ongoing"
                                ? styles.statusOngoing
                                : styles.statusCompleted,
                            ].join(" ")}
                          >
                            <span className={styles.statusDot} />
                            <span>
                              {ev.status === "upcoming"
                                ? "Upcoming"
                                : ev.status === "ongoing"
                                ? "Live Now"
                                : "Concluded"}
                            </span>
                          </span>
                        </td>

                        {/* 7. Action Buttons */}
                        <td className={styles.thCenter}>
                          <div className={styles.rowActions}>
                            <button
                              type="button"
                              className={styles.editBtn}
                              onClick={() => openEditEvent(ev)}
                              title="Edit Event"
                            >
                              <Edit2 size={14} />
                            </button>
                            <a
                              href="/events"
                              target="_blank"
                              rel="noreferrer"
                              className={styles.viewBtn}
                              title="View Live Page"
                            >
                              <ExternalLink size={14} />
                            </a>
                            <button
                              type="button"
                              className={styles.delBtn}
                              onClick={() => handleDeleteEventClick(ev.id, ev.title)}
                              title="Delete Event"
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
        </div>
      )}

      {/* TAB 2: GALLERY GRID */}
      {activeTab === "gallery" && (
        localGallery.length === 0 ? (
          <div className={styles.emptyTableTd} style={{ width: "100%", padding: "3rem 1.5rem" }}>
            <div className={styles.emptyStateContainer}>
              <ImageIcon size={36} className={styles.emptyIcon} />
              <h4>No gallery photos found</h4>
              <p>Get started by clicking "Add Gallery Photo" above to upload your first photo.</p>
            </div>
          </div>
        ) : (
          <div className={styles.galleryAdminGrid}>
            {localGallery.map((g) => (
              <div key={g.id} className={styles.galAdminCard}>
                <img
                  src={g.image_url}
                  alt={g.title}
                  className={styles.galAdminThumb}
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = DEFAULT_EVENT_FALLBACK_IMAGE;
                  }}
                />
                <div className={styles.galAdminInfo}>
                  <span className={styles.galCategoryTag}>{g.category}</span>
                  <h5 className={styles.galItemTitle}>{g.title}</h5>
                  <p className={styles.galItemCaption}>{g.caption}</p>
                  <div className={styles.galCardActions}>
                    <button
                      type="button"
                      className={styles.delBtn}
                      onClick={() => handleDeleteGalleryClick(g)}
                      title="Remove Photo"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

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
                  <h3 className={styles.modalTitle}>
                    {activeTab === "gallery"
                      ? "Gallery Category Taxonomy & Topics"
                      : "Event Category Taxonomy & Topics"}
                  </h3>
                  <p className={styles.modalSub}>
                    {activeTab === "gallery"
                      ? "Manage dynamic gallery categories, descriptions, and active filter display states."
                      : "Manage dynamic event categories, descriptions, and active filter display states."}
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
                      ? `Warning: There are currently ${catDeleteConfirm.count} ${activeTab === "gallery" ? "photo(s)" : "event(s)"} tagged with this category. Deleting this category will remove it from the taxonomy and active filters.`
                      : 'Are you sure you want to permanently delete this category?'}
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
                        <Edit2 size={15} /> Edit {activeTab === "gallery" ? "Gallery" : "Event"} Category
                      </>
                    ) : (
                      <>
                        <FolderPlus size={15} /> Create New {activeTab === "gallery" ? "Gallery" : "Event"} Category
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
                          setCatSlug(slugifyEventCategory(e.target.value));
                        }
                      }}
                      placeholder="e.g. AI & Autonomy Summit"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Short Description (Optional)</label>
                    <textarea
                      rows={2}
                      value={catDescription}
                      onChange={(e) => setCatDescription(e.target.value)}
                      placeholder="e.g. Flagship conferences, technical keynotes and live demos..."
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
                        <option value="active">Active (Visible in Filter &amp; {activeTab === "gallery" ? "Gallery" : "Events"})</option>
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

              {/* Right Column: Existing Categories List Table */}
              <div className={styles.catListCard}>
                <div className={styles.catListHeader}>
                  <h4 className={styles.catListTitle}>
                    <span>Configured {activeTab === "gallery" ? "Gallery" : "Event"} Categories</span>
                    <span className={styles.catCountBadge}>{categoryList.length}</span>
                  </h4>
                  <span className={styles.catListSub}>
                    {activeTab === "gallery"
                      ? "Active categories appear in the gallery photo creation and filter views."
                      : "Active categories appear on the public and admin event filter bars."}
                  </span>
                </div>

                <div className={styles.catListScrollContainer}>
                  <table className={styles.catTable}>
                    <thead>
                      <tr>
                        <th style={{ width: "50px" }}>Order</th>
                        <th>Category</th>
                        <th style={{ width: "90px" }}>{activeTab === "gallery" ? "Photos" : "Events"}</th>
                        <th style={{ width: "95px" }}>Status</th>
                        <th style={{ width: "110px", textAlign: "right" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categoryList.length === 0 ? (
                        <tr>
                          <td
                            colSpan={5}
                            style={{
                              textAlign: "center",
                              padding: "2.5rem 1rem",
                              color: "rgba(255, 255, 255, 0.4)",
                              fontSize: "0.85rem",
                            }}
                          >
                            No {activeTab === "gallery" ? "gallery" : "event"} categories found. Create your first category on the left.
                          </td>
                        </tr>
                      ) : (
                        categoryList
                          .sort((a, b) => a.order_index - b.order_index)
                          .map((cat) => {
                            const count =
                              activeTab === "gallery"
                                ? categoryGalleryCounts[cat.name.toLowerCase()] || 0
                                : categoryEventCounts[cat.name.toLowerCase()] || 0;
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
                                  {cat.description && (
                                    <span className={styles.catItemDesc}>
                                      {cat.description}
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td>
                                <span className={styles.catPostCountBadge}>
                                  {count} {activeTab === "gallery" ? (count !== 1 ? "photos" : "photo") : (count !== 1 ? "events" : "event")}
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
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className={styles.modalFooter}>
              <div className={styles.footerLeft}>
                <span className={styles.footerHint}>
                  Categories marked as active are instantly available in event creation and filters.
                </span>
              </div>
              <div className={styles.footerRight}>
                <button
                  type="button"
                  className={styles.saveSubmitBtn}
                  onClick={() => setShowCatModal(false)}
                >
                  Done / Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* APPLICATION-STYLE EVENT CMS MODAL */}
      {showEventModal && (
        <div
          className={styles.modalBackdrop}
          role="dialog"
          aria-modal="true"
          data-lenis-prevent
          onClick={() => setShowEventModal(false)}
        >
          <div
            className={styles.modalContent}
            data-lenis-prevent
            onClick={(e) => e.stopPropagation()}
            onPaste={handlePaste}
          >
            {/* Sticky Header */}
            <div className={styles.modalHeader}>
              <div>
                <h3 className={styles.modalTitle}>
                  {editingEvent ? `Edit Company Event: ${editingEvent.title}` : "Create New Company Event"}
                </h3>
                <p className={styles.modalSub}>
                  Configure event details, media, highlights and RSVP.
                </p>
              </div>
              <button
                type="button"
                className={styles.modalClose}
                onClick={() => setShowEventModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            {/* Sticky Stepper Tabs */}
            <div className={styles.modalTabsBar} role="tablist" aria-label="Event Form Steps" data-lenis-prevent>
              {EVENT_MODAL_STEPS.map((t) => (
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

            {/* Global Error Alert */}
            {formError && (
              <div className={styles.errorAlert} style={{ margin: "0.75rem 1.75rem 0" }}>
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <div style={{ flex: 1, fontSize: "0.82rem" }}>
                  <strong>{formError.includes("logged in") || formError.includes("Unauthorized") ? "Session Expired:" : "Error:"}</strong> {formError}
                  {(formError.includes("logged in") || formError.includes("Unauthorized")) && (
                    <div style={{ marginTop: "0.25rem", fontSize: "0.78rem", color: "#fca5a5" }}>
                      Your admin session cookie has expired after 15 minutes of inactivity. Please refresh the page to sign in again.
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  className={styles.alertCloseBtn}
                  onClick={() => setFormError(null)}
                  title="Dismiss error"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveEvent();
              }}
              className={styles.modalForm}
            >
              {/* Scrollable Container */}
              <div className={styles.modalBodyScroll} data-lenis-prevent>
                {/* STEP 1: BASIC INFO & SCHEDULE */}
                {modalTab === "basic" && (
                  <div className={styles.tabPane}>
                    <div className={styles.formGroup}>
                      <label>Event Title *</label>
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
                          if (!editingEvent) setSlug(slugifyEvent(e.target.value));
                        }}
                        placeholder="e.g. Kalesh App Global Launch 2026"
                      />
                      {fieldErrors.title && (
                        <span className={styles.fieldErrorText}>{fieldErrors.title}</span>
                      )}
                    </div>

                    <div className={styles.formGrid3}>
                      <div className={styles.formGroup}>
                        <div className={styles.labelWithAction}>
                          <label>Category *</label>
                          <button
                            type="button"
                            className={styles.manageCatInlineLink}
                            onClick={() => handleOpenCatModal()}
                            title="Manage Dynamic Categories"
                          >
                            + Manage Categories
                          </button>
                        </div>
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className={styles.selectInput}
                        >
                          {activeCategories.length === 0 && (
                            <option value="">-- No Categories Found (Please Create One First) --</option>
                          )}
                          {activeCategories.map((c) => (
                            <option key={c.id} value={c.name}>
                              {c.name}
                            </option>
                          ))}
                          {category && !activeCategories.some((c) => c.name === category) && (
                            <option value={category}>{category}</option>
                          )}
                        </select>
                      </div>

                      <div className={styles.formGroup}>
                        <label>Event Date *</label>
                        <input
                          type="date"
                          required
                          value={date}
                          className={fieldErrors.date ? styles.inputError : ""}
                          onChange={(e) => {
                            setDate(e.target.value);
                            if (fieldErrors.date) {
                              setFieldErrors((prev) => {
                                const copy = { ...prev };
                                delete copy.date;
                                return copy;
                              });
                            }
                          }}
                        />
                        {fieldErrors.date && (
                          <span className={styles.fieldErrorText}>{fieldErrors.date}</span>
                        )}
                      </div>

                      <div className={styles.formGroup}>
                        <label>Status *</label>
                        <select
                          value={status}
                          onChange={(e) => setStatus(e.target.value as EventStatus)}
                          className={styles.selectInput}
                        >
                          {EVENT_STATUSES.map((st) => (
                            <option key={st.id} value={st.id}>
                              {st.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className={styles.formGrid3}>
                      <div className={styles.formGroup}>
                        <label>Start Timing / Schedule</label>
                        <input
                          type="text"
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                          placeholder="e.g. 06:00 PM IST"
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label>End Timing</label>
                        <input
                          type="text"
                          value={endTime}
                          onChange={(e) => setEndTime(e.target.value)}
                          placeholder="e.g. 09:30 PM IST"
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label>Event Mode</label>
                        <div className={styles.modePills}>
                          {(["offline", "online", "hybrid"] as const).map((m) => (
                            <button
                              key={m}
                              type="button"
                              className={[
                                styles.modeBtn,
                                mode === m ? styles.modeBtnActive : "",
                              ].join(" ")}
                              onClick={() => setMode(m)}
                            >
                              {m.toUpperCase()}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className={styles.formGrid2}>
                      <div className={styles.formGroup}>
                        <label>Location / City *</label>
                        <input
                          type="text"
                          required
                          value={location}
                          className={fieldErrors.location ? styles.inputError : ""}
                          onChange={(e) => {
                            setLocation(e.target.value);
                            if (fieldErrors.location) {
                              setFieldErrors((prev) => {
                                const copy = { ...prev };
                                delete copy.location;
                                return copy;
                              });
                            }
                          }}
                          placeholder="e.g. Grand Auditorium, New Delhi & Online"
                        />
                        {fieldErrors.location && (
                          <span className={styles.fieldErrorText}>{fieldErrors.location}</span>
                        )}
                      </div>

                      <div className={styles.formGroup}>
                        <label>Venue / Address Details</label>
                        <input
                          type="text"
                          value={venueDetails}
                          onChange={(e) => setVenueDetails(e.target.value)}
                          placeholder="e.g. Sector 62, Innovation Arena"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2: DESCRIPTION & HIGHLIGHTS */}
                {modalTab === "details" && (
                  <div className={styles.tabPane}>
                    <div className={styles.formGroup}>
                      <div className={styles.labelCounterRow}>
                        <label>Short Description (for cards and previews) *</label>
                        <span className={description.length > 200 ? styles.charCounterWarning : styles.charCounter}>
                          {description.length} / 200 characters
                        </span>
                      </div>
                      <textarea
                        rows={3}
                        required
                        value={description}
                        className={fieldErrors.description ? styles.inputError : ""}
                        onChange={(e) => {
                          setDescription(e.target.value);
                          if (fieldErrors.description) {
                            setFieldErrors((prev) => {
                              const copy = { ...prev };
                              delete copy.description;
                              return copy;
                            });
                          }
                        }}
                        placeholder="Concise 1-2 sentence event overview..."
                      />
                      {fieldErrors.description && (
                        <span className={styles.fieldErrorText}>{fieldErrors.description}</span>
                      )}
                    </div>

                    <div className={styles.formGroup}>
                      <label>Full Event Description &amp; Briefing (for modal)</label>
                      <textarea
                        rows={7}
                        value={fullDescription}
                        onChange={(e) => setFullDescription(e.target.value)}
                        placeholder="Detailed agenda, keynotes, topics covered, and schedule details..."
                      />
                    </div>

                    {/* Interactive Highlights Manager */}
                    <div className={styles.highlightsBox}>
                      <h4 className={styles.highlightsTitle}>
                        <Sparkles size={15} />
                        <span>Key Event Highlights</span>
                      </h4>

                      <div className={styles.highlightsList}>
                        {highlights.map((h, i) => (
                          <div key={i} className={styles.highlightItem}>
                            <span className={styles.highlightNum}>0{i + 1}</span>
                            <span className={styles.highlightText}>{h}</span>
                            <button
                              type="button"
                              className={styles.highlightDelBtn}
                              onClick={() => handleRemoveHighlight(i)}
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>

                      <div className={styles.addInputRow}>
                        <input
                          type="text"
                          value={newHighlight}
                          onChange={(e) => setNewHighlight(e.target.value)}
                          placeholder="e.g. Live keynote by core engineering team..."
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddHighlight();
                            }
                          }}
                        />
                        <button
                          type="button"
                          className={styles.smallAddBtn}
                          onClick={handleAddHighlight}
                        >
                          Add Point
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 3: COVER & VISUAL GALLERY */}
                {modalTab === "media" && (
                  <div className={styles.tabPane}>
                    {/* PRIMARY COVER IMAGE */}
                    <div className={styles.uploadSectionBox}>
                      <div className={styles.uploadSectionHeader}>
                        <h4 className={styles.uploadSectionTitle}>
                          <ImageIcon size={16} />
                          <span>PRIMARY COVER IMAGE *</span>
                        </h4>

                        {/* Source Toggle */}
                        <div className={styles.sourceSelector}>
                          <button
                            type="button"
                            className={[
                              styles.sourceBtn,
                              coverSourceType === "upload" ? styles.sourceBtnActive : "",
                            ].join(" ")}
                            onClick={() => setCoverSourceType("upload")}
                          >
                            Upload Image
                          </button>
                          <button
                            type="button"
                            className={[
                              styles.sourceBtn,
                              coverSourceType === "url" ? styles.sourceBtnActive : "",
                            ].join(" ")}
                            onClick={() => setCoverSourceType("url")}
                          >
                            Image URL
                          </button>
                        </div>
                      </div>

                      <p className={styles.uploadInstruction}>
                        Upload a hero event banner (16:9 recommended). Supported: <strong>JPG, PNG, WEBP</strong> (Max <strong>10 MB</strong>).
                      </p>

                      {coverSourceType === "upload" && (
                        <div
                          className={[
                            styles.dropzone,
                            isCoverDragOver ? styles.dropzoneActive : "",
                            fieldErrors.cover_image || coverError ? styles.dropzoneError : "",
                          ].join(" ")}
                          onDragOver={handleCoverDragOver}
                          onDragLeave={handleCoverDragLeave}
                          onDrop={handleCoverDrop}
                        >
                          <input
                            type="file"
                            ref={coverFileInputRef}
                            style={{ display: "none" }}
                            accept="image/png,image/jpeg,image/jpg,image/webp"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                processCoverFile(e.target.files[0]);
                              }
                            }}
                          />

                          {coverPreviewUrl ? (
                            <div className={styles.previewContainer}>
                              <img
                                src={coverPreviewUrl}
                                alt="Cover Preview"
                                className={styles.dropzonePreviewImg}
                                loading="lazy"
                                decoding="async"
                              />

                              <div className={styles.previewMetaRow}>
                                <div className={styles.fileInfoBadge}>
                                  <FileCheck size={14} className={styles.checkIcon} />
                                  <span>{coverFile ? `${coverFile.name} (${(coverFile.size / (1024 * 1024)).toFixed(2)} MB)` : "Active Cover Image"}</span>
                                </div>

                                <div className={styles.previewActions}>
                                  <button
                                    type="button"
                                    className={styles.replaceImgBtn}
                                    onClick={() => coverFileInputRef.current?.click()}
                                  >
                                    <RefreshCw size={13} />
                                    <span>Replace</span>
                                  </button>
                                  <button
                                    type="button"
                                    className={styles.removeImgBtn}
                                    onClick={() => {
                                      setCoverFile(null);
                                      setCoverPreviewUrl(null);
                                      setCoverImage("");
                                    }}
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
                              onClick={() => coverFileInputRef.current?.click()}
                            >
                              <div className={styles.uploadIconCircle}>
                                <UploadCloud size={24} className={styles.uploadIcon} />
                              </div>
                              <h5 className={styles.dropzonePrompt}>
                                Drag and drop cover image, <span className={styles.browseLink}>Choose Image</span>, or paste with <kbd className={styles.kbdShortcut}>Ctrl + V</kbd>
                              </h5>
                              <span className={styles.dropzoneSub}>Supports JPG, PNG, WEBP up to 10MB</span>
                            </div>
                          )}

                          {isUploadingCover && (
                            <div className={styles.uploadProgressBar}>
                              <div
                                className={styles.uploadProgressFill}
                                style={{ width: `${coverUploadProgress}%` }}
                              />
                            </div>
                          )}
                        </div>
                      )}

                      {coverSourceType === "url" && (
                        <div className={styles.urlInputBox}>
                          <div className={styles.formGroup}>
                            <label>Direct Image URL (CDN / Unsplash)</label>
                            <input
                              type="url"
                              value={coverImage}
                              onChange={(e) => {
                                setCoverImage(e.target.value);
                                setCoverPreviewUrl(e.target.value);
                                setCoverError(null);
                              }}
                              placeholder="https://images.unsplash.com/photo-..."
                            />
                          </div>

                          {coverPreviewUrl && (
                            <div className={styles.urlPreviewContainer}>
                              <img
                                src={coverPreviewUrl}
                                alt="URL Preview"
                                className={styles.dropzonePreviewImg}
                                loading="lazy"
                                decoding="async"
                              />
                            </div>
                          )}
                        </div>
                      )}

                      {coverError && (
                        <div className={styles.imageErrorText}>
                          <AlertCircle size={13} />
                          <span>{coverError}</span>
                        </div>
                      )}
                    </div>

                    {/* EVENT PHOTO GALLERY BATCH UPLOADER */}
                    <div className={styles.uploadSectionBox}>
                      <div className={styles.uploadSectionHeader}>
                        <h4 className={styles.uploadSectionTitle}>
                          <Layers size={16} />
                          <span>EVENT PHOTO GALLERY ({galleryImages.length} Photos)</span>
                        </h4>
                      </div>

                      <p className={styles.uploadInstruction}>
                        Add event photographs from sessions, keynote stages, hackathon pods, and retreat moments.
                      </p>

                      {/* Dropzone for multiple files */}
                      <div
                        className={[
                          styles.dropzone,
                          isGalleryDragOver ? styles.dropzoneActive : "",
                        ].join(" ")}
                        onDragOver={handleGalleryDragOver}
                        onDragLeave={handleGalleryDragLeave}
                        onDrop={handleGalleryDrop}
                        onClick={() => galleryFileInputRef.current?.click()}
                      >
                        <input
                          type="file"
                          ref={galleryFileInputRef}
                          style={{ display: "none" }}
                          multiple
                          accept="image/png,image/jpeg,image/jpg,image/webp"
                          onChange={(e) => {
                            if (e.target.files) processGalleryFiles(e.target.files);
                          }}
                        />

                        <div className={styles.dropzoneEmpty}>
                          <div className={styles.uploadIconCircle}>
                            <UploadCloud size={24} className={styles.uploadIcon} />
                          </div>
                          <h5 className={styles.dropzonePrompt}>
                            Drag and drop multiple photos or <span className={styles.browseLink}>Choose Images</span>
                          </h5>
                          <span className={styles.dropzoneSub}>Upload multiple JPG, PNG, WEBP files simultaneously</span>
                        </div>
                      </div>

                      {/* URL Add Input */}
                      <div className={styles.addInputRow} style={{ marginTop: "0.5rem" }}>
                        <input
                          type="url"
                          value={newGalleryUrl}
                          onChange={(e) => setNewGalleryUrl(e.target.value)}
                          placeholder="Or paste remote image URL here..."
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddGalleryUrl();
                            }
                          }}
                        />
                        <button
                          type="button"
                          className={styles.smallAddBtn}
                          onClick={handleAddGalleryUrl}
                        >
                          Add Photo
                        </button>
                      </div>

                      {/* Gallery Cards Grid */}
                      {galleryImages.length > 0 && (
                        <div className={styles.galleryThumbGrid}>
                          {galleryImages.map((imgUrl, idx) => (
                            <div key={idx} className={styles.galleryThumbCard}>
                              <img
                                src={imgUrl}
                                alt={`Gallery item ${idx + 1}`}
                                className={styles.galleryGridThumb}
                                loading="lazy"
                                decoding="async"
                              />
                              <div className={styles.galleryThumbOverlay}>
                                <span className={styles.galleryThumbBadge}>#{idx + 1}</span>
                                <div className={styles.thumbBtnGroup}>
                                  {idx > 0 && (
                                    <button
                                      type="button"
                                      onClick={() => handleMoveGalleryImage(idx, "up")}
                                      className={styles.thumbMoveBtn}
                                      title="Move Left"
                                    >
                                      <ChevronLeft size={12} />
                                    </button>
                                  )}
                                  {idx < galleryImages.length - 1 && (
                                    <button
                                      type="button"
                                      onClick={() => handleMoveGalleryImage(idx, "down")}
                                      className={styles.thumbMoveBtn}
                                      title="Move Right"
                                    >
                                      <ChevronRight size={12} />
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveGalleryImage(idx)}
                                    className={styles.thumbDelBtn}
                                    title="Remove Image"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* STEP 4: REGISTRATION & PUBLISHING */}
                {modalTab === "publish" && (
                  <div className={styles.tabPane}>
                    <div className={styles.formGrid2}>
                      <div className={styles.formGroup}>
                        <label>Expected / Attended Count</label>
                        <input
                          type="number"
                          value={attendeesCount}
                          onChange={(e) =>
                            setAttendeesCount(e.target.value === "" ? "" : Number(e.target.value))
                          }
                          placeholder="e.g. 500"
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label>Registration / RSVP URL</label>
                        <input
                          type="text"
                          value={registrationUrl}
                          onChange={(e) => setRegistrationUrl(e.target.value)}
                          placeholder="e.g. /contact?event=launch or https://lu.ma/..."
                        />
                      </div>
                    </div>

                    <div className={styles.toggleRow} style={{ marginTop: "1rem" }}>
                      <label className={styles.checkboxLabel}>
                        <input
                          type="checkbox"
                          checked={isFeatured}
                          onChange={(e) => setIsFeatured(e.target.checked)}
                        />
                        <span>Feature in Homepage / Top Spotlight Banner</span>
                      </label>
                    </div>

                    {/* Step 4 Submission Error Banner */}
                    {formError && (
                      <div className={styles.errorAlert} style={{ marginTop: "1rem" }}>
                        <AlertCircle size={16} style={{ flexShrink: 0 }} />
                        <div style={{ flex: 1, fontSize: "0.82rem" }}>
                          <strong>{formError.includes("logged in") || formError.includes("Unauthorized") ? "Session Expired:" : "Submission Error:"}</strong> {formError}
                          {(formError.includes("logged in") || formError.includes("Unauthorized")) && (
                            <div style={{ marginTop: "0.25rem", fontSize: "0.78rem", color: "#fca5a5" }}>
                              Your admin session cookie has expired after 15 minutes of inactivity. Please refresh the page to sign in again.
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          className={styles.alertCloseBtn}
                          onClick={() => setFormError(null)}
                          title="Dismiss error"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    )}

                    {/* Summary Review Card */}
                    <div className={styles.reviewCard}>
                      <h4 className={styles.reviewTitle}>Event Summary Review</h4>
                      <div className={styles.reviewGrid}>
                        <div>
                          <span className={styles.reviewLabel}>Event Title:</span>
                          <span className={styles.reviewVal}>{title || "—"}</span>
                        </div>
                        <div>
                          <span className={styles.reviewLabel}>Date &amp; Time:</span>
                          <span className={styles.reviewVal}>{date} ({startTime})</span>
                        </div>
                        <div>
                          <span className={styles.reviewLabel}>Location:</span>
                          <span className={styles.reviewVal}>{location}</span>
                        </div>
                        <div>
                          <span className={styles.reviewLabel}>Photos Count:</span>
                          <span className={styles.reviewVal}>{galleryImages.length} gallery photos</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Sticky Footer Action Bar */}
              <div className={styles.modalFooter}>
                <div className={styles.footerLeft}>
                  {modalTab !== "basic" && (
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
                    onClick={() => setShowEventModal(false)}
                  >
                    Cancel
                  </button>

                  {modalTab !== "publish" ? (
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
                      disabled={isPending || isUploadingCover}
                      className={styles.saveSubmitBtn}
                    >
                      {isUploadingCover
                        ? "Uploading Media..."
                        : isPending
                        ? "Saving Event..."
                        : editingEvent
                        ? "Update Event"
                        : "Publish Event"}
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STANDALONE GALLERY PHOTO MODAL */}
      {showGalleryModal && (
        <div
          className={styles.modalBackdrop}
          role="dialog"
          aria-modal="true"
          data-lenis-prevent
          onClick={() => setShowGalleryModal(false)}
        >
          <div
            className={styles.modalContent}
            data-lenis-prevent
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "600px" }}
          >
            <div className={styles.modalHeader}>
              <div>
                <h3 className={styles.modalTitle}>Add Gallery Photo</h3>
                <p className={styles.modalSub}>Upload high-res photo for the global gallery wall.</p>
              </div>
              <button
                type="button"
                className={styles.modalClose}
                onClick={() => setShowGalleryModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveGalleryItem} className={styles.modalForm}>
              <div className={styles.modalBodyScroll} data-lenis-prevent>
                {galFormError && (
                  <div className={styles.errorAlert} style={{ marginBottom: "1rem" }}>
                    <AlertCircle size={16} style={{ flexShrink: 0 }} />
                    <div style={{ flex: 1, fontSize: "0.82rem" }}>
                      <strong>{galFormError.includes("logged in") || galFormError.includes("Unauthorized") ? "Session Expired:" : "Error:"}</strong> {galFormError}
                      {(galFormError.includes("logged in") || galFormError.includes("Unauthorized")) && (
                        <div style={{ marginTop: "0.25rem", fontSize: "0.78rem", color: "#fca5a5" }}>
                          Your admin session cookie has expired after 15 minutes of inactivity. Please refresh the page to sign in again.
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      className={styles.alertCloseBtn}
                      onClick={() => setGalFormError(null)}
                      title="Dismiss error"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
                <div className={styles.formGroup}>
                  <label>Photo Title</label>
                  <input
                    type="text"
                    value={galTitle}
                    onChange={(e) => setGalTitle(e.target.value)}
                    placeholder="e.g. Main Stage Keynote Light Study"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Caption / Technical Note</label>
                  <input
                    type="text"
                    value={galCaption}
                    onChange={(e) => setGalCaption(e.target.value)}
                    placeholder="e.g. Volumetric laser simulation..."
                  />
                </div>

                <div className={styles.formGrid2}>
                  <div className={styles.formGroup}>
                    <div className={styles.labelWithAction}>
                      <label>Category *</label>
                      <button
                        type="button"
                        className={styles.manageCatInlineLink}
                        onClick={() => handleOpenCatModal()}
                        title="Manage Dynamic Categories"
                      >
                        + Manage Categories
                      </button>
                    </div>
                    <select
                      value={galCategory}
                      onChange={(e) => setGalCategory(e.target.value)}
                      className={styles.selectInput}
                    >
                      {activeCategories.length === 0 && (
                        <option value="">-- No Categories Found (Please Create One First) --</option>
                      )}
                      {activeCategories.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                      {galCategory && !activeCategories.some((c) => c.name === galCategory) && (
                        <option value={galCategory}>{galCategory}</option>
                      )}
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Aspect Ratio</label>
                    <select
                      value={galAspect}
                      onChange={(e) => setGalAspect(e.target.value as any)}
                      className={styles.selectInput}
                    >
                      <option value="normal">Normal (4:3 / 1:1)</option>
                      <option value="tall">Tall (Portrait)</option>
                      <option value="wide">Wide (Cinematic 16:9)</option>
                    </select>
                  </div>
                </div>

                {/* Photo Upload Mode */}
                <div className={styles.uploadSectionBox}>
                  <div className={styles.uploadSectionHeader}>
                    <label>Photo Image *</label>
                    <div className={styles.sourceSelector}>
                      <button
                        type="button"
                        className={[
                          styles.sourceBtn,
                          galSourceType === "upload" ? styles.sourceBtnActive : "",
                        ].join(" ")}
                        onClick={() => setGalSourceType("upload")}
                      >
                        Upload
                      </button>
                      <button
                        type="button"
                        className={[
                          styles.sourceBtn,
                          galSourceType === "url" ? styles.sourceBtnActive : "",
                        ].join(" ")}
                        onClick={() => setGalSourceType("url")}
                      >
                        URL
                      </button>
                    </div>
                  </div>

                  {galSourceType === "upload" ? (
                    <div
                      className={styles.dropzone}
                      onClick={() => standaloneGalInputRef.current?.click()}
                    >
                      <input
                        type="file"
                        ref={standaloneGalInputRef}
                        style={{ display: "none" }}
                        accept="image/png,image/jpeg,image/jpg,image/webp"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            const file = e.target.files[0];
                            setGalFile(file);
                            compressImageToDataUrl(file, 1400, 0.82)
                              .then((dataUrl) => {
                                setGalPreviewUrl(dataUrl);
                                setGalImage(dataUrl);
                              })
                              .catch(() => {
                                const reader = new FileReader();
                                reader.onload = (ev) => {
                                  const dataUrl = ev.target?.result as string;
                                  setGalPreviewUrl(dataUrl);
                                  setGalImage(dataUrl);
                                };
                                reader.readAsDataURL(file);
                              });
                          }
                        }}
                      />
                      {galPreviewUrl ? (
                        <img
                          src={galPreviewUrl}
                          alt="Gallery Preview"
                          className={styles.dropzonePreviewImg}
                          loading="lazy"
                          decoding="async"
                        />
                      ) : (
                        <div className={styles.dropzoneEmpty}>
                          <UploadCloud size={22} className={styles.uploadIcon} />
                          <span className={styles.dropzonePrompt}>Click to Choose Photo</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <input
                      type="url"
                      value={galImage}
                      onChange={(e) => {
                        setGalImage(e.target.value);
                        setGalPreviewUrl(e.target.value);
                      }}
                      placeholder="https://images.unsplash.com/..."
                    />
                  )}
                </div>
              </div>

              {/* Bottom error indicator right above footer buttons */}
              {galFormError && (
                <div style={{ padding: "0 1.75rem 0.75rem" }}>
                  <div className={styles.errorAlert}>
                    <AlertCircle size={16} style={{ flexShrink: 0 }} />
                    <div style={{ flex: 1, fontSize: "0.82rem" }}>
                      <strong>{galFormError.includes("logged in") || galFormError.includes("Unauthorized") ? "Session Expired:" : "Submission Error:"}</strong> {galFormError}
                    </div>
                    <button
                      type="button"
                      className={styles.alertCloseBtn}
                      onClick={() => setGalFormError(null)}
                      title="Dismiss error"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              )}

              <div className={styles.modalFooter}>
                <div className={styles.footerLeft} />
                <div className={styles.footerRight}>
                  <button
                    type="button"
                    className={styles.cancelBtn}
                    onClick={() => setShowGalleryModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" disabled={isPending} className={styles.saveSubmitBtn}>
                    {isPending ? "Adding Photo..." : editingGalItem ? "Update Photo" : "Add to Gallery"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
         DEDICATED EVENT DELETE CONFIRMATION MODAL
         ========================================================================= */}
      {eventDeleteConfirm && (
        <div
          className={styles.modalBackdrop}
          role="dialog"
          aria-modal="true"
          data-lenis-prevent
          onClick={() => setEventDeleteConfirm(null)}
        >
          <div
            className={styles.deleteConfirmModal}
            data-lenis-prevent
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.deleteModalHeader}>
              <div className={styles.deleteIconWrapper}>
                <Trash2 size={22} className={styles.deleteModalTrashIcon} />
              </div>
              <button
                type="button"
                className={styles.modalClose}
                onClick={() => setEventDeleteConfirm(null)}
                title="Close (Esc)"
              >
                <X size={18} />
              </button>
            </div>

            <div className={styles.deleteModalBody}>
              <h3 className={styles.deleteModalTitle}>Delete Company Event</h3>
              <p className={styles.deleteModalDescription}>
                Are you sure you want to permanently delete{" "}
                <span className={styles.deleteHighlight}>
                  "{eventDeleteConfirm.title}"
                </span>
                ?
              </p>
              <div className={styles.deleteWarningBox}>
                <AlertTriangle size={18} className={styles.deleteWarningBoxIcon} />
                <span>
                  This action is permanent and cannot be undone. The event will be immediately removed from the live database, unlinking all associated gallery items and registrations.
                </span>
              </div>
            </div>

            <div className={styles.deleteModalFooter}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={() => setEventDeleteConfirm(null)}
                disabled={isPending}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.deleteConfirmBtn}
                onClick={handleConfirmDeleteEvent}
                disabled={isPending}
              >
                <Trash2 size={15} />
                <span>{isPending ? "Deleting..." : "Delete Event"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
         DEDICATED GALLERY PHOTO DELETE CONFIRMATION MODAL
         ========================================================================= */}
      {galleryDeleteConfirm && (
        <div
          className={styles.modalBackdrop}
          role="dialog"
          aria-modal="true"
          data-lenis-prevent
          onClick={() => setGalleryDeleteConfirm(null)}
        >
          <div
            className={styles.deleteConfirmModal}
            data-lenis-prevent
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.deleteModalHeader}>
              <div className={styles.deleteIconWrapper}>
                <Trash2 size={22} className={styles.deleteModalTrashIcon} />
              </div>
              <button
                type="button"
                className={styles.modalClose}
                onClick={() => setGalleryDeleteConfirm(null)}
                title="Close (Esc)"
              >
                <X size={18} />
              </button>
            </div>

            <div className={styles.deleteModalBody}>
              <h3 className={styles.deleteModalTitle}>Delete Gallery Photo</h3>
              <p className={styles.deleteModalDescription}>
                Are you sure you want to permanently delete this photo from the gallery?
              </p>

              {/* Photo Preview Card */}
              <div className={styles.deletePreviewCard}>
                {galleryDeleteConfirm.imageUrl && (
                  <img
                    src={galleryDeleteConfirm.imageUrl}
                    alt={galleryDeleteConfirm.title}
                    className={styles.deletePreviewThumb}
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = DEFAULT_EVENT_FALLBACK_IMAGE;
                    }}
                  />
                )}
                <div className={styles.deletePreviewInfo}>
                  <span className={styles.deletePreviewTitle}>{galleryDeleteConfirm.title}</span>
                  {galleryDeleteConfirm.category && (
                    <span className={styles.deletePreviewCategory}>
                      <Tag size={11} />
                      <span>{galleryDeleteConfirm.category}</span>
                    </span>
                  )}
                </div>
              </div>

              <div className={styles.deleteWarningBox}>
                <AlertTriangle size={18} className={styles.deleteWarningBoxIcon} />
                <span>
                  This action is permanent and cannot be undone. The photo will be immediately removed from the live database and public gallery.
                </span>
              </div>
            </div>

            <div className={styles.deleteModalFooter}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={() => setGalleryDeleteConfirm(null)}
                disabled={isPending}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.deleteConfirmBtn}
                onClick={handleConfirmDeleteGallery}
                disabled={isPending}
              >
                <Trash2 size={15} />
                <span>{isPending ? "Deleting..." : "Delete Photo"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
