import { createClient } from "@libsql/client";
import dotenv from "dotenv";

dotenv.config();

const client = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
});

// Wrapper para compatibilidad con el código existente
const db = {
    async query(sql, params = []) {
        try {
            const result = await client.execute({
                sql,
                args: params,
            });
            return {
                rows: result.rows,
                rowCount: result.rows.length,
            };
        } catch (error) {
            console.error("Database query error:", error);
            throw error;
        }
    },
};

console.log("✅ Connected to Turso database");

export default db;
