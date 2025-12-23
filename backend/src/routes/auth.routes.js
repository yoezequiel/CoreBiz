import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import validator from 'validator';
import pool from '../config/database.js';
import { logAudit } from '../middleware/audit.js';

const router = express.Router();

// Register new company and admin user
router.post('/register', async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { 
      companyName, 
      companyEmail, 
      companyPhone,
      companyAddress,
      adminName, 
      adminEmail, 
      password 
    } = req.body;

    // Validations
    if (!companyName || !companyEmail || !adminName || !adminEmail || !password) {
      return res.status(400).json({ error: 'Todos los campos obligatorios deben completarse' });
    }

    if (!validator.isEmail(companyEmail) || !validator.isEmail(adminEmail)) {
      return res.status(400).json({ error: 'Email inválido' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' });
    }

    await client.query('BEGIN');

    // Check if company email exists
    const existingCompany = await client.query(
      'SELECT id FROM companies WHERE email = $1',
      [companyEmail]
    );

    if (existingCompany.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: 'El email de la empresa ya está registrado' });
    }

    // Create company
    const companyResult = await client.query(
      `INSERT INTO companies (name, email, phone, address, plan, status)
       VALUES ($1, $2, $3, $4, 'Free', 'active')
       RETURNING id, name, email, plan, status`,
      [companyName, companyEmail, companyPhone, companyAddress]
    );

    const company = companyResult.rows[0];

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create admin user
    const userResult = await client.query(
      `INSERT INTO users (company_id, email, password_hash, full_name, role, status)
       VALUES ($1, $2, $3, $4, 'admin', 'active')
       RETURNING id, email, full_name, role`,
      [company.id, adminEmail, passwordHash, adminName]
    );

    const user = userResult.rows[0];

    await client.query('COMMIT');

    // Log audit
    await logAudit(company.id, user.id, 'register', 'company', company.id);

    res.status(201).json({
      message: 'Empresa y usuario creados exitosamente',
      company,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role
      }
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Register error:', error);
    res.status(500).json({ error: 'Error al registrar la empresa' });
  } finally {
    client.release();
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña requeridos' });
    }

    // Find user
    const userResult = await pool.query(
      `SELECT u.id, u.company_id, u.email, u.password_hash, u.full_name, u.role, u.status,
              c.name as company_name, c.status as company_status
       FROM users u
       JOIN companies c ON u.company_id = c.id
       WHERE u.email = $1`,
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const user = userResult.rows[0];

    // Check user status
    if (user.status !== 'active') {
      return res.status(403).json({ error: 'Usuario inactivo' });
    }

    // Check company status
    if (user.company_status !== 'active') {
      return res.status(403).json({ error: 'Empresa inactiva' });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Generate JWT
    const token = jwt.sign(
      { 
        userId: user.id, 
        companyId: user.company_id,
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Log audit
    const ipAddress = req.ip || req.connection.remoteAddress;
    await logAudit(user.company_id, user.id, 'login', 'user', user.id, null, ipAddress);

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        companyId: user.company_id,
        companyName: user.company_name
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

// Change password (authenticated)
router.post('/change-password', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Contraseñas requeridas' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 8 caracteres' });
    }

    // Get user
    const userResult = await pool.query(
      'SELECT id, password_hash, company_id FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const user = userResult.rows[0];

    // Verify current password
    const validPassword = await bcrypt.compare(currentPassword, user.password_hash);
    
    if (!validPassword) {
      return res.status(401).json({ error: 'Contraseña actual incorrecta' });
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Update password
    await pool.query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [newPasswordHash, user.id]
    );

    // Log audit
    await logAudit(user.company_id, user.id, 'change_password', 'user', user.id);

    res.json({ message: 'Contraseña cambiada exitosamente' });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Error al cambiar contraseña' });
  }
});

export default router;
