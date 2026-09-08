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
  saveBlogConfigFn,
  getBlogCategoriesFn,
  saveBlogCategoryFn,
  deleteBlogCategoryFn,
} from "@/lib/blog.functions";
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

const DEFAULT_CATEGORIES: BlogCategoryItem[] = [
  {
    id: "cat-ai",
    name: "AI",
    slug: "ai",
    description: "Artificial Intelligence, Neural Perception, Multi-Agent Swarms & Applied ML",
    status: "active",
    order_index: 1,
  },
  {
    id: "cat-cloud",
    name: "Cloud",
    slug: "cloud",
    description: "Cloud Architecture, GPU Economics, DevOps & Distributed Infrastructure",
    status: "active",
    order_index: 2,
  },
  {
    id: "cat-web",
    name: "Web",
    slug: "web",
    description: "Modern Frontend, WebGL Shaders, Micro-Frontends & High Performance",
    status: "active",
    order_index: 3,
  },
  {
    id: "cat-mobile",
    name: "Mobile",
    slug: "mobile",
    description: "Cross-Platform Mobile Engineering, Edge Inference & Native Architectures",
    status: "active",
    order_index: 4,
  },
  {
    id: "cat-startups",
    name: "Startups",
    slug: "startups",
    description: "Lean Product Principles, Fast 14-Day MVP Velocity & Founder Strategy",
    status: "active",
    order_index: 5,
  },
  {
    id: "cat-trends",
    name: "Technology Trends",
    slug: "technology-trends",
    description: "Emerging Paradigms, Hardware Accelerators, Robotics & Future Tech",
    status: "active",
    order_index: 6,
  },
];

