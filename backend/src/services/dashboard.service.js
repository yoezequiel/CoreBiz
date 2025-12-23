/**
 * Dashboard Service
 * Handles all dashboard analytics and statistics
 */

import db from "../config/database.js";

/**
 * Get dashboard statistics for a company
 */
export const getDashboardStats = async (companyId, { month, year } = {}) => {
    const currentMonth = month ? parseInt(month) : new Date().getMonth() + 1;
    const currentYear = year ? parseInt(year) : new Date().getFullYear();

    // Total sales (paid only) for current month
    const totalSalesResult = await db.query(
        `SELECT COALESCE(SUM(amount), 0) as total
         FROM sales
         WHERE company_id = ? 
           AND status = 'paid'
           AND CAST(strftime('%m', sale_date) AS INTEGER) = ?
           AND CAST(strftime('%Y', sale_date) AS INTEGER) = ?`,
        [companyId, currentMonth, currentYear]
    );

    // Sales count for current month
    const salesCountResult = await db.query(
        `SELECT COUNT(*) as count
         FROM sales
         WHERE company_id = ? 
           AND CAST(strftime('%m', sale_date) AS INTEGER) = ?
           AND CAST(strftime('%Y', sale_date) AS INTEGER) = ?`,
        [companyId, currentMonth, currentYear]
    );

    // Active customers
    const activeCustomersResult = await db.query(
        `SELECT COUNT(*) as count
         FROM customers
         WHERE company_id = ? AND status = 'active'`,
        [companyId]
    );

    // Pending sales
    const pendingSalesResult = await db.query(
        `SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as total
         FROM sales
         WHERE company_id = ? AND status = 'pending'`,
        [companyId]
    );

    return {
        totalSales: parseFloat(totalSalesResult.rows[0].total),
        salesCount: parseInt(salesCountResult.rows[0].count),
        activeCustomers: parseInt(activeCustomersResult.rows[0].count),
        pendingSales: {
            count: parseInt(pendingSalesResult.rows[0].count),
            total: parseFloat(pendingSalesResult.rows[0].total),
        },
    };
};

/**
 * Get sales by month for charting
 */
export const getSalesByMonth = async (companyId, year) => {
    const currentYear = year || new Date().getFullYear();

    const result = await db.query(
        `SELECT 
           CAST(strftime('%m', sale_date) AS INTEGER) as month,
           COUNT(*) as count,
           COALESCE(SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END), 0) as total
         FROM sales
         WHERE company_id = ? 
           AND CAST(strftime('%Y', sale_date) AS INTEGER) = ?
         GROUP BY CAST(strftime('%m', sale_date) AS INTEGER)
         ORDER BY month`,
        [companyId, parseInt(currentYear)]
    );

    // Fill all 12 months
    const months = Array.from({ length: 12 }, (_, i) => ({
        month: i + 1,
        count: 0,
        total: 0,
    }));

    result.rows.forEach((row) => {
        const index = parseInt(row.month) - 1;
        months[index] = {
            month: parseInt(row.month),
            count: parseInt(row.count),
            total: parseFloat(row.total),
        };
    });

    return months;
};

/**
 * Get top customers by revenue
 */
export const getTopCustomers = async (companyId, limit = 10) => {
    const result = await db.query(
        `SELECT 
           c.id, c.name, c.email,
           COUNT(s.id) as sales_count,
           COALESCE(SUM(s.amount), 0) as total_amount
         FROM customers c
         LEFT JOIN sales s ON c.id = s.customer_id AND s.status = 'paid'
         WHERE c.company_id = ?
         GROUP BY c.id, c.name, c.email
         HAVING COUNT(s.id) > 0
         ORDER BY total_amount DESC
         LIMIT ?`,
        [companyId, parseInt(limit)]
    );

    return result.rows.map((row) => ({
        ...row,
        sales_count: parseInt(row.sales_count),
        total_amount: parseFloat(row.total_amount),
    }));
};

/**
 * Get recent activity
 */
export const getRecentActivity = async (companyId, limit = 10) => {
    const result = await db.query(
        `SELECT 
           s.id, s.amount, s.status, s.sale_date, s.created_at,
           c.name as customer_name,
           u.full_name as user_name
         FROM sales s
         JOIN customers c ON s.customer_id = c.id
         JOIN users u ON s.user_id = u.id
         WHERE s.company_id = ?
         ORDER BY s.created_at DESC
         LIMIT ?`,
        [companyId, parseInt(limit)]
    );

    return result.rows;
};
