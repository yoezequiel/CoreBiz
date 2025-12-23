/**
 * Authentication Controllers
 * Controllers that use the auth service - Example of proper layered architecture
 */

import * as authService from "../services/auth.service.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { successResponse, createdResponse } from "../utils/response.js";

/**
 * Register new company and admin user
 * POST /api/auth/register
 */
export const register = asyncHandler(async (req, res) => {
    const { company, user } = req.body;

    const result = await authService.registerCompany(company, user);

    return createdResponse(res, result, "Empresa registrada exitosamente");
});

/**
 * Login user
 * POST /api/auth/login
 */
export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;

    const result = await authService.login(email, password, ipAddress);

    return successResponse(res, result, "Inicio de sesión exitoso");
});

/**
 * Change password
 * POST /api/auth/change-password
 */
export const changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.userId;

    const result = await authService.changePassword(
        userId,
        currentPassword,
        newPassword
    );

    return successResponse(res, result);
});

/**
 * Get current user info
 * GET /api/auth/me
 */
export const getCurrentUser = asyncHandler(async (req, res) => {
    const userData = {
        userId: req.user.userId,
        companyId: req.user.companyId,
        role: req.user.role,
    };

    return successResponse(res, userData);
});
