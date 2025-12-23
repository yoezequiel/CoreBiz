import express from "express";
import pool from "../config/database.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { auditMiddleware } from "../middleware/audit.js";

const router = express.Router();

// Get company info (authenticated)
router.get("/", authenticate, async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT id, name, email, phone, address, plan, status, created_at FROM companies WHERE id = $1",
            [req.user.company_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Empresa no encontrada" });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error("Get company error:", error);
        res.status(500).json({ error: "Error al obtener empresa" });
    }
});

// Update company (admin only)
router.put(
    "/",
    authenticate,
    authorize("admin"),
    auditMiddleware("update", "company"),
    async (req, res) => {
        try {
            const { name, email, phone, address } = req.body;

            if (!name || !email) {
                return res
                    .status(400)
                    .json({ error: "Nombre y email requeridos" });
            }

            const result = await pool.query(
                `UPDATE companies 
       SET name = $1, email = $2, phone = $3, address = $4, updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING id, name, email, phone, address, plan, status`,
                [name, email, phone, address, req.user.company_id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: "Empresa no encontrada" });
            }

            res.json(result.rows[0]);
        } catch (error) {
            console.error("Update company error:", error);
            res.status(500).json({ error: "Error al actualizar empresa" });
        }
    }
);

// Deactivate company (admin only)
router.post(
    "/deactivate",
    authenticate,
    authorize("admin"),
    auditMiddleware("deactivate", "company"),
    async (req, res) => {
        try {
            const result = await pool.query(
                `UPDATE companies 
       SET status = 'suspended', updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING id, name, status`,
                [req.user.company_id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: "Empresa no encontrada" });
            }

            res.json({
                message: "Empresa desactivada",
                company: result.rows[0],
            });
        } catch (error) {
            console.error("Deactivate company error:", error);
            res.status(500).json({ error: "Error al desactivar empresa" });
        }
    }
);

export default router;
