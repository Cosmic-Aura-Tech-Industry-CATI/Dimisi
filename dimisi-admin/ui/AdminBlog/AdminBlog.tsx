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
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Star,
  Eye,
  EyeOff,
  ExternalLink,
  MapPin,
  Clock,
  Sparkles,
  Layers,
  X,
  Send,
  Save,
  Search,
  Calendar,
  Construction,
  Settings,
  Image as ImageIcon,
  FileText,
  Globe,
  ChevronRight,
  ChevronLeft,
  UploadCloud,
  FileCheck,
  AlertCircle,
  RefreshCw,
  Share2,
  Tag,
  User,
} from "lucide-react";
import {
  type BlogPostItem,
  type BlogPostInput,
  type BlogStatus,
  type BlogConfig,
  slugifyBlog,
  validateBlogPostInput,
} from "@/lib/blog.shared";
import {
  saveBlogPostFn,
  deleteBlogPostFn,
  saveBlogConfigFn,
} from "@/lib/blog.functions";
import styles from "./AdminBlog.module.css";

interface AdminBlogProps {
  posts: BlogPostItem[];
  config: BlogConfig;
  categories: string[];
  onRefresh: () => void;
}

type BlogModalTab = "basic" | "cover" | "content" | "seo";

const MODAL_STEPS: { id: BlogModalTab; label: string; num: string }[] = [
  { id: "basic", label: "1. Basic Info & Meta", num: "01" },
  { id: "cover", label: "2. Cover & Visuals", num: "02" },
  { id: "content", label: "3. Article Content", num: "03" },
  { id: "seo", label: "4. SEO & Social", num: "04" },
];

const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/jpg", "image/webp"];

