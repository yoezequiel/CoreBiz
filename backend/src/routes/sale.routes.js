import express from "express";
import pool from "../config/database.js";
import { authenticate, ensureSameTenant } from "../middleware/auth.js";
import { auditMiddleware } from "../middleware/audit.js";

const router = express.Router();
router.use(authenticate);
router.use(ensureSameTenant);

// Get all sales
router.get("/", async (req, res) => {
    try {
        const {
            status,
            customerId,
            startDate,
            endDate,
            limit = 100,
        } = req.query;

        let query = `
      SELECT s.id, s.amount, s.status, s.sale_date, s.notes, s.created_at,
             c.name as customer_name,
             u.full_name as created_by
      FROM sales s
      JOIN customers c ON s.customer_id = c.id
      JOIN users u ON s.user_id = u.id
      WHERE s.company_id = $1
    `;
        const params = [req.companyId];
        let paramCount = 1;

        if (status) {
            paramCount++;
            query += ` AND s.status = $${paramCount}`;
            params.push(status);
        }

        if (customerId) {
            paramCount++;
            query += ` AND s.customer_id = $${paramCount}`;
            params.push(parseInt(customerId));
        }

        if (startDate) {
            paramCount++;
            query += ` AND s.sale_date >= $${paramCount}`;
            params.push(startDate);
        }

        if (endDate) {
            paramCount++;
            query += ` AND s.sale_date <= $${paramCount}`;
            params.push(endDate);
        }

        query += ` ORDER BY s.sale_date DESC, s.created_at DESC LIMIT $${
            paramCount + 1
        }`;
        params.push(parseInt(limit));

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error("Get sales error:", error);
        res.status(500).json({ error: "Error al obtener ventas" });
    }
});

