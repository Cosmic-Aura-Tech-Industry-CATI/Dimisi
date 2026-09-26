import { useEffect, useRef, useState, useTransition } from "react";
import QRCode from "qrcode";
import {
  QrCode,
  Plus,
  Copy,
  Check,
  Download,
  Printer,
  Share2,
  Trash2,
  Calendar,
  MapPin,
  Briefcase,
  X,
  Loader2,
  MessageCircle,
  Mail,
  Smartphone,
  ExternalLink,
  Percent,
  AlertTriangle,
} from "lucide-react";
import {
  DIMISI_SERVICES,
  type ReviewCampaign,
} from "@/lib/reviews.shared";
import {
  createCampaign,
  updateCampaign,
  deleteCampaign,
} from "@/lib/reviews.functions";
import { getAllServicesApi } from "@/services";
import type { CompanyService } from "@/lib/services.shared";
import styles from "./AdminCampaigns.module.css";

export function AdminCampaigns({
  campaigns = [],
  onRefresh,
}: {
  campaigns?: ReviewCampaign[];
  onRefresh: () => void;
}) {
  const addCampaign = createCampaign;
  const editCampaign = updateCampaign;
  const removeCampaign = deleteCampaign;

  // Live Services from Express backend / MongoDB
  const [servicesList, setServicesList] = useState<CompanyService[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(false);

  // Creation State
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState("");
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [selectedServiceName, setSelectedServiceName] = useState("");
  const [location, setLocation] = useState("");
  const [expiry, setExpiry] = useState("");

  // Delete Confirmation Modal
  const [deleteTarget, setDeleteTarget] = useState<ReviewCampaign | null>(null);

  // Active QR Studio Modal
  const [activeCampaign, setActiveCampaign] = useState<ReviewCampaign | null>(null);
  const [copied, setCopied] = useState(false);
  const [qrSvg, setQrSvg] = useState<string>("");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Flyer Print Modal
  const [showFlyer, setShowFlyer] = useState(false);

  const [isPending, startTransition] = useTransition();

  // Load live services from Express backend on mount
  useEffect(() => {
    let isMounted = true;
    setIsLoadingServices(true);
    getAllServicesApi()
      .then((list) => {
        if (isMounted && Array.isArray(list)) {
          setServicesList(list);
        }
      })
      .catch((err) => {
        console.warn("Failed to fetch live services for campaigns:", err);
      })
      .finally(() => {
        if (isMounted) setIsLoadingServices(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);


  const getCampaignUrl = (cSlug: string) => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/review/${cSlug}`;
    }
    return `https://dimisi.in/review/${cSlug}`;
  };

  const getShortUrl = (cSlug: string) => {
    return `dimisi.in/review/${cSlug}`;
  };

  // Generate QR Canvas & SVG when active campaign opens
  useEffect(() => {
    if (!activeCampaign) return;

    const url = getCampaignUrl(activeCampaign.slug);

    // Render Canvas (High contrast, margin, dark modules)
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, url, {
        width: 320,
        margin: 2,
        color: {
          dark: "#050508",
          light: "#ffffff",
        },
        errorCorrectionLevel: "H",
      }).catch(console.error);
    }

    // Generate SVG string
    QRCode.toString(url, {
      type: "svg",
      margin: 2,
      color: {
        dark: "#050508",
        light: "#ffffff",
      },
      errorCorrectionLevel: "H",
    })
      .then((svg) => setQrSvg(svg))
      .catch(console.error);
  }, [activeCampaign]);

  const handleCopyLink = (cSlug: string) => {
    const url = getCampaignUrl(cSlug);
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPng = () => {
    if (!canvasRef.current || !activeCampaign) return;
    const dataUrl = canvasRef.current.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `dimisi-qr-${activeCampaign.slug}.png`;
    a.click();
  };

  const handleDownloadSvg = () => {
    if (!qrSvg || !activeCampaign) return;
    const blob = new Blob([qrSvg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dimisi-qr-${activeCampaign.slug}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    startTransition(async () => {
      try {
        await addCampaign({
          data: {
            campaignName: name.trim(),
            ...(selectedServiceId ? { serviceId: selectedServiceId } : {}),
            ...(selectedServiceName ? { serviceName: selectedServiceName } : {}),
            ...(location.trim() ? { location: location.trim() } : {}),
            ...(expiry ? { expiresAt: expiry } : {}),
          },
        });
        setIsCreating(false);
        setName("");
        setSelectedServiceId("");
        setSelectedServiceName("");
        setLocation("");
        setExpiry("");
        onRefresh();
      } catch (err) {
        alert(err instanceof Error ? err.message : "Error creating campaign.");
      }
    });
  };

  const handleToggleActive = (c: ReviewCampaign) => {
    startTransition(async () => {
      try {
        await editCampaign({
          data: {
            campaignId: c.id,
            campaignName: c.campaign_name,
            ...(c.service_name ? { serviceName: c.service_name } : {}),
            ...(c.location ? { location: c.location } : {}),
            isActive: !c.is_active,
            ...(c.expires_at ? { expiresAt: c.expires_at } : {}),
          },
        });
        onRefresh();
      } catch (err) {
        alert(err instanceof Error ? err.message : "Error updating campaign.");
      }
    });
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    startTransition(async () => {
      try {
        await removeCampaign({ data: { campaignId: deleteTarget.id } });
        setDeleteTarget(null);
        onRefresh();
      } catch (err) {
        alert(err instanceof Error ? err.message : "Error deleting campaign.");
      }
    });
  };

  const handlePrintFlyer = () => {
    window.print();
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.topBar}>
        <div className={styles.titleBox}>
          <h2>Review Campaigns & QR Codes</h2>
          <p>
            Generate targeted QR codes, custom links, and printable flyers for WhatsApp, invoices, email, receipts, and printed cards.
          </p>
        </div>
        <button
          type="button"
          className={styles.createBtn}
          onClick={() => setIsCreating(true)}
        >
          <Plus size={16} />
          <span>New Campaign</span>
        </button>
      </div>

      {/* Campaigns Grid */}
      <div className={styles.campaignsGrid}>
        {campaigns.map((c) => {
          const isExpired = c.expires_at && new Date(c.expires_at) < new Date();
          return (
            <div key={c.id} className={styles.campaignCard}>
              <div className={styles.cardHead}>
                <div>
                  <h3 className={styles.campaignName}>{c.campaign_name}</h3>
                  <span className={styles.campaignSlug}>/review/{c.slug}</span>
                </div>
                <span
                  style={{
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    padding: "0.2rem 0.55rem",
                    borderRadius: "999px",
                    background: c.is_active && !isExpired ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
                    color: c.is_active && !isExpired ? "#34d399" : "#f87171",
                  }}
                >
                  {isExpired ? "Expired" : c.is_active ? "Active" : "Disabled"}
                </span>
              </div>

              <div className={styles.cardMeta}>
                {c.service_name ? (
                  <div className={styles.metaItem}>
                    <Briefcase size={13} color="#818cf8" />
                    <span>{c.service_name}</span>
                  </div>
                ) : null}
                {c.location ? (
                  <div className={styles.metaItem}>
                    <MapPin size={13} color="#818cf8" />
                    <span>{c.location}</span>
                  </div>
                ) : null}
                {c.expires_at ? (
                  <div className={styles.metaItem}>
                    <Calendar size={13} color="#818cf8" />
                    <span>Expires: {new Date(c.expires_at).toLocaleDateString()}</span>
                  </div>
                ) : null}
              </div>

              {/* Metrics Grid */}
              <div className={styles.metricsGrid}>
                <div className={styles.metricItem}>
                  <span className={styles.metricVal}>{c.visits}</span>
                  <span className={styles.metricLbl}>Visits</span>
                </div>
                <div className={styles.metricItem}>
                  <span className={styles.metricVal}>{c.scans}</span>
                  <span className={styles.metricLbl}>Scans</span>
                </div>
                <div className={styles.metricItem}>
                  <span className={styles.metricVal}>{c.submissions}</span>
                  <span className={styles.metricLbl}>Reviews</span>
                </div>
                <div className={styles.metricItem}>
                  <span className={styles.metricVal} style={{ color: "#34d399" }}>
                    {c.conversion_rate || 0}%
                  </span>
                  <span className={styles.metricLbl}>Conv.</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className={styles.cardActions}>
                <button
                  type="button"
                  className={[styles.btnAction, styles.btnPrimaryAction].join(" ")}
                  onClick={() => setActiveCampaign(c)}
                >
                  <QrCode size={14} />
                  <span>QR Studio</span>
                </button>
                <button
                  type="button"
                  className={styles.btnAction}
                  onClick={() => handleCopyLink(c.slug)}
                  title="Copy Review URL"
                >
                  {copied ? <Check size={14} color="#34d399" /> : <Copy size={14} />}
                  <span>{copied ? "Copied!" : "Copy"}</span>
                </button>
                <button
                  type="button"
                  className={styles.btnAction}
                  onClick={() => handleToggleActive(c)}
                >
                  {c.is_active ? "Disable" : "Enable"}
                </button>
                <button
                  type="button"
                  className={styles.btnAction}
                  style={{ color: "#f43f5e" }}
                  onClick={() => setDeleteTarget(c)}
                  title="Delete Campaign"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* QR Studio & Sharing Modal */}
      {activeCampaign ? (
        <div className={styles.modalBackdrop} onClick={() => setActiveCampaign(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>QR Code & Campaign Studio</h3>
              <button
                type="button"
                onClick={() => setActiveCampaign(null)}
                style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            <div className={styles.qrStudioBox}>
              <div className={styles.qrCanvasWrap}>
                <canvas ref={canvasRef} style={{ width: "220px", height: "220px" }} />
              </div>
              <div>
                <p className={styles.qrScanHint}>Scan to share your experience with Dimisi</p>
                <div className={styles.qrShortUrl}>{getShortUrl(activeCampaign.slug)}</div>
              </div>

              {/* Download Buttons */}
              <div className={styles.downloadButtonsRow}>
                <button
                  type="button"
                  className={[styles.btnAction, styles.btnPrimaryAction].join(" ")}
                  onClick={handleDownloadPng}
                >
                  <Download size={14} />
                  <span>Download PNG (1024px)</span>
                </button>
                <button
                  type="button"
                  className={styles.btnAction}
                  onClick={handleDownloadSvg}
                >
                  <Download size={14} />
                  <span>Download Vector SVG</span>
                </button>
                <button
                  type="button"
                  className={styles.btnAction}
                  onClick={() => setShowFlyer(true)}
                >
                  <Printer size={14} />
                  <span>Print Flyer Card</span>
                </button>
              </div>
            </div>

            {/* Direct Sharing Channels */}
            <div style={{ marginBottom: "1rem" }}>
              <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "#cbd5e1", marginBottom: "0.6rem" }}>
                Instant Share Channels
              </div>
              <div className={styles.shareButtonsRow}>
                {/* WhatsApp */}
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                    `We would love your feedback on your experience with DIMISI Technologies! Leave a quick review here: ${getCampaignUrl(
                      activeCampaign.slug,
                    )}`,
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.shareBtn}
                  style={{ color: "#25d366" }}
                >
                  <MessageCircle size={18} />
                  <span>WhatsApp</span>
                </a>

                {/* Email */}
                <a
                  href={`mailto:?subject=${encodeURIComponent(
                    "Share your experience with DIMISI Technologies",
                  )}&body=${encodeURIComponent(
                    `Hello,\n\nWe value your feedback. Please take a moment to share your review of our recent project:\n\n${getCampaignUrl(
                      activeCampaign.slug,
                    )}\n\nThank you,\nDIMISI Technologies Team`,
                  )}`}
                  className={styles.shareBtn}
                  style={{ color: "#818cf8" }}
                >
                  <Mail size={18} />
                  <span>Email</span>
                </a>

                {/* SMS */}
                <a
                  href={`sms:?body=${encodeURIComponent(
                    `Share your DIMISI review: ${getCampaignUrl(activeCampaign.slug)}`,
                  )}`}
                  className={styles.shareBtn}
                  style={{ color: "#38bdf8" }}
                >
                  <Smartphone size={18} />
                  <span>SMS</span>
                </a>

                {/* Open Form */}
                <a
                  href={getCampaignUrl(activeCampaign.slug)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.shareBtn}
                  style={{ color: "#fbbf24" }}
                >
                  <ExternalLink size={18} />
                  <span>Open Form</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Printable Flyer / Table Tent Modal */}
      {showFlyer && activeCampaign ? (
        <div className={styles.modalBackdrop} onClick={() => setShowFlyer(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Printable Client Review Card</h3>
              <button
                type="button"
                onClick={() => setShowFlyer(false)}
                style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Printable Card */}
            <div className={styles.flyerPreviewBox}>
              <div className={styles.flyerBrand}>DIMISI TECHNOLOGIES</div>
              <div className={styles.flyerTagline}>Technology Beyond Limits</div>
              <div className={styles.flyerCallout}>Scan to share your experience with Dimisi</div>
              <div className={styles.flyerQrContainer}>
                {qrSvg ? (
                  <div
                    style={{ width: "200px", height: "200px" }}
                    dangerouslySetInnerHTML={{ __html: qrSvg }}
                  />
                ) : null}
              </div>
              <div className={styles.flyerShortLink}>
                Or visit: <strong>{getShortUrl(activeCampaign.slug)}</strong>
              </div>
            </div>

            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.btnAction}
                onClick={() => setShowFlyer(false)}
              >
                Close
              </button>
              <button
                type="button"
                className={[styles.btnAction, styles.btnPrimaryAction].join(" ")}
                onClick={handlePrintFlyer}
              >
                <Printer size={15} />
                <span>Print Card / Save PDF</span>
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Create Campaign Modal */}
      {isCreating ? (
        <div className={styles.modalBackdrop} onClick={() => setIsCreating(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Create New Review Campaign</h3>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit}>
              <div className={styles.field}>
                <label className={styles.label}>Campaign Name *</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="e.g. Q3 Web Clients - WhatsApp"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Associated Service (Optional)</label>
                <select
                  className={styles.select}
                  value={selectedServiceId}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedServiceId(val);
                    const found = servicesList.find((s) => s.id === val);
                    setSelectedServiceName(found ? found.title : "");
                  }}
                >
                  <option value="">
                    {isLoadingServices ? "Loading live services..." : "Select live service to pre-fill on form..."}
                  </option>
                  {servicesList.length > 0
                    ? servicesList.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.title}
                        </option>
                      ))
                    : DIMISI_SERVICES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                </select>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Location / Branch (Optional)</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="e.g. Noida Sector 62 or Remote Worldwide"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Expiration Date (Optional)</label>
                <input
                  type="datetime-local"
                  className={styles.input}
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                />
              </div>

              <div className={styles.cardActions} style={{ marginTop: "1.5rem" }}>
                <button
                  type="button"
                  className={styles.btnAction}
                  onClick={() => setIsCreating(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={[styles.btnAction, styles.btnPrimaryAction].join(" ")}
                  disabled={isPending}
                >
                  {isPending ? <Loader2 size={15} className="animate-spin" /> : "Create Campaign"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {/* Delete Campaign Confirmation Modal */}
      {deleteTarget ? (
        <div className={styles.modalBackdrop} onClick={() => setDeleteTarget(null)}>
          <div className={styles.deleteModalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.deleteWarningHeader}>
              <AlertTriangle size={24} className={styles.deleteWarningIcon} />
              <h4 className={styles.deleteWarningTitle}>Delete Review Campaign?</h4>
            </div>
            <p className={styles.deleteWarningText}>
              Are you sure you want to permanently delete campaign <strong>"{deleteTarget.campaign_name}"</strong>?
              This will remove the campaign and deactivate its direct review link (<code>/review/{deleteTarget.slug}</code>).
            </p>
            <div className={styles.deleteModalActions}>
              <button
                type="button"
                className={styles.cancelDeleteBtn}
                onClick={() => setDeleteTarget(null)}
                disabled={isPending}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.confirmDeleteBtn}
                onClick={handleConfirmDelete}
                disabled={isPending}
              >
                {isPending ? <Loader2 size={15} className="animate-spin" /> : "Yes, Delete Campaign"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
