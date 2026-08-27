import { useEffect, useState, useTransition } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Star, Upload, CheckCircle2, Shield, RefreshCw, X, ArrowLeft, HeartHandshake } from "lucide-react";
import {
  DIMISI_SERVICES,
  REVIEW_TEXT_MAX,
  REVIEW_TEXT_MIN,
  validateReview,
  PHOTO_MAX_BYTES,
  PHOTO_TYPES,
  type ReviewInput,
} from "@/lib/reviews.shared";
import {
  getReviewCampaign,
  getReviewCaptcha,
  submitReview,
} from "@/lib/reviews.functions";
import styles from "./ReviewSubmitPage.module.css";

const RATING_DESCRIPTIONS: Record<number, string> = {
  1: "1 Star — Needs Major Improvement",
  2: "2 Stars — Fair / Met Minimum",
  3: "3 Stars — Good / Satisfactory",
  4: "4 Stars — Very Good / Highly Capable",
  5: "5 Stars — Outstanding / Technology Beyond Limits",
};

export function ReviewSubmitPage({
  campaignSlug,
  isScan,
}: {
  campaignSlug?: string;
  isScan?: boolean;
}) {
  const loadCampaign = useServerFn(getReviewCampaign);
  const loadCaptcha = useServerFn(getReviewCaptcha);
  const sendReview = useServerFn(submitReview);

  const [campaign, setCampaign] = useState<{
    id: string;
    campaign_name: string;
    service_name: string | null;
    location: string | null;
  } | null>(null);

  const [formData, setFormData] = useState<ReviewInput>({
    slug: campaignSlug ?? "",
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    serviceName: "",
    rating: 5,
    reviewText: "",
    customerLocation: "",
    consent: false,
  });

  const [hoverRating, setHoverRating] = useState<number>(0);
  const [photoData, setPhotoData] = useState<{ name: string; type: string; dataUrl: string } | null>(null);
  const [captcha, setCaptcha] = useState<{ question: string; token: string } | null>(null);
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [honeypot, setHoneypot] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  // Load campaign & captcha challenge
  useEffect(() => {
    let active = true;

    if (campaignSlug) {
      loadCampaign({ data: { slug: campaignSlug, ...(isScan ? { scan: true } : {}) } })
        .then((res) => {
          if (active && res?.campaign) {
            setCampaign(res.campaign);
            if (res.campaign.service_name) {
              const svc = res.campaign.service_name;
              setFormData((prev) => ({ ...prev, serviceName: svc }));
            }
            if (res.campaign.location) {
              const loc = res.campaign.location;
              setFormData((prev) => ({ ...prev, customerLocation: loc }));
            }
          }
        })
        .catch(() => {
          // ignore campaign load error
        });
    }

    loadCaptcha()
      .then((c) => {
        if (active && c) setCaptcha(c);
      })
      .catch(() => {
        if (active) setCaptcha({ question: "What is 4 + 5?", token: "fallback" });
      });

    return () => {
      active = false;
    };
  }, [campaignSlug, isScan, loadCampaign, loadCaptcha]);

  const refreshCaptcha = () => {
    setCaptchaAnswer("");
    loadCaptcha().then((c) => {
      if (c) setCaptcha(c);
    });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!(PHOTO_TYPES as readonly string[]).includes(file.type as any)) {
      setErrors((prev) => ({ ...prev, photo: "Photo must be JPG, PNG, or WebP." }));
      return;
    }

    if (file.size > PHOTO_MAX_BYTES) {
      setErrors((prev) => ({ ...prev, photo: "Photo size must be under 3 MB." }));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPhotoData({
        name: file.name,
        type: file.type,
        dataUrl: reader.result as string,
      });
      setErrors((prev) => {
        const { photo, ...rest } = prev;
        return rest;
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (honeypot) return; // bot detected

    const validationErrors = validateReview(formData);
    if (!captchaAnswer.trim()) {
      validationErrors["captcha"] = "Please answer the anti-spam question.";
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      const firstKey = Object.keys(validationErrors)[0];
      const el = document.getElementById(`field-${firstKey}`);
      if (el) el.focus();
      return;
    }

    setErrors({});
    setSubmitError(null);

    startTransition(async () => {
      try {
        await sendReview({
          data: {
            ...(campaignSlug ? { slug: campaignSlug } : {}),
            customerName: formData.customerName,
            ...(formData.customerEmail ? { customerEmail: formData.customerEmail } : {}),
            ...(formData.customerPhone ? { customerPhone: formData.customerPhone } : {}),
            ...(formData.serviceName ? { serviceName: formData.serviceName } : {}),
            rating: formData.rating,
            reviewText: formData.reviewText,
            ...(formData.customerLocation ? { customerLocation: formData.customerLocation } : {}),
            consent: formData.consent,
            captchaToken: captcha?.token ?? "",
            captchaAnswer: captchaAnswer.trim(),
            ...(photoData ? { photo: photoData } : {}),
          },
        });
        setSubmitted(true);
      } catch (err) {
        setSubmitError(err instanceof Error ? err.message : "Could not submit your review. Please try again.");
        refreshCaptcha();
      }
    });
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {campaign ? (
          <div className={styles.campaignBanner}>
            <span className={styles.campaignBadge}>Campaign</span>
            <p className={styles.campaignTitle}>
              Reviewing <strong>{campaign.service_name || campaign.campaign_name}</strong>
              {campaign.location ? ` (${campaign.location})` : ""}
            </p>
          </div>
        ) : null}

        <div className={styles.card}>
          {submitted ? (
            <div className={styles.successCard}>
              <div className={styles.successIcon}>
                <CheckCircle2 size={40} />
              </div>
              <h2 className={styles.successTitle}>Review Submitted!</h2>
              <p className={styles.successMsg}>
                Thank you for sharing your feedback. Your review has been submitted and will be published after approval by our team.
              </p>
              <div className={styles.successActions}>
                <Link to="/reviews" className={styles.btnSecondary}>
                  View All Reviews
                </Link>
                <Link to="/" className={styles.btnSecondary}>
                  Back to DIMISI Home
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className={styles.header}>
                <div className={styles.kicker}>
                  <span className={styles.kickerDot} />
                  <span>Customer Experience</span>
                </div>
                <h1 className={styles.title}>Share Your Dimisi Experience</h1>
                <p className={styles.subtitle}>
                  We value your honest feedback. Your review helps us continuously innovate and deliver technology beyond limits.
                </p>
              </div>

              <form onSubmit={handleSubmit} className={styles.form} noValidate>
                {/* 5-Star Rating Selector */}
                <div className={styles.ratingSection} id="field-rating">
                  <label className={styles.ratingLabel}>
                    Select Your Rating <span className={styles.req}>*</span>
                  </label>
                  <div className={styles.starsRow} role="radiogroup" aria-label="Rating from 1 to 5 stars">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const active = star <= (hoverRating || formData.rating);
                      return (
                        <button
                          key={star}
                          type="button"
                          className={[styles.starBtn, active ? styles.starFilled : ""].join(" ")}
                          onClick={() => setFormData((prev) => ({ ...prev, rating: star }))}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          onFocus={() => setHoverRating(star)}
                          onBlur={() => setHoverRating(0)}
                          aria-label={`${star} Star${star > 1 ? "s" : ""}`}
                          aria-checked={formData.rating === star}
                          role="radio"
                        >
                          <Star size={34} fill={active ? "currentColor" : "none"} strokeWidth={1.5} />
                        </button>
                      );
                    })}
                  </div>
                  <div className={styles.ratingDescriptor}>
                    {RATING_DESCRIPTIONS[hoverRating || formData.rating]}
                  </div>
                  {errors["rating"] ? <span className={styles.errorText}>{errors["rating"]}</span> : null}
                </div>

                {/* Customer Name */}
                <div className={styles.field}>
                  <label htmlFor="field-customerName" className={styles.label}>
                    <span>Your Full Name <span className={styles.req}>*</span></span>
                  </label>
                  <input
                    id="field-customerName"
                    type="text"
                    className={[styles.input, errors["customerName"] ? styles.inputErr : ""].join(" ")}
                    placeholder="e.g. Alexander Wright"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    maxLength={80}
                    required
                  />
                  {errors["customerName"] ? (
                    <span className={styles.errorText}>{errors["customerName"]}</span>
                  ) : null}
                </div>

                {/* Email & Phone Row */}
                <div className={styles.row2}>
                  <div className={styles.field}>
                    <label htmlFor="field-customerEmail" className={styles.label}>
                      <span>Email Address</span>
                      <span className={styles.opt}>Private / Optional</span>
                    </label>
                    <input
                      id="field-customerEmail"
                      type="email"
                      className={[styles.input, errors["customerEmail"] ? styles.inputErr : ""].join(" ")}
                      placeholder="alex@company.com"
                      value={formData.customerEmail}
                      onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                    />
                    {errors["customerEmail"] ? (
                      <span className={styles.errorText}>{errors["customerEmail"]}</span>
                    ) : null}
                  </div>

                  <div className={styles.field}>
                    <label htmlFor="field-customerPhone" className={styles.label}>
                      <span>Phone Number</span>
                      <span className={styles.opt}>Private / Optional</span>
                    </label>
                    <input
                      id="field-customerPhone"
                      type="tel"
                      className={[styles.input, errors["customerPhone"] ? styles.inputErr : ""].join(" ")}
                      placeholder="+1 (555) 000-1234"
                      value={formData.customerPhone}
                      onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                    />
                    {errors["customerPhone"] ? (
                      <span className={styles.errorText}>{errors["customerPhone"]}</span>
                    ) : null}
                  </div>
                </div>

                {/* Service Received & Location */}
                <div className={styles.row2}>
                  <div className={styles.field}>
                    <label htmlFor="field-serviceName" className={styles.label}>
                      <span>Service / Project Received</span>
                    </label>
                    <select
                      id="field-serviceName"
                      className={styles.select}
                      value={formData.serviceName}
                      onChange={(e) => setFormData({ ...formData, serviceName: e.target.value })}
                    >
                      <option value="">Select a service category...</option>
                      {DIMISI_SERVICES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.field}>
                    <label htmlFor="field-customerLocation" className={styles.label}>
                      <span>Your Location</span>
                      <span className={styles.opt}>Optional</span>
                    </label>
                    <input
                      id="field-customerLocation"
                      type="text"
                      className={styles.input}
                      placeholder="e.g. San Francisco, CA or London, UK"
                      value={formData.customerLocation}
                      onChange={(e) => setFormData({ ...formData, customerLocation: e.target.value })}
                      maxLength={120}
                    />
                  </div>
                </div>

                {/* Written Review */}
                <div className={styles.field}>
                  <label htmlFor="field-reviewText" className={styles.label}>
                    <span>Your Review <span className={styles.req}>*</span></span>
                    <span className={styles.charCount}>
                      {formData.reviewText.length}/{REVIEW_TEXT_MAX}
                    </span>
                  </label>
                  <textarea
                    id="field-reviewText"
                    className={[styles.textarea, errors["reviewText"] ? styles.inputErr : ""].join(" ")}
                    placeholder="Describe your project, team collaboration, technical quality, and the outcomes delivered by DIMISI..."
                    value={formData.reviewText}
                    onChange={(e) => setFormData({ ...formData, reviewText: e.target.value })}
                    maxLength={REVIEW_TEXT_MAX}
                    required
                  />
                  {errors["reviewText"] ? (
                    <span className={styles.errorText}>{errors["reviewText"]}</span>
                  ) : null}
                </div>

                {/* Optional Customer Photo Upload */}
                <div className={styles.field}>
                  <label className={styles.label}>
                    <span>Customer Photo</span>
                    <span className={styles.opt}>Optional (Max 3MB)</span>
                  </label>
                  <div className={styles.photoUploadBox}>
                    {photoData?.dataUrl ? (
                      <img src={photoData.dataUrl} alt="Preview" className={styles.photoPreview} />
                    ) : (
                      <div className={styles.photoPlaceholder}>
                        <Upload size={20} />
                      </div>
                    )}
                    <div className={styles.photoActions}>
                      <label className={styles.fileBtn}>
                        <Upload size={14} />
                        <span>{photoData ? "Change Photo" : "Upload Photo"}</span>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className={styles.fileInput}
                          onChange={handlePhotoUpload}
                        />
                      </label>
                      {photoData ? (
                        <button
                          type="button"
                          className={styles.removePhotoBtn}
                          onClick={() => setPhotoData(null)}
                        >
                          Remove photo
                        </button>
                      ) : (
                        <span className={styles.opt}>JPG, PNG, or WebP</span>
                      )}
                    </div>
                  </div>
                  {errors["photo"] ? <span className={styles.errorText}>{errors["photo"]}</span> : null}
                </div>

                {/* Publication Consent Checkbox */}
                <div className={styles.consentBox} id="field-consent">
                  <input
                    type="checkbox"
                    id="consent-check"
                    className={styles.checkbox}
                    checked={formData.consent}
                    onChange={(e) => setFormData({ ...formData, consent: e.target.checked })}
                    required
                  />
                  <label htmlFor="consent-check" className={styles.consentText}>
                    I allow Dimisi to display my name, rating, review, and submitted photo on its website and marketing materials.{" "}
                    <button
                      type="button"
                      className={styles.privacyLink}
                      onClick={() => setShowPrivacy(true)}
                    >
                      Read Review Privacy Notice
                    </button>
                  </label>
                </div>
                {errors["consent"] ? <span className={styles.errorText}>{errors["consent"]}</span> : null}

                {/* Anti-Spam Arithmetic Challenge */}
                <div className={styles.captchaBox} id="field-captcha">
                  <div className={styles.captchaQuestion}>
                    <Shield size={16} color="#ffab2e" />
                    <span>Security Verification: {captcha?.question || "Loading verification..."}</span>
                    <button
                      type="button"
                      onClick={refreshCaptcha}
                      style={{ background: "none", border: "none", color: "#ffab2e", cursor: "pointer", marginLeft: "auto" }}
                      title="New question"
                    >
                      <RefreshCw size={14} />
                    </button>
                  </div>
                  <input
                    type="text"
                    className={[styles.input, errors["captcha"] ? styles.inputErr : ""].join(" ")}
                    placeholder="Enter answer here"
                    value={captchaAnswer}
                    onChange={(e) => setCaptchaAnswer(e.target.value)}
                    required
                  />
                  {errors["captcha"] ? (
                    <span className={styles.errorText}>{errors["captcha"]}</span>
                  ) : null}
                </div>

                {/* Invisible bot honeypot */}
                <input
                  type="text"
                  name="dimisi_hp"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  className={styles.honeypot}
                  tabIndex={-1}
                  autoComplete="off"
                />

                {submitError ? <div className={styles.formError}>{submitError}</div> : null}

                <button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={isPending}
                >
                  {isPending ? (
                    <>
                      <RefreshCw size={18} className="animate-spin" />
                      <span>Submitting Your Review...</span>
                    </>
                  ) : (
                    <>
                      <HeartHandshake size={18} />
                      <span>Submit Review</span>
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      {/* Privacy Notice Modal */}
      {showPrivacy ? (
        <div className={styles.modalBackdrop} onClick={() => setShowPrivacy(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 className={styles.modalTitle}>DIMISI Review Privacy Notice</h3>
              <button
                type="button"
                onClick={() => setShowPrivacy(false)}
                style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <p>
                <strong>Data Collection & Purpose:</strong> DIMISI Technologies collects your submitted name, rating, service feedback, and optional photo to showcase genuine client experiences. Your email address and phone number are collected solely for verification and moderation communication; they are <strong>never</strong> displayed publicly.
              </p>
              <p>
                <strong>Moderation & Consent:</strong> Every review undergoes administrator moderation prior to publication. Content containing spam, offensive remarks, or confidential data is rejected.
              </p>
              <p>
                <strong>Your Rights (GDPR & Data Protection):</strong> You have the right to request correction, anonymization, or deletion of your review at any time by emailing <code>hello@dimisi.in</code>.
              </p>
            </div>
            <button
              type="button"
              className={styles.closeModalBtn}
              onClick={() => setShowPrivacy(false)}
            >
              I Understand
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
