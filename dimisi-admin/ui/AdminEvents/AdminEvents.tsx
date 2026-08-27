import {
  useState,
  useTransition,
  useRef,
  useEffect,
  useCallback,
  type DragEvent,
  type ChangeEvent,
  type ClipboardEvent,
} from "react";
import { useServerFn } from "@tanstack/react-start";
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
  ExternalLink,
  X,
  AlertCircle,
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
} from "lucide-react";
import {
  type CompanyEvent,
  type EventGalleryItem,
  type EventInput,
  type GalleryItemInput,
  type EventStatus,
  EVENT_STATUSES,
  EVENT_CATEGORIES,
  slugifyEvent,
  validateEvent,
} from "@/lib/events.shared";
import {
  saveEventFn,
  deleteEventFn,
  saveGalleryItemFn,
  deleteGalleryItemFn,
} from "@/lib/events.functions";
import styles from "./AdminEvents.module.css";

interface AdminEventsProps {
  events: CompanyEvent[];
  gallery: EventGalleryItem[];
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

export function AdminEvents({ events, gallery, onRefresh }: AdminEventsProps) {
  const saveEvent = useServerFn(saveEventFn);
  const deleteEvent = useServerFn(deleteEventFn);
  const saveGallery = useServerFn(saveGalleryItemFn);
  const deleteGallery = useServerFn(deleteGalleryItemFn);

  const [activeTab, setActiveTab] = useState<"events" | "gallery">("events");
  const [statusFilter, setStatusFilter] = useState<string>("All");

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
  const standaloneGalInputRef = useRef<HTMLInputElement>(null);

  // Body Lock & ESC Key Listener
  useEffect(() => {
    if (!showEventModal && !showGalleryModal) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowEventModal(false);
        setShowGalleryModal(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [showEventModal, showGalleryModal]);

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
    setCategory("Product Launch");
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

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setCoverPreviewUrl(dataUrl);
      setCoverImage(dataUrl);
      setCoverUploadProgress(100);
      setTimeout(() => setIsUploadingCover(false), 200);
    };
    reader.onerror = () => {
      setCoverError("Failed to read image file. Please try again.");
      setIsUploadingCover(false);
    };
    reader.readAsDataURL(file);
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
    const newUrls: string[] = [];
    const fileArray = Array.from(files);

    fileArray.forEach((file) => {
      if (ALLOWED_IMAGE_TYPES.includes(file.type) && file.size <= MAX_IMAGE_SIZE_BYTES) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const dataUrl = e.target?.result as string;
          if (dataUrl) {
            setGalleryImages((prev) => [...prev, dataUrl]);
          }
        };
        reader.readAsDataURL(file);
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

  // Step-by-Step Navigation & Validation
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
          setShowEventModal(false);
          onRefresh();
        } else {
          setFormError(res.error || "Failed to save event.");
        }
      } catch (err) {
        setFormError(err instanceof Error ? err.message : "Error saving event.");
      }
    });
  };

  const handleDeleteEvent = (id: string, evTitle: string) => {
    if (window.confirm(`Delete company event "${evTitle}"? This will also unlink its gallery photos.`)) {
      startTransition(async () => {
        await deleteEvent({ data: { id } });
        onRefresh();
      });
    }
  };

  // Standalone Gallery Item Actions
  const openCreateGalleryItem = () => {
    setEditingGalItem(null);
    setGalTitle("");
    setGalCaption("");
    setGalImage("https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80");
    setGalCategory("Interfaces");
    setGalEventId("");
    setGalAspect("normal");
    setGalFile(null);
    setGalPreviewUrl("https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80");
    setGalSourceType("upload");
    setShowGalleryModal(true);
  };

  const handleSaveGalleryItem = (e: React.FormEvent) => {
    e.preventDefault();
    const input: GalleryItemInput = {
      id: editingGalItem?.id,
      title: galTitle.trim() || "Event Photo",
      caption: galCaption.trim() || "DIMISI Event Archive",
      image_url: galImage.trim(),
      category: galCategory,
      event_id: galEventId || undefined,
      aspect_ratio: galAspect,
    };

    startTransition(async () => {
      const res = await saveGallery({ data: input });
      if (res.success) {
        setShowGalleryModal(false);
        onRefresh();
      }
    });
  };

  const handleDeleteGalleryItem = (id: string) => {
    if (window.confirm("Remove this photo from the global gallery?")) {
      startTransition(async () => {
        await deleteGallery({ data: { id } });
        onRefresh();
      });
    }
  };

  const filteredEvents = events.filter((ev) => {
    if (statusFilter === "All") return true;
    return ev.status.toLowerCase() === statusFilter.toLowerCase();
  });

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
              <span>Events ({events.length})</span>
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
              <span>Photo Gallery ({gallery.length})</span>
            </button>
          </div>

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

      {/* TAB 1: EVENTS LIST */}
      {activeTab === "events" && (
        <div className={styles.postsSection}>
          {/* Status Filter Bar */}
          <div className={styles.filtersBar}>
            <div className={styles.catPills}>
              {["All", "upcoming", "ongoing", "completed"].map((st) => (
                <button
                  key={st}
                  type="button"
                  className={[
                    styles.catPill,
                    statusFilter.toLowerCase() === st.toLowerCase() ? styles.catPillActive : "",
                  ].join(" ")}
                  onClick={() => setStatusFilter(st)}
                >
                  {st === "All" ? "All Events" : st.charAt(0).toUpperCase() + st.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Table Card */}
          <div className={styles.tableCard}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th style={{ width: "80px" }}>Cover</th>
                  <th>Event Title</th>
                  <th>Category</th>
                  <th>Date &amp; Timing</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.map((ev) => (
                  <tr key={ev.id}>
                    <td>
                      <img src={ev.cover_image} alt={ev.title} className={styles.thumbImg} />
                    </td>
                    <td>
                      <div className={styles.titleCol}>
                        <span className={styles.postTitle}>{ev.title}</span>
                        <code className={styles.slugCode}>/events/{ev.slug}</code>
                      </div>
                    </td>
                    <td>
                      <span className={styles.categoryBadge}>{ev.category}</span>
                    </td>
                    <td>
                      <div className={styles.timeCol}>
                        <span>{ev.date}</span>
                        {ev.start_time && <span className={styles.subTime}>{ev.start_time}</span>}
                      </div>
                    </td>
                    <td>
                      <div className={styles.locationCell}>
                        <MapPin size={13} />
                        <span>{ev.location}</span>
                      </div>
                    </td>
                    <td>
                      <span
                        className={styles.statusBadge}
                        style={{
                          color:
                            ev.status === "upcoming"
                              ? "#ffb300"
                              : ev.status === "ongoing"
                              ? "#10b981"
                              : "rgba(255,255,255,0.6)",
                        }}
                      >
                        {ev.status.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <div className={styles.rowActions}>
                        <button
                          type="button"
                          className={styles.editBtn}
                          onClick={() => openEditEvent(ev)}
                          title="Edit Event"
                        >
                          <Edit2 size={15} />
                        </button>
                        <a
                          href="/events"
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
                          onClick={() => handleDeleteEvent(ev.id, ev.title)}
                          title="Delete Event"
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
        </div>
      )}

      {/* TAB 2: GALLERY GRID */}
      {activeTab === "gallery" && (
        <div className={styles.galleryAdminGrid}>
          {gallery.map((g) => (
            <div key={g.id} className={styles.galAdminCard}>
              <img src={g.image_url} alt={g.title} className={styles.galAdminThumb} />
              <div className={styles.galAdminInfo}>
                <span className={styles.galCategoryTag}>{g.category}</span>
                <h5 className={styles.galItemTitle}>{g.title}</h5>
                <p className={styles.galItemCaption}>{g.caption}</p>
                <div className={styles.galCardActions}>
                  <button
                    type="button"
                    className={styles.delBtn}
                    onClick={() => handleDeleteGalleryItem(g.id)}
                    title="Remove Photo"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
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
            <div className={styles.modalTabsBar} data-lenis-prevent>
              {EVENT_MODAL_STEPS.map((t) => (
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

            {/* Global Error Alert */}
            {formError && (
              <div className={styles.errorAlert}>
                <AlertCircle size={16} />
                <span>{formError}</span>
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
                    <div className={styles.formGrid2}>
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

                      <div className={styles.formGroup}>
                        <label>URL Slug *</label>
                        <input
                          type="text"
                          required
                          value={slug}
                          onChange={(e) => setSlug(e.target.value)}
                          placeholder="e.g. kalesh-app-global-launch-2026"
                        />
                      </div>
                    </div>

                    <div className={styles.formGrid3}>
                      <div className={styles.formGroup}>
                        <label>Category *</label>
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className={styles.selectInput}
                        >
                          {EVENT_CATEGORIES.filter((c) => c !== "All").map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
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
                              <img src={coverPreviewUrl} alt="URL Preview" className={styles.dropzonePreviewImg} />
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
                              <img src={imgUrl} alt={`Gallery item ${idx + 1}`} className={styles.galleryGridThumb} />
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
                <div className={styles.formGroup}>
                  <label>Photo Title</label>
                  <input
                    type="text"
                    required
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
                    <label>Category</label>
                    <select
                      value={galCategory}
                      onChange={(e) => setGalCategory(e.target.value)}
                      className={styles.selectInput}
                    >
                      <option value="Interfaces">Interfaces</option>
                      <option value="Motion">Motion</option>
                      <option value="AI & Systems">AI &amp; Systems</option>
                      <option value="Culture">Culture</option>
                      <option value="Environments">Environments</option>
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
                            const reader = new FileReader();
                            reader.onload = (ev) => {
                              const dataUrl = ev.target?.result as string;
                              setGalPreviewUrl(dataUrl);
                              setGalImage(dataUrl);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      {galPreviewUrl ? (
                        <img src={galPreviewUrl} alt="Gallery Preview" className={styles.dropzonePreviewImg} />
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
                    {isPending ? "Saving..." : "Add to Gallery"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
