/**
 * Central API Services Registry & Barrel Exports
 * Provides unified access to all frontend API client layers and Express backend integrations.
 */

// 1. API Client Core & Utilities
export {
  API_BASE_URL,
  ApiError,
  apiRequest,
  type RequestOptions,
} from "./apiClient";

// 2. Authentication & Session Services
export {
  loginAdmin,
  logoutAdmin,
  getStoredAdminSession,
  refreshAdminTokenApi,
  clearAdminSession,
  transformBackendPanelUser,
  type AdminLoginCredentials,
  type BackendLoginResponse,
  type AdminAuthSession,
  type AdminAuthUser,
} from "./adminAuth.service";

// 3. Admin & User Management Services
export {
  getAllPanelAdmins,
  getPanelAdminById,
  createPanelAdmin,
  updatePanelAdminRole,
  activatePanelAdmin,
  deactivatePanelAdmin,
  fetchAdminsApi,
  grantAdminAccessApi,
  updateAdminRoleApi,
  updateAdminActiveApi,
  deleteAdminApi,
  normalizeBackendPanelUser,
  type BackendPanelUserDoc,
  type BackendAdminsListResponse,
  type BackendAdminSingleResponse,
  type GrantAdminPayload,
  type NormalizedAdminUser,
} from "./adminManagement.service";

// 4. Service Categories Services
export {
  getAllServiceCategoriesApi,
  createServiceCategoryApi,
  updateServiceCategoryApi,
  deleteServiceCategoryApi,
  normalizeBackendServiceCategory,
  type BackendServiceCategoryDoc,
  type BackendServiceCategoryListResponse,
  type BackendServiceCategorySingleResponse,
  type CreateServiceCategoryPayload,
  type UpdateServiceCategoryPayload,
} from "./serviceCategory.service";

// 5. Company Services API
export {
  getAllServicesApi,
  getVisitorServicesApi,
  getServiceByIdApi,
  createServiceApi,
  updateServiceApi,
  deleteServiceApi,
  toggleServiceActivationApi,
  toggleServiceFeaturedApi,
  resolveCategoryIdForPayload,
  resolveCategoryName,
  normalizeBackendService,
  isMongoId,
  type BackendServiceDoc,
  type BackendServiceListResponse,
  type BackendServiceSingleResponse,
} from "./service.service";

// 6. Case Study & Work Categories API
export {
  getAllCasestudyCategoriesApi,
  createCasestudyCategoryApi,
  updateCasestudyCategoryApi,
  deleteCasestudyCategoryApi,
  normalizeBackendCasestudyCategory,
  type BackendCasestudyCategoryDoc,
  type BackendCasestudyCategoryListResponse,
  type BackendCasestudyCategorySingleResponse,
  type CreateCasestudyCategoryPayload,
  type UpdateCasestudyCategoryPayload,
} from "./casestudyCategory.service";

// 7. Case Studies / Our Work & Products API
export {
  getAllCasestudiesApi,
  getActiveCasestudiesApi,
  getCasestudyByIdApi,
  createCasestudyApi,
  updateCasestudyApi,
  deleteCasestudyApi,
  toggleCasestudyActivationApi,
  toggleCasestudyFeaturedApi,
  resolveCasestudyCategoryName,
  resolveCasestudyCategoryIdForPayload,
  normalizeBackendCasestudy,
  DEFAULT_CASESTUDY_FALLBACK_IMAGE,
  type BackendCasestudyDoc,
  type BackendCasestudyListResponse,
  type BackendCasestudySingleResponse,
} from "./casestudy.service";

// 8. Department API
export {
  getAllActiveDepartmentsApi,
  getDepartmentByIdApi,
  normalizeBackendDepartment,
  DEFAULT_DEPARTMENTS,
  type BackendDepartmentDoc,
  type BackendDepartmentListResponse,
  type BackendDepartmentSingleResponse,
  type DepartmentItem,
} from "./department.service";

