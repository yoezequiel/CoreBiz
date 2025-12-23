/**
 * API Services
 * High-level API service functions for each module
 */

import { get, post, put, patch, del } from "./api";
import { API_ENDPOINTS } from "./config";

// ========== Auth Services ==========

export interface LoginData {
    email: string;
    password: string;
}

export interface RegisterData {
    company: {
        name: string;
        email: string;
        phone?: string;
        address?: string;
    };
    user: {
        name: string;
        email: string;
        password: string;
    };
}

export const authService = {
    login: (data: LoginData) => post(API_ENDPOINTS.AUTH.LOGIN, data),

    register: (data: RegisterData) => post(API_ENDPOINTS.AUTH.REGISTER, data),

    changePassword: (
        data: { currentPassword: string; newPassword: string },
        token: string
    ) => post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, data, token),
};

// ========== Customer Services ==========

export interface Customer {
    id: number;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    status: string;
    created_at: string;
}

export const customerService = {
    list: (token: string, filters?: { status?: string; search?: string }) => {
        const query = new URLSearchParams(filters as any).toString();
        const endpoint = query
            ? `${API_ENDPOINTS.CUSTOMERS.LIST}?${query}`
            : API_ENDPOINTS.CUSTOMERS.LIST;
        return get<Customer[]>(endpoint, token);
    },

    get: (id: number, token: string) =>
        get<Customer>(API_ENDPOINTS.CUSTOMERS.GET(id), token),

    create: (data: Partial<Customer>, token: string) =>
        post<Customer>(API_ENDPOINTS.CUSTOMERS.CREATE, data, token),

    update: (id: number, data: Partial<Customer>, token: string) =>
        put<Customer>(API_ENDPOINTS.CUSTOMERS.UPDATE(id), data, token),

    toggleStatus: (id: number, status: string, token: string) =>
        patch<Customer>(
            API_ENDPOINTS.CUSTOMERS.TOGGLE_STATUS(id),
            { status },
            token
        ),

    getSales: (id: number, token: string) =>
        get(API_ENDPOINTS.CUSTOMERS.SALES(id), token),
};

// ========== Sale Services ==========

export interface Sale {
    id: number;
    customer_id: number;
    customer_name: string;
    amount: number;
    status: string;
    sale_date: string;
    notes?: string;
    created_at: string;
}

export const saleService = {
    list: (token: string, filters?: any) => {
        const query = new URLSearchParams(filters).toString();
        const endpoint = query
            ? `${API_ENDPOINTS.SALES.LIST}?${query}`
            : API_ENDPOINTS.SALES.LIST;
        return get<Sale[]>(endpoint, token);
    },

    get: (id: number, token: string) =>
        get<Sale>(API_ENDPOINTS.SALES.GET(id), token),

    create: (data: Partial<Sale>, token: string) =>
        post<Sale>(API_ENDPOINTS.SALES.CREATE, data, token),

    update: (id: number, data: Partial<Sale>, token: string) =>
        put<Sale>(API_ENDPOINTS.SALES.UPDATE(id), data, token),

    delete: (id: number, token: string) =>
        del(API_ENDPOINTS.SALES.DELETE(id), token),

    exportCSV: (token: string, filters?: any) => {
        const query = new URLSearchParams(filters).toString();
        const endpoint = query
            ? `${API_ENDPOINTS.SALES.EXPORT_CSV}?${query}`
            : API_ENDPOINTS.SALES.EXPORT_CSV;
        return get(endpoint, token);
    },
};

// ========== User Services ==========

export interface User {
    id: number;
    email: string;
    full_name: string;
    role: string;
    status: string;
    created_at: string;
}

export const userService = {
    list: (token: string, filters?: { status?: string; role?: string }) => {
        const query = new URLSearchParams(filters as any).toString();
        const endpoint = query
            ? `${API_ENDPOINTS.USERS.LIST}?${query}`
            : API_ENDPOINTS.USERS.LIST;
        return get<User[]>(endpoint, token);
    },

    get: (id: number, token: string) =>
        get<User>(API_ENDPOINTS.USERS.GET(id), token),

    create: (data: Partial<User> & { password: string }, token: string) =>
        post<User>(API_ENDPOINTS.USERS.CREATE, data, token),

    update: (id: number, data: Partial<User>, token: string) =>
        put<User>(API_ENDPOINTS.USERS.UPDATE(id), data, token),

    toggleStatus: (id: number, status: string, token: string) =>
        patch<User>(API_ENDPOINTS.USERS.TOGGLE_STATUS(id), { status }, token),
};

// ========== Dashboard Services ==========

export interface DashboardStats {
    totalSales: number;
    salesCount: number;
    activeCustomers: number;
    pendingSales: {
        count: number;
        total: number;
    };
}

export const dashboardService = {
    getStats: (token: string, params?: { month?: number; year?: number }) => {
        const query = new URLSearchParams(params as any).toString();
        const endpoint = query
            ? `${API_ENDPOINTS.DASHBOARD.STATS}?${query}`
            : API_ENDPOINTS.DASHBOARD.STATS;
        return get<DashboardStats>(endpoint, token);
    },

    getSalesByMonth: (token: string, year?: number) => {
        const query = year ? `?year=${year}` : "";
        return get(`${API_ENDPOINTS.DASHBOARD.SALES_MONTH}${query}`, token);
    },

    getTopCustomers: (token: string, limit: number = 10) =>
        get(`${API_ENDPOINTS.DASHBOARD.TOP_CUSTOMERS}?limit=${limit}`, token),

    getActivity: (token: string, limit: number = 10) =>
        get(`${API_ENDPOINTS.DASHBOARD.ACTIVITY}?limit=${limit}`, token),
};

// ========== Company Services ==========

export const companyService = {
    get: (token: string) => get(API_ENDPOINTS.COMPANY.GET, token),

    update: (data: any, token: string) =>
        put(API_ENDPOINTS.COMPANY.UPDATE, data, token),
};

// ========== Audit Services ==========

export const auditService = {
    list: (token: string, filters?: any) => {
        const query = new URLSearchParams(filters).toString();
        const endpoint = query
            ? `${API_ENDPOINTS.AUDIT.LIST}?${query}`
            : API_ENDPOINTS.AUDIT.LIST;
        return get(endpoint, token);
    },

    getSummary: (token: string, days: number = 30) =>
        get(`${API_ENDPOINTS.AUDIT.SUMMARY}?days=${days}`, token),
};
