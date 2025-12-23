import db from "../config/database.js";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function seed() {
    try {
        console.log("🌱 Starting database seed...");

        // Read and execute schema
        const schemaSQL = fs.readFileSync(
            path.join(__dirname, "schema.sql"),
            "utf8"
        );

        // Parse SQL statements correctly handling triggers with BEGIN...END
        const statements = [];
        let current = "";
        let inTrigger = false;

        const lines = schemaSQL.split("\n");
        for (const line of lines) {
            const trimmed = line.trim();

            // Skip comments
            if (trimmed.startsWith("--") || trimmed === "") {
                continue;
            }

            current += line + "\n";

            // Detect trigger start
            if (/CREATE\s+TRIGGER/i.test(trimmed)) {
                inTrigger = true;
            }

            // Detect trigger end
            if (inTrigger && /END;/i.test(trimmed)) {
                statements.push(current.trim());
                current = "";
                inTrigger = false;
                continue;
            }

            // Regular statement end (not in trigger)
            if (!inTrigger && trimmed.endsWith(";")) {
                statements.push(current.trim());
                current = "";
            }
        }

        // Execute each statement
        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            if (statement) {
                try {
                    await db.query(statement);
                    console.log(`✓ Statement ${i + 1}/${statements.length}`);
                } catch (error) {
                    console.error(
                        `❌ Error in statement ${i + 1}:`,
                        error.message
                    );
                    console.error("Statement:", statement.substring(0, 150));
                    throw error;
                }
            }
        }
        console.log("✅ Schema created");

        // Clear existing data (in correct order due to foreign keys)
        await db.query("DELETE FROM audit_logs");
        await db.query("DELETE FROM sales");
        await db.query("DELETE FROM customers");
        await db.query("DELETE FROM users");
        await db.query("DELETE FROM companies");
        console.log("✅ Tables cleared");

        // Seed companies
        await db.query(
            `INSERT INTO companies (name, email, phone, address, plan, status)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
                "Demo Company",
                "demo@corebiz.com",
                "+54 11 1234-5678",
                "Av. Corrientes 1234, CABA",
                "Demo",
                "active",
            ]
        );
        const company1Id = 1;

        await db.query(
            `INSERT INTO companies (name, email, phone, address, plan, status)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
                "TechStart SRL",
                "info@techstart.com",
                "+54 11 8765-4321",
                "Av. Santa Fe 4567, CABA",
                "Free",
                "active",
            ]
        );
        const company2Id = 2;

        console.log(`✅ Companies seeded (IDs: ${company1Id}, ${company2Id})`);

        // Seed users (password: "password123")
        const hashedPassword = await bcrypt.hash("password123", 10);

        await db.query(
            `INSERT INTO users (company_id, email, password_hash, full_name, role, status)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
                company1Id,
                "admin@corebiz.com",
                hashedPassword,
                "Admin User",
                "admin",
                "active",
            ]
        );
        const user1Id = 1;

        await db.query(
            `INSERT INTO users (company_id, email, password_hash, full_name, role, status)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
                company1Id,
                "staff@corebiz.com",
                hashedPassword,
                "Staff User",
                "staff",
                "active",
            ]
        );
        const user2Id = 2;

        await db.query(
            `INSERT INTO users (company_id, email, password_hash, full_name, role, status)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
                company2Id,
                "admin@techstart.com",
                hashedPassword,
                "Tech Admin",
                "admin",
                "active",
            ]
        );
        const user3Id = 3;

        console.log(
            `✅ Users seeded (IDs: ${user1Id}, ${user2Id}, ${user3Id})`
        );
        console.log("   📧 Login: admin@corebiz.com / password123");
        console.log("   📧 Login: staff@corebiz.com / password123");

        // Seed customers
        const customerIds = [];
        for (const customer of [
            [
                "Juan Pérez",
                "juan@example.com",
                "+54 11 1111-1111",
                "Calle Falsa 123",
                "active",
            ],
            [
                "María García",
                "maria@example.com",
                "+54 11 2222-2222",
                "Av. Siempreviva 456",
                "active",
            ],
            [
                "Carlos López",
                "carlos@example.com",
                "+54 11 3333-3333",
                "Calle Real 789",
                "active",
            ],
            [
                "Ana Martínez",
                "ana@example.com",
                "+54 11 4444-4444",
                "Paseo Central 321",
                "inactive",
            ],
        ]) {
            await db.query(
                `INSERT INTO customers (company_id, name, email, phone, address, status)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [company1Id, ...customer]
            );
            customerIds.push(customerIds.length + 1);
        }
        console.log(`✅ Customers seeded (${customerIds.length} customers)`);

        // Seed sales
        const salesData = [
            [
                company1Id,
                customerIds[0],
                user1Id,
                15000.0,
                "paid",
                "2025-12-01",
                "Primera venta del mes",
            ],
            [
                company1Id,
                customerIds[1],
                user1Id,
                8500.5,
                "paid",
                "2025-12-05",
                "Venta express",
            ],
            [
                company1Id,
                customerIds[2],
                user2Id,
                22300.0,
                "pending",
                "2025-12-10",
                "Pendiente de pago",
            ],
            [
                company1Id,
                customerIds[0],
                user2Id,
                5400.75,
                "paid",
                "2025-12-15",
                "Venta menor",
            ],
            [
                company1Id,
                customerIds[1],
                user1Id,
                31500.0,
                "pending",
                "2025-12-18",
                "Proyecto grande",
            ],
            [
                company1Id,
                customerIds[2],
                user2Id,
                12000.0,
                "cancelled",
                "2025-12-20",
                "Cliente canceló",
            ],
        ];

        for (const sale of salesData) {
            await db.query(
                `INSERT INTO sales (company_id, customer_id, user_id, amount, status, sale_date, notes)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                sale
            );
        }
        console.log("✅ Sales seeded");

        // Seed audit logs
        const auditData = [
            [
                company1Id,
                user1Id,
                "login",
                "user",
                user1Id,
                JSON.stringify({ method: "email" }),
                "127.0.0.1",
            ],
            [
                company1Id,
                user1Id,
                "create",
                "sale",
                1,
                JSON.stringify({ amount: 15000 }),
                "127.0.0.1",
            ],
            [
                company1Id,
                user2Id,
                "login",
                "user",
                user2Id,
                JSON.stringify({ method: "email" }),
                "127.0.0.1",
            ],
            [
                company1Id,
                user2Id,
                "create",
                "customer",
                1,
                JSON.stringify({ name: "Juan Pérez" }),
                "127.0.0.1",
            ],
        ];

        for (const audit of auditData) {
            await db.query(
                `INSERT INTO audit_logs (company_id, user_id, action, entity_type, entity_id, details, ip_address)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                audit
            );
        }
        console.log("✅ Audit logs seeded");

        console.log("\n🎉 Database seeded successfully!");
        console.log("\n📝 Test credentials:");
        console.log("   Email: admin@corebiz.com");
        console.log("   Password: password123");
        console.log("   Role: admin\n");
    } catch (error) {
        console.error("❌ Seed error:", error);
        throw error;
    }
}

seed();
