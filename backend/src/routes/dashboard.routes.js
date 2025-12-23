import express from "express";
import db from "../config/database.js";
import {
    authenticate,
    ensureSameTenant,
    authorize,
} from "../middleware/auth.js";
import * as dashboardService from "../services/dashboard.service.js";

const router = express.Router();
router.use(authenticate);
router.use(ensureSameTenant);

// Get dashboard stats
router.get("/stats", async (req, res) => {
    try {
        const { month, year } = req.query;
        const stats = await dashboardService.getDashboardStats(req.companyId, {
            month,
            year,
        });
        res.json(stats);
    } catch (error) {
        console.error("Get dashboard stats error:", error);
        res.status(500).json({ error: "Error al obtener estadísticas" });
    }
});

// Get sales by month (for chart)
router.get("/sales-by-month", async (req, res) => {
    try {
        const { year } = req.query;
        const months = await dashboardService.getSalesByMonth(
            req.companyId,
            year
        );
        res.json(months);
    } catch (error) {
        console.error("Get sales by month error:", error);
        res.status(500).json({ error: "Error al obtener ventas por mes" });
    }
});

// Get top customers (admin only)
router.get("/top-customers", authorize("admin"), async (req, res) => {
    try {
        const { limit = 10 } = req.query;

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
            [req.companyId, parseInt(limit)]
        );

        res.json(
            result.rows.map((row) => ({
                ...row,
                sales_count: parseInt(row.sales_count),
                total_amount: parseFloat(row.total_amount),
            }))
        );
    } catch (error) {
        console.error("Get top customers error:", error);
        res.status(500).json({ error: "Error al obtener mejores clientes" });
    }
});

// Get recent activity
router.get("/recent-activity", async (req, res) => {
    try {
        const { limit = 10 } = req.query;

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
            [req.companyId, parseInt(limit)]
        );

        res.json(result.rows);
    } catch (error) {
        console.error("Get recent activity error:", error);
        res.status(500).json({ error: "Error al obtener actividad reciente" });
    }
});

export default router;
