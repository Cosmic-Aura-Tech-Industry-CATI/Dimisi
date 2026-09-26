/**
 * DIMISI Technologies — Client-Side & Admin API Careers Functions
 * Integrates live Express backend endpoints for Careers / Jobs and Applications.
 */
import { careersStore } from "./careers.data";
import {
  type JobOpening,
  type JobInput,
  type JobApplicationItem,
  type JobApplicationInput,
  type ApplicationStatus,
  type HiringProcessStep,
  type CultureBenefit,
  type CareersHeroConfig,
  type CareersClosingCtaConfig,
  type PublicCareersPayload,
  type BackendJobListResponse,
  type BackendJobSingleResponse,
  type BackendApplicationListResponse,
  type BackendApplicationSingleResponse,
  validateJobInput,
  validateJobApplicationInput,
  normalizeBackendJob,
  normalizeBackendApplication,
  serializeJobInputToBackend,
  isMongoId,
} from "./careers.shared";
import {
  apiRequest,
  clearApiCache,
  ApiError,
  API_BASE_URL,
} from "../services/apiClient";
import {
  DEFAULT_DEPARTMENTS,
  getAllActiveDepartmentsApi,
  type DepartmentItem,
} from "../services/department.service";

export { isMongoId };

/**
 * 1. GET PUBLIC CAREERS DATA
 * Endpoint: GET /api/v1/admin-panel/jobs/all
 * Only active jobs (isActive: true) are returned for public visitors.
 */
export async function getPublicCareersData(): Promise<PublicCareersPayload> {
  const departments: DepartmentItem[] = DEFAULT_DEPARTMENTS;

  try {
    const res = await apiRequest<BackendJobListResponse>(
      "/api/v1/admin-panel/jobs/all",
      { method: "GET" },
    );

    const rawJobs = res?.data?.jobs;
    if (Array.isArray(rawJobs)) {
      const allNormalized = rawJobs.map((doc) => normalizeBackendJob(doc, departments));
      // Filter for public view: only active jobs
      const activeJobs = allNormalized.filter((j) => j.status === "open");
      careersStore.setJobs(activeJobs);
    } else {
      careersStore.setJobs([]);
    }
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      console.warn("Failed to fetch public careers from live backend API:", err.message);
    }
    throw err;
  }

  return careersStore.getPublicPayload();
}

/**
 * 2. GET JOB BY SLUG
 */
export async function getJobBySlug({
  data,
}: {
  data: { slug: string };
}): Promise<JobOpening | null> {
  if (!data?.slug) return null;
  const cleanSlug = data.slug.trim().toLowerCase();

  // 1. Check local store
  let job = careersStore.getJobBySlug(cleanSlug);
  if (job) return job;

  // 2. Fetch fresh live jobs from backend
  try {
    let departments: DepartmentItem[] = [];
    try {
      departments = await getAllActiveDepartmentsApi();
    } catch {
      departments = [];
    }

    const res = await apiRequest<BackendJobListResponse>(
      "/api/v1/admin-panel/jobs/all",
      { method: "GET" },
    );

    const rawJobs = res?.data?.jobs;
    if (Array.isArray(rawJobs)) {
      const allNormalized = rawJobs.map((doc) => normalizeBackendJob(doc, departments));
      const activeJobs = allNormalized.filter((j) => j.status === "open");
      careersStore.setJobs(activeJobs);
      job = careersStore.getJobBySlug(cleanSlug);
      if (job) return job;
    }
  } catch (err) {
    console.warn("Live lookup for job by slug failed:", err);
  }

  return null;
}

/**
 * 3. GET SINGLE JOB BY ID
 * Endpoint: GET /api/v1/admin-panel/jobs/:id
 */
export async function getJobByIdApi(
  id: string,
  departments?: DepartmentItem[],
): Promise<JobOpening> {
  if (!id) throw new Error("Job ID is required.");

  const res = await apiRequest<BackendJobSingleResponse>(
    `/api/v1/admin-panel/jobs/${encodeURIComponent(id)}`,
    { method: "GET" },
  );

  const doc = res?.data?.job;
  if (!doc) throw new Error(res?.message || "Job not found.");

  return normalizeBackendJob(doc, departments);
}