export function AdminBlog({
  posts,
  config,
  categories,
  onRefresh,
}: AdminBlogProps) {
  const [isPending, startTransition] = useTransition();
  const savePost = useServerFn(saveBlogPostFn);
  const deletePost = useServerFn(deleteBlogPostFn);
  const saveConfig = useServerFn(saveBlogConfigFn);

  // Sub-section tab
  const [activeSection, setActiveSection] = useState<"posts" | "settings">("posts");
  const [categoryFilter, setCategoryFilter] = useState("All Posts");
  const [searchQuery, setSearchQuery] = useState("");

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

  const filteredPosts = posts.filter((p) => {
    const matchCat =
      categoryFilter === "All Posts" || p.category.toLowerCase() === categoryFilter.toLowerCase();
    const matchSearch =
      searchQuery === "" ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.author_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleOpenCreate = () => {
    setEditingPost(null);
    setTitle("");
    setSlug("");
    setCategory("AI");
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
        if (validation.field === "title" || validation.field === "category" || validation.field === "excerpt") {
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
        const res = await savePost({ data: input });
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
    if (window.confirm(`Are you sure you want to delete article "${postTitle}"?`)) {
      startTransition(async () => {
        await deletePost({ data: { id } });
        onRefresh();
      });
    }
  };

  const handleToggleStatus = (p: BlogPostItem) => {
    const nextStatus: BlogStatus = p.status === "published" ? "draft" : "published";
    startTransition(async () => {
      await savePost({
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
      await savePost({
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
        const res = await saveConfig({
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
            Publish articles, tech breakdowns, AI research papers, and manage the Under Development Notice.
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
            <button type="button" className={styles.createBtn} onClick={handleOpenCreate}>
              <Plus size={16} />
              <span>Create New Blog Post</span>
            </button>
          )}
        </div>
      </div>

      {/* SECTION 1: ARTICLES LIST */}
      {activeSection === "posts" && (
        <div className={styles.postsSection}>
          {/* Filters Bar */}
          <div className={styles.filtersBar}>
            <div className={styles.searchBox}>
              <Search size={15} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search by title, author, category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className={styles.catPills}>
              {["All Posts", "AI", "Cloud", "Web", "Mobile", "Startups"].map((c) => (
                <button
                  key={c}
                  type="button"
                  className={[
                    styles.catPill,
                    categoryFilter.toLowerCase() === c.toLowerCase() ? styles.catPillActive : "",
                  ].join(" ")}
                  onClick={() => setCategoryFilter(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Table Card */}
          <div className={styles.tableCard}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th style={{ width: "60px" }}>Order</th>
                  <th style={{ width: "80px" }}>Cover</th>
                  <th>Article Title</th>
                  <th>Category</th>
                  <th>Author</th>
                  <th>Reading Time</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPosts.map((p) => (
                  <tr key={p.id} className={p.status !== "published" ? styles.inactiveRow : ""}>
                    <td className={styles.orderCell}>{p.order_index}</td>
                    <td>
                      <img src={p.cover_image} alt={p.title} className={styles.thumbImg} />
                    </td>
                    <td>
                      <div className={styles.titleCol}>
                        <span className={styles.postTitle}>{p.title}</span>
                        <code className={styles.slugCode}>/blog/{p.slug}</code>
                      </div>
                    </td>
                    <td>
                      <span className={styles.categoryBadge}>{p.category}</span>
                    </td>
                    <td>
                      <div className={styles.authorCell}>
                        <img src={p.author_avatar} alt={p.author_name} className={styles.avatarImg} />
                        <span>{p.author_name}</span>
                      </div>
                    </td>
                    <td>
                      <span className={styles.timeBadge}>{p.reading_time}</span>
                    </td>
                    <td>
                      <div className={styles.statusCell}>
                        <button
                          type="button"
                          className={[
                            styles.toggleIconBtn,
                            p.status === "published" ? styles.activeIcon : styles.inactiveIcon,
                          ].join(" ")}
                          onClick={() => handleToggleStatus(p)}
                          title={p.status === "published" ? "Click to set Draft" : "Click to Publish"}
                        >
                          {p.status === "published" ? <Eye size={16} /> : <EyeOff size={16} />}
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
                          title="Edit Article"
                        >
                          <Edit2 size={15} />
                        </button>
                        <a
                          href={`/blog/${p.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className={styles.viewBtn}
                          title="View Live Reader"
                        >
                          <ExternalLink size={15} />
                        </a>
                        <button
                          type="button"
                          className={styles.delBtn}
                          onClick={() => handleDeletePost(p.id, p.title)}
                          title="Delete Article"
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

      {/* APPLICATION-STYLE EDITORIAL MODAL */}
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
                  {editingPost ? `Edit Blog Post: ${editingPost.title}` : "Create New Blog Post"}
                </h3>
                <p className={styles.modalSub}>
                  Craft editorial essays, research notes, and tech breakdowns with full SEO support.
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

            {/* Sticky Section Navigation Stepper */}
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
                      <div className={styles.formGroup}>
                        <label>Category *</label>
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className={styles.selectInput}
                        >
                          <option value="AI">AI &amp; Autonomous Systems</option>
                          <option value="Cloud">Cloud &amp; Infrastructure</option>
                          <option value="Web">Full-Stack &amp; Web</option>
                          <option value="Mobile">Mobile Engineering</option>
                          <option value="Startups">Startups &amp; Product Velocity</option>
                          <option value="Security">Security &amp; Web3</option>
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
                        Upload or paste a high-resolution hero cover image (16:9 recommended). Supported: <strong>JPG, PNG, WEBP</strong> (Max <strong>10 MB</strong>).
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
                                Drag and drop cover image, <span className={styles.browseLink}>Choose Image</span>, or paste with <kbd className={styles.kbdShortcut}>Ctrl + V</kbd>
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
                              <img src={coverPreviewUrl} alt="URL Preview" className={styles.dropzonePreviewImg} />
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
                        Supports Markdown headings (<code>##</code>), bullet points, blockquotes (<code>&gt;</code>), bold/italics, and code blocks (<code>```ts</code>).
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
                        <span className={metaTitle.length > 60 ? styles.charCounterWarning : styles.charCounter}>
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
                        <span className={metaDescription.length > 160 ? styles.charCounterWarning : styles.charCounter}>
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
                          onChange={(e) => setStatus(e.target.checked ? "published" : "draft")}
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