// Get sale by ID
router.get("/:id", async (req, res) => {
    try {
        const saleId = parseInt(req.params.id);

        const result = await pool.query(
            `SELECT s.id, s.amount, s.status, s.sale_date, s.notes, s.created_at,
              c.id as customer_id, c.name as customer_name, c.email as customer_email,
              u.id as user_id, u.full_name as created_by
       FROM sales s
       JOIN customers c ON s.customer_id = c.id
       JOIN users u ON s.user_id = u.id
       WHERE s.id = $1 AND s.company_id = $2`,
            [saleId, req.companyId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Venta no encontrada" });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error("Get sale error:", error);
        res.status(500).json({ error: "Error al obtener venta" });
    }
});

// Create sale
router.post("/", auditMiddleware("create", "sale"), async (req, res) => {
    try {
        const { customerId, amount, saleDate, notes } = req.body;

        if (!customerId || !amount || !saleDate) {
            return res
                .status(400)
                .json({ error: "Cliente, monto y fecha son requeridos" });
        }

        if (amount <= 0) {
            return res
                .status(400)
                .json({ error: "El monto debe ser mayor a 0" });
        }

        // Verify customer belongs to company
        const customerCheck = await pool.query(
            "SELECT id, status FROM customers WHERE id = $1 AND company_id = $2",
            [customerId, req.companyId]
        );

        if (customerCheck.rows.length === 0) {
            return res.status(404).json({ error: "Cliente no encontrado" });
        }

        if (customerCheck.rows[0].status !== "active") {
            return res.status(400).json({ error: "El cliente está inactivo" });
        }

        const result = await pool.query(
            `INSERT INTO sales (company_id, customer_id, user_id, amount, sale_date, notes, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending')
       RETURNING id, amount, status, sale_date, notes, created_at`,
            [req.companyId, customerId, req.user.id, amount, saleDate, notes]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error("Create sale error:", error);
        res.status(500).json({ error: "Error al crear venta" });
    }
});

// Update sale
router.put("/:id", auditMiddleware("update", "sale"), async (req, res) => {
    try {
        const saleId = parseInt(req.params.id);
        const { customerId, amount, saleDate, notes } = req.body;

        if (!customerId || !amount || !saleDate) {
            return res
                .status(400)
                .json({ error: "Cliente, monto y fecha son requeridos" });
        }

        if (amount <= 0) {
            return res
                .status(400)
                .json({ error: "El monto debe ser mayor a 0" });
        }

        // Verify sale belongs to company
        const saleCheck = await pool.query(
            "SELECT id FROM sales WHERE id = $1 AND company_id = $2",
            [saleId, req.companyId]
        );

        if (saleCheck.rows.length === 0) {
            return res.status(404).json({ error: "Venta no encontrada" });
        }

        // Verify customer
        const customerCheck = await pool.query(
            "SELECT id FROM customers WHERE id = $1 AND company_id = $2",
            [customerId, req.companyId]
        );

        if (customerCheck.rows.length === 0) {
            return res.status(404).json({ error: "Cliente no encontrado" });
        }

        const result = await pool.query(
            `UPDATE sales 
       SET customer_id = $1, amount = $2, sale_date = $3, notes = $4, updated_at = CURRENT_TIMESTAMP
       WHERE id = $5 AND company_id = $6
       RETURNING id, amount, status, sale_date, notes`,
            [customerId, amount, saleDate, notes, saleId, req.companyId]
        );

        res.json(result.rows[0]);
    } catch (error) {
        console.error("Update sale error:", error);
        res.status(500).json({ error: "Error al actualizar venta" });
    }
});

// Update sale status
router.patch(
    "/:id/status",
    auditMiddleware("update_status", "sale"),
    async (req, res) => {
        try {
            const saleId = parseInt(req.params.id);
            const { status } = req.body;

            if (!["pending", "paid", "cancelled"].includes(status)) {
                return res.status(400).json({ error: "Estado inválido" });
            }

            const result = await pool.query(
                `UPDATE sales 
       SET status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND company_id = $3
       RETURNING id, amount, status, sale_date`,
                [status, saleId, req.companyId]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: "Venta no encontrada" });
            }

            res.json(result.rows[0]);
        } catch (error) {
            console.error("Update sale status error:", error);
            res.status(500).json({
                error: "Error al actualizar estado de venta",
            });
        }
    }
);

// Export sales to CSV
router.get("/export/csv", async (req, res) => {
    try {
        const { startDate, endDate, status } = req.query;

        let query = `
      SELECT s.sale_date, c.name as customer_name, s.amount, s.status, s.notes,
             u.full_name as created_by
      FROM sales s
      JOIN customers c ON s.customer_id = c.id
      JOIN users u ON s.user_id = u.id
      WHERE s.company_id = $1
    `;
        const params = [req.companyId];
        let paramCount = 1;

        if (status) {
            paramCount++;
            query += ` AND s.status = $${paramCount}`;
            params.push(status);
        }

        if (startDate) {
            paramCount++;
            query += ` AND s.sale_date >= $${paramCount}`;
            params.push(startDate);
        }

        if (endDate) {
            paramCount++;
            query += ` AND s.sale_date <= $${paramCount}`;
            params.push(endDate);
        }

        query += " ORDER BY s.sale_date DESC";

        const result = await pool.query(query, params);

        // Generate CSV
        const headers = [
            "Fecha",
            "Cliente",
            "Monto",
            "Estado",
            "Notas",
            "Creado por",
        ];
        const csv = [
            headers.join(","),
            ...result.rows.map((row) =>
                [
                    row.sale_date,
                    `"${row.customer_name}"`,
                    row.amount,
                    row.status,
                    `"${row.notes || ""}"`,
                    `"${row.created_by}"`,
                ].join(",")
            ),
        ].join("\n");

        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", "attachment; filename=ventas.csv");
        res.send(csv);
    } catch (error) {
        console.error("Export sales error:", error);
        res.status(500).json({ error: "Error al exportar ventas" });
    }
});

export default router;
