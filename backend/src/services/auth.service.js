/**
 * Authentication Service
 * Handles all authentication-related business logic
 */

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import validator from "validator";
import db from "../config/database.js";
import { AppError } from "../middleware/errorHandler.js";
import { logAudit } from "../middleware/audit.js";

/**
 * Register a new company and admin user
 */
export const registerCompany = async (companyData, adminData) => {
    // Validate inputs
    if (
        !validator.isEmail(companyData.email) ||
        !validator.isEmail(adminData.email)
    ) {
        throw new AppError("Email inválido", 400);
    }

    if (adminData.password.length < 8) {
        throw new AppError(
            "La contraseña debe tener al menos 8 caracteres",
            400
        );
    }

    // Check if company email exists
    const existingCompany = await db.query(
        "SELECT id FROM companies WHERE email = ?",
        [companyData.email]
    );

    if (existingCompany.rows.length > 0) {
        throw new AppError("El email de la empresa ya está registrado", 409);
    }

    // Create company
    const companyResult = await db.query(
        `INSERT INTO companies (name, email, phone, address, plan, status)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
            companyData.name,
            companyData.email,
            companyData.phone || null,
            companyData.address || null,
            "Free",
            "active",
        ]
    );

    const companyId = companyResult.rows[0]?.id || companyResult.rowCount;

    // Hash password
    const passwordHash = await bcrypt.hash(adminData.password, 10);

    // Create admin user
    const userResult = await db.query(
        `INSERT INTO users (company_id, email, password_hash, full_name, role, status)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
            companyId,
            adminData.email,
            passwordHash,
            adminData.name,
            "admin",
            "active",
        ]
    );

    const userId = userResult.rows[0]?.id || userResult.rowCount;

    // Log audit
    await logAudit(companyId, userId, "register", "company", companyId);

    return {
        company: {
            id: companyId,
            name: companyData.name,
            email: companyData.email,
            plan: "Free",
        },
        user: {
            id: userId,
            email: adminData.email,
            fullName: adminData.name,
            role: "admin",
        },
    };
};

/**
 * Authenticate user and generate JWT token
 */
export const login = async (email, password, ipAddress) => {
    if (!email || !password) {
        throw new AppError("Email y contraseña requeridos", 400);
    }

    // Find user with company info
    const userResult = await db.query(
        `SELECT u.id, u.company_id, u.email, u.password_hash, u.full_name, u.role, u.status,
                c.name as company_name, c.status as company_status
         FROM users u
         JOIN companies c ON u.company_id = c.id
         WHERE u.email = ?`,
        [email]
    );

    if (userResult.rows.length === 0) {
        throw new AppError("Credenciales inválidas", 401);
    }

    const user = userResult.rows[0];

    // Check user status
    if (user.status !== "active") {
        throw new AppError("Usuario inactivo", 403);
    }

    // Check company status
    if (user.company_status !== "active") {
        throw new AppError("Empresa inactiva", 403);
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
        throw new AppError("Credenciales inválidas", 401);
    }

    // Generate JWT
    const token = jwt.sign(
        {
            userId: user.id,
            companyId: user.company_id,
            role: user.role,
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    // Log audit
    await logAudit(
        user.company_id,
        user.id,
        "login",
        "user",
        user.id,
        null,
        ipAddress
    );

    return {
        token,
        user: {
            id: user.id,
            email: user.email,
            fullName: user.full_name,
            role: user.role,
            companyId: user.company_id,
            companyName: user.company_name,
        },
    };
};

/**
 * Change user password
 */
export const changePassword = async (userId, currentPassword, newPassword) => {
    if (newPassword.length < 8) {
        throw new AppError(
            "La nueva contraseña debe tener al menos 8 caracteres",
            400
        );
    }

    // Get user
    const userResult = await db.query(
        "SELECT id, password_hash, company_id FROM users WHERE id = ?",
        [userId]
    );

    if (userResult.rows.length === 0) {
        throw new AppError("Usuario no encontrado", 404);
    }

    const user = userResult.rows[0];

    // Verify current password
    const validPassword = await bcrypt.compare(
        currentPassword,
        user.password_hash
    );

    if (!validPassword) {
        throw new AppError("Contraseña actual incorrecta", 401);
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Update password
    await db.query(
        "UPDATE users SET password_hash = ?, updated_at = datetime('now') WHERE id = ?",
        [newPasswordHash, user.id]
    );

    // Log audit
    await logAudit(
        user.company_id,
        user.id,
        "change_password",
        "user",
        user.id
    );

    return { message: "Contraseña cambiada exitosamente" };
};