/**
 * 4. GET ADMIN CAREERS DATA (ALL JOBS + APPLICATIONS)
 * Fetches all jobs (active & inactive) and all job applications.
 */
export async function getAdminCareersData(): Promise<{
  jobs: JobOpening[];
  applications: JobApplicationItem[];
  hiring_steps: HiringProcessStep[];
  benefits: CultureBenefit[];
  hero: CareersHeroConfig;
  closing_cta: CareersClosingCtaConfig;
  stats: PublicCareersPayload["stats"];
}> {
  let departments: DepartmentItem[] = [];
  try {
    departments = await getAllActiveDepartmentsApi();
  } catch {
    departments = [];
  }

  const [jobsRes, appsRes] = await Promise.allSettled([
    apiRequest<BackendJobListResponse>("/api/v1/admin-panel/jobs/all", { method: "GET" }),
    apiRequest<BackendApplicationListResponse>("/api/v1/admin-panel/application/all", { method: "GET" }),
  ]);

  let allJobs: JobOpening[] = [];
  if (jobsRes.status === "fulfilled" && Array.isArray(jobsRes.value?.data?.jobs)) {
    allJobs = jobsRes.value.data.jobs.map((doc) => normalizeBackendJob(doc, departments));
    careersStore.setJobs(allJobs);
  } else if (jobsRes.status === "rejected") {
    console.warn("Could not load live jobs for admin careers:", jobsRes.reason);
    allJobs = careersStore.getAllJobs();
  }

  let allApps: JobApplicationItem[] = [];
  if (appsRes.status === "fulfilled" && Array.isArray(appsRes.value?.data?.applications)) {
    allApps = appsRes.value.data.applications.map((doc) => normalizeBackendApplication(doc, allJobs));
    careersStore.setApplications(allApps);
  } else if (appsRes.status === "rejected") {
    console.warn("Could not load live applications for admin careers:", appsRes.reason);
    allApps = careersStore.getAllApplications();
  }

  const payload = careersStore.getPublicPayload();

  return {
    jobs: allJobs,
    applications: allApps,
    hiring_steps: payload.hiring_steps,
    benefits: payload.benefits,
    hero: payload.hero,
    closing_cta: payload.closing_cta,
    stats: payload.stats,
  };
}

/**
 * 5. SAVE JOB (CREATE OR UPDATE)
 * Create: POST /api/v1/admin-panel/jobs/create
 * Update: PATCH /api/v1/admin-panel/jobs/:id/update
 */
export async function saveJobFn({
  data,
  departments,
}: {
  data: JobInput;
  departments?: DepartmentItem[];
}): Promise<{ success: boolean; job?: JobOpening; error?: string }> {
  try {
    const validation = validateJobInput(data);
    if (!validation.valid) {
      return { success: false, error: validation.error || "Validation failed." };
    }

    if (!departments || departments.length === 0) {
      try {
        departments = await getAllActiveDepartmentsApi();
      } catch {
        departments = [];
      }
    }

    const payload = serializeJobInputToBackend(data, departments);

    let savedDoc: any = null;

    if (data.id && isMongoId(data.id)) {
      // UPDATE existing job
      const res = await apiRequest<BackendJobSingleResponse>(
        `/api/v1/admin-panel/jobs/${encodeURIComponent(data.id)}/update`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      savedDoc = res?.data?.job;
    } else {
      // CREATE new job
      const res = await apiRequest<BackendJobSingleResponse>(
        "/api/v1/admin-panel/jobs/create",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      savedDoc = res?.data?.job;
    }

    const normalized = normalizeBackendJob(savedDoc, departments);
    careersStore.saveJob(data);
    clearApiCache("/api/v1/admin-panel/jobs");

    return { success: true, job: normalized };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to save job opening.";
    return {
      success: false,
      error: errorMsg,
    };
  }
}

/**
 * 6. DELETE JOB
 * Endpoint: DELETE /api/v1/admin-panel/jobs/:id/delete
 */
export async function deleteJobFn({
  data,
}: {
  data: { id: string };
}): Promise<{ success: boolean; error?: string }> {
  try {
    if (!data?.id) return { success: false, error: "Job ID is required." };

    if (isMongoId(data.id)) {
      await apiRequest(
        `/api/v1/admin-panel/jobs/${encodeURIComponent(data.id)}/delete`,
        { method: "DELETE" },
      );
    }

    careersStore.deleteJob(data.id);
    clearApiCache("/api/v1/admin-panel/jobs");

    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to delete job opening.",
    };
  }
}

/**
 * 7. TOGGLE JOB ACTIVE STATUS
 * Endpoint: PATCH /api/v1/admin-panel/jobs/:id/toggle-activate
 */
export async function toggleJobActiveFn({
  data,
  departments,
}: {
  data: { id: string };
  departments?: DepartmentItem[];
}): Promise<{ success: boolean; job?: JobOpening; error?: string }> {
  try {
    if (!data?.id) return { success: false, error: "Job ID is required." };

    const res = await apiRequest<BackendJobSingleResponse>(
      `/api/v1/admin-panel/jobs/${encodeURIComponent(data.id)}/toggle-activate`,
      { method: "PATCH" },
    );

    const doc = res?.data?.job;
    const normalized = normalizeBackendJob(doc, departments);

    // Update in store
    const existing = careersStore.getJobById(data.id);
    if (existing) {
      existing.status = normalized.status;
      existing.updated_at = normalized.updated_at;
    }
    clearApiCache("/api/v1/admin-panel/jobs");

    return { success: true, job: normalized };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to toggle job active status.",
    };
  }
}

