import express from "express";
import pool from "../config/database.js";
import {
    authenticate,
    ensureSameTenant,
    authorize,
} from "../middleware/auth.js";

const router = express.Router();
router.use(authenticate);
router.use(ensureSameTenant);

// Get audit logs (admin only)
router.get("/", authorize("admin"), async (req, res) => {
    try {
        const { startDate, endDate, action, userId, limit = 100 } = req.query;

        let query = `
      SELECT 
        a.id, a.action, a.entity_type, a.entity_id, 
        a.details, a.ip_address, a.created_at,
        u.full_name as user_name, u.email as user_email
      FROM audit_logs a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE a.company_id = $1
    `;
        const params = [req.companyId];
        let paramCount = 1;

        if (startDate) {
            paramCount++;
            query += ` AND a.created_at >= $${paramCount}`;
            params.push(startDate);
        }

        if (endDate) {
            paramCount++;
            query += ` AND a.created_at <= $${paramCount}`;
            params.push(endDate);
        }

        if (action) {
            paramCount++;
            query += ` AND a.action = $${paramCount}`;
            params.push(action);
        }

        if (userId) {
            paramCount++;
            query += ` AND a.user_id = $${paramCount}`;
            params.push(parseInt(userId));
        }

        query += ` ORDER BY a.created_at DESC LIMIT $${paramCount + 1}`;
        params.push(parseInt(limit));

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error("Get audit logs error:", error);
        res.status(500).json({
            error: "Error al obtener registros de auditoría",
        });
    }
});

// Get audit log by ID (admin only)
router.get("/:id", authorize("admin"), async (req, res) => {
    try {
        const auditId = parseInt(req.params.id);

        const result = await pool.query(
            `SELECT 
        a.id, a.action, a.entity_type, a.entity_id, 
        a.details, a.ip_address, a.created_at,
        u.full_name as user_name, u.email as user_email
       FROM audit_logs a
       LEFT JOIN users u ON a.user_id = u.id
       WHERE a.id = $1 AND a.company_id = $2`,
            [auditId, req.companyId]
        );

        if (result.rows.length === 0) {
            return res
                .status(404)
                .json({ error: "Registro de auditoría no encontrado" });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error("Get audit log error:", error);
        res.status(500).json({
            error: "Error al obtener registro de auditoría",
        });
    }
});

// Get audit summary (admin only)
router.get("/summary/stats", authorize("admin"), async (req, res) => {
    try {
        // Actions count by type
        const actionsResult = await pool.query(
            `SELECT action, COUNT(*) as count
       FROM audit_logs
       WHERE company_id = $1
       GROUP BY action
       ORDER BY count DESC`,
            [req.companyId]
        );

        // Most active users
        const usersResult = await pool.query(
            `SELECT u.full_name, u.email, COUNT(a.id) as actions_count
       FROM audit_logs a
       JOIN users u ON a.user_id = u.id
       WHERE a.company_id = $1
       GROUP BY u.id, u.full_name, u.email
       ORDER BY actions_count DESC
       LIMIT 5`,
            [req.companyId]
        );

        // Recent activity count (last 7 days)
        const recentResult = await pool.query(
            `SELECT COUNT(*) as count
       FROM audit_logs
       WHERE company_id = $1
         AND created_at >= CURRENT_DATE - INTERVAL '7 days'`,
            [req.companyId]
        );

        res.json({
            actionsByType: actionsResult.rows.map((row) => ({
                action: row.action,
                count: parseInt(row.count),
            })),
            topUsers: usersResult.rows.map((row) => ({
                ...row,
                actions_count: parseInt(row.actions_count),
            })),
            recentActivityCount: parseInt(recentResult.rows[0].count),
        });
    } catch (error) {
        console.error("Get audit summary error:", error);
        res.status(500).json({
            error: "Error al obtener resumen de auditoría",
        });
    }
});

export default router;
