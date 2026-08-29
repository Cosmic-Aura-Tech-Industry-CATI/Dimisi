/**
 * Content Repository — MongoDB Data Access Layer for CMS Modules
 * Covers Events, Gallery, Services, Projects/Work, Careers, and Blogs.
 */
import {
  getCollection,
  COLLECTIONS,
  type MongoEvent,
  type MongoGalleryItem,
  type MongoService,
  type MongoIndustrySector,
  type MongoProject,
  type MongoJobOpening,
  type MongoCareersConfig,
  type MongoBlogPost,
  type MongoBlogConfigDoc,
} from "../db/collections";
import type { CompanyEvent, EventGalleryItem } from "@/lib/events.shared";
import type { CompanyService, IndustrySector } from "@/lib/services.shared";
import type { ProjectItem } from "@/lib/work.shared";
import type {
  JobOpening,
  HiringProcessStep,
  CultureBenefit,
  CareersHeroConfig,
  CareersClosingCtaConfig,
} from "@/lib/careers.shared";
import type { BlogPostItem, BlogConfig } from "@/lib/blog.shared";

export class ContentRepository {
  // ===================== EVENTS & GALLERY =====================

  async getEvents(): Promise<CompanyEvent[]> {
    const col = await getCollection<MongoEvent>(COLLECTIONS.EVENTS);
    if (!col) return [];
    const docs = await col.find().sort({ date: 1 }).toArray();
    return docs.map(({ _id, ...rest }) => rest as CompanyEvent);
  }

  async saveEvent(event: CompanyEvent): Promise<CompanyEvent> {
    const col = await getCollection<MongoEvent>(COLLECTIONS.EVENTS);
    if (col) {
      await col.updateOne({ id: event.id }, { $set: event }, { upsert: true });
    }
    return event;
  }

  async deleteEvent(id: string): Promise<boolean> {
    const col = await getCollection<MongoEvent>(COLLECTIONS.EVENTS);
    if (!col) return false;
    const res = await col.deleteOne({ id });
    return res.deletedCount > 0;
  }

  async getGallery(): Promise<EventGalleryItem[]> {
    const col = await getCollection<MongoGalleryItem>(COLLECTIONS.GALLERY);
    if (!col) return [];
    const docs = await col.find().sort({ created_at: -1 }).toArray();
    return docs.map(({ _id, ...rest }) => rest as EventGalleryItem);
  }

  async saveGalleryItem(item: EventGalleryItem): Promise<EventGalleryItem> {
    const col = await getCollection<MongoGalleryItem>(COLLECTIONS.GALLERY);
    if (col) {
      await col.updateOne({ id: item.id }, { $set: item }, { upsert: true });
    }
    return item;
  }

  async deleteGalleryItem(id: string): Promise<boolean> {
    const col = await getCollection<MongoGalleryItem>(COLLECTIONS.GALLERY);
    if (!col) return false;
    const res = await col.deleteOne({ id });
    return res.deletedCount > 0;
  }

  // ===================== SERVICES & INDUSTRIES =====================

  async getServices(): Promise<CompanyService[]> {
    const col = await getCollection<MongoService>(COLLECTIONS.SERVICES);
    if (!col) return [];
    const docs = await col.find().sort({ display_order: 1 }).toArray();
    return docs.map(({ _id, ...rest }) => rest as CompanyService);
  }

  async saveService(service: CompanyService): Promise<CompanyService> {
    const col = await getCollection<MongoService>(COLLECTIONS.SERVICES);
    if (col) {
      await col.updateOne({ id: service.id }, { $set: service }, { upsert: true });
    }
    return service;
  }

  async deleteService(id: string): Promise<boolean> {
    const col = await getCollection<MongoService>(COLLECTIONS.SERVICES);
    if (!col) return false;
    const res = await col.deleteOne({ id });
    return res.deletedCount > 0;
  }

  async getIndustries(): Promise<IndustrySector[]> {
    const col = await getCollection<MongoIndustrySector>(COLLECTIONS.INDUSTRIES);
    if (!col) return [];
    const docs = await col.find().toArray();
    return docs.map(({ _id, ...rest }) => rest as IndustrySector);
  }

  // ===================== PROJECTS / WORK =====================

  async getProjects(): Promise<ProjectItem[]> {
    const col = await getCollection<MongoProject>(COLLECTIONS.PROJECTS);
    if (!col) return [];
    const docs = await col.find().sort({ display_order: 1 }).toArray();
    return docs.map(({ _id, ...rest }) => rest as ProjectItem);
  }

  async saveProject(project: ProjectItem): Promise<ProjectItem> {
    const col = await getCollection<MongoProject>(COLLECTIONS.PROJECTS);
    if (col) {
      await col.updateOne({ id: project.id }, { $set: project }, { upsert: true });
    }
    return project;
  }

  async deleteProject(id: string): Promise<boolean> {
    const col = await getCollection<MongoProject>(COLLECTIONS.PROJECTS);
    if (!col) return false;
    const res = await col.deleteOne({ id });
    return res.deletedCount > 0;
  }

  // ===================== CAREERS & JOBS =====================

  async getJobs(): Promise<JobOpening[]> {
    const col = await getCollection<MongoJobOpening>(COLLECTIONS.JOBS);
    if (!col) return [];
    const docs = await col.find().sort({ display_order: 1 }).toArray();
    return docs.map(({ _id, ...rest }) => rest as JobOpening);
  }

  async saveJob(job: JobOpening): Promise<JobOpening> {
    const col = await getCollection<MongoJobOpening>(COLLECTIONS.JOBS);
    if (col) {
      await col.updateOne({ id: job.id }, { $set: job }, { upsert: true });
    }
    return job;
  }

  async deleteJob(id: string): Promise<boolean> {
    const col = await getCollection<MongoJobOpening>(COLLECTIONS.JOBS);
    if (!col) return false;
    const res = await col.deleteOne({ id });
    return res.deletedCount > 0;
  }

  // ===================== BLOG & JOURNAL =====================

  async getBlogPosts(): Promise<BlogPostItem[]> {
    const col = await getCollection<MongoBlogPost>(COLLECTIONS.BLOG_POSTS);
    if (!col) return [];
    const docs = await col.find().sort({ published_at: -1 }).toArray();
    return docs.map(({ _id, ...rest }) => rest as BlogPostItem);
  }

  async saveBlogPost(post: BlogPostItem): Promise<BlogPostItem> {
    const col = await getCollection<MongoBlogPost>(COLLECTIONS.BLOG_POSTS);
    if (col) {
      await col.updateOne({ id: post.id }, { $set: post }, { upsert: true });
    }
    return post;
  }

  async deleteBlogPost(id: string): Promise<boolean> {
    const col = await getCollection<MongoBlogPost>(COLLECTIONS.BLOG_POSTS);
    if (!col) return false;
    const res = await col.deleteOne({ id });
    return res.deletedCount > 0;
  }
}

export const contentRepository = new ContentRepository();