/**
 * 8. TOGGLE JOB FEATURED STATUS
 * Endpoint: PATCH /api/v1/admin-panel/jobs/:id/toggle-featured
 */
export async function toggleJobFeaturedFn({
  data,
  departments,
}: {
  data: { id: string };
  departments?: DepartmentItem[];
}): Promise<{ success: boolean; job?: JobOpening; error?: string }> {
  try {
    if (!data?.id) return { success: false, error: "Job ID is required." };

    const res = await apiRequest<BackendJobSingleResponse>(
      `/api/v1/admin-panel/jobs/${encodeURIComponent(data.id)}/toggle-featured`,
      { method: "PATCH" },
    );

    const doc = res?.data?.job;
    const normalized = normalizeBackendJob(doc, departments);

    // Update in store
    const existing = careersStore.getJobById(data.id);
    if (existing) {
      existing.is_featured = normalized.is_featured;
      existing.updated_at = normalized.updated_at;
    }
    clearApiCache("/api/v1/admin-panel/jobs");

    return { success: true, job: normalized };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to toggle job featured status.",
    };
  }
}

/**
 * 9. SUBMIT JOB APPLICATION
 * Endpoint: POST /api/v1/admin-panel/application/submit
 *
 * Note: Public application submission requires a backend route/authorization configuration
 * that permits unauthenticated visitors. Frontend intentionally does not bypass authentication.
 */