const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
const FALLBACK_COVER = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80";

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
  const [categoryFilter, setCategoryFilter] = useState("All Posts");
  const [searchQuery, setSearchQuery] = useState("");

  // Dynamic Categories State
  const [categoryList, setCategoryList] = useState<BlogCategoryItem[]>(() => {
    if (initialCategoryItems && initialCategoryItems.length > 0) {
      return initialCategoryItems;
    }
    return DEFAULT_CATEGORIES;
  });

  // Load latest categories from store
  const refreshCategories = useCallback(async () => {
    try {
      const res = await getBlogCategoriesFn();
      if (res && res.categories && res.categories.length > 0) {
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

  // Active category items for filter pills & post selector
  const activeCategories = useMemo(() => {
    return categoryList
      .filter((c) => c.status === "active")
      .sort((a, b) => a.order_index - b.order_index);
  }, [categoryList]);

  // Category Modal State
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

  // Post Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPostItem | null>(null);
  const [modalTab, setModalTab] = useState<BlogModalTab>("basic");

  // Post Form State
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("AI");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");

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
  const catPillsBarRef = useRef<HTMLDivElement>(null);

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

  // Author & Metadata
  const [authorName, setAuthorName] = useState("DIMISI Editorial");
  const [authorRole, setAuthorRole] = useState("Engineering & Systems");
  const [authorAvatar, setAuthorAvatar] = useState(
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
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
    if (!showModal && !showCatModal) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showCatModal) {
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
  }, [showModal, showCatModal]);

  // Filtered Posts
  const filteredPosts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return posts.filter((p) => {
      const matchCat =
        categoryFilter === "All Posts" ||
        p.category.toLowerCase() === categoryFilter.toLowerCase();

      const matchSearch =
        q === "" ||
        p.title.toLowerCase().includes(q) ||
        p.author_name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.tags && p.tags.some((t) => t.toLowerCase().includes(q)));

      return matchCat && matchSearch;
    });
  }, [posts, categoryFilter, searchQuery]);

  // Handle Category Modal Actions
  const handleOpenCatModal = (catToEdit?: BlogCategoryItem) => {
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

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setCatFormError(null);
    setCatSuccessMsg(null);

    const input: BlogCategoryInput = {
      id: editingCatId || undefined,
      name: catName.trim(),
      slug: catSlug.trim() || slugifyBlogCategory(catName),
      description: catDescription.trim() || undefined,
      status: catStatus,
      order_index: Number(catOrderIndex) || 1,
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
            editingCatId
              ? "Updated category \"" + res.category.name + "\" successfully."
              : "Created new category \"" + res.category.name + "\"."
          );
          handleResetCatForm();
          await refreshCategories();
          onRefresh();
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
    setSlug("");
    const defaultCat = activeCategories[0]?.name || "AI";
    setCategory(defaultCat);
    setTags(["Computer Vision", "Architecture"]);
    setExcerpt("");
    setContent(
      "## Introduction\n\nWrite your rich technical essay or product architecture breakdown here..."
    );
    setCoverSourceType("upload");
    setCoverImage("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80");
    setCoverFile(null);
    setCoverPreviewUrl("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80");
    setImageError(null);
    setUploadProgress(0);
    setIsUploadingImage(false);
    setCoverCaption("");
    setCoverAlt("");
    setCoverCredit("Photography: DIMISI Technologies");
    setAuthorName("DIMISI Editorial");
    setAuthorRole("Engineering & Systems");
    setAuthorAvatar(
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
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

  const handleOpenEdit = (p: BlogPostItem) => {
    setEditingPost(p);
    setTitle(p.title);
    setSlug(p.slug);
    setCategory(p.category);
    setTags(p.tags || []);
    setExcerpt(p.excerpt);
    setContent(p.content);
    setCoverSourceType("upload");
    setCoverImage(p.cover_image);
    setCoverFile(null);
    setCoverPreviewUrl(p.cover_image);
    setImageError(null);
    setUploadProgress(0);
    setIsUploadingImage(false);
    setCoverCaption(p.cover_caption || "");
    setCoverAlt(p.cover_alt || "");
    setCoverCredit(p.cover_credit || "");
    setAuthorName(p.author_name);
    setAuthorRole(p.author_role || "");
    setAuthorAvatar(p.author_avatar || "");
    setReadingTime(p.reading_time);
    setPublishedAt(p.published_at.slice(0, 10));
    setIsFeatured(p.is_featured);
    setStatus(p.status);
    setMetaTitle(p.meta_title || "");
    setMetaDescription(p.meta_description || "");
    setOgImage(p.og_image || "");
    setOrderIndex(p.order_index);
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
      if (!content.trim() || content.trim().length < 20) {
        errors.content = "Article content must be at least 20 characters long.";
        setFieldErrors(errors);
        setFormError("Please provide substantial article content before proceeding.");
        return;
      }
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

    const input: BlogPostInput = {
      id: editingPost?.id ?? undefined,
      title: title.trim(),
      slug: slug.trim() || slugifyBlog(title),
      category: category.trim(),
      tags,
      excerpt: excerpt.trim(),
      content: content.trim(),
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
        const res = await saveBlogPostFn({ data: input });
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

  const handleDeletePost = (id: string, postTitle: string) => {
    if (window.confirm("Are you sure you want to delete article \"" + postTitle + "\"?")) {
      startTransition(async () => {
        await deleteBlogPostFn({ data: { id } });
        onRefresh();
      });
    }
  };

  const handleToggleStatus = (p: BlogPostItem) => {
    const nextStatus: BlogStatus = p.status === "published" ? "draft" : "published";
    startTransition(async () => {
      await saveBlogPostFn({
        data: {
          id: p.id,
          title: p.title,
          slug: p.slug,
          category: p.category,
          tags: p.tags,
          excerpt: p.excerpt,
          content: p.content,
          cover_image: p.cover_image,
          cover_caption: p.cover_caption,
          cover_alt: p.cover_alt,
          cover_credit: p.cover_credit,
          author_name: p.author_name,
          author_role: p.author_role,
          author_avatar: p.author_avatar,
          reading_time: p.reading_time,
          published_at: p.published_at,
          is_featured: p.is_featured,
          status: nextStatus,
          meta_title: p.meta_title,
          meta_description: p.meta_description,
          og_image: p.og_image,
          order_index: p.order_index,
        },
      });
      onRefresh();
    });
  };

  const handleToggleFeatured = (p: BlogPostItem) => {
    startTransition(async () => {
      await saveBlogPostFn({
        data: {
          id: p.id,
          title: p.title,
          slug: p.slug,
          category: p.category,
          tags: p.tags,
          excerpt: p.excerpt,
          content: p.content,
          cover_image: p.cover_image,
          cover_caption: p.cover_caption,
          cover_alt: p.cover_alt,
          cover_credit: p.cover_credit,
          author_name: p.author_name,
          author_role: p.author_role,
          author_avatar: p.author_avatar,
          reading_time: p.reading_time,
          published_at: p.published_at,
          is_featured: !p.is_featured,
          status: p.status,
          meta_title: p.meta_title,
          meta_description: p.meta_description,
          og_image: p.og_image,
          order_index: p.order_index,
        },
      });
      onRefresh();
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
        }
      } catch (err) {
        console.error(err);
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
            Publish articles, tech breakdowns, AI research papers, and manage the dynamic Category Taxonomy &amp; Notice Banner.
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

              <button
                type="button"
                className={styles.createBtn}
                onClick={handleOpenCreate}
              >
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
          {/* Filters Bar & Dynamic Category Pills */}
          <div className={styles.filtersBar}>
            <div className={styles.searchBox}>
              <Search size={15} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search by title, author, category, tags..."
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

            {/* Dynamic Horizontally Scrollable Category Filter Pills */}
            <div className={styles.catPillsContainer}>
              <div className={styles.catPillsBar} ref={catPillsBarRef}>
                {/* All Posts Pill */}
                <button
                  type="button"
                  className={[
                    styles.catPill,
                    categoryFilter.toLowerCase() === "all posts" ? styles.catPillActive : "",
                  ].join(" ")}
                  onClick={() => setCategoryFilter("All Posts")}
                >
                  <span>All Posts</span>
                  <span className={styles.catCountBadge}>{posts.length}</span>
                </button>

                {/* Dynamic Category Pills */}
                {activeCategories.map((c) => {
                  const count = categoryPostCounts[c.name.toLowerCase()] || 0;
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
                      title={c.description || c.name}
                    >
                      <span>{c.name}</span>
                      <span className={styles.catCountBadge}>{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Table Card with Fixed Grid Columns */}
          <div className={styles.tableCard}>
            <table className={styles.table}>
              <colgroup>
                <col style={{ width: "70px" }} />
                <col style={{ width: "90px" }} />
                <col style={{ width: "320px" }} />
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
                  <th>Article Title &amp; Slug</th>
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
                    <tr
                      key={p.id}
                      className={p.status !== "published" ? styles.inactiveRow : ""}
                    >
                      {/* Order Index */}
                      <td className={styles.orderCell}>{p.order_index}</td>

                      {/* Cover Thumbnail */}
                      <td className={styles.coverCell}>
                        <img
                          src={p.cover_image || FALLBACK_COVER}
                          alt={p.title}
                          className={styles.thumbImg}
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = FALLBACK_COVER;
                          }}
                        />
                      </td>

                      {/* Title & Clickable URL Slug */}
                      <td>
                        <div className={styles.titleCol}>
                          <span className={styles.postTitle} title={p.title}>
                            {p.title}
                          </span>
                          <div className={styles.slugRow}>
                            <a
                              href={"/blog/" + p.slug}
                              target="_blank"
                              rel="noreferrer"
                              className={styles.slugCodeLink}
                              title="Open Live Article"
                            >
                              <span className={styles.slugPrefix}>/blog/</span>
                              <span>{p.slug}</span>
                            </a>
                            {p.is_featured && (
                              <span className={styles.featuredSpotlightBadge}>
                                <Star size={10} /> FEATURED
                              </span>
                            )}
                          </div>
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
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                                const next = e.currentTarget.nextElementSibling;
                                if (next) next.style.display = "flex";
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
                            className={styles.viewBtn}
                            title="View Live Reader"
                          >
                            <ExternalLink size={14} />
                          </a>

                          <button
                            type="button"
                            className={styles.delBtn}
                            onClick={() => handleDeletePost(p.id, p.title)}
                            title="Delete Article"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className={styles.emptyTableState}>
                      <div className={styles.emptyContent}>
                        <AlertCircle size={28} className={styles.emptyIcon} />
                        <h4>No articles found matching criteria</h4>
                        <p>
                          {searchQuery
                            ? 'No results for "' + searchQuery + '" in category "' + categoryFilter + '".'
                            : 'No articles in category "' + categoryFilter + '".'}
                        </p>
                        <div className={styles.emptyActions}>
                          {searchQuery && (
                            <button
                              type="button"
                              className={styles.resetFilterBtn}
                              onClick={() => setSearchQuery("")}
                            >
                              Clear Search
                            </button>
                          )}
                          {categoryFilter !== "All Posts" && (
                            <button
                              type="button"
                              className={styles.resetFilterBtn}
                              onClick={() => setCategoryFilter("All Posts")}
                            >
                              Show All Categories
                            </button>
                          )}
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
                Toggle and configure the dynamic cyberpunk construction banner visible on the public Blog hub.
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
                    Manage dynamic editorial categories, slugs, descriptions, and filter display states.
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
                      ? 'Warning: There are currently ' + catDeleteConfirm.count + ' published article(s) tagged with this category. Deleting this category will remove it from the taxonomy and active filters.'
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
                          setCatSlug(slugifyBlogCategory(e.target.value));
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
                      placeholder="e.g. Autonomous systems, perception pipelines, and applied robotics..."
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
                        <option value="active">Active (Visible in Filter &amp; Posts)</option>
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
                        <th>Category &amp; Slug</th>
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

            {/* Modal Footer */}
            <div className={styles.modalFooter}>
              <div className={styles.footerLeft}>
                <span className={styles.modalFooterInfo}>
                  <HelpCircle size={14} /> Changes to categories synchronize immediately with all editorial post forms.
                </span>
              </div>
              <div className={styles.footerRight}>
                <button
                  type="button"
                  className={styles.saveSubmitBtn}
                  onClick={() => setShowCatModal(false)}
                >
                  Done Managing
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
         APPLICATION-STYLE EDITORIAL BLOG POST MODAL
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
            {/* Sticky Modal Header */}
            <div className={styles.modalHeader}>
              <div>
                <h3 className={styles.modalTitle}>
                  {editingPost ? 'Edit Blog Post: ' + editingPost.title : "Create New Blog Post"}
                </h3>
                <p className={styles.modalSub}>
                  Craft editorial essays, research notes, and tech breakdowns with full SEO support.
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

            {/* Sticky Section Navigation Stepper */}
            <div
              className={styles.modalTabsBar}
              role="tablist"
              aria-label="Blog Post Form Steps"
              data-lenis-prevent
            >
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
                handleSavePost();
              }}
              className={styles.modalForm}
            >
              {/* Single Independent Scrollable Body */}
              <div className={styles.modalBodyScroll} data-lenis-prevent>
                {/* STEP 1: BASIC INFO & META */}
                {modalTab === "basic" && (
                  <div className={styles.tabPane}>
                    <div className={styles.formGrid2}>
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
                            if (!editingPost) setSlug(slugifyBlog(e.target.value));
                          }}
                          placeholder="e.g. Architecting Distributed AI Agents for Enterprise Scale"
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
                          placeholder="e.g. architecting-distributed-ai-agents"
                        />
                      </div>
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
                          {/* If current category is not in active list, preserve it */}
                          {!activeCategories.some(
                            (c) => c.name.toLowerCase() === category.toLowerCase()
                          ) && (
                            <option value={category}>{category} (Custom / Inactive)</option>
                          )}
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

                    <div className={styles.formGrid3}>
                      <div className={styles.formGroup}>
                        <label>Author Name</label>
                        <input
                          type="text"
                          value={authorName}
                          onChange={(e) => setAuthorName(e.target.value)}
                          placeholder="e.g. Dr. Ira Mehta"
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label>Author Role</label>
                        <input
                          type="text"
                          value={authorRole}
                          onChange={(e) => setAuthorRole(e.target.value)}
                          placeholder="e.g. Head of AI Research"
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
                        placeholder="Concise, high-impact summary displayed on blog cards and Google SERP snippets..."
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
                        Upload or paste a high-resolution hero cover image (16:9 recommended). Supported:{" "}
                        <strong>JPG, PNG, WEBP</strong> (Max <strong>10 MB</strong>).
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
                              />

                              <div className={styles.previewMetaRow}>
                                <div className={styles.fileInfoBadge}>
                                  <FileCheck size={14} className={styles.checkIcon} />
                                  <span>
                                    {coverFile
                                      ? coverFile.name + " (" + (coverFile.size / (1024 * 1024)).toFixed(2) + " MB)"
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
                                <span className={styles.browseLink}>Choose Image</span>, or paste with{" "}
                                <kbd className={styles.kbdShortcut}>Ctrl + V</kbd>
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

                {/* STEP 3: ARTICLE CONTENT */}
                {modalTab === "content" && (
                  <div className={styles.tabPane}>
                    <div className={styles.editorNoticeBox}>
                      <FileText size={15} className={styles.editorNoticeIcon} />
                      <span>
                        Supports Markdown headings (<code>##</code>), bullet points, blockquotes (
                        <code>&gt;</code>), bold/italics, and code blocks (<code>```ts</code>).
                      </span>
                    </div>

                    <div className={styles.formGroup}>
                      <label>Article Markdown Content *</label>
                      <textarea
                        rows={14}
                        required
                        value={content}
                        className={[
                          styles.articleTextarea,
                          fieldErrors.content ? styles.inputError : "",
                        ].join(" ")}
                        onChange={(e) => {
                          setContent(e.target.value);
                          if (fieldErrors.content) {
                            setFieldErrors((prev) => {
                              const copy = { ...prev };
                              delete copy.content;
                              return copy;
                            });
                          }
                        }}
                        placeholder="Write your long-form article here..."
                      />
                      {fieldErrors.content && (
                        <span className={styles.fieldErrorText}>{fieldErrors.content}</span>
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
                            metaTitle.length > 60
                              ? styles.charCounterWarning
                              : styles.charCounter
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
                        <label>Open Graph / Social Sharing Image</label>
                        {coverImage && (
                          <button
                            type="button"
                            className={styles.useCoverBtn}
                            onClick={() => setOgImage(coverImage)}
                          >
                            <Share2 size={12} />
                            <span>Use Cover Image</span>
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        value={ogImage}
                        onChange={(e) => setOgImage(e.target.value)}
                        placeholder="https://images.unsplash.com/photo-..."
                      />
                    </div>

                    {/* Visibility & Status Settings */}
                    <div className={styles.toggleRow} style={{ marginTop: "1rem" }}>
                      <label className={styles.checkboxLabel}>
                        <input
                          type="checkbox"
                          checked={status === "published"}
                          onChange={(e) =>
                            setStatus(e.target.checked ? "published" : "draft")
                          }
                        />
                        <span>Published on Public Website</span>
                      </label>

                      <label className={styles.checkboxLabel}>
                        <input
                          type="checkbox"
                          checked={isFeatured}
                          onChange={(e) => setIsFeatured(e.target.checked)}
                        />
                        <span>Featured Hero Spotlight Badge</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Sticky Modal Footer */}
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
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    disabled={isPending || isUploadingImage}
                    className={styles.draftBtn}
                    onClick={() => handleSavePost("draft")}
                  >
                    Save Draft
                  </button>

                  {modalTab !== "seo" ? (
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
                        ? "Publishing..."
                        : editingPost
                        ? "Update Article"
                        : "Publish Article"}
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
