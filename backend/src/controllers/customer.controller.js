/**
 * Customer Controllers
 * Example of proper controller implementation
 */

import * as customerService from "../services/customer.service.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { successResponse, createdResponse } from "../utils/response.js";

/**
 * Get all customers
 * GET /api/customers
 */
export const getCustomers = asyncHandler(async (req, res) => {
    const filters = {
        status: req.query.status,
        search: req.query.search,
    };

    const customers = await customerService.getCustomers(
        req.user.companyId,
        filters
    );

    return successResponse(res, customers);
});

/**
 * Get customer by ID
 * GET /api/customers/:id
 */
export const getCustomerById = asyncHandler(async (req, res) => {
    const customer = await customerService.getCustomerById(
        req.user.companyId,
        req.params.id
    );

    return successResponse(res, customer);
});

/**
 * Create customer
 * POST /api/customers
 */
export const createCustomer = asyncHandler(async (req, res) => {
    const customer = await customerService.createCustomer(
        req.user.companyId,
        req.body
    );

    return createdResponse(res, customer, "Cliente creado exitosamente");
});

/**
 * Update customer
 * PUT /api/customers/:id
 */
export const updateCustomer = asyncHandler(async (req, res) => {
    const customer = await customerService.updateCustomer(
        req.user.companyId,
        req.params.id,
        req.body
    );

    return successResponse(res, customer, "Cliente actualizado exitosamente");
});

/**
 * Toggle customer status
 * PATCH /api/customers/:id/status
 */
export const toggleCustomerStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;

    const customer = await customerService.toggleCustomerStatus(
        req.user.companyId,
        req.params.id,
        status
    );

    return successResponse(res, customer, "Estado actualizado exitosamente");
});

/**
 * Get customer sales
 * GET /api/customers/:id/sales
 */
export const getCustomerSales = asyncHandler(async (req, res) => {
    const sales = await customerService.getCustomerSales(
        req.user.companyId,
        req.params.id
    );

    return successResponse(res, sales);
});
