/**
 * MongoDB Indexes Configuration & Initializer
 */
import { getCollection, COLLECTIONS } from "./collections";

let indexesEnsured = false;

export async function ensureMongoIndexes(): Promise<void> {
  if (indexesEnsured) return;

  try {
    // 1. Reviews collection
    const reviewsCol = await getCollection(COLLECTIONS.REVIEWS);
    if (reviewsCol) {
      await reviewsCol.createIndex({ id: 1 }, { unique: true });
      await reviewsCol.createIndex({ status: 1, submitted_at: -1 });
      await reviewsCol.createIndex({ is_featured: 1, status: 1 });
      await reviewsCol.createIndex({ campaign_id: 1 });
      await reviewsCol.createIndex({ reviewer_type: 1 });
    }

    // 2. Campaigns collection
    const campaignsCol = await getCollection(COLLECTIONS.CAMPAIGNS);
    if (campaignsCol) {
      await campaignsCol.createIndex({ slug: 1 }, { unique: true });
      await campaignsCol.createIndex({ id: 1 }, { unique: true });
      await campaignsCol.createIndex({ is_active: 1, expires_at: 1 });
    }

    // 3. Reports collection
    const reportsCol = await getCollection(COLLECTIONS.REPORTS);
    if (reportsCol) {
      await reportsCol.createIndex({ id: 1 }, { unique: true });
      await reportsCol.createIndex({ review_id: 1 });
      await reportsCol.createIndex({ status: 1 });
    }

    // 4. Leads collection
    const leadsCol = await getCollection(COLLECTIONS.LEADS);
    if (leadsCol) {
      await leadsCol.createIndex({ id: 1 }, { unique: true });
      await leadsCol.createIndex({ created_at: -1 });
      await leadsCol.createIndex({ email: 1 });
    }

    // 5. Admin Users & Profiles
    const adminUsersCol = await getCollection(COLLECTIONS.ADMIN_USERS);
    if (adminUsersCol) {
      await adminUsersCol.createIndex({ user_id: 1 }, { unique: true });
      await adminUsersCol.createIndex({ email: 1 }, { unique: true });
    }

    const profilesCol = await getCollection(COLLECTIONS.PROFILES);
    if (profilesCol) {
      await profilesCol.createIndex({ id: 1 }, { unique: true });
    }

    // 6. Audit Logs
    const auditLogsCol = await getCollection(COLLECTIONS.AUDIT_LOGS);
    if (auditLogsCol) {
      await auditLogsCol.createIndex({ id: 1 }, { unique: true });
      await auditLogsCol.createIndex({ created_at: -1 });
      await auditLogsCol.createIndex({ entity_id: 1 });
    }

    // 7. Content Modules (Events, Services, Projects, Jobs, Blogs)
    const eventsCol = await getCollection(COLLECTIONS.EVENTS);
    if (eventsCol) {
      await eventsCol.createIndex({ id: 1 }, { unique: true });
      await eventsCol.createIndex({ slug: 1 }, { unique: true });
      await eventsCol.createIndex({ status: 1 });
    }

    const galleryCol = await getCollection(COLLECTIONS.GALLERY);
    if (galleryCol) {
      await galleryCol.createIndex({ id: 1 }, { unique: true });
    }

    const servicesCol = await getCollection(COLLECTIONS.SERVICES);
    if (servicesCol) {
      await servicesCol.createIndex({ id: 1 }, { unique: true });
      await servicesCol.createIndex({ slug: 1 }, { unique: true });
    }

    const projectsCol = await getCollection(COLLECTIONS.PROJECTS);
    if (projectsCol) {
      await projectsCol.createIndex({ id: 1 }, { unique: true });
      await projectsCol.createIndex({ slug: 1 }, { unique: true });
    }

    const blogPostsCol = await getCollection(COLLECTIONS.BLOG_POSTS);
    if (blogPostsCol) {
      await blogPostsCol.createIndex({ id: 1 }, { unique: true });
      await blogPostsCol.createIndex({ slug: 1 }, { unique: true });
    }

    const jobsCol = await getCollection(COLLECTIONS.JOBS);
    if (jobsCol) {
      await jobsCol.createIndex({ id: 1 }, { unique: true });
      await jobsCol.createIndex({ slug: 1 }, { unique: true });
    }

    indexesEnsured = true;
    console.log("[mongodb] Database indexes ensured.");
  } catch (err) {
    console.warn("[mongodb] Note ensuring indexes:", err instanceof Error ? err.message : String(err));
  }
}
