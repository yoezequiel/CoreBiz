/**
 * API Configuration
 * Centralized configuration for API calls
 */

// API Base URL from environment or default
export const API_BASE_URL =
    import.meta.env.PUBLIC_API_URL || "http://localhost:3000/api";

// API Endpoints
export const API_ENDPOINTS = {
    // Auth
    AUTH: {
        LOGIN: "/auth/login",
        REGISTER: "/auth/register",
        CHANGE_PASSWORD: "/auth/change-password",
        ME: "/auth/me",
    },
    // Company
    COMPANY: {
        GET: "/companies",
        UPDATE: "/companies",
        DEACTIVATE: "/companies/deactivate",
    },
    // Users
    USERS: {
        LIST: "/users",
        CREATE: "/users",
        GET: (id: number) => `/users/${id}`,
        UPDATE: (id: number) => `/users/${id}`,
        TOGGLE_STATUS: (id: number) => `/users/${id}/status`,
    },
    // Customers
    CUSTOMERS: {
        LIST: "/customers",
        CREATE: "/customers",
        GET: (id: number) => `/customers/${id}`,
        UPDATE: (id: number) => `/customers/${id}`,
        TOGGLE_STATUS: (id: number) => `/customers/${id}/status`,
        SALES: (id: number) => `/customers/${id}/sales`,
    },
    // Sales
    SALES: {
        LIST: "/sales",
        CREATE: "/sales",
        GET: (id: number) => `/sales/${id}`,
        UPDATE: (id: number) => `/sales/${id}`,
        DELETE: (id: number) => `/sales/${id}`,
        EXPORT_CSV: "/sales/export/csv",
    },
    // Dashboard
    DASHBOARD: {
        STATS: "/dashboard/stats",
        SALES_MONTH: "/dashboard/sales-by-month",
        TOP_CUSTOMERS: "/dashboard/top-customers",
        ACTIVITY: "/dashboard/recent-activity",
    },
    // Audit
    AUDIT: {
        LIST: "/audit",
        SUMMARY: "/audit/summary",
    },
} as const;

// HTTP Methods
export const HTTP_METHODS = {
    GET: "GET",
    POST: "POST",
    PUT: "PUT",
    PATCH: "PATCH",
    DELETE: "DELETE",
} as const;

// Cookie keys
export const STORAGE_KEYS = {
    TOKEN: "token",
    USER: "user",
} as const;