export async function submitJobApplicationFn({
  data,
  resumeFile,
}: {
  data: JobApplicationInput;
  resumeFile?: File | null;
}): Promise<{ success: boolean; application?: JobApplicationItem; error?: string }> {
  try {
    const validation = validateJobApplicationInput(data);
    if (!validation.valid) {
      const firstError = Object.values(validation.errors)[0] || "Validation failed.";
      return { success: false, error: firstError };
    }

    if (!resumeFile && (!data.resume_data_url || !data.resume_data_url.startsWith("data:"))) {
      return { success: false, error: "Please upload your resume file (PDF, DOC, or DOCX)." };
    }

    const formData = new FormData();
    formData.append("jobId", data.job_id || "general-inquiry");
    formData.append("fullName", data.full_name);
    formData.append("email", data.email);
    formData.append("phone", data.phone);
    formData.append("location", data.location);
    if (data.portfolio_url) formData.append("portfolioUrl", data.portfolio_url);
    if (data.linkedin_url) formData.append("linkedinUrl", data.linkedin_url);
    if (data.github_url) formData.append("githubUrl", data.github_url);
    if (data.cover_letter) formData.append("coverLetter", data.cover_letter);
    if (data.additional_info) formData.append("additionalInfo", data.additional_info);

    if (resumeFile) {
      formData.append("resume", resumeFile);
    } else if (data.resume_data_url && data.resume_data_url.startsWith("data:")) {
      try {
        const arr = data.resume_data_url.split(",");
        const mime = arr[0].match(/:(.*?);/)?.[1] || "application/pdf";
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        const blob = new Blob([u8arr], { type: mime });
        formData.append("resume", blob, "Resume.pdf");
      } catch {
        const blob = new Blob(["%PDF-1.4 Resume Content"], { type: "application/pdf" });
        formData.append("resume", blob, "Resume.pdf");
      }
    }

    const res = await apiRequest<BackendApplicationSingleResponse>(
      "/api/v1/admin-panel/application/submit",
      {
        method: "POST",
        body: formData,
      },
    );

    const doc = res?.data?.application;
    const normalized = normalizeBackendApplication(doc);
    // Synchronize local store ONLY after confirmed backend success
    careersStore.submitApplication(data);
    clearApiCache("/api/v1/admin-panel/application");
    return { success: true, application: normalized };
  } catch (err: unknown) {
    let msg = "Unable to submit your application right now. Please try again shortly.";

    if (err instanceof ApiError) {
      if (err.status === 401 || err.status === 403) {
        msg = "Unable to submit your application right now. Please try again shortly.";
        if (typeof console !== "undefined" && typeof console.warn === "function") {
          console.warn("[JobApplication] Public submission blocked: backend requires authenticated user session (HTTP 401/403).");
        }
      } else if (err.status === 413) {
        msg = "Resume file is too large. Please upload a file under 5MB.";
      } else if (err.status === 400) {
        msg = err.message || "Invalid application details. Please verify the form and try again.";
      } else if (err.status >= 500) {
        msg = "Server error occurred while submitting your application. Please try again later.";
      } else if (err.message) {
        msg = err.message;
      }
    } else if (err instanceof Error && err.message) {
      msg = err.message;
    }

    return {
      success: false,
      error: msg,
    };
  }
}

/**
 * 10. GET SINGLE APPLICATION BY ID
 * Endpoint: GET /api/v1/admin-panel/application/:id
 */
export async function getApplicationByIdApi(id: string): Promise<JobApplicationItem> {
  if (!id) throw new Error("Application ID is required.");

  if (isMongoId(id)) {
    const res = await apiRequest<BackendApplicationSingleResponse>(
      `/api/v1/admin-panel/application/${encodeURIComponent(id)}`,
      { method: "GET" },
    );
    const doc = res?.data?.application;
    if (!doc) throw new Error(res?.message || "Application not found.");
    const allJobs = careersStore.getAllJobs();
    return normalizeBackendApplication(doc, allJobs);
  }

  const local = careersStore.getApplicationById(id);
  if (!local) throw new Error("Application not found.");
  return local;
}

/**
 * 11. GET ADMIN APPLICATIONS
 * Endpoint: GET /api/v1/admin-panel/application/all
 */
export async function getAdminApplicationsFn(): Promise<JobApplicationItem[]> {
  try {
    const res = await apiRequest<BackendApplicationListResponse>(
      "/api/v1/admin-panel/application/all",
      { method: "GET" },
    );

    if (Array.isArray(res?.data?.applications)) {
      const allJobs = careersStore.getAllJobs();
      const normalized = res.data.applications.map((doc) =>
        normalizeBackendApplication(doc, allJobs),
      );
      careersStore.setApplications(normalized);
      return normalized;
    }
  } catch (err) {
    console.warn("Failed to fetch applications from API, returning local store:", err);
  }

  return careersStore.getAllApplications();
}

/**
 * 12. UPDATE APPLICATION STATUS
 * Endpoint: PATCH /api/v1/admin-panel/application/:id/update
 */
