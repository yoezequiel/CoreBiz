import pool from "../config/database.js";

export const logAudit = async (
    companyId,
    userId,
    action,
    entityType = null,
    entityId = null,
    details = null,
    ipAddress = null
) => {
    try {
        await pool.query(
            `INSERT INTO audit_logs (company_id, user_id, action, entity_type, entity_id, details, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
                companyId,
                userId,
                action,
                entityType,
                entityId,
                details ? JSON.stringify(details) : null,
                ipAddress,
            ]
        );
    } catch (error) {
        console.error("Error logging audit:", error);
    }
};

export const auditMiddleware = (action, entityType) => {
    return async (req, res, next) => {
        const originalJson = res.json.bind(res);

        res.json = function (data) {
            if (res.statusCode >= 200 && res.statusCode < 300) {
                const entityId = data?.id || data?.data?.id || null;
                const ipAddress = req.ip || req.connection.remoteAddress;

                logAudit(
                    req.user?.company_id,
                    req.user?.id,
                    action,
                    entityType,
                    entityId,
                    { method: req.method, path: req.path },
                    ipAddress
                ).catch((err) => console.error("Audit log error:", err));
            }

            return originalJson(data);
        };

        next();
    };
};
