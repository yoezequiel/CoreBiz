/**
 * User Service
 * Handles all user management business logic
 */

import db from "../config/database.js";
import bcrypt from "bcryptjs";
import validator from "validator";
import { AppError } from "../middleware/errorHandler.js";

/**
 * Get all users for a company
 */
export const getUsers = async (companyId, filters = {}) => {
    let query = `
        SELECT id, email, full_name, role, status, created_at
        FROM users
        WHERE company_id = ?
    `;
    const params = [companyId];

    if (filters.status) {
        query += " AND status = ?";
        params.push(filters.status);
    }

    if (filters.role) {
        query += " AND role = ?";
        params.push(filters.role);
    }

    query += " ORDER BY full_name ASC";

    const result = await db.query(query, params);
    return result.rows;
};

/**
 * Get user by ID
 */
export const getUserById = async (companyId, userId) => {
    const result = await db.query(
        `SELECT id, email, full_name, role, status, created_at
         FROM users
         WHERE id = ? AND company_id = ?`,
        [userId, companyId]
    );

    if (result.rows.length === 0) {
        throw new AppError("Usuario no encontrado", 404);
    }

    return result.rows[0];
};

/**
 * Create a new user
 */
export const createUser = async (companyId, data) => {
    if (!data.email || !data.full_name || !data.password) {
        throw new AppError("email, full_name y password son requeridos", 400);
    }

    if (!validator.isEmail(data.email)) {
        throw new AppError("Email inválido", 400);
    }

    if (data.password.length < 8) {
        throw new AppError(
            "La contraseña debe tener al menos 8 caracteres",
            400
        );
    }

    // Check if email exists in the company
    const existingUser = await db.query(
        "SELECT id FROM users WHERE email = ? AND company_id = ?",
        [data.email, companyId]
    );

    if (existingUser.rows.length > 0) {
        throw new AppError("El email ya está registrado", 409);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, 10);

    const result = await db.query(
        `INSERT INTO users (company_id, email, password_hash, full_name, role, status)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
            companyId,
            data.email,
            passwordHash,
            data.full_name,
            data.role || "staff",
            "active",
        ]
    );

    const userId = result.rows[0]?.id || result.rowCount;
    return await getUserById(companyId, userId);
};

/**
 * Update user
 */
export const updateUser = async (companyId, userId, data) => {
    if (!data.email || !data.full_name) {
        throw new AppError("email y full_name son requeridos", 400);
    }

    if (!validator.isEmail(data.email)) {
        throw new AppError("Email inválido", 400);
    }

    // Check if email is already used by another user
    const existingUser = await db.query(
        "SELECT id FROM users WHERE email = ? AND company_id = ? AND id != ?",
        [data.email, companyId, userId]
    );

    if (existingUser.rows.length > 0) {
        throw new AppError("El email ya está en uso", 409);
    }

    const result = await db.query(
        `UPDATE users 
         SET email = ?, full_name = ?, role = ?, updated_at = datetime('now')
         WHERE id = ? AND company_id = ?`,
        [data.email, data.full_name, data.role, userId, companyId]
    );

    if (result.rowCount === 0) {
        throw new AppError("Usuario no encontrado", 404);
    }

    return await getUserById(companyId, userId);
};

/**
 * Toggle user status (activate/deactivate)
 */
export const toggleUserStatus = async (companyId, userId, newStatus) => {
    const result = await db.query(
        `UPDATE users 
         SET status = ?, updated_at = datetime('now')
         WHERE id = ? AND company_id = ?`,
        [newStatus, userId, companyId]
    );

    if (result.rowCount === 0) {
        throw new AppError("Usuario no encontrado", 404);
    }

    return await getUserById(companyId, userId);
};

/**
 * Reset user password (admin action)
 */
export const resetUserPassword = async (companyId, userId, newPassword) => {
    if (newPassword.length < 8) {
        throw new AppError(
            "La contraseña debe tener al menos 8 caracteres",
            400
        );
    }

    // Verify user exists in company
    const userCheck = await db.query(
        "SELECT id FROM users WHERE id = ? AND company_id = ?",
        [userId, companyId]
    );

    if (userCheck.rows.length === 0) {
        throw new AppError("Usuario no encontrado", 404);
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    await db.query(
        "UPDATE users SET password_hash = ?, updated_at = datetime('now') WHERE id = ?",
        [passwordHash, userId]
    );

    return { message: "Contraseña restablecida exitosamente" };
};
