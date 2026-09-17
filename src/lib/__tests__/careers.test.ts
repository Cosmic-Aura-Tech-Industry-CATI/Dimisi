import test from "node:test";
import assert from "node:assert/strict";
import {
  slugifyJob,
  validateJobInput,
  validateJobApplicationInput,
  type JobInput,
  type JobApplicationInput,
} from "../careers.shared";
import { careersStore } from "../careers.data";

test("Careers System - Slugification", async (t) => {
  await t.test("creates clean URL slugs from job titles", () => {
    assert.equal(slugifyJob("Content Writer Intern"), "content-writer-intern");
    assert.equal(slugifyJob("  Graphic Designer Intern (Remote)  "), "graphic-designer-intern-remote");
    assert.equal(slugifyJob("Senior AI Agent Engineer // Applied ML"), "senior-ai-agent-engineer-applied-ml");
  });
});

test("Careers System - Job Validation", async (t) => {
  await t.test("rejects job when title is missing or too short", () => {
    const check = validateJobInput({
      title: "AB",
      department: "Engineering",
      location: "Remote",
      summary: "Valid summary description with sufficient length.",
    });
    assert.equal(check.valid, false);
    assert.match(check.error || "", /title must be at least 3 characters/i);
  });

  await t.test("rejects job when department is missing", () => {
    const check = validateJobInput({
      title: "Senior Engineer",
      department: "",
      location: "Remote",
      summary: "Valid summary description with sufficient length.",
    });
    assert.equal(check.valid, false);
    assert.match(check.error || "", /department is required/i);
  });

  await t.test("rejects job when summary is too short", () => {
    const check = validateJobInput({
      title: "Senior Engineer",
      department: "Engineering",
      location: "Remote",
      summary: "Short",
    });
    assert.equal(check.valid, false);
    assert.match(check.error || "", /summary must be at least 10 characters/i);
  });

  await t.test("accepts valid job opening input", () => {
    const check = validateJobInput({
      title: "Content Writer Intern",
      department: "Content & Editorial",
      type: "Internship",
      location: "Remote / Noida",
      summary: "Research, write, and craft compelling narratives and tech articles.",
      apply_url: "",
    });
    assert.equal(check.valid, true);
  });
});

test("Careers System - Application Validation", async (t) => {
  await t.test("rejects application when full name is missing", () => {
    const check = validateJobApplicationInput({
      full_name: "",
      email: "test@example.com",
      phone: "+91 9876543210",
      location: "New Delhi, India",
      job_id: "seed-job-1",
      resume_data_url: "data:application/pdf;base64,JVBERi0x...",
    });
    assert.equal(check.valid, false);
    assert.match(check.errors.full_name || "", /full name/i);
  });

  await t.test("rejects invalid email address", () => {
    const check = validateJobApplicationInput({
      full_name: "Aarav Sharma",
      email: "not-an-email",
      phone: "+91 9876543210",
      location: "New Delhi, India",
      job_id: "seed-job-1",
      resume_data_url: "data:application/pdf;base64,JVBERi0x...",
    });
    assert.equal(check.valid, false);
    assert.match(check.errors.email || "", /valid email/i);
  });

  await t.test("rejects missing resume", () => {
    const check = validateJobApplicationInput({
      full_name: "Aarav Sharma",
      email: "aarav@example.com",
      phone: "+91 9876543210",
      location: "New Delhi, India",
      job_id: "seed-job-1",
      resume_data_url: "",
    });
    assert.equal(check.valid, false);
    assert.match(check.errors.resume || "", /upload your resume/i);
  });

  await t.test("accepts valid application input", () => {
    const check = validateJobApplicationInput({
      full_name: "Aarav Sharma",
      email: "aarav@example.com",
      phone: "+91 9876543210",
      location: "New Delhi, India",
      job_id: "seed-job-1",
      portfolio_url: "https://aarav.design",
      linkedin_url: "https://linkedin.com/in/aarav",
      resume_data_url: "data:application/pdf;base64,JVBERi0xLjQK...",
      cover_letter: "Excited to apply for DIMISI!",
    });
    assert.equal(check.valid, true);
    assert.equal(Object.keys(check.errors).length, 0);
  });
});

