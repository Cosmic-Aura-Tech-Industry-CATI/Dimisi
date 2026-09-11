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
      job_title: "Content Writer Intern",
      resume_name: "resume.pdf",
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
      job_title: "Content Writer Intern",
      resume_name: "resume.pdf",
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
      job_title: "Content Writer Intern",
      resume_name: "",
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
      job_title: "Content Writer Intern",
      portfolio_url: "https://aarav.design",
      linkedin_url: "https://linkedin.com/in/aarav",
      resume_name: "aarav_resume.pdf",
      resume_data_url: "data:application/pdf;base64,JVBERi0xLjQK...",
      cover_letter: "Excited to apply for DIMISI!",
    });
    assert.equal(check.valid, true);
    assert.equal(Object.keys(check.errors).length, 0);
  });
});

test("Careers System - Store Operations & Seed Integrity", async (t) => {
  await t.test("returns public payload with all default open internship roles", () => {
    const payload = careersStore.getPublicPayload();
    assert.ok(payload.jobs.length >= 2);
    assert.equal(payload.hero.heading, "Build the Future With Us");
    assert.equal(payload.hero.illustration_caption, "Bhootdev Careers");
    assert.equal(payload.hero.cta_link, "#open-positions");
    assert.equal(payload.closing_cta.cta_link, "#open-positions");
    assert.equal(payload.hiring_steps.length, 5);
    assert.equal(payload.benefits.length, 6);
  });

  await t.test("retrieves Content Writer Intern with full details", () => {
    const job = careersStore.getJobBySlug("content-writer-intern");
    assert.ok(job !== null);
    assert.equal(job?.title, "Content Writer Intern");
    assert.equal(job?.department, "Content & Editorial");
    assert.equal(job?.type, "Internship");
    assert.equal(job?.location, "Remote / Noida");
    assert.ok(job?.responsibilities.length >= 3);
    assert.ok(job?.requirements.length >= 3);
  });

  await t.test("retrieves Graphic Designer Intern with full details", () => {
    const job = careersStore.getJobBySlug("graphic-designer-intern");
    assert.ok(job !== null);
    assert.equal(job?.title, "Graphic Designer Intern");
    assert.equal(job?.department, "Design & Creative");
    assert.equal(job?.type, "Internship");
    assert.equal(job?.location, "Remote / Noida");
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
      job_title: "Content Writer Intern",
      job_department: "Content & Editorial",
      portfolio_url: "https://priyasharma.io",
      linkedin_url: "https://linkedin.com/in/priyasharma",
      cover_letter: "Passionate storyteller ready to write for DIMISI.",
      resume_name: "priya_cv.pdf",
      resume_data_url: "data:application/pdf;base64,JVBERi0xLjQK...",
      resume_size: 1048576,
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

