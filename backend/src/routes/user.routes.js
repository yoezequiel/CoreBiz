import express from "express";
import bcrypt from "bcryptjs";
import validator from "validator";
import pool from "../config/database.js";
import {
    authenticate,
    authorize,
    ensureSameTenant,
} from "../middleware/auth.js";
import { auditMiddleware } from "../middleware/audit.js";

const router = express.Router();
router.use(authenticate);
router.use(ensureSameTenant);

// Get all users (admin only)
router.get("/", authorize("admin"), async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, email, full_name, role, status, created_at 
       FROM users 
       WHERE company_id = $1
       ORDER BY created_at DESC`,
            [req.companyId]
        );

        res.json(result.rows);
    } catch (error) {
        console.error("Get users error:", error);
        res.status(500).json({ error: "Error al obtener usuarios" });
    }
});

// Get user by ID (admin or self)
router.get("/:id", async (req, res) => {
    try {
        const userId = parseInt(req.params.id);

        // Staff can only see themselves
        if (req.user.role === "staff" && userId !== req.user.id) {
            return res.status(403).json({ error: "No autorizado" });
        }

        const result = await pool.query(
            `SELECT id, email, full_name, role, status, created_at 
       FROM users 
       WHERE id = $1 AND company_id = $2`,
            [userId, req.companyId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error("Get user error:", error);
        res.status(500).json({ error: "Error al obtener usuario" });
    }
});

// Create user (admin only)
router.post(
    "/",
    authorize("admin"),
    auditMiddleware("create", "user"),
    async (req, res) => {
        try {
            const { email, password, fullName, role } = req.body;

            if (!email || !password || !fullName || !role) {
                return res
                    .status(400)
                    .json({ error: "Todos los campos son requeridos" });
            }

            if (!validator.isEmail(email)) {
                return res.status(400).json({ error: "Email inválido" });
            }

            if (password.length < 8) {
                return res
                    .status(400)
                    .json({
                        error: "La contraseña debe tener al menos 8 caracteres",
                    });
            }

            if (!["admin", "staff"].includes(role)) {
                return res.status(400).json({ error: "Rol inválido" });
            }

            // Check if email exists in company
            const existing = await pool.query(
                "SELECT id FROM users WHERE company_id = $1 AND email = $2",
                [req.companyId, email]
            );

            if (existing.rows.length > 0) {
                return res
                    .status(409)
                    .json({ error: "El email ya existe en esta empresa" });
            }

            // Hash password
            const passwordHash = await bcrypt.hash(password, 10);

            // Create user
            const result = await pool.query(
                `INSERT INTO users (company_id, email, password_hash, full_name, role, status)
       VALUES ($1, $2, $3, $4, $5, 'active')
       RETURNING id, email, full_name, role, status, created_at`,
                [req.companyId, email, passwordHash, fullName, role]
            );

            res.status(201).json(result.rows[0]);
        } catch (error) {
            console.error("Create user error:", error);
            res.status(500).json({ error: "Error al crear usuario" });
        }
    }
);

// Update user (admin only)
router.put(
    "/:id",
    authorize("admin"),
    auditMiddleware("update", "user"),
    async (req, res) => {
        try {
            const userId = parseInt(req.params.id);
            const { email, fullName, role } = req.body;

            if (!email || !fullName || !role) {
                return res
                    .status(400)
                    .json({ error: "Email, nombre y rol requeridos" });
            }

            if (!validator.isEmail(email)) {
                return res.status(400).json({ error: "Email inválido" });
            }

            if (!["admin", "staff"].includes(role)) {
                return res.status(400).json({ error: "Rol inválido" });
            }

            const result = await pool.query(
                `UPDATE users 
       SET email = $1, full_name = $2, role = $3, updated_at = CURRENT_TIMESTAMP
       WHERE id = $4 AND company_id = $5
       RETURNING id, email, full_name, role, status`,
                [email, fullName, role, userId, req.companyId]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: "Usuario no encontrado" });
            }

            res.json(result.rows[0]);
        } catch (error) {
            console.error("Update user error:", error);
            res.status(500).json({ error: "Error al actualizar usuario" });
        }
    }
);

// Deactivate user (admin only)
router.post(
    "/:id/deactivate",
    authorize("admin"),
    auditMiddleware("deactivate", "user"),
    async (req, res) => {
        try {
            const userId = parseInt(req.params.id);

            // Cannot deactivate yourself
            if (userId === req.user.id) {
                return res
                    .status(400)
                    .json({ error: "No puedes desactivarte a ti mismo" });
            }

            const result = await pool.query(
                `UPDATE users 
       SET status = 'inactive', updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND company_id = $2
       RETURNING id, email, status`,
                [userId, req.companyId]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: "Usuario no encontrado" });
            }

            res.json({ message: "Usuario desactivado", user: result.rows[0] });
        } catch (error) {
            console.error("Deactivate user error:", error);
            res.status(500).json({ error: "Error al desactivar usuario" });
        }
    }
);

// Activate user (admin only)
router.post(
    "/:id/activate",
    authorize("admin"),
    auditMiddleware("activate", "user"),
    async (req, res) => {
        try {
            const userId = parseInt(req.params.id);

            const result = await pool.query(
                `UPDATE users 
       SET status = 'active', updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND company_id = $2
       RETURNING id, email, status`,
                [userId, req.companyId]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: "Usuario no encontrado" });
            }

            res.json({ message: "Usuario activado", user: result.rows[0] });
        } catch (error) {
            console.error("Activate user error:", error);
            res.status(500).json({ error: "Error al activar usuario" });
        }
    }
);

export default router;
