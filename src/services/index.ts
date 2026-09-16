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
  decodeJwtPayload,
  type AdminLoginCredentials,
  type BackendLoginResponse,
  type AdminAuthSession,
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
  type BackendDepartmentDoc,
  type BackendDepartmentListResponse,
  type BackendDepartmentSingleResponse,
  type DepartmentItem,
} from "./department.service";



