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
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Star,
  Eye,
  EyeOff,
  ExternalLink,
  Clock,
  Sparkles,
  Layers,
  X,
  Save,
  Search,
  Construction,
  Settings,
  Image as ImageIcon,
  FileText,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  UploadCloud,
  FileCheck,
  AlertCircle,
  RefreshCw,
  Share2,
  Tag,
  SlidersHorizontal,
  FolderPlus,
  HelpCircle,
  Check,
  AlertTriangle,
  MoveUp,
  MoveDown,
  Heading as HeadingIcon,
  Type,
  List as ListIcon,
  ListOrdered,
  Code as CodeIcon,
  Quote as QuoteIcon,
  Copy,
  FileCode,
} from "lucide-react";
import {
  type BlogPostItem,
  type BlogPostInput,
  type BlogCategoryItem,
  type BlogCategoryInput,
  type BlogStatus,
  type BlogConfig,
  slugifyBlog,
  slugifyBlogCategory,
  validateBlogPostInput,
  validateBlogCategoryInput,
} from "@/lib/blog.shared";
import {
  saveBlogPostFn,
  deleteBlogPostFn,
  toggleBlogActiveFn,
  setBlogFeaturedFn,
  saveBlogConfigFn,
  getBlogCategoriesFn,
  saveBlogCategoryFn,
  deleteBlogCategoryFn,
} from "@/lib/blog.functions";
import { getBlogByIdApi } from "@/services/blog.service";
import {
  parseMarkdownToBlocks,
  serializeBlocksToMarkdown,
  createEmptyBlock,
  generateBlockId,
  type ContentBlock,
  type ContentBlockType,
  type HeadingBlock,
  type ParagraphBlock,
  type ListBlock,
  type CodeBlock,
  type QuoteBlock,
  type RawBlock,
} from "@/lib/blogContent.parser";
import { BlogContentRenderer } from "@/components/blog/BlogContentRenderer";
import styles from "./AdminBlog.module.css";

interface AdminBlogProps {
  posts: BlogPostItem[];
  config: BlogConfig;
  categories: string[];
  categoryItems?: BlogCategoryItem[] | undefined;
  onRefresh: () => void;
}

type BlogModalTab = "basic" | "cover" | "content" | "seo";

const MODAL_STEPS: { id: BlogModalTab; label: string; num: string }[] = [
  { id: "basic", label: "1. Basic Info & Meta", num: "01" },
  { id: "cover", label: "2. Cover & Visuals", num: "02" },
  { id: "content", label: "3. Article Content", num: "03" },
  { id: "seo", label: "4. SEO & Social", num: "04" },
];

const CODE_LANGUAGES = [
  { value: "typescript", label: "TypeScript" },
  { value: "javascript", label: "JavaScript" },
  { value: "python", label: "Python" },
  { value: "bash", label: "Bash / Shell" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "json", label: "JSON" },
  { value: "sql", label: "SQL" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "cpp", label: "C++" },
  { value: "yaml", label: "YAML" },
];

const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
const FALLBACK_COVER =
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80";

