/**
 * Company Service
 * Handles all company-related business logic
 */

import db from "../config/database.js";
import { AppError } from "../middleware/errorHandler.js";
import validator from "validator";

/**
 * Get company by ID
 */
export const getCompanyById = async (companyId) => {
    const result = await db.query(
        "SELECT id, name, email, phone, address, plan, status, created_at FROM companies WHERE id = ?",
        [companyId]
    );

    if (result.rows.length === 0) {
        throw new AppError("Empresa no encontrada", 404);
    }

    return result.rows[0];
};

/**
 * Update company information
 */
export const updateCompany = async (companyId, data) => {
    if (!data.name || !data.email) {
        throw new AppError("Nombre y email requeridos", 400);
    }

    if (!validator.isEmail(data.email)) {
        throw new AppError("Email inválido", 400);
    }

    const result = await db.query(
        `UPDATE companies 
         SET name = ?, email = ?, phone = ?, address = ?, updated_at = datetime('now')
         WHERE id = ?`,
        [data.name, data.email, data.phone, data.address, companyId]
    );

    if (result.rowCount === 0) {
        throw new AppError("Empresa no encontrada", 404);
    }

    return await getCompanyById(companyId);
};

/**
 * Deactivate company
 */
export const deactivateCompany = async (companyId) => {
    const result = await db.query(
        `UPDATE companies 
         SET status = 'suspended', updated_at = datetime('now')
         WHERE id = ?`,
        [companyId]
    );

    if (result.rowCount === 0) {
        throw new AppError("Empresa no encontrada", 404);
    }

    return await getCompanyById(companyId);
};