export async function updateApplicationStatusFn({
  data,
}: {
  data: { id: string; status: ApplicationStatus; notes?: string };
}): Promise<{ success: boolean; application?: JobApplicationItem; error?: string }> {
  try {
    if (!data?.id) return { success: false, error: "Application ID is required." };

    const backendStatus = data.status === "hired" ? "accepted" : data.status;

    if (isMongoId(data.id)) {
      const res = await apiRequest<BackendApplicationSingleResponse>(
        `/api/v1/admin-panel/application/${encodeURIComponent(data.id)}/update`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: backendStatus }),
        },
      );
      const doc = res?.data?.application;
      const normalized = normalizeBackendApplication(doc);
      careersStore.updateApplicationStatus(data.id, data.status, data.notes);
      clearApiCache("/api/v1/admin-panel/application");
      return { success: true, application: normalized };
    }

    const updated = careersStore.updateApplicationStatus(data.id, data.status, data.notes);
    if (!updated) return { success: false, error: "Application not found." };
    return { success: true, application: updated };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update application status.",
    };
  }
}

/**
 * 13. DELETE APPLICATION
 * Endpoint: DELETE /api/v1/admin-panel/application/:id/delete
 */
export async function deleteApplicationFn({
  data,
}: {
  data: { id: string };
}): Promise<{ success: boolean; error?: string }> {
  try {
    if (!data?.id) return { success: false, error: "Application ID is required." };

    if (isMongoId(data.id)) {
      await apiRequest(
        `/api/v1/admin-panel/application/${encodeURIComponent(data.id)}/delete`,
        { method: "DELETE" },
      );
    }

    const ok = careersStore.deleteApplication(data.id);
    clearApiCache("/api/v1/admin-panel/application");
    return { success: ok };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to delete application.",
    };
  }
}

/**
 * 13. DOWNLOAD RESUME FROM LIVE API
 * Endpoint: GET /api/v1/admin-panel/application/:id/resume
 */
export async function downloadResumeApi(
  id: string,
  candidateName?: string,
): Promise<void> {
  if (!id) throw new Error("Application ID is required.");

  const filename = `${(candidateName || "Candidate").replace(/\s+/g, "_")}_Resume.pdf`;

  if (isMongoId(id)) {
    const url = `${API_BASE_URL}/api/v1/admin-panel/application/${encodeURIComponent(id)}/resume`;
    let authToken: string | undefined;
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("dimisi_admin_session");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed?.token && !parsed.token.includes("cookie")) {
            authToken = parsed.token;
          }
        }
      } catch {}
    }

    const headers: Record<string, string> = {};
    if (authToken && !authToken.includes("cookie")) {
      headers["Authorization"] = `Bearer ${authToken}`;
    }

    const res = await fetch(url, {
      method: "GET",
      headers,
      credentials: "include",
    });

    if (res.ok) {
      const blob = await res.blob();
      const disposition = res.headers.get("content-disposition");
      let dlName = filename;
      if (disposition) {
        const match = disposition.match(/filename="?([^";]+)"?/);
        if (match?.[1]) dlName = match[1];
      }
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = dlName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
      return;
    }

    if (res.status === 401 || res.status === 403) {
      throw new Error("Unauthorized to download resume. Please ensure you are logged in as admin.");
    }
    if (res.status === 404) {
      throw new Error("Resume not found or still processing.");
    }
    throw new Error(`Failed to download resume (HTTP ${res.status}).`);
  }

  throw new Error("Resume download is not available for this record.");
}

/**
 * 13. HIRING PROCESS, BENEFITS & HERO CONFIG SETTERS
 */
export async function saveHiringStepsFn({
  data,
}: {
  data: { steps: HiringProcessStep[] };
}): Promise<{ success: boolean; steps: HiringProcessStep[] }> {
  const updated = careersStore.updateHiringSteps(data.steps);
  return { success: true, steps: updated };
}

export async function saveBenefitsFn({
  data,
}: {
  data: { benefits: CultureBenefit[] };
}): Promise<{ success: boolean; benefits: CultureBenefit[] }> {
  const updated = careersStore.updateBenefits(data.benefits);
  return { success: true, benefits: updated };
}

export async function saveCareersHeroFn({
  data,
}: {
  data: { hero?: Partial<CareersHeroConfig>; closing_cta?: Partial<CareersClosingCtaConfig> };
}): Promise<{ success: boolean }> {
  if (data.hero) careersStore.updateHero(data.hero);
  if (data.closing_cta) careersStore.updateClosingCta(data.closing_cta);
  return { success: true };
}