export function AdminBlog({
  posts,
  config,
  categories: initialCategoryNames,
  categoryItems: initialCategoryItems,
  onRefresh,
}: AdminBlogProps) {
  const [isPending, startTransition] = useTransition();

  // Sub-section tab
  const [activeSection, setActiveSection] = useState<"posts" | "settings">("posts");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState<"All" | "published" | "draft">("All");
  const [searchQuery, setSearchQuery] = useState("");

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

  // Dynamic Categories State — loaded directly from live backend
  const [categoryList, setCategoryList] = useState<BlogCategoryItem[]>(() => {
    if (initialCategoryItems && Array.isArray(initialCategoryItems)) {
      return initialCategoryItems;
    }
    return [];
  });

  // Sync when initialCategoryItems prop updates
  useEffect(() => {
    if (initialCategoryItems && Array.isArray(initialCategoryItems)) {
      setCategoryList(initialCategoryItems);
    }
  }, [initialCategoryItems]);

  // Load latest categories from backend API
  const refreshCategories = useCallback(async () => {
    try {
      const res = await getBlogCategoriesFn();
      if (res && Array.isArray(res.categories)) {
        setCategoryList(res.categories);
      }
    } catch (err) {
      console.warn("Failed to load blog categories", err);
    }
  }, []);

  useEffect(() => {
    refreshCategories();
  }, [refreshCategories, posts]);

  // Compute category post counts dynamically
  const categoryPostCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    posts.forEach((p) => {
      const cat = p.category.trim();
      counts[cat] = (counts[cat] || 0) + 1;
      counts[cat.toLowerCase()] = (counts[cat.toLowerCase()] || 0) + 1;
    });
    return counts;
  }, [posts]);

  // Active category items for filter selector & post selector
  const activeCategories = useMemo(() => {
    return categoryList
      .filter((c) => c.status === "active")
      .sort((a, b) => a.order_index - b.order_index);
  }, [categoryList]);

  // Category Modal State
  const [showCatModal, setShowCatModal] = useState(false);
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [catName, setCatName] = useState("");
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
  const [postDeleteConfirm, setPostDeleteConfirm] = useState<{
    id: string;
    title: string;
  } | null>(null);

  // Post Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPostItem | null>(null);
  const [modalTab, setModalTab] = useState<BlogModalTab>("basic");

  // Post Form State
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("AI");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");

  // Block Builder State
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [blockViewMode, setBlockViewMode] = useState<"builder" | "preview" | "raw">("builder");

  // Primary Cover Image State
  const [coverSourceType, setCoverSourceType] = useState<"upload" | "url">("upload");
  const [coverImage, setCoverImage] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imageError, setImageError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  // Metadata Fields
  const [coverCaption, setCoverCaption] = useState("");
  const [coverAlt, setCoverAlt] = useState("");
  const [coverCredit, setCoverCredit] = useState("");

  // Preserved Author State (Default or existing values preserved)
  const [authorName, setAuthorName] = useState("DIMISI Editorial");
  const [authorRole, setAuthorRole] = useState("Engineering & Systems");
  const [authorAvatar, setAuthorAvatar] = useState(
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
  );
  const [readingTime, setReadingTime] = useState("6 min read");
  const [publishedAt, setPublishedAt] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [status, setStatus] = useState<BlogStatus>("published");

  // SEO & Social State
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [ogImage, setOgImage] = useState("");
  const [orderIndex, setOrderIndex] = useState(1);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Config Form State
  const [noticeActive, setNoticeActive] = useState(config.under_development_notice_active);
  const [noticeHeading, setNoticeHeading] = useState(config.under_development_notice_heading);
  const [noticeText, setNoticeText] = useState(config.under_development_notice_text);
  const [heroHeading, setHeroHeading] = useState(config.hero_heading);
  const [heroSubline, setHeroSubline] = useState(config.hero_subline);
  const [configSuccess, setConfigSuccess] = useState(false);

  // Body Lock & ESC Key Listener
  useEffect(() => {
    if (!showModal && !showCatModal && !postDeleteConfirm) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (postDeleteConfirm) {
          setPostDeleteConfirm(null);
        } else if (showCatModal) {
          setShowCatModal(false);
        } else if (showModal) {
          setShowModal(false);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [showModal, showCatModal, postDeleteConfirm]);

  // Synchronize Blocks ➔ Content
  const updateBlocksAndSyncContent = useCallback((newBlocks: ContentBlock[]) => {
    setBlocks(newBlocks);
    const md = serializeBlocksToMarkdown(newBlocks);
    setContent(md);
  }, []);

  // Block Builder Helpers
  const handleAddBlock = (type: ContentBlockType, level: 2 | 3 | 4 = 2, afterIndex?: number) => {
    const newBlock = createEmptyBlock(type, level);
    const nextBlocks = [...blocks];
    if (typeof afterIndex === "number" && afterIndex >= 0 && afterIndex < nextBlocks.length) {
      nextBlocks.splice(afterIndex + 1, 0, newBlock);
    } else {
      nextBlocks.push(newBlock);
    }
    updateBlocksAndSyncContent(nextBlocks);
  };

  const handleUpdateBlock = (id: string, updates: Partial<ContentBlock>) => {
    const nextBlocks = blocks.map((b) => {
      if (b.id === id) {
        return { ...b, ...updates } as ContentBlock;
      }
      return b;
    });
    updateBlocksAndSyncContent(nextBlocks);
  };

  const handleRemoveBlock = (id: string) => {
    if (blocks.length <= 1) {
      // Keep at least one empty paragraph block
      updateBlocksAndSyncContent([createEmptyBlock("paragraph")]);
      return;
    }
    const nextBlocks = blocks.filter((b) => b.id !== id);
    updateBlocksAndSyncContent(nextBlocks);
  };

  const handleMoveBlock = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= blocks.length) return;
    const nextBlocks = [...blocks];
    const [moved] = nextBlocks.splice(index, 1);
    nextBlocks.splice(targetIndex, 0, moved);
    updateBlocksAndSyncContent(nextBlocks);
  };

  // List Item Block Helpers
  const handleAddListItem = (blockId: string, afterItemIndex?: number) => {
    const nextBlocks = blocks.map((b) => {
      if (b.id === blockId && b.type === "list") {
        const items = [...b.items];
        if (typeof afterItemIndex === "number" && afterItemIndex >= 0) {
          items.splice(afterItemIndex + 1, 0, "");
        } else {
          items.push("");
        }
        return { ...b, items };
      }
      return b;
    });
    updateBlocksAndSyncContent(nextBlocks);
  };

  const handleUpdateListItem = (blockId: string, itemIndex: number, text: string) => {
    const nextBlocks = blocks.map((b) => {
      if (b.id === blockId && b.type === "list") {
        const items = [...b.items];
        items[itemIndex] = text;
        return { ...b, items };
      }
      return b;
    });
    updateBlocksAndSyncContent(nextBlocks);
  };

  const handleRemoveListItem = (blockId: string, itemIndex: number) => {
    const nextBlocks = blocks.map((b) => {
      if (b.id === blockId && b.type === "list") {
        const items = b.items.filter((_, idx) => idx !== itemIndex);
        return { ...b, items: items.length > 0 ? items : [""] };
      }
      return b;
    });
    updateBlocksAndSyncContent(nextBlocks);
  };

  // Filter Logic
  const filteredPosts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return posts.filter((post) => {
      const matchCat =
        categoryFilter === "All" || post.category.toLowerCase() === categoryFilter.toLowerCase();
      const matchStatus = statusFilter === "All" || post.status === statusFilter;
      const matchSearch =
        q === "" ||
        post.title.toLowerCase().includes(q) ||
        post.excerpt.toLowerCase().includes(q) ||
        post.author_name.toLowerCase().includes(q) ||
        (post.tags && post.tags.some((t) => t.toLowerCase().includes(q)));

      return matchCat && matchStatus && matchSearch;
    });
  }, [posts, categoryFilter, statusFilter, searchQuery]);

  // Category Actions
  const handleOpenCatModal = (catToEdit?: BlogCategoryItem) => {
    setCatFormError(null);
    setCatSuccessMsg(null);
    setCatDeleteConfirm(null);
    if (catToEdit) {
      setEditingCatId(catToEdit.id);
      setCatName(catToEdit.name);
      setCatDescription(catToEdit.description || "");
      setCatStatus(catToEdit.status);
      setCatOrderIndex(catToEdit.order_index);
    } else {
      setEditingCatId(null);
      setCatName("");
      setCatDescription("");
      setCatStatus("active");
      setCatOrderIndex(categoryList.length + 1);
    }
    setShowCatModal(true);
  };

  const handleResetCatForm = () => {
    setEditingCatId(null);
    setCatName("");
    setCatDescription("");
    setCatStatus("active");
    setCatOrderIndex(categoryList.length + 1);
    setCatFormError(null);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    setCatFormError(null);
    setCatSuccessMsg(null);

    const input: BlogCategoryInput = {
      id: editingCatId ?? undefined,
      name: catName.trim(),
      slug: slugifyBlogCategory(catName),
      description: catDescription.trim() || undefined,
      status: catStatus,
      order_index: Number(catOrderIndex),
    };

    const validation = validateBlogCategoryInput(input);
    if (!validation.valid) {
      setCatFormError(validation.error || "Please enter a valid category name.");
      return;
    }

    startTransition(async () => {
      try {
        const res = await saveBlogCategoryFn({ data: input });
        if (res.success && res.category) {
          setCatSuccessMsg(
            editingCatId ? "Category updated successfully!" : "Category created successfully!",
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

  const handleToggleCategoryStatus = async (cat: BlogCategoryItem) => {
    const nextStatus: "active" | "inactive" = cat.status === "active" ? "inactive" : "active";
    startTransition(async () => {
      try {
        await saveBlogCategoryFn({
          data: {
            id: cat.id,
            name: cat.name,
            slug: cat.slug,
            description: cat.description,
            order_index: cat.order_index,
            status: nextStatus,
          },
        });
        await refreshCategories();
        onRefresh();
      } catch (err) {
        console.error("Failed to toggle category status", err);
      }
    });
  };

  const handleDeleteCategoryClick = (cat: BlogCategoryItem) => {
    const count = categoryPostCounts[cat.name.toLowerCase()] || 0;
    setCatDeleteConfirm({
      id: cat.id,
      name: cat.name,
      count,
    });
  };

  const handleConfirmDeleteCategory = async () => {
    if (!catDeleteConfirm) return;
    const catId = catDeleteConfirm.id;

    startTransition(async () => {
      try {
        const res = await deleteBlogCategoryFn({ data: { id: catId } });
        if (res.success) {
          setCatDeleteConfirm(null);
          if (editingCatId === catId) {
            handleResetCatForm();
          }
          setCatSuccessMsg("Deleted category successfully.");
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

  // Post Actions
  const handleOpenCreate = () => {
    setEditingPost(null);
    setTitle("");
    const defaultCat = activeCategories[0]?.name || "AI";
    setCategory(defaultCat);
    setTags(["Architecture", "AI"]);
    setExcerpt("");
    const initialMd =
      "## Introduction\n\nWrite your rich technical essay or product architecture breakdown here...";
    setContent(initialMd);
    setBlocks(parseMarkdownToBlocks(initialMd));
    setBlockViewMode("builder");
    setCoverSourceType("upload");
    setCoverImage(
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
    );
    setCoverFile(null);
    setCoverPreviewUrl(
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
    );
    setImageError(null);
    setUploadProgress(0);
    setIsUploadingImage(false);
    setCoverCaption("");
    setCoverAlt("");
    setCoverCredit("Photography: DIMISI Technologies");
    setAuthorName("DIMISI Editorial");
    setAuthorRole("Engineering & Systems");
    setAuthorAvatar(
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    );
    setReadingTime("6 min read");
    setPublishedAt(new Date().toISOString().slice(0, 10));
    setIsFeatured(false);
    setStatus("published");
    setMetaTitle("");
    setMetaDescription("");
    setOgImage("");
    setOrderIndex(posts.length + 1);
    setModalTab("basic");
    setFormError(null);
    setFieldErrors({});
    setShowModal(true);
  };

  const handleOpenEdit = async (p: BlogPostItem) => {
    let postData = p;
    try {
      if (p.id && !p.id.startsWith("post-")) {
        postData = await getBlogByIdApi(p.id, categoryList);
      }
    } catch (err) {
      console.warn("Could not fetch fresh post by ID, using row data:", err);
    }
    setEditingPost(postData);
    setTitle(postData.title);
    setCategory(postData.category);
    setTags(postData.tags || []);
    setExcerpt(postData.excerpt);
    setContent(postData.content);
    setBlocks(parseMarkdownToBlocks(postData.content));
    setBlockViewMode("builder");
    setCoverSourceType("upload");
    setCoverImage(postData.cover_image);
    setCoverFile(null);
    setCoverPreviewUrl(postData.cover_image);
    setImageError(null);
    setUploadProgress(0);
    setIsUploadingImage(false);
    setCoverCaption(postData.cover_caption || "");
    setCoverAlt(postData.cover_alt || "");
    setCoverCredit(postData.cover_credit || "");
    setAuthorName(postData.author_name || "DIMISI Editorial");
    setAuthorRole(postData.author_role || "Engineering & Systems");
    setAuthorAvatar(
      postData.author_avatar ||
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    );
    setReadingTime(postData.reading_time || "6 min read");
    setPublishedAt(
      postData.published_at ? postData.published_at.slice(0, 10) : new Date().toISOString().slice(0, 10),
    );
    setIsFeatured(postData.is_featured);
    setStatus(postData.status);
    setMetaTitle(postData.meta_title || "");
    setMetaDescription(postData.meta_description || "");
    setOgImage(postData.og_image || "");
    setOrderIndex(postData.order_index);
    setModalTab("basic");
    setFormError(null);
    setFieldErrors({});
    setShowModal(true);
  };

  // Image Processing & Validation
  const processImageFile = useCallback((file: File) => {
    setImageError(null);

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setImageError("Unsupported image format. Use JPG, JPEG, PNG, or WEBP.");
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setImageError("Image is too large. Maximum allowed size is 10 MB.");
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
    [processImageFile],
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

    if (modalTab === "basic") {
      if (!title.trim() || title.trim().length < 3) {
        errors.title = "Blog title must be at least 3 characters long.";
      }
      if (!category.trim() || category.trim().length < 2) {
        errors.category = "Category is required.";
      }
      if (!excerpt.trim() || excerpt.trim().length < 10) {
        errors.excerpt = "Short description/excerpt must be at least 10 characters long.";
      }
      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        setFormError("Please complete the required Basic Info fields.");
        return;
      }
      setFieldErrors({});
      setModalTab("cover");
      return;
    }

    if (modalTab === "cover") {
      if (!coverImage.trim() && !coverFile) {
        setImageError("Primary cover image is required.");
        setFormError("Please select or upload a cover image.");
        return;
      }
      setModalTab("content");
      return;
    }

    if (modalTab === "content") {
      const serialized =
        blockViewMode === "raw" ? content.trim() : serializeBlocksToMarkdown(blocks).trim();
      if (!serialized || serialized.length < 20) {
        errors.content = "Article content must be at least 20 characters long.";
        setFieldErrors(errors);
        setFormError("Please add headings, paragraphs, or bullet points before proceeding.");
        return;
      }
      setContent(serialized);
      setFieldErrors({});
      setModalTab("seo");
      return;
    }
  };

  const handlePrevStep = () => {
    setFormError(null);
    if (modalTab === "seo") setModalTab("content");
    else if (modalTab === "content") setModalTab("cover");
    else if (modalTab === "cover") setModalTab("basic");
  };

  // Form Submission
  const handleSavePost = (statusOverride?: BlogStatus) => {
    setFormError(null);
    setFieldErrors({});

    const finalStatus = statusOverride || status;
    const finalContent =
      blockViewMode === "raw" ? content.trim() : serializeBlocksToMarkdown(blocks).trim();

    const input: BlogPostInput = {
      id: editingPost?.id ?? undefined,
      title: title.trim(),
      slug: editingPost?.slug || slugifyBlog(title),
      category: category.trim(),
      tags,
      excerpt: excerpt.trim(),
      content: finalContent,
      cover_image: coverImage.trim(),
      cover_caption: coverCaption.trim() || undefined,
      cover_alt: coverAlt.trim() || undefined,
      cover_credit: coverCredit.trim() || undefined,
      author_name: authorName.trim() || "DIMISI Editorial",
      author_role: authorRole.trim() || undefined,
      author_avatar: authorAvatar.trim() || undefined,
      reading_time: readingTime.trim() || "6 min read",
      published_at: publishedAt ? new Date(publishedAt).toISOString() : new Date().toISOString(),
      is_featured: isFeatured,
      status: finalStatus,
      meta_title: metaTitle.trim() || undefined,
      meta_description: metaDescription.trim() || undefined,
      og_image: ogImage.trim() || coverImage.trim() || undefined,
      order_index: Number(orderIndex),
    };

    const validation = validateBlogPostInput(input);
    if (!validation.valid) {
      setFormError(validation.error || "Please check the highlighted fields.");
      if (validation.field) {
        setFieldErrors({ [validation.field]: validation.error || "Invalid field." });
        if (
          validation.field === "title" ||
          validation.field === "category" ||
          validation.field === "excerpt"
        ) {
          setModalTab("basic");
        } else if (validation.field === "cover_image") {
          setModalTab("cover");
        } else if (validation.field === "content") {
          setModalTab("content");
        }
      }
      return;
    }

    startTransition(async () => {
      try {
        const res = await saveBlogPostFn({ data: input, coverImageFile: coverFile });
        if (res.success) {
          setShowModal(false);
          onRefresh();
        } else {
          setFormError(res.error || "Failed to save blog post.");
        }
      } catch (err) {
        setFormError(err instanceof Error ? err.message : "Error saving blog post.");
      }
    });
  };

  const handleConfirmDeletePost = () => {
    if (!postDeleteConfirm) return;
    const { id } = postDeleteConfirm;
    startTransition(async () => {
      try {
        const res = await deleteBlogPostFn({ data: { id } });
        if (res.success) {
          setPostDeleteConfirm(null);
          onRefresh();
        } else {
          alert(res.error || "Failed to delete blog post.");
        }
      } catch (err) {
        console.error("Failed to delete blog post", err);
        alert(err instanceof Error ? err.message : "Failed to delete blog post.");
      }
    });
  };

  const handleToggleStatus = (p: BlogPostItem) => {
    startTransition(async () => {
      try {
        const res = await toggleBlogActiveFn({ data: { id: p.id } });
        if (res.success) {
          onRefresh();
        } else {
          alert(res.error || "Failed to toggle blog status.");
        }
      } catch (err) {
        console.error("Failed to toggle blog status", err);
        alert(err instanceof Error ? err.message : "Failed to toggle blog status.");
      }
    });
  };

  const handleToggleFeatured = (p: BlogPostItem) => {
    startTransition(async () => {
      try {
        const res = await setBlogFeaturedFn({ data: { id: p.id } });
        if (res.success) {
          onRefresh();
        } else {
          alert(res.error || "Failed to toggle blog featured status.");
        }
      } catch (err) {
        console.error("Failed to toggle blog featured status", err);
        alert(err instanceof Error ? err.message : "Failed to toggle blog featured status.");
      }
    });
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setConfigSuccess(false);

    startTransition(async () => {
      try {
        const res = await saveBlogConfigFn({
          data: {
            config: {
              under_development_notice_active: noticeActive,
              under_development_notice_heading: noticeHeading,
              under_development_notice_text: noticeText,
              hero_heading: heroHeading,
              hero_subline: heroSubline,
            },
          },
        });
        if (res.success) {
          setConfigSuccess(true);
          onRefresh();
          setTimeout(() => setConfigSuccess(false), 3000);
        } else {
          alert(res.error || "Failed to save blog configuration.");
        }
      } catch (err) {
        console.error(err);
        alert(err instanceof Error ? err.message : "Failed to save configuration.");
      }
    });
  };

  return (
    <div className={styles.wrapper}>
      {/* Top Header */}
      <div className={styles.headerRow}>
        <div>
          <h2 className={styles.title}>Blog &amp; Editorial Publications</h2>
          <p className={styles.subtitle}>
            Publish articles, tech breakdowns, AI research papers, and manage the dynamic Category
            Taxonomy &amp; Notice Banner.
          </p>
        </div>

        <div className={styles.actions}>
          <div className={styles.sectionTabs}>
            <button
              type="button"
              className={[
                styles.sectionTabBtn,
                activeSection === "posts" ? styles.sectionTabBtnActive : "",
              ].join(" ")}
              onClick={() => setActiveSection("posts")}
            >
              <BookOpen size={14} />
              <span>Articles ({posts.length})</span>
            </button>
            <button
              type="button"
              className={[
                styles.sectionTabBtn,
                activeSection === "settings" ? styles.sectionTabBtnActive : "",
              ].join(" ")}
              onClick={() => setActiveSection("settings")}
            >
              <Settings size={14} />
              <span>Banner &amp; Notice</span>
            </button>
          </div>

          {activeSection === "posts" && (
            <div className={styles.headerBtnGroup}>
              <button
                type="button"
                className={styles.manageCatHeaderBtn}
                onClick={() => handleOpenCatModal()}
                title="Open Category Taxonomy Manager"
              >
                <SlidersHorizontal size={15} />
                <span>Manage Categories ({categoryList.length})</span>
              </button>

              <button type="button" className={styles.createBtn} onClick={handleOpenCreate}>
                <Plus size={16} />
                <span>Create New Blog Post</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* SECTION 1: ARTICLES LIST */}
      {activeSection === "posts" && (
        <div className={styles.postsSection}>
          {/* Filters Bar: Search + Status Dropdown + Category Dropdown */}
          <div className={styles.filtersBar}>
            <div className={styles.secondaryFiltersRow}>
              {/* Search Box */}
              <div className={styles.searchBox}>
                <Search size={15} className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search articles by title, author, category, or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
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
                    aria-label="Filter articles by status"
                  >
                    <div className={styles.catDropdownTriggerLeft}>
                      <Eye size={13} className={styles.dropdownIcon} />
                      <span className={styles.catDropdownTriggerText}>
                        {statusFilter === "All"
                          ? "All Status"
                          : statusFilter === "published"
                            ? "Live / Published"
                            : "Draft"}
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
                        <span className={styles.catDropdownItemCount}>({posts.length})</span>
                      </button>

                      <div className={styles.catDropdownDivider} />

                      <button
                        type="button"
                        className={[
                          styles.catDropdownItem,
                          statusFilter === "published" ? styles.catDropdownItemActive : "",
                        ].join(" ")}
                        onClick={() => {
                          setStatusFilter("published");
                          setIsStatusDropdownOpen(false);
                        }}
                      >
                        <div className={styles.catDropdownItemLeft}>
                          {statusFilter === "published" ? (
                            <Check size={14} className={styles.catDropdownCheck} />
                          ) : (
                            <span className={styles.catDropdownCheckPlaceholder} />
                          )}
                          <span>Live / Published</span>
                        </div>
                        <span className={styles.catDropdownItemCount}>
                          ({posts.filter((p) => p.status === "published").length})
                        </span>
                      </button>

                      <button
                        type="button"
                        className={[
                          styles.catDropdownItem,
                          statusFilter === "draft" ? styles.catDropdownItemActive : "",
                        ].join(" ")}
                        onClick={() => {
                          setStatusFilter("draft");
                          setIsStatusDropdownOpen(false);
                        }}
                      >
                        <div className={styles.catDropdownItemLeft}>
                          {statusFilter === "draft" ? (
                            <Check size={14} className={styles.catDropdownCheck} />
                          ) : (
                            <span className={styles.catDropdownCheckPlaceholder} />
                          )}
                          <span>Drafts</span>
                        </div>
                        <span className={styles.catDropdownItemCount}>
                          ({posts.filter((p) => p.status !== "published").length})
                        </span>
                      </button>
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
                    aria-label="Filter articles by category"
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
                        <span className={styles.catDropdownItemCount}>({posts.length})</span>
                      </button>

                      <div className={styles.catDropdownDivider} />

                      {activeCategories.map((c) => {
                        const count = categoryPostCounts[c.name.toLowerCase()] || 0;
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

          {/* Table Card with Fixed Grid Columns */}
          <div className={styles.tableCard}>
            <table className={styles.table}>
              <colgroup>
                <col style={{ width: "70px" }} />
                <col style={{ width: "90px" }} />
                <col style={{ width: "340px" }} />
                <col style={{ width: "140px" }} />
                <col style={{ width: "190px" }} />
                <col style={{ width: "130px" }} />
                <col style={{ width: "130px" }} />
                <col style={{ width: "170px" }} />
              </colgroup>
              <thead>
                <tr>
                  <th className={styles.thCenter}>Order</th>
                  <th className={styles.thCenter}>Cover</th>
                  <th>Article Title</th>
                  <th>Category</th>
                  <th>Author</th>
                  <th className={styles.thCenter}>Reading Time</th>
                  <th className={styles.thCenter}>Status &amp; Spotlight</th>
                  <th className={styles.thRight}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPosts.length > 0 ? (
                  filteredPosts.map((p) => (
                    <tr key={p.id} className={p.status !== "published" ? styles.inactiveRow : ""}>
                      {/* Order Index */}
                      <td className={styles.orderCell}>{p.order_index}</td>

                      {/* Cover Thumbnail */}
                      <td className={styles.coverCell}>
                        <img
                          src={p.cover_image || FALLBACK_COVER}
                          alt={p.title}
                          className={styles.thumbImg}
                          loading="lazy"
                          decoding="async"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = FALLBACK_COVER;
                          }}
                        />
                      </td>

                      {/* Title only (No slug exposed) */}
                      <td>
                        <div className={styles.titleCol}>
                          <span className={styles.postTitle} title={p.title}>
                            {p.title}
                          </span>
                          {p.is_featured && (
                            <div className={styles.titleMetaRow}>
                              <span className={styles.featuredSpotlightBadge}>
                                <Star size={10} /> FEATURED SPOTLIGHT
                              </span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Category Badge */}
                      <td>
                        <span className={styles.categoryBadge} title={p.category}>
                          <Tag size={11} className={styles.badgeTagIcon} />
                          <span>{p.category}</span>
                        </span>
                      </td>

                      {/* Author Info */}
                      <td>
                        <div className={styles.authorCell}>
                          {p.author_avatar ? (
                            <img
                              src={p.author_avatar}
                              alt={p.author_name}
                              className={styles.avatarImg}
                              loading="lazy"
                              decoding="async"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                                const next = e.currentTarget.nextElementSibling;
                                if (next && "style" in next)
                                  (next as HTMLElement).style.display = "flex";
                              }}
                            />
                          ) : null}
                          <div
                            className={styles.avatarFallback}
                            style={{ display: p.author_avatar ? "none" : "flex" }}
                          >
                            {p.author_name ? p.author_name.slice(0, 2).toUpperCase() : "ED"}
                          </div>
                          <div className={styles.authorMeta}>
                            <span className={styles.authorName}>{p.author_name}</span>
                            {p.author_role && (
                              <span className={styles.authorRole}>{p.author_role}</span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Reading Time */}
                      <td className={styles.timeCell}>
                        <div className={styles.timeBadge}>
                          <Clock size={12} className={styles.timeIcon} />
                          <span>{p.reading_time || "5 min read"}</span>
                        </div>
                      </td>

                      {/* Status & Featured Spotlight */}
                      <td>
                        <div className={styles.statusCell}>
                          <button
                            type="button"
                            className={[
                              styles.toggleStatusBtn,
                              p.status === "published"
                                ? styles.statusPublished
                                : styles.statusDraft,
                            ].join(" ")}
                            onClick={() => handleToggleStatus(p)}
                            title={
                              p.status === "published"
                                ? "Article is LIVE — Click to set to Draft"
                                : "Article is DRAFT — Click to Publish"
                            }
                          >
                            {p.status === "published" ? (
                              <Eye size={14} className={styles.statusIcon} />
                            ) : (
                              <EyeOff size={14} className={styles.statusIcon} />
                            )}
                            <span>{p.status === "published" ? "Live" : "Draft"}</span>
                          </button>

                          <button
                            type="button"
                            className={[
                              styles.starIconBtn,
                              p.is_featured ? styles.starActive : styles.starInactive,
                            ].join(" ")}
                            onClick={() => handleToggleFeatured(p)}
                            title={
                              p.is_featured
                                ? "Featured spotlight active (click to unfeature)"
                                : "Click to feature this article on the blog hero spotlight"
                            }
                          >
                            <Star size={14} />
                          </button>
                        </div>
                      </td>

                      {/* Action Buttons */}
                      <td>
                        <div className={styles.rowActions}>
                          <button
                            type="button"
                            className={styles.editBtn}
                            onClick={() => handleOpenEdit(p)}
                            title="Edit Article"
                          >
                            <Edit2 size={13} />
                            <span>Edit</span>
                          </button>

                          <a
                            href={"/blog/" + p.slug}
                            target="_blank"
                            rel="noreferrer"
                            className={styles.viewLiveBtn}
                            title="View Public Article Page"
                          >
                            <ExternalLink size={13} />
                          </a>

                          <button
                            type="button"
                            className={styles.delBtn}
                            onClick={() => setPostDeleteConfirm({ id: p.id, title: p.title })}
                            title="Delete Article"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className={styles.emptyStateRow}>
                      <div className={styles.emptyStateContent}>
                        <BookOpen size={36} className={styles.emptyStateIcon} />
                        <h4>No Published Articles Found</h4>
                        <p>
                          {searchQuery || categoryFilter !== "All" || statusFilter !== "All"
                            ? "No articles matched your active filters. Try clearing filters or searching for different keywords."
                            : "Create your first editorial breakdown or tech essay using the button below."}
                        </p>
                        <div>
                          <button
                            type="button"
                            className={styles.createEmptyBtn}
                            onClick={handleOpenCreate}
                          >
                            <Plus size={14} />
                            <span>Create New Post</span>
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 2: UNDER DEVELOPMENT NOTICE & BANNER SETTINGS */}
      {activeSection === "settings" && (
        <div className={styles.settingsCard}>
          <div className={styles.settingsHeader}>
            <Construction size={22} className={styles.noticeIcon} />
            <div>
              <h3 className={styles.settingsTitle}>Under Development Notice &amp; Hero Settings</h3>
              <p className={styles.settingsSub}>
                Toggle and configure the dynamic cyberpunk construction banner visible on the public
                Blog hub.
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveConfig} className={styles.settingsForm}>
            <div className={styles.toggleRow}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={noticeActive}
                  onChange={(e) => setNoticeActive(e.target.checked)}
                />
                <span>Enable "Editorial Ecosystem Under Active Development" Notice Banner</span>
              </label>
            </div>

            <div className={styles.formGrid2}>
              <div className={styles.formGroup}>
                <label>Notice Banner Heading</label>
                <input
                  type="text"
                  value={noticeHeading}
                  onChange={(e) => setNoticeHeading(e.target.value)}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Notice Banner Description</label>
                <input
                  type="text"
                  value={noticeText}
                  onChange={(e) => setNoticeText(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.formGrid2}>
              <div className={styles.formGroup}>
                <label>Hero Heading</label>
                <input
                  type="text"
                  value={heroHeading}
                  onChange={(e) => setHeroHeading(e.target.value)}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Hero Subline</label>
                <input
                  type="text"
                  value={heroSubline}
                  onChange={(e) => setHeroSubline(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.saveConfigRow}>
              {configSuccess && (
                <span className={styles.successMsg}>
                  <CheckCircle2 size={16} /> Saved banner settings successfully!
                </span>
              )}
              <button type="submit" disabled={isPending} className={styles.saveSubmitBtn}>
                <Save size={15} />
                <span>Save Banner Settings</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =========================================================================
         DYNAMIC BLOG CATEGORY MANAGEMENT MODAL
         ========================================================================= */}
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
                  <h3 className={styles.modalTitle}>Blog Category Taxonomy &amp; Topics</h3>
                  <p className={styles.modalSub}>
                    Manage dynamic editorial categories, descriptions, and filter display states.
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
                      ? "Warning: There are currently " +
                        catDeleteConfirm.count +
                        " published article(s) tagged with this category. Deleting this category will remove it from the taxonomy and active filters."
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
                      placeholder="e.g. Autonomous systems, perception pipelines, and applied robotics..."
                    />
                  </div>

                  <div className={styles.formGrid2}>
                    <div className={styles.formGroup}>
                      <label>Display Order Index</label>
                      <input
                        type="number"
                        value={catOrderIndex}
                        onChange={(e) => setCatOrderIndex(Number(e.target.value))}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label>Status</label>
                      <select
                        value={catStatus}
                        onChange={(e) => setCatStatus(e.target.value as "active" | "inactive")}
                        className={styles.selectInput}
                      >
                        <option value="active">Active (Visible in Filter)</option>
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
                    <button type="submit" disabled={isPending} className={styles.saveSubmitBtn}>
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
                    <span>Configured Categories</span>
                    <span className={styles.catCountBadge}>{categoryList.length}</span>
                  </h4>
                  <span className={styles.catListSub}>
                    Active categories appear on the public blog filter bar.
                  </span>
                </div>

                <div className={styles.catListScrollContainer}>
                  <table className={styles.catTable}>
                    <thead>
                      <tr>
                        <th style={{ width: "50px" }}>Order</th>
                        <th>Category Name</th>
                        <th style={{ width: "90px" }}>Articles</th>
                        <th style={{ width: "95px" }}>Status</th>
                        <th style={{ width: "110px", textAlign: "right" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categoryList
                        .sort((a, b) => a.order_index - b.order_index)
                        .map((cat) => {
                          const count = categoryPostCounts[cat.name.toLowerCase()] || 0;
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
                                    <span className={styles.catItemDesc}>{cat.description}</span>
                                  )}
                                </div>
                              </td>
                              <td>
                                <span className={styles.catPostCountBadge}>
                                  {count} post{count !== 1 ? "s" : ""}
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
                                    <Edit2 size={12} />
                                    <span>Edit</span>
                                  </button>
                                  <button
                                    type="button"
                                    className={styles.catDelBtn}
                                    onClick={() => handleDeleteCategoryClick(cat)}
                                    title="Delete Category"
                                  >
                                    <Trash2 size={12} />
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

      {/* =========================================================================
         CREATE / EDIT ARTICLE MODAL (WIZARD STEPS)
         ========================================================================= */}
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
            {/* Modal Header */}
            <div className={styles.modalHeader}>
              <div>
                <h3 className={styles.modalTitle}>
                  {editingPost ? "Edit Article: " + editingPost.title : "Create New Blog Post"}
                </h3>
                <p className={styles.modalSub}>
                  Craft high-impact engineering breakdowns, AI whitepapers, and product updates.
                </p>
              </div>
              <button
                type="button"
                className={styles.modalClose}
                onClick={() => setShowModal(false)}
                title="Close Modal (Esc)"
              >
                <X size={18} />
              </button>
            </div>

            {/* Step Tabs Navigation */}
            <div className={styles.modalTabsBar}>
              {MODAL_STEPS.map((s) => {
                const isActive = modalTab === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    ref={(el) => {
                      tabRefs.current[s.id] = el;
                    }}
                    className={[styles.modalTabBtn, isActive ? styles.modalTabBtnActive : ""].join(
                      " ",
                    )}
                    onClick={() => setModalTab(s.id)}
                  >
                    <span className={styles.modalTabNum}>{s.num}</span>
                    <span>{s.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Error Notifications */}
            {formError && (
              <div className={styles.errorAlert} style={{ margin: "1rem 1.75rem 0" }}>
                <AlertCircle size={16} />
                <span>{formError}</span>
              </div>
            )}

            {/* Step Body */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSavePost();
              }}
              className={styles.modalForm}
            >
              {/* Single Independent Scrollable Body */}
              <div className={styles.modalBodyScroll} data-lenis-prevent>
                {/* STEP 1: BASIC INFO & META */}
                {modalTab === "basic" && (
                  <div className={styles.tabPane}>
                    {/* Title full width */}
                    <div className={styles.formGroup}>
                      <label>Blog Post Title *</label>
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
                        placeholder="e.g. Architecting Distributed AI Agents for Enterprise Scale"
                      />
                      {fieldErrors.title && (
                        <span className={styles.fieldErrorText}>{fieldErrors.title}</span>
                      )}
                    </div>

                    <div className={styles.formGrid3}>
                      {/* Dynamic Category Selector */}
                      <div className={styles.formGroup}>
                        <div className={styles.labelWithAction}>
                          <label>Category *</label>
                          <button
                            type="button"
                            className={styles.smallInlineLink}
                            onClick={() => handleOpenCatModal()}
                          >
                            + Manage
                          </button>
                        </div>
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className={styles.selectInput}
                        >
                          {activeCategories.map((cat) => (
                            <option key={cat.id} value={cat.name}>
                              {cat.name}
                            </option>
                          ))}
                          {!activeCategories.some(
                            (c) => c.name.toLowerCase() === category.toLowerCase(),
                          ) && <option value={category}>{category} (Custom / Inactive)</option>}
                        </select>
                      </div>

                      <div className={styles.formGroup}>
                        <label>Reading Time</label>
                        <input
                          type="text"
                          value={readingTime}
                          onChange={(e) => setReadingTime(e.target.value)}
                          placeholder="e.g. 7 min read"
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label>Publication Date</label>
                        <input
                          type="date"
                          value={publishedAt}
                          onChange={(e) => setPublishedAt(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className={styles.formGrid2}>
                      <div className={styles.formGroup}>
                        <label>Display Order Index</label>
                        <input
                          type="number"
                          value={orderIndex}
                          onChange={(e) => setOrderIndex(Number(e.target.value))}
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label>Publication Status</label>
                        <select
                          value={status}
                          onChange={(e) => setStatus(e.target.value as BlogStatus)}
                          className={styles.selectInput}
                        >
                          <option value="published">Published (Live)</option>
                          <option value="draft">Draft (Unpublished)</option>
                          <option value="archived">Archived</option>
                        </select>
                      </div>
                    </div>

                    <div className={styles.formGroup}>
                      <label>Tags &amp; Keywords</label>
                      <div className={styles.chipsRow}>
                        {tags.map((t, i) => (
                          <span key={i} className={styles.chip}>
                            <Tag size={12} className={styles.chipCheck} />
                            <span>{t}</span>
                            <button
                              type="button"
                              onClick={() => setTags(tags.filter((_, idx) => idx !== i))}
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
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          placeholder="Add topic tag (e.g. LLM, Rust, Kubernetes)..."
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              if (newTag.trim()) {
                                setTags([...tags, newTag.trim()]);
                                setNewTag("");
                              }
                            }
                          }}
                        />
                        <button
                          type="button"
                          className={styles.smallAddBtn}
                          onClick={() => {
                            if (newTag.trim()) {
                              setTags([...tags, newTag.trim()]);
                              setNewTag("");
                            }
                          }}
                        >
                          Add Tag
                        </button>
                      </div>
                    </div>

                    <div className={styles.formGroup}>
                      <label>Short Description / Article Excerpt *</label>
                      <textarea
                        rows={3}
                        required
                        value={excerpt}
                        className={fieldErrors.excerpt ? styles.inputError : ""}
                        onChange={(e) => {
                          setExcerpt(e.target.value);
                          if (fieldErrors.excerpt) {
                            setFieldErrors((prev) => {
                              const copy = { ...prev };
                              delete copy.excerpt;
                              return copy;
                            });
                          }
                        }}
                        placeholder="Concise, high-impact summary displayed on blog cards and search snippets..."
                      />
                      {fieldErrors.excerpt && (
                        <span className={styles.fieldErrorText}>{fieldErrors.excerpt}</span>
                      )}
                    </div>
                  </div>
                )}

                {/* STEP 2: COVER & VISUALS */}
                {modalTab === "cover" && (
                  <div className={styles.tabPane}>
                    <div className={styles.uploadSectionBox}>
                      <div className={styles.uploadSectionHeader}>
                        <h4 className={styles.uploadSectionTitle}>
                          <ImageIcon size={16} />
                          <span>ARTICLE COVER IMAGE *</span>
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
                        Upload or paste a high-resolution hero cover image (16:9 recommended).
                        Supported: <strong>JPG, PNG, WEBP</strong> (Max <strong>10 MB</strong>).
                      </p>

                      {/* Upload Mode */}
                      {coverSourceType === "upload" && (
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
                                  <span>
                                    {coverFile
                                      ? coverFile.name +
                                        " (" +
                                        (coverFile.size / (1024 * 1024)).toFixed(2) +
                                        " MB)"
                                      : "Active Cover Image"}
                                  </span>
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
                                Drag and drop cover image,{" "}
                                <span className={styles.browseLink}>Choose Image</span>, or paste
                                with <kbd className={styles.kbdShortcut}>Ctrl + V</kbd>
                              </h5>
                              <span className={styles.dropzoneSub}>
                                Supports JPG, PNG, WEBP up to 10MB
                              </span>
                            </div>
                          )}

                          {isUploadingImage && (
                            <div className={styles.uploadProgressBar}>
                              <div
                                className={styles.uploadProgressFill}
                                style={{ width: uploadProgress + "%" }}
                              />
                            </div>
                          )}
                        </div>
                      )}

                      {/* URL Mode */}
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
                                setImageError(null);
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

                      {imageError && (
                        <div className={styles.imageErrorText}>
                          <AlertCircle size={13} />
                          <span>{imageError}</span>
                        </div>
                      )}
                    </div>

                    {/* Image Metadata */}
                    <div className={styles.metaFieldsBox}>
                      <h4 className={styles.metaFieldsTitle}>
                        <Sparkles size={14} />
                        <span>Cover Metadata &amp; Accessibility</span>
                      </h4>

                      <div className={styles.formGrid2}>
                        <div className={styles.formGroup}>
                          <label>Cover Caption</label>
                          <input
                            type="text"
                            value={coverCaption}
                            onChange={(e) => setCoverCaption(e.target.value)}
                            placeholder="e.g. Neural sensor fusion pipeline running at 120fps."
                          />
                        </div>

                        <div className={styles.formGroup}>
                          <label>Photography / Graphic Credit</label>
                          <input
                            type="text"
                            value={coverCredit}
                            onChange={(e) => setCoverCredit(e.target.value)}
                            placeholder="e.g. Photography: DIMISI Technologies"
                          />
                        </div>
                      </div>

                      <div className={styles.formGroup}>
                        <label>Alt Text (SEO &amp; Screen Readers)</label>
                        <input
                          type="text"
                          value={coverAlt}
                          onChange={(e) => setCoverAlt(e.target.value)}
                          placeholder="e.g. High-throughput neural processing pipeline architecture schematic"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 3: VISUAL MODULAR BLOCK BUILDER */}
                {modalTab === "content" && (
                  <div className={styles.tabPane}>
                    <div className={styles.blockBuilderContainer}>
                      {/* Top Bar with Mode Switcher & Block Stats */}
                      <div className={styles.blockBuilderTopBar}>
                        <div className={styles.blockModeToggleGroup}>
                          <button
                            type="button"
                            className={[
                              styles.blockModeBtn,
                              blockViewMode === "builder" ? styles.blockModeBtnActive : "",
                            ].join(" ")}
                            onClick={() => {
                              if (blockViewMode === "raw") {
                                setBlocks(parseMarkdownToBlocks(content));
                              }
                              setBlockViewMode("builder");
                            }}
                          >
                            <Layers size={14} />
                            <span>Visual Blocks ({blocks.length})</span>
                          </button>

                          <button
                            type="button"
                            className={[
                              styles.blockModeBtn,
                              blockViewMode === "preview" ? styles.blockModeBtnActive : "",
                            ].join(" ")}
                            onClick={() => {
                              if (blockViewMode === "raw") {
                                setBlocks(parseMarkdownToBlocks(content));
                              }
                              setBlockViewMode("preview");
                            }}
                          >
                            <Eye size={14} />
                            <span>Live Preview</span>
                          </button>

                          <button
                            type="button"
                            className={[
                              styles.blockModeBtn,
                              blockViewMode === "raw" ? styles.blockModeBtnActive : "",
                            ].join(" ")}
                            onClick={() => {
                              setContent(serializeBlocksToMarkdown(blocks));
                              setBlockViewMode("raw");
                            }}
                          >
                            <FileCode size={14} />
                            <span>Raw Markdown</span>
                          </button>
                        </div>

                        <div className={styles.blockStatsSummary}>
                          <span className={styles.blockStatsBadge}>
                            <span>
                              Blocks: <strong>{blocks.length}</strong>
                            </span>
                          </span>
                          <span className={styles.blockStatsBadge}>
                            <span>
                              Est. Read:{" "}
                              <strong>
                                {Math.max(1, Math.round(content.split(/\s+/).length / 200))} min
                              </strong>
                            </span>
                          </span>
                        </div>
                      </div>

                      {/* Quick Add Toolbar (Visible in Builder Mode) */}
                      {blockViewMode === "builder" && (
                        <div className={styles.quickAddToolbar}>
                          <span className={styles.quickAddLabel}>+ Add Block:</span>

                          <button
                            type="button"
                            className={styles.quickAddBtn}
                            onClick={() => handleAddBlock("heading", 2)}
                          >
                            <HeadingIcon size={13} />
                            <span>+ H2 Heading</span>
                          </button>

                          <button
                            type="button"
                            className={styles.quickAddBtn}
                            onClick={() => handleAddBlock("heading", 3)}
                          >
                            <HeadingIcon size={13} />
                            <span>+ H3 Heading</span>
                          </button>

                          <button
                            type="button"
                            className={styles.quickAddBtn}
                            onClick={() => handleAddBlock("heading", 4)}
                          >
                            <HeadingIcon size={13} />
                            <span>+ H4 Heading</span>
                          </button>

                          <button
                            type="button"
                            className={styles.quickAddBtn}
                            onClick={() => handleAddBlock("paragraph")}
                          >
                            <Type size={13} />
                            <span>+ Paragraph</span>
                          </button>

                          <button
                            type="button"
                            className={styles.quickAddBtn}
                            onClick={() => handleAddBlock("list")}
                          >
                            <ListIcon size={13} />
                            <span>+ Bullet Points</span>
                          </button>

                          <button
                            type="button"
                            className={styles.quickAddBtn}
                            onClick={() => {
                              const newBlock: ListBlock = {
                                id: generateBlockId("list"),
                                type: "list",
                                style: "numbered",
                                items: [""],
                              };
                              updateBlocksAndSyncContent([...blocks, newBlock]);
                            }}
                          >
                            <ListOrdered size={13} />
                            <span>+ Numbered List</span>
                          </button>

                          <button
                            type="button"
                            className={styles.quickAddBtn}
                            onClick={() => handleAddBlock("code")}
                          >
                            <CodeIcon size={13} />
                            <span>+ Code Block</span>
                          </button>

                          <button
                            type="button"
                            className={styles.quickAddBtn}
                            onClick={() => handleAddBlock("quote")}
                          >
                            <QuoteIcon size={13} />
                            <span>+ Quote / Callout</span>
                          </button>
                        </div>
                      )}

                      {/* MODE 1: VISUAL BLOCK BUILDER CARDS */}
                      {blockViewMode === "builder" && (
                        <div className={styles.blocksList}>
                          {blocks.length === 0 ? (
                            <div className={styles.emptyBlocksState}>
                              <Layers size={32} className={styles.emptyBlocksIcon} />
                              <h4 className={styles.emptyBlocksTitle}>No Content Blocks Yet</h4>
                              <p className={styles.emptyBlocksText}>
                                Click any of the "+ Add Block" buttons above to start building your
                                article structure.
                              </p>
                            </div>
                          ) : (
                            blocks.map((block, idx) => {
                              return (
                                <div key={block.id} className={styles.blockCard}>
                                  {/* Block Header */}
                                  <div className={styles.blockCardHeader}>
                                    <div className={styles.blockHeaderLeft}>
                                      <span className={styles.blockIndexNum}>
                                        {String(idx + 1).padStart(2, "0")}
                                      </span>

                                      {/* Block Type Badges */}
                                      {block.type === "heading" && (
                                        <span
                                          className={[
                                            styles.blockTypeBadge,
                                            styles.badgeHeading,
                                          ].join(" ")}
                                        >
                                          <HeadingIcon size={12} />
                                          <span>
                                            {(block as HeadingBlock).level === 4
                                              ? "H4 Minor Heading"
                                              : (block as HeadingBlock).level === 3
                                                ? "H3 Sub-Heading"
                                                : "H2 Section Heading"}
                                          </span>
                                        </span>
                                      )}

                                      {block.type === "paragraph" && (
                                        <span
                                          className={[
                                            styles.blockTypeBadge,
                                            styles.badgeParagraph,
                                          ].join(" ")}
                                        >
                                          <Type size={12} />
                                          <span>Paragraph Block</span>
                                        </span>
                                      )}

                                      {block.type === "list" && (
                                        <span
                                          className={[styles.blockTypeBadge, styles.badgeList].join(
                                            " ",
                                          )}
                                        >
                                          {(block as ListBlock).style === "numbered" ? (
                                            <ListOrdered size={12} />
                                          ) : (
                                            <ListIcon size={12} />
                                          )}
                                          <span>
                                            {(block as ListBlock).style === "numbered"
                                              ? "Numbered List"
                                              : "Bullet Points"}
                                          </span>
                                        </span>
                                      )}

                                      {block.type === "code" && (
                                        <span
                                          className={[styles.blockTypeBadge, styles.badgeCode].join(
                                            " ",
                                          )}
                                        >
                                          <CodeIcon size={12} />
                                          <span>
                                            Code Block (
                                            {(block as CodeBlock).language || "typescript"})
                                          </span>
                                        </span>
                                      )}

                                      {block.type === "quote" && (
                                        <span
                                          className={[
                                            styles.blockTypeBadge,
                                            styles.badgeQuote,
                                          ].join(" ")}
                                        >
                                          <QuoteIcon size={12} />
                                          <span>Quote / Callout</span>
                                        </span>
                                      )}

                                      {block.type === "raw" && (
                                        <span
                                          className={[styles.blockTypeBadge, styles.badgeRaw].join(
                                            " ",
                                          )}
                                        >
                                          <FileCode size={12} />
                                          <span>Custom Markdown</span>
                                        </span>
                                      )}
                                    </div>

                                    {/* Block Action Buttons */}
                                    <div className={styles.blockHeaderActions}>
                                      <button
                                        type="button"
                                        className={styles.blockActionBtn}
                                        disabled={idx === 0}
                                        onClick={() => handleMoveBlock(idx, "up")}
                                        title="Move block up"
                                      >
                                        <MoveUp size={13} />
                                      </button>

                                      <button
                                        type="button"
                                        className={styles.blockActionBtn}
                                        disabled={idx === blocks.length - 1}
                                        onClick={() => handleMoveBlock(idx, "down")}
                                        title="Move block down"
                                      >
                                        <MoveDown size={13} />
                                      </button>

                                      <button
                                        type="button"
                                        className={styles.blockDeleteBtn}
                                        onClick={() => handleRemoveBlock(block.id)}
                                        title="Delete block"
                                      >
                                        <Trash2 size={13} />
                                      </button>
                                    </div>
                                  </div>

                                  {/* Block Card Body */}
                                  <div className={styles.blockCardBody}>
                                    {/* 1. HEADING BLOCK */}
                                    {block.type === "heading" && (
                                      <div className={styles.headingControlsRow}>
                                        <div className={styles.headingLevelGroup}>
                                          <button
                                            type="button"
                                            className={[
                                              styles.levelBtn,
                                              (block as HeadingBlock).level === 2
                                                ? styles.levelBtnActive
                                                : "",
                                            ].join(" ")}
                                            onClick={() =>
                                              handleUpdateBlock(block.id, { level: 2 })
                                            }
                                          >
                                            H2
                                          </button>
                                          <button
                                            type="button"
                                            className={[
                                              styles.levelBtn,
                                              (block as HeadingBlock).level === 3
                                                ? styles.levelBtnActive
                                                : "",
                                            ].join(" ")}
                                            onClick={() =>
                                              handleUpdateBlock(block.id, { level: 3 })
                                            }
                                          >
                                            H3
                                          </button>
                                          <button
                                            type="button"
                                            className={[
                                              styles.levelBtn,
                                              (block as HeadingBlock).level === 4
                                                ? styles.levelBtnActive
                                                : "",
                                            ].join(" ")}
                                            onClick={() =>
                                              handleUpdateBlock(block.id, { level: 4 })
                                            }
                                          >
                                            H4
                                          </button>
                                        </div>

                                        <input
                                          type="text"
                                          value={(block as HeadingBlock).text}
                                          onChange={(e) =>
                                            handleUpdateBlock(block.id, { text: e.target.value })
                                          }
                                          placeholder="Enter heading text..."
                                          className={styles.headingTextInput}
                                        />
                                      </div>
                                    )}

                                    {/* 2. PARAGRAPH BLOCK */}
                                    {block.type === "paragraph" && (
                                      <>
                                        <textarea
                                          rows={3}
                                          value={(block as ParagraphBlock).text}
                                          onChange={(e) =>
                                            handleUpdateBlock(block.id, { text: e.target.value })
                                          }
                                          placeholder="Write your paragraph content..."
                                          className={styles.paragraphTextarea}
                                        />
                                        <div className={styles.paragraphFormatTips}>
                                          <span>Formatting tips:</span>
                                          <span className={styles.formatTipCode}>**bold**</span>
                                          <span className={styles.formatTipCode}>*italic*</span>
                                          <span className={styles.formatTipCode}>`code`</span>
                                          <span className={styles.formatTipCode}>
                                            [link](https://...)
                                          </span>
                                        </div>
                                      </>
                                    )}

                                    {/* 3. LIST BLOCK */}
                                    {block.type === "list" && (
                                      <>
                                        <div className={styles.listStyleToggleGroup}>
                                          <button
                                            type="button"
                                            className={[
                                              styles.levelBtn,
                                              (block as ListBlock).style === "bullet"
                                                ? styles.levelBtnActive
                                                : "",
                                            ].join(" ")}
                                            onClick={() =>
                                              handleUpdateBlock(block.id, { style: "bullet" })
                                            }
                                          >
                                            • Bullet List
                                          </button>
                                          <button
                                            type="button"
                                            className={[
                                              styles.levelBtn,
                                              (block as ListBlock).style === "numbered"
                                                ? styles.levelBtnActive
                                                : "",
                                            ].join(" ")}
                                            onClick={() =>
                                              handleUpdateBlock(block.id, { style: "numbered" })
                                            }
                                          >
                                            1. Numbered List
                                          </button>
                                        </div>

                                        <div className={styles.listItemsList}>
                                          {(block as ListBlock).items.map((item, itIdx) => (
                                            <div key={itIdx} className={styles.listItemRow}>
                                              {(block as ListBlock).style === "numbered" ? (
                                                <span className={styles.listItemNum}>
                                                  {String(itIdx + 1).padStart(2, "0")}
                                                </span>
                                              ) : (
                                                <span className={styles.listItemBullet}>•</span>
                                              )}
                                              <input
                                                type="text"
                                                value={item}
                                                onChange={(e) =>
                                                  handleUpdateListItem(
                                                    block.id,
                                                    itIdx,
                                                    e.target.value,
                                                  )
                                                }
                                                onKeyDown={(e) => {
                                                  if (e.key === "Enter") {
                                                    e.preventDefault();
                                                    handleAddListItem(block.id, itIdx);
                                                  }
                                                }}
                                                placeholder={`List item ${itIdx + 1}...`}
                                                className={styles.listItemInput}
                                              />
                                              <button
                                                type="button"
                                                className={styles.removeListItemBtn}
                                                onClick={() =>
                                                  handleRemoveListItem(block.id, itIdx)
                                                }
                                                title="Remove item"
                                              >
                                                <X size={13} />
                                              </button>
                                            </div>
                                          ))}
                                        </div>

                                        <button
                                          type="button"
                                          className={styles.addListItemBtn}
                                          onClick={() => handleAddListItem(block.id)}
                                        >
                                          <Plus size={13} />
                                          <span>Add List Item</span>
                                        </button>
                                      </>
                                    )}

                                    {/* 4. CODE BLOCK */}
                                    {block.type === "code" && (
                                      <>
                                        <div className={styles.codeLangSelectRow}>
                                          <label
                                            style={{
                                              fontSize: "0.76rem",
                                              color: "rgba(255,255,255,0.6)",
                                            }}
                                          >
                                            Language:
                                          </label>
                                          <select
                                            value={(block as CodeBlock).language || "typescript"}
                                            onChange={(e) =>
                                              handleUpdateBlock(block.id, {
                                                language: e.target.value,
                                              })
                                            }
                                            className={styles.codeLangSelect}
                                          >
                                            {CODE_LANGUAGES.map((lang) => (
                                              <option key={lang.value} value={lang.value}>
                                                {lang.label}
                                              </option>
                                            ))}
                                          </select>
                                        </div>

                                        <textarea
                                          rows={5}
                                          value={(block as CodeBlock).code}
                                          onChange={(e) =>
                                            handleUpdateBlock(block.id, { code: e.target.value })
                                          }
                                          placeholder="Paste or write code here..."
                                          className={styles.codeEditorTextarea}
                                        />
                                      </>
                                    )}

                                    {/* 5. QUOTE BLOCK */}
                                    {block.type === "quote" && (
                                      <>
                                        <textarea
                                          rows={3}
                                          value={(block as QuoteBlock).text}
                                          onChange={(e) =>
                                            handleUpdateBlock(block.id, { text: e.target.value })
                                          }
                                          placeholder="Enter quote or key takeaway text..."
                                          className={styles.quoteTextarea}
                                        />

                                        <input
                                          type="text"
                                          value={(block as QuoteBlock).cite || ""}
                                          onChange={(e) =>
                                            handleUpdateBlock(block.id, { cite: e.target.value })
                                          }
                                          placeholder="Quote attribution / author cite (optional)..."
                                          className={styles.quoteCiteInput}
                                        />
                                      </>
                                    )}

                                    {/* 6. RAW BLOCK */}
                                    {block.type === "raw" && (
                                      <textarea
                                        rows={4}
                                        value={(block as RawBlock).markdown}
                                        onChange={(e) =>
                                          handleUpdateBlock(block.id, { markdown: e.target.value })
                                        }
                                        placeholder="Enter custom markdown..."
                                        className={styles.codeEditorTextarea}
                                      />
                                    )}
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      )}

                      {/* MODE 2: LIVE PREVIEW PANE */}
                      {blockViewMode === "preview" && (
                        <div className={styles.previewPaneCard}>
                          <BlogContentRenderer content={serializeBlocksToMarkdown(blocks)} />
                        </div>
                      )}

                      {/* MODE 3: RAW MARKDOWN EDITOR */}
                      {blockViewMode === "raw" && (
                        <div className={styles.formGroup}>
                          <textarea
                            rows={16}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Write or paste your full markdown article here..."
                            className={styles.rawEditorTextarea}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* STEP 4: SEO & SOCIAL */}
                {modalTab === "seo" && (
                  <div className={styles.tabPane}>
                    <div className={styles.formGroup}>
                      <div className={styles.labelCounterRow}>
                        <label>Meta Title (Google SERP)</label>
                        <span
                          className={
                            metaTitle.length > 60 ? styles.charCounterWarning : styles.charCounter
                          }
                        >
                          {metaTitle.length} / 60 characters
                        </span>
                      </div>
                      <input
                        type="text"
                        value={metaTitle}
                        onChange={(e) => setMetaTitle(e.target.value)}
                        placeholder="e.g. Architecting Distributed AI Agents | DIMISI Technologies"
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <div className={styles.labelCounterRow}>
                        <label>Meta Description</label>
                        <span
                          className={
                            metaDescription.length > 160
                              ? styles.charCounterWarning
                              : styles.charCounter
                          }
                        >
                          {metaDescription.length} / 160 characters
                        </span>
                      </div>
                      <textarea
                        rows={3}
                        value={metaDescription}
                        onChange={(e) => setMetaDescription(e.target.value)}
                        placeholder="e.g. Learn how DIMISI builds resilient, multi-agent artificial intelligence workflows with sub-second response times..."
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <div className={styles.labelCounterRow}>
                        <label>Open Graph / Social Sharing Image URL</label>
                        <span className={styles.charCounter}>Defaults to Cover Image</span>
                      </div>
                      <input
                        type="url"
                        value={ogImage}
                        onChange={(e) => setOgImage(e.target.value)}
                        placeholder={coverImage || "https://images.unsplash.com/photo-..."}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Wizard Footer Navigation */}
              <div className={styles.modalFooter}>
                <div className={styles.footerLeft}>
                  {modalTab !== "basic" && (
                    <button type="button" className={styles.prevBtn} onClick={handlePrevStep}>
                      <ChevronLeft size={15} />
                      <span>Back</span>
                    </button>
                  )}
                  <button
                    type="button"
                    className={styles.cancelBtn}
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                </div>

                <div className={styles.footerRight}>
                  {modalTab !== "seo" ? (
                    <button type="button" className={styles.nextBtn} onClick={handleNextStep}>
                      <span>Continue to Next Step</span>
                      <ChevronRight size={15} />
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        disabled={isPending}
                        className={styles.draftBtn}
                        onClick={() => handleSavePost("draft")}
                      >
                        <Save size={14} />
                        <span>Save as Draft</span>
                      </button>
                      <button
                        type="button"
                        disabled={isPending}
                        className={styles.saveSubmitBtn}
                        onClick={() => handleSavePost("published")}
                      >
                        <CheckCircle2 size={15} />
                        <span>{editingPost ? "Update & Publish" : "Publish Article"}</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
         DEDICATED ARTICLE DELETE CONFIRMATION MODAL
         ========================================================================= */}
      {postDeleteConfirm && (
        <div
          className={styles.modalBackdrop}
          role="dialog"
          aria-modal="true"
          onClick={() => setPostDeleteConfirm(null)}
        >
          <div
            className={styles.deleteConfirmModal}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.deleteModalHeader}>
              <div className={styles.deleteIconWrapper}>
                <Trash2 size={22} className={styles.deleteModalTrashIcon} />
              </div>
              <button
                type="button"
                className={styles.modalClose}
                onClick={() => setPostDeleteConfirm(null)}
                title="Close (Esc)"
              >
                <X size={18} />
              </button>
            </div>

            <div className={styles.deleteModalBody}>
              <h3 className={styles.deleteModalTitle}>Delete Article</h3>
              <p className={styles.deleteModalDescription}>
                Are you sure you want to permanently delete{" "}
                <span className={styles.deleteHighlight}>
                  "{postDeleteConfirm.title}"
                </span>
                ?
              </p>
              <div className={styles.deleteWarningBox}>
                <AlertTriangle size={18} className={styles.deleteWarningBoxIcon} />
                <span>
                  This action is irreversible. The article will be immediately removed from the live database and public blog.
                </span>
              </div>
            </div>

            <div className={styles.deleteModalFooter}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={() => setPostDeleteConfirm(null)}
                disabled={isPending}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.deleteConfirmBtn}
                onClick={handleConfirmDeletePost}
                disabled={isPending}
              >
                <Trash2 size={15} />
                <span>{isPending ? "Deleting..." : "Delete Article"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
