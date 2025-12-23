/**
 * Customer Service
 * Handles all customer-related business logic
 */

import db from "../config/database.js";
import { AppError } from "../middleware/errorHandler.js";
import validator from "validator";

/**
 * Get all customers for a company with optional filters
 */
export const getCustomers = async (companyId, filters = {}) => {
    let query = `
        SELECT id, name, email, phone, address, status, created_at 
        FROM customers 
        WHERE company_id = ?
    `;
    const params = [companyId];

    if (filters.status) {
        query += " AND status = ?";
        params.push(filters.status);
    }

    if (filters.search) {
        query += " AND (name LIKE ? OR email LIKE ?)";
        params.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    query += " ORDER BY name ASC";

    const result = await db.query(query, params);
    return result.rows;
};

/**
 * Get customer by ID
 */
export const getCustomerById = async (companyId, customerId) => {
    const result = await db.query(
        `SELECT id, name, email, phone, address, status, created_at 
         FROM customers 
         WHERE id = ? AND company_id = ?`,
        [customerId, companyId]
    );

    if (result.rows.length === 0) {
        throw new AppError("Cliente no encontrado", 404);
    }

    return result.rows[0];
};

/**
 * Create a new customer
 */
export const createCustomer = async (companyId, data) => {
    if (!data.name) {
        throw new AppError("El nombre es requerido", 400);
    }

    if (data.email && !validator.isEmail(data.email)) {
        throw new AppError("Email inválido", 400);
    }

    const result = await db.query(
        `INSERT INTO customers (company_id, name, email, phone, address, status)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
            companyId,
            data.name,
            data.email || null,
            data.phone || null,
            data.address || null,
            "active",
        ]
    );

    const customerId = result.rows[0]?.id || result.rowCount;
    return await getCustomerById(companyId, customerId);
};

/**
 * Update customer
 */
export const updateCustomer = async (companyId, customerId, data) => {
    if (!data.name) {
        throw new AppError("El nombre es requerido", 400);
    }

    if (data.email && !validator.isEmail(data.email)) {
        throw new AppError("Email inválido", 400);
    }

    const result = await db.query(
        `UPDATE customers 
         SET name = ?, email = ?, phone = ?, address = ?, updated_at = datetime('now')
         WHERE id = ? AND company_id = ?`,
        [data.name, data.email, data.phone, data.address, customerId, companyId]
    );

    if (result.rowCount === 0) {
        throw new AppError("Cliente no encontrado", 404);
    }

    return await getCustomerById(companyId, customerId);
};

/**
 * Toggle customer status (activate/deactivate)
 */
export const toggleCustomerStatus = async (
    companyId,
    customerId,
    newStatus
) => {
    const result = await db.query(
        `UPDATE customers 
         SET status = ?, updated_at = datetime('now')
         WHERE id = ? AND company_id = ?`,
        [newStatus, customerId, companyId]
    );

    if (result.rowCount === 0) {
        throw new AppError("Cliente no encontrado", 404);
    }

    return await getCustomerById(companyId, customerId);
};

/**
 * Get customer sales history
 */
export const getCustomerSales = async (companyId, customerId) => {
    // Verify customer belongs to company
    const customerCheck = await db.query(
        "SELECT id FROM customers WHERE id = ? AND company_id = ?",
        [customerId, companyId]
    );

    if (customerCheck.rows.length === 0) {
        throw new AppError("Cliente no encontrado", 404);
    }

    const result = await db.query(
        `SELECT s.id, s.amount, s.status, s.sale_date, s.notes, s.created_at,
                u.full_name as created_by
         FROM sales s
         JOIN users u ON s.user_id = u.id
         WHERE s.customer_id = ? AND s.company_id = ?
         ORDER BY s.sale_date DESC`,
        [customerId, companyId]
    );

    return result.rows;
};
