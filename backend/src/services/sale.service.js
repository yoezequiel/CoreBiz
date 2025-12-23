/**
 * Sale Service
 * Handles all sales-related business logic
 */

import db from "../config/database.js";
import { AppError } from "../middleware/errorHandler.js";

/**
 * Get all sales for a company with optional filters
 */
export const getSales = async (companyId, filters = {}) => {
    let query = `
        SELECT s.id, s.amount, s.status, s.sale_date, s.notes, s.created_at,
               c.name as customer_name, c.email as customer_email,
               u.full_name as user_name
        FROM sales s
        JOIN customers c ON s.customer_id = c.id
        JOIN users u ON s.user_id = u.id
        WHERE s.company_id = ?
    `;
    const params = [companyId];

    if (filters.status) {
        query += " AND s.status = ?";
        params.push(filters.status);
    }

    if (filters.customerId) {
        query += " AND s.customer_id = ?";
        params.push(filters.customerId);
    }

    if (filters.startDate) {
        query += " AND s.sale_date >= ?";
        params.push(filters.startDate);
    }

    if (filters.endDate) {
        query += " AND s.sale_date <= ?";
        params.push(filters.endDate);
    }

    if (filters.search) {
        query += " AND (c.name LIKE ? OR c.email LIKE ?)";
        params.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    query += " ORDER BY s.sale_date DESC, s.created_at DESC";

    const result = await db.query(query, params);
    return result.rows.map((row) => ({
        ...row,
        amount: parseFloat(row.amount),
    }));
};

/**
 * Get sale by ID
 */
export const getSaleById = async (companyId, saleId) => {
    const result = await db.query(
        `SELECT s.id, s.amount, s.status, s.sale_date, s.notes, s.created_at,
                c.id as customer_id, c.name as customer_name, c.email as customer_email,
                u.id as user_id, u.full_name as user_name
         FROM sales s
         JOIN customers c ON s.customer_id = c.id
         JOIN users u ON s.user_id = u.id
         WHERE s.id = ? AND s.company_id = ?`,
        [saleId, companyId]
    );

    if (result.rows.length === 0) {
        throw new AppError("Venta no encontrada", 404);
    }

    return {
        ...result.rows[0],
        amount: parseFloat(result.rows[0].amount),
    };
};

/**
 * Create a new sale
 */
export const createSale = async (companyId, userId, data) => {
    if (!data.customer_id || !data.amount || !data.sale_date) {
        throw new AppError(
            "customer_id, amount y sale_date son requeridos",
            400
        );
    }

    const amount = parseFloat(data.amount);
    if (isNaN(amount) || amount <= 0) {
        throw new AppError("Monto inválido", 400);
    }

    // Verify customer belongs to company
    const customerCheck = await db.query(
        "SELECT id FROM customers WHERE id = ? AND company_id = ?",
        [data.customer_id, companyId]
    );

    if (customerCheck.rows.length === 0) {
        throw new AppError("Cliente no encontrado", 404);
    }

    const result = await db.query(
        `INSERT INTO sales (company_id, customer_id, user_id, amount, status, sale_date, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
            companyId,
            data.customer_id,
            userId,
            amount,
            data.status || "pending",
            data.sale_date,
            data.notes || null,
        ]
    );

    const saleId = result.rows[0]?.id || result.rowCount;
    return await getSaleById(companyId, saleId);
};

/**
 * Update sale
 */
export const updateSale = async (companyId, saleId, data) => {
    if (!data.amount || !data.sale_date) {
        throw new AppError("amount y sale_date son requeridos", 400);
    }

    const amount = parseFloat(data.amount);
    if (isNaN(amount) || amount <= 0) {
        throw new AppError("Monto inválido", 400);
    }

    const result = await db.query(
        `UPDATE sales 
         SET amount = ?, status = ?, sale_date = ?, notes = ?, updated_at = datetime('now')
         WHERE id = ? AND company_id = ?`,
        [amount, data.status, data.sale_date, data.notes, saleId, companyId]
    );

    if (result.rowCount === 0) {
        throw new AppError("Venta no encontrada", 404);
    }

    return await getSaleById(companyId, saleId);
};

/**
 * Delete sale
 */
export const deleteSale = async (companyId, saleId) => {
    const result = await db.query(
        "DELETE FROM sales WHERE id = ? AND company_id = ?",
        [saleId, companyId]
    );

    if (result.rowCount === 0) {
        throw new AppError("Venta no encontrada", 404);
    }

    return { message: "Venta eliminada exitosamente" };
};

/**
 * Generate CSV export of sales
 */
export const generateSalesCSV = async (companyId, filters = {}) => {
    const sales = await getSales(companyId, filters);

    // CSV headers
    const headers = [
        "ID",
        "Cliente",
        "Email",
        "Monto",
        "Estado",
        "Fecha",
        "Vendedor",
        "Notas",
    ];
    const rows = sales.map((sale) => [
        sale.id,
        sale.customer_name,
        sale.customer_email || "",
        sale.amount,
        sale.status,
        sale.sale_date,
        sale.user_name,
        sale.notes || "",
    ]);

    // Convert to CSV format
    const csvContent = [
        headers.join(","),
        ...rows.map((row) =>
            row
                .map((cell) =>
                    typeof cell === "string" && cell.includes(",")
                        ? `"${cell}"`
                        : cell
                )
                .join(",")
        ),
    ].join("\n");

    return csvContent;
};
