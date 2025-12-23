import jwt from "jsonwebtoken";
import pool from "../config/database.js";

export const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ error: "Token no proporcionado" });
        }

        const token = authHeader.substring(7);

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Verificar que el usuario sigue existiendo y activo
            const userResult = await pool.query(
                "SELECT id, company_id, email, full_name, role, status FROM users WHERE id = $1",
                [decoded.userId]
            );

            if (userResult.rows.length === 0) {
                return res.status(401).json({ error: "Usuario no encontrado" });
            }

            const user = userResult.rows[0];

            if (user.status !== "active") {
                return res.status(403).json({ error: "Usuario inactivo" });
            }

            // Verificar que la empresa está activa
            const companyResult = await pool.query(
                "SELECT status FROM companies WHERE id = $1",
                [user.company_id]
            );

            if (
                companyResult.rows.length === 0 ||
                companyResult.rows[0].status !== "active"
            ) {
                return res
                    .status(403)
                    .json({ error: "Empresa inactiva o no encontrada" });
            }

            req.user = user;
            next();
        } catch (err) {
            if (err.name === "TokenExpiredError") {
                return res.status(401).json({ error: "Token expirado" });
            }
            return res.status(401).json({ error: "Token inválido" });
        }
    } catch (error) {
        return res.status(500).json({ error: "Error de autenticación" });
    }
};

export const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: "No autenticado" });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res
                .status(403)
                .json({ error: "No autorizado para esta acción" });
        }

        next();
    };
};

export const ensureSameTenant = (req, res, next) => {
    // Middleware para asegurar que el usuario solo accede a recursos de su empresa
    req.companyId = req.user.company_id;
    next();
};