test("Careers System - Store Operations & Live State Integrity", async (t) => {
  await t.test("returns public payload with empty initial jobs when database has no records", () => {
    const payload = careersStore.getPublicPayload();
    assert.equal(payload.jobs.length, 0);
    assert.equal(payload.hero.heading, "Build the Future With Us");
    assert.equal(payload.hero.illustration_caption, "Bhootdev Careers");
    assert.equal(payload.hero.cta_link, "#open-positions");
    assert.equal(payload.closing_cta.cta_link, "#open-positions");
    assert.equal(payload.hiring_steps.length, 5);
    assert.equal(payload.benefits.length, 6);
  });

  await t.test("populates jobs dynamically via setJobs and retrieves by slug", () => {
    careersStore.setJobs([
      {
        id: "job-1",
        title: "Content Writer Intern",
        slug: "content-writer-intern",
        department: "Content & Editorial",
        type: "Internship",
        workplace: "Remote",
        location: "Remote / Noida",
        summary: "Research, write, and craft compelling narratives and tech articles.",
        responsibilities: ["Write tech articles", "Edit copies", "Collaborate with design team"],
        requirements: ["Strong English", "Passion for tech", "Portfolio"],
        benefits: ["Certificate", "Mentorship"],
        apply_url: "",
        order_index: 1,
        is_featured: true,
        status: "open",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]);

    const job = careersStore.getJobBySlug("content-writer-intern");
    assert.ok(job !== null);
    assert.equal(job?.title, "Content Writer Intern");
    assert.equal(job?.department, "Content & Editorial");
    assert.equal(job?.type, "Internship");
    assert.equal(job?.location, "Remote / Noida");
    assert.equal(job?.responsibilities.length, 3);
    assert.equal(job?.requirements.length, 3);
  });

  await t.test("creates, updates, and deletes job in store", () => {
    const input: JobInput = {
      title: "Senior Full Stack Architect",
      slug: "senior-full-stack-architect",
      department: "Platform Engineering",
      type: "Full-time",
      workplace: "Remote",
      location: "Remote / Bengaluru",
      summary: "Lead core distributed architecture and cloud performance optimizations.",
      responsibilities: ["Build micro-frontends and real-time streaming engines."],
      requirements: ["5+ years experience in Node, TypeScript, and React."],
      benefits: ["Top-tier salary, equity, and remote work setup."],
      apply_url: "",
      order_index: 99,
      is_featured: true,
      status: "open",
    };

    const created = careersStore.saveJob(input);
    assert.ok(created.id);
    assert.equal(created.title, "Senior Full Stack Architect");

    const fetched = careersStore.getJobBySlug("senior-full-stack-architect");
    assert.ok(fetched !== null);
    assert.equal(fetched?.title, "Senior Full Stack Architect");

    // Update
    const updated = careersStore.saveJob({
      ...input,
      id: created.id,
      title: "Lead Full Stack Architect",
    });
    assert.equal(updated.title, "Lead Full Stack Architect");

    // Delete
    const deleted = careersStore.deleteJob(created.id);
    assert.equal(deleted, true);

    const notFound = careersStore.getJobBySlug("senior-full-stack-architect");
    assert.equal(notFound, null);
  });

  await t.test("submits, updates status, and deletes job application in store", () => {
    const appInput: JobApplicationInput = {
      full_name: "Priya Sharma",
      email: "priya.test@example.com",
      phone: "+91 9123456780",
      location: "Bengaluru, India",
      job_id: "seed-job-1",
      portfolio_url: "https://priyasharma.io",
      linkedin_url: "https://linkedin.com/in/priyasharma",
      cover_letter: "Passionate storyteller ready to write for DIMISI.",
      resume_data_url: "data:application/pdf;base64,JVBERi0xLjQK...",
    };

    const submitted = careersStore.submitApplication(appInput);
    assert.ok(submitted.id);
    assert.equal(submitted.full_name, "Priya Sharma");
    assert.equal(submitted.status, "new");

    // Retrieve
    const fetched = careersStore.getApplicationById(submitted.id);
    assert.ok(fetched !== null);
    assert.equal(fetched?.email, "priya.test@example.com");

    // Update status
    const updated = careersStore.updateApplicationStatus(submitted.id, "shortlisted", "Impressive writing portfolio");
    assert.ok(updated !== null);
    assert.equal(updated?.status, "shortlisted");
    assert.equal(updated?.notes, "Impressive writing portfolio");

    // Delete
    const deleted = careersStore.deleteApplication(submitted.id);
    assert.equal(deleted, true);

    const notFound = careersStore.getApplicationById(submitted.id);
    assert.equal(notFound, null);
  });

  await t.test("updates 5-step recruitment process and 6 benefits seamlessly", () => {
    const updatedSteps = careersStore.updateHiringSteps([
      { step: "01", title: "Application Review", detail: "Initial CV and portfolio screening." },
      { step: "02", title: "Intro Chat", detail: "Mutual cultural alignment." },
    ]);
    assert.equal(updatedSteps.length, 2);

    const updatedBenefits = careersStore.updateBenefits([
      { id: "b1", title: "Unlimited PTO", description: "Take rest whenever needed." },
    ]);
    assert.equal(updatedBenefits.length, 1);
  });
});

test("Careers API Integration - Public Submission & Admin Operations", async (t) => {
  const originalFetch = globalThis.fetch;

  t.afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  const {
    submitJobApplicationFn,
    getApplicationByIdApi,
    updateApplicationStatusFn,
    deleteApplicationFn,
  } = await import("../careers.functions");

  const { normalizeBackendApplication } = await import("../careers.shared");

  await t.test("1. Handles confirmed 200/201/202 successful application submission", async () => {
    const mockAppDoc = {
      _id: "65f1a2b3c4d5e6f7a8b9c001",
      jobId: "65f1a2b3c4d5e6f7a8b9c999",
      fullName: "Rohan Varma",
      email: "rohan@example.com",
      phone: "+91 9876543210",
      location: "Bengaluru",
      resumeUrl: "https://res.cloudinary.com/dimisi/raw/upload/v1/resume.pdf",
      status: "new",
      createdAt: new Date().toISOString(),
    };

    globalThis.fetch = async (url, opts) => {
      if (String(url).includes("/application/submit")) {
        return {
          ok: true,
          status: 202,
          headers: new Headers({ "content-type": "application/json" }),
          json: async () => ({
            status: "success",
            data: { application: mockAppDoc },
          }),
        } as Response;
      }
      return { ok: false, status: 404 } as Response;
    };

    const res = await submitJobApplicationFn({
      data: {
        job_id: "65f1a2b3c4d5e6f7a8b9c999",
        full_name: "Rohan Varma",
        email: "rohan@example.com",
        phone: "+91 9876543210",
        location: "Bengaluru",
        resume_data_url: "data:application/pdf;base64,JVBERi0xLjQK...",
      },
    });

    assert.equal(res.success, true);
    assert.equal(res.application?.id, "65f1a2b3c4d5e6f7a8b9c001");
    assert.equal(res.application?.full_name, "Rohan Varma");
  });

  await t.test("2. Handles 401 Unauthorized submission failure without false success", async () => {
    careersStore.setApplications([]);

    globalThis.fetch = async (url) => {
      if (String(url).includes("/application/submit")) {
        return {
          ok: false,
          status: 401,
          headers: new Headers({ "content-type": "application/json" }),
          json: async () => ({
            status: "fail",
            message: "User authentication failed.",
          }),
        } as Response;
      }
      return { ok: false, status: 404 } as Response;
    };

    const res = await submitJobApplicationFn({
      data: {
        job_id: "65f1a2b3c4d5e6f7a8b9c999",
        full_name: "Unauthenticated Applicant",
        email: "unauth@example.com",
        phone: "+91 9876543210",
        location: "Delhi",
        resume_data_url: "data:application/pdf;base64,JVBERi0xLjQK...",
      },
    });

    assert.equal(res.success, false);
    assert.match(res.error || "", /Unable to submit your application/i);
    // Ensure local store was NOT updated on 401
    const stored = careersStore.getAllApplications();
    const found = stored.find((a) => a.email === "unauth@example.com");
    assert.equal(found, undefined, "Failed 401 application must not be inserted into store");
  });

  await t.test("3. Handles 403 Forbidden submission failure without false success", async () => {
    careersStore.setApplications([]);

    globalThis.fetch = async () => {
      return {
        ok: false,
        status: 403,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({
          status: "fail",
          message: "Forbidden",
        }),
      } as Response;
    };

    const res = await submitJobApplicationFn({
      data: {
        job_id: "65f1a2b3c4d5e6f7a8b9c999",
        full_name: "Forbidden Applicant",
        email: "forbidden@example.com",
        phone: "+91 9876543210",
        location: "Delhi",
        resume_data_url: "data:application/pdf;base64,JVBERi0xLjQK...",
      },
    });

    assert.equal(res.success, false);
    assert.match(res.error || "", /Unable to submit your application/i);
    const stored = careersStore.getAllApplications();
    assert.equal(stored.find((a) => a.email === "forbidden@example.com"), undefined);
  });

  await t.test("4. Handles 400 Bad Request / Validation failure", async () => {
    globalThis.fetch = async () => {
      return {
        ok: false,
        status: 400,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({
          status: "fail",
          message: "Resume file is required.",
        }),
      } as Response;
    };

    const res = await submitJobApplicationFn({
      data: {
        job_id: "65f1a2b3c4d5e6f7a8b9c999",
        full_name: "Invalid Applicant",
        email: "invalid@example.com",
        phone: "+91 9876543210",
        location: "Delhi",
        resume_data_url: "data:application/pdf;base64,JVBERi0xLjQK...",
      },
    });

    assert.equal(res.success, false);
    assert.equal(res.error, "Resume file is required.");
  });

  await t.test("5. Handles network / connection error gracefully", async () => {
    globalThis.fetch = async () => {
      throw new Error("Failed to fetch");
    };

    const res = await submitJobApplicationFn({
      data: {
        job_id: "65f1a2b3c4d5e6f7a8b9c999",
        full_name: "Offline Applicant",
        email: "offline@example.com",
        phone: "+91 9876543210",
        location: "Delhi",
        resume_data_url: "data:application/pdf;base64,JVBERi0xLjQK...",
      },
    });

    assert.equal(res.success, false);
    assert.match(res.error || "", /Unable to reach backend service|Failed to fetch/i);
  });

  await t.test("6. Removed fields are NOT sent in multipart/form-data payload", async () => {
    let capturedFormData: FormData | null = null;

    globalThis.fetch = async (url, opts) => {
      if (opts?.body instanceof FormData) {
        capturedFormData = opts.body;
      }
      return {
        ok: true,
        status: 202,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({
          status: "success",
          data: {
            application: {
              _id: "65f1a2b3c4d5e6f7a8b9c002",
              fullName: "Payload Test",
              status: "PENDING",
            },
          },
        }),
      } as Response;
    };

    await submitJobApplicationFn({
      data: {
        job_id: "65f1a2b3c4d5e6f7a8b9c999",
        full_name: "Payload Test",
        email: "payload@example.com",
        phone: "+91 9876543210",
        location: "Bengaluru",
        portfolio_url: "https://portfolio.com",
        linkedin_url: "https://linkedin.com/in/payload",
        github_url: "https://github.com/payload",
        cover_letter: "Excited to apply",
        additional_info: "Available immediately",
        resume_data_url: "data:application/pdf;base64,JVBERi0xLjQK...",
      },
    });

    assert.ok(capturedFormData !== null);
    const fd = capturedFormData as unknown as FormData;

    // Must NOT contain removed fields
    assert.equal(fd.has("job_title"), false, "job_title must not be in payload");
    assert.equal(fd.has("job_department"), false, "job_department must not be in payload");
    assert.equal(fd.has("resume_name"), false, "resume_name must not be in payload");
    assert.equal(fd.has("resume_size"), false, "resume_size must not be in payload");
    assert.equal(fd.has("resume_type"), false, "resume_type must not be in payload");

    // Must contain supported fields
    assert.equal(fd.get("jobId"), "65f1a2b3c4d5e6f7a8b9c999");
    assert.equal(fd.get("fullName"), "Payload Test");
    assert.equal(fd.get("email"), "payload@example.com");
    assert.equal(fd.get("phone"), "+91 9876543210");
    assert.equal(fd.get("location"), "Bengaluru");
    assert.equal(fd.get("portfolioUrl"), "https://portfolio.com");
    assert.equal(fd.get("linkedinUrl"), "https://linkedin.com/in/payload");
    assert.equal(fd.get("githubUrl"), "https://github.com/payload");
    assert.equal(fd.get("coverLetter"), "Excited to apply");
    assert.equal(fd.get("additionalInfo"), "Available immediately");
    assert.ok(fd.has("resume"));
  });

  await t.test("7. Normalizes backend application documents accurately", () => {
    const backendDoc = {
      _id: "65f1a2b3c4d5e6f7a8b9c003",
      jobId: {
        _id: "65f1a2b3c4d5e6f7a8b9c999",
        title: "Senior Backend Engineer",
        department: { _id: "dept-1", name: "Platform Engineering" },
      },
      fullName: "Ananya Iyer",
      email: "ananya@example.com",
      phone: "+91 9876543211",
      location: "Hyderabad",
      portfolioUrl: "https://ananya.dev",
      linkedinUrl: "https://linkedin.com/in/ananya",
      githubUrl: "https://github.com/ananya",
      coverLetter: "Passionate distributed systems engineer.",
      additionalInfo: "Notice period: 2 weeks",
      resumeUrl: "https://res.cloudinary.com/dimisi/raw/upload/v1/ananya_cv.pdf",
      status: "shortlisted",
      createdAt: "2026-03-10T10:00:00.000Z",
    };

    const normalized = normalizeBackendApplication(backendDoc);
    assert.equal(normalized.id, "65f1a2b3c4d5e6f7a8b9c003");
    assert.equal(normalized.job_id, "65f1a2b3c4d5e6f7a8b9c999");
    assert.equal(normalized.job_title, "Senior Backend Engineer");
    assert.equal(normalized.job_department, "Platform Engineering");
    assert.equal(normalized.full_name, "Ananya Iyer");
    assert.equal(normalized.status, "shortlisted");
    assert.equal(normalized.resume_name, "ananya_cv.pdf");
    assert.equal(normalized.applied_at, "2026-03-10T10:00:00.000Z");
  });

  await t.test("8. Fetches single application by ID from live endpoint", async () => {
    globalThis.fetch = async (url) => {
      if (String(url).includes("/application/65f1a2b3c4d5e6f7a8b9c003")) {
        return {
          ok: true,
          status: 200,
          headers: new Headers({ "content-type": "application/json" }),
          json: async () => ({
            status: "success",
            data: {
              application: {
                _id: "65f1a2b3c4d5e6f7a8b9c003",
                fullName: "Ananya Iyer",
                status: "reviewing",
              },
            },
          }),
        } as Response;
      }
      return { ok: false, status: 404 } as Response;
    };

    const app = await getApplicationByIdApi("65f1a2b3c4d5e6f7a8b9c003");
    assert.equal(app.id, "65f1a2b3c4d5e6f7a8b9c003");
    assert.equal(app.full_name, "Ananya Iyer");
    assert.equal(app.status, "reviewing");
  });

  await t.test("9. Updates application status via live PATCH API", async () => {
    let capturedBody: any = null;

    globalThis.fetch = async (url, opts) => {
      if (opts?.body) {
        capturedBody = JSON.parse(String(opts.body));
      }
      return {
        ok: true,
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({
          status: "success",
          data: {
            application: {
              _id: "65f1a2b3c4d5e6f7a8b9c003",
              status: capturedBody?.status || "interview",
            },
          },
        }),
      } as Response;
    };

    const res = await updateApplicationStatusFn({
      data: {
        id: "65f1a2b3c4d5e6f7a8b9c003",
        status: "interview",
      },
    });

    assert.equal(res.success, true);
    assert.equal(capturedBody?.status, "interview");
    assert.equal(res.application?.status, "interview");
  });

  await t.test("10. Deletes application via live DELETE API", async () => {
    let deleteCalled = false;

    careersStore.setApplications([
      normalizeBackendApplication({
        _id: "65f1a2b3c4d5e6f7a8b9c003",
        fullName: "Ananya Iyer",
      }),
    ]);

    globalThis.fetch = async (url, opts) => {
      if (opts?.method === "DELETE" && String(url).includes("/application/65f1a2b3c4d5e6f7a8b9c003/delete")) {
        deleteCalled = true;
        return {
          ok: true,
          status: 204,
          headers: new Headers(),
          text: async () => "",
        } as Response;
      }
      return { ok: false, status: 404 } as Response;
    };

    const res = await deleteApplicationFn({
      data: { id: "65f1a2b3c4d5e6f7a8b9c003" },
    });

    assert.equal(res.success, true);
    assert.equal(deleteCalled, true);
  });
});

