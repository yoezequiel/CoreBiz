/**
 * HTTP Client
 * Centralized HTTP request handling with authentication
 */

import { API_BASE_URL } from "./config";

export interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
    error?: string;
    code?: string;
}

export interface RequestOptions {
    method?: string;
    headers?: Record<string, string>;
    body?: any;
    token?: string;
}

/**
 * Makes an authenticated API request
 */
export async function apiRequest<T = any>(
    endpoint: string,
    options: RequestOptions = {}
): Promise<ApiResponse<T>> {
    const { method = "GET", headers = {}, body, token } = options;

    const config: RequestInit = {
        method,
        headers: {
            "Content-Type": "application/json",
            ...headers,
            ...(token && { Authorization: `Bearer ${token}` }),
        },
    };

    if (body && method !== "GET") {
        config.body = JSON.stringify(body);
    }

    try {
        const url = endpoint.startsWith("http")
            ? endpoint
            : `${API_BASE_URL}${endpoint}`;
        const response = await fetch(url, config);
        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: data.error || data.message || "Error en la petición",
                code: data.code,
                message: data.message,
            };
        }

        return {
            success: true,
            data: data.data || data,
            message: data.message,
        };
    } catch (error: any) {
        console.error("API Request Error:", error);
        return {
            success: false,
            error: error.message || "Error de conexión",
        };
    }
}

/**
 * GET request helper
 */
export async function get<T = any>(
    endpoint: string,
    token?: string
): Promise<ApiResponse<T>> {
    return apiRequest<T>(endpoint, { method: "GET", token });
}

/**
 * POST request helper
 */
export async function post<T = any>(
    endpoint: string,
    body: any,
    token?: string
): Promise<ApiResponse<T>> {
    return apiRequest<T>(endpoint, { method: "POST", body, token });
}

/**
 * PUT request helper
 */
export async function put<T = any>(
    endpoint: string,
    body: any,
    token?: string
): Promise<ApiResponse<T>> {
    return apiRequest<T>(endpoint, { method: "PUT", body, token });
}

/**
 * PATCH request helper
 */
export async function patch<T = any>(
    endpoint: string,
    body: any,
    token?: string
): Promise<ApiResponse<T>> {
    return apiRequest<T>(endpoint, { method: "PATCH", body, token });
}

/**
 * DELETE request helper
 */
export async function del<T = any>(
    endpoint: string,
    token?: string
): Promise<ApiResponse<T>> {
    return apiRequest<T>(endpoint, { method: "DELETE", token });
}

/**
 * Get token from cookies (client-side)
 */
export function getToken(): string | null {
    if (typeof document === "undefined") return null;

    const cookies = document.cookie.split(";");
    const tokenCookie = cookies.find((c) => c.trim().startsWith("token="));
    return tokenCookie ? tokenCookie.split("=")[1] : null;
}

/**
 * Get user from localStorage (client-side)
 */
export function getUser(): any {
    if (typeof localStorage === "undefined") return null;

    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
}

/**
 * Set token cookie (client-side)
 */
export function setToken(token: string, days: number = 7): void {
    if (typeof document === "undefined") return;

    const maxAge = days * 24 * 60 * 60;
    document.cookie = `token=${token}; path=/; max-age=${maxAge}`;
}

/**
 * Clear authentication (client-side)
 */
export function clearAuth(): void {
    if (typeof document === "undefined") return;

    document.cookie = "token=; path=/; max-age=0";
    localStorage.removeItem("user");
}