// 9. Blog Category Taxonomy API
export {
  getAllBlogCategoriesApi,
  createBlogCategoryApi,
  updateBlogCategoryApi,
  deleteBlogCategoryApi,
  normalizeBackendBlogCategory,
  resolveBlogCategoryName,
  resolveBlogCategoryIdForPayload,
  type BackendBlogCategoryDoc,
  type BackendBlogCategoryListResponse,
  type BackendBlogCategorySingleResponse,
  type CreateBlogCategoryPayload,
  type UpdateBlogCategoryPayload,
} from "./blogCategory.service";

// 10. Blog & Editorial Publication API
export {
  getPublicActiveBlogsApi,
  getAllAdminBlogsApi,
  getBlogByIdApi,
  createBlogApi,
  updateBlogApi,
  deleteBlogApi,
  toggleBlogActiveApi,
  setBlogFeaturedApi,
  getBlogConfigApi,
  updateBlogConfigApi,
  normalizeBackendBlog,
  DEFAULT_BLOG_FALLBACK_IMAGE,
  type BackendBlogDoc,
  type BackendBlogListResponse,
  type BackendBlogSingleResponse,
  type BackendBlogConfigResponse,
} from "./blog.service";

// 11. Event Category Taxonomy API
export {
  getAllEventCategoriesApi,
  createEventCategoryApi,
  updateEventCategoryApi,
  deleteEventCategoryApi,
  normalizeBackendEventCategory,
  resolveEventCategoryName,
  resolveEventCategoryIdForPayload,
  type BackendEventCategoryDoc,
  type BackendEventCategoryListResponse,
  type BackendEventCategorySingleResponse,
  type CreateEventCategoryPayload,
  type UpdateEventCategoryPayload,
} from "./eventCategory.service";

// 12. Event & Photo Gallery API
export {
  getPublicActiveEventsApi,
  getPublicActiveGalleryApi,
  getAllAdminEventsApi,
  getAllAdminGalleryApi,
  getEventByIdApi,
  createEventApi,
  createGalleryItemApi,
  updateEventApi,
  deleteEventApi,
  normalizeBackendEvent,
  normalizeBackendGalleryItem,
  DEFAULT_EVENT_FALLBACK_IMAGE,
  type BackendEventDoc,
  type BackendEventListResponse,
  type BackendEventSingleResponse,
} from "./event.service";

// 13. Campaign & QR API
export {
  getAllAdminCampaignsApi,
  createAdminCampaignApi,
  toggleAdminCampaignApi,
  deleteAdminCampaignApi,
  normalizeBackendCampaign,
  type BackendCampaignDoc,
  type BackendCampaignListResponse,
  type BackendCampaignSingleResponse,
  type CreateCampaignPayload,
} from "./campaign.service";

// 14. Reviews & Testimonials API
export {
  getPublicReviewsApi,
  submitPublicReviewApi,
  reportReviewApi,
  getAllAdminReviewsApi,
  getReviewKpisApi,
  updateReviewStatusApi,
  deleteReviewApi,
  keepReviewApi,
  toggleReviewActiveApi,
  toggleReviewVerifyApi,
  normalizeBackendReview,
  normalizeBackendPublicReview,
  normalizeBackendReport,
  type BackendReviewDoc,
  type BackendReviewListResponse,
  type BackendReviewSingleResponse,
  type BackendReviewKpiResponse,
  type SubmitReviewPayload,
  type ReportReviewPayload,
} from "./review.service";

// 15. Leads CRM & Contact Inquiries API
export {
  submitLeadApi,
  getAllAdminLeadsApi,
  getLeadDetailsApi,
  updateLeadApi,
  deleteLeadApi,
  normalizeBackendLead,
  type BackendLeadDoc,
  type BackendVisitorSessionDoc,
  type BackendLeadListResponse,
  type BackendLeadSingleResponse,
  type SubmitLeadPayload,
  type UpdateLeadPayload,
} from "./lead.service";

// 16. Admin Activity & Audit Logs API
export {
  getPanelActivityLogsApi,
  normalizeBackendActivityLog,
  type BackendActivityLogDoc,
  type BackendActivityLogsResponse,
  type AdminActivityLogItem,
} from "./activity.service";

// 17. Application Configuration & Settings API
export {
  getFullAppConfigApi,
  getSectionConfigApi,
  updateAppConfigApi,
  updateSectionConfigApi,
  type BackendAppConfigResponse,
} from "./config.service";

