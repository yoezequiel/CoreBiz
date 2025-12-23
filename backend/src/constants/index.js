/**
 * Constants
 * Central location for all application constants
 */

export const USER_ROLES = {
    ADMIN: "admin",
    STAFF: "staff",
};

export const USER_STATUS = {
    ACTIVE: "active",
    INACTIVE: "inactive",
};

export const COMPANY_STATUS = {
    ACTIVE: "active",
    SUSPENDED: "suspended",
    CANCELLED: "cancelled",
};

export const COMPANY_PLANS = {
    FREE: "Free",
    BASIC: "Basic",
    PREMIUM: "Premium",
    ENTERPRISE: "Enterprise",
};

export const CUSTOMER_STATUS = {
    ACTIVE: "active",
    INACTIVE: "inactive",
};

export const SALE_STATUS = {
    PENDING: "pending",
    PAID: "paid",
    CANCELLED: "cancelled",
};

export const AUDIT_ACTIONS = {
    CREATE: "create",
    UPDATE: "update",
    DELETE: "delete",
    LOGIN: "login",
    LOGOUT: "logout",
    REGISTER: "register",
    CHANGE_PASSWORD: "change_password",
};

export const ENTITY_TYPES = {
    COMPANY: "company",
    USER: "user",
    CUSTOMER: "customer",
    SALE: "sale",
};

export const PASSWORD_MIN_LENGTH = 8;

export const JWT_EXPIRATION = "7d";

export const PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 50,
    MAX_LIMIT: 1000,
};

export const ERROR_MESSAGES = {
    UNAUTHORIZED: "No autorizado",
    FORBIDDEN: "Acceso denegado",
    NOT_FOUND: "Recurso no encontrado",
    INVALID_CREDENTIALS: "Credenciales inválidas",
    INVALID_EMAIL: "Email inválido",
    INVALID_PASSWORD: "Contraseña inválida",
    PASSWORD_TOO_SHORT: `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres`,
    EMAIL_EXISTS: "El email ya está registrado",
    COMPANY_INACTIVE: "Empresa inactiva",
    USER_INACTIVE: "Usuario inactivo",
    REQUIRED_FIELDS: "Campos requeridos faltantes",
    INTERNAL_ERROR: "Error interno del servidor",
};

export const SUCCESS_MESSAGES = {
    CREATED: "Creado exitosamente",
    UPDATED: "Actualizado exitosamente",
    DELETED: "Eliminado exitosamente",
    PASSWORD_CHANGED: "Contraseña cambiada exitosamente",
    LOGIN_SUCCESS: "Inicio de sesión exitoso",
};
