import express from "express";
import validator from "validator";
import pool from "../config/database.js";
import { authenticate, ensureSameTenant } from "../middleware/auth.js";
import { auditMiddleware } from "../middleware/audit.js";

const router = express.Router();
router.use(authenticate);
router.use(ensureSameTenant);

// Get all customers
router.get("/", async (req, res) => {
    try {
        const { status, search } = req.query;

        let query = `
      SELECT id, name, email, phone, address, status, created_at 
      FROM customers 
      WHERE company_id = $1
    `;
        const params = [req.companyId];
        let paramCount = 1;

        if (status) {
            paramCount++;
            query += ` AND status = $${paramCount}`;
            params.push(status);
        }

        if (search) {
            paramCount++;
            query += ` AND (name ILIKE $${paramCount} OR email ILIKE $${paramCount})`;
            params.push(`%${search}%`);
        }

        query += " ORDER BY name ASC";

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error("Get customers error:", error);
        res.status(500).json({ error: "Error al obtener clientes" });
    }
});

// Get customer by ID
router.get("/:id", async (req, res) => {
    try {
        const customerId = parseInt(req.params.id);

        const result = await pool.query(
            `SELECT id, name, email, phone, address, status, created_at 
       FROM customers 
       WHERE id = $1 AND company_id = $2`,
            [customerId, req.companyId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Cliente no encontrado" });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error("Get customer error:", error);
        res.status(500).json({ error: "Error al obtener cliente" });
    }
});

// Create customer
router.post("/", auditMiddleware("create", "customer"), async (req, res) => {
    try {
        const { name, email, phone, address } = req.body;

        if (!name) {
            return res.status(400).json({ error: "El nombre es requerido" });
        }

        if (email && !validator.isEmail(email)) {
            return res.status(400).json({ error: "Email inválido" });
        }

        const result = await pool.query(
            `INSERT INTO customers (company_id, name, email, phone, address, status)
       VALUES ($1, $2, $3, $4, $5, 'active')
       RETURNING id, name, email, phone, address, status, created_at`,
            [req.companyId, name, email, phone, address]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error("Create customer error:", error);
        res.status(500).json({ error: "Error al crear cliente" });
    }
});

// Update customer
router.put("/:id", auditMiddleware("update", "customer"), async (req, res) => {
    try {
        const customerId = parseInt(req.params.id);
        const { name, email, phone, address } = req.body;

        if (!name) {
            return res.status(400).json({ error: "El nombre es requerido" });
        }

        if (email && !validator.isEmail(email)) {
            return res.status(400).json({ error: "Email inválido" });
        }

        const result = await pool.query(
            `UPDATE customers 
       SET name = $1, email = $2, phone = $3, address = $4, updated_at = CURRENT_TIMESTAMP
       WHERE id = $5 AND company_id = $6
       RETURNING id, name, email, phone, address, status`,
            [name, email, phone, address, customerId, req.companyId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Cliente no encontrado" });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error("Update customer error:", error);
        res.status(500).json({ error: "Error al actualizar cliente" });
    }
});

// Deactivate customer
router.post(
    "/:id/deactivate",
    auditMiddleware("deactivate", "customer"),
    async (req, res) => {
        try {
            const customerId = parseInt(req.params.id);

            const result = await pool.query(
                `UPDATE customers 
       SET status = 'inactive', updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND company_id = $2
       RETURNING id, name, status`,
                [customerId, req.companyId]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: "Cliente no encontrado" });
            }

            res.json({
                message: "Cliente desactivado",
                customer: result.rows[0],
            });
        } catch (error) {
            console.error("Deactivate customer error:", error);
            res.status(500).json({ error: "Error al desactivar cliente" });
        }
    }
);

// Activate customer
router.post(
    "/:id/activate",
    auditMiddleware("activate", "customer"),
    async (req, res) => {
        try {
            const customerId = parseInt(req.params.id);

            const result = await pool.query(
                `UPDATE customers 
       SET status = 'active', updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND company_id = $2
       RETURNING id, name, status`,
                [customerId, req.companyId]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: "Cliente no encontrado" });
            }

            res.json({ message: "Cliente activado", customer: result.rows[0] });
        } catch (error) {
            console.error("Activate customer error:", error);
            res.status(500).json({ error: "Error al activar cliente" });
        }
    }
);

// Get customer sales history
router.get("/:id/sales", async (req, res) => {
    try {
        const customerId = parseInt(req.params.id);

        // Verify customer belongs to company
        const customerCheck = await pool.query(
            "SELECT id FROM customers WHERE id = $1 AND company_id = $2",
            [customerId, req.companyId]
        );

        if (customerCheck.rows.length === 0) {
            return res.status(404).json({ error: "Cliente no encontrado" });
        }

        const result = await pool.query(
            `SELECT s.id, s.amount, s.status, s.sale_date, s.notes, s.created_at,
              u.full_name as created_by
       FROM sales s
       JOIN users u ON s.user_id = u.id
       WHERE s.customer_id = $1 AND s.company_id = $2
       ORDER BY s.sale_date DESC`,
            [customerId, req.companyId]
        );

        res.json(result.rows);
    } catch (error) {
        console.error("Get customer sales error:", error);
        res.status(500).json({ error: "Error al obtener ventas del cliente" });
    }
});

export default router;
