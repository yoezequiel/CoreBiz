/**
 * Audit Service
 * Handles audit log queries
 */

import db from "../config/database.js";

/**
 * Get audit logs for a company with filters
 */
export const getAuditLogs = async (companyId, filters = {}) => {
    let query = `
        SELECT a.id, a.user_id, a.action, a.entity_type, a.entity_id, 
               a.old_value, a.new_value, a.ip_address, a.created_at,
               u.full_name as user_name, u.email as user_email
        FROM audit_logs a
        LEFT JOIN users u ON a.user_id = u.id
        WHERE a.company_id = ?
    `;
    const params = [companyId];

    if (filters.action) {
        query += " AND a.action = ?";
        params.push(filters.action);
    }

    if (filters.entity_type) {
        query += " AND a.entity_type = ?";
        params.push(filters.entity_type);
    }

    if (filters.user_id) {
        query += " AND a.user_id = ?";
        params.push(filters.user_id);
    }

    if (filters.start_date) {
        query += " AND a.created_at >= ?";
        params.push(filters.start_date);
    }

    if (filters.end_date) {
        query += " AND a.created_at <= ?";
        params.push(filters.end_date);
    }

    query += " ORDER BY a.created_at DESC LIMIT 1000";

    const result = await db.query(query, params);
    return result.rows;
};

/**
 * Get audit log summary statistics
 */
export const getAuditSummary = async (companyId, days = 30) => {
    const result = await db.query(
        `SELECT 
           action,
           COUNT(*) as count
         FROM audit_logs
         WHERE company_id = ? 
           AND created_at >= datetime('now', '-' || ? || ' days')
         GROUP BY action
         ORDER BY count DESC`,
        [companyId, days]
    );

    return result.rows.map((row) => ({
        action: row.action,
        count: parseInt(row.count),
    }));
};
