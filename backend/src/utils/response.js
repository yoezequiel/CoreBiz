/**
 * Response Utilities
 * Standardized response formatters for API endpoints
 */

/**
 * Success Response
 * Sends a standardized success response
 */
export const successResponse = (
    res,
    data,
    message = "Operación exitosa",
    statusCode = 200
) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
    });
};

/**
 * Created Response
 * Sends a success response for resource creation
 */
export const createdResponse = (res, data, message = "Creado exitosamente") => {
    return successResponse(res, data, message, 201);
};

/**
 * No Content Response
 * Sends a 204 No Content response
 */
export const noContentResponse = (res) => {
    return res.status(204).send();
};

/**
 * Paginated Response
 * Sends a paginated response with metadata
 */
export const paginatedResponse = (res, data, pagination) => {
    return res.status(200).json({
        success: true,
        data,
        pagination: {
            page: pagination.page,
            limit: pagination.limit,
            total: pagination.total,
            totalPages: Math.ceil(pagination.total / pagination.limit),
        },
    });
};

/**
 * Error Response
 * Sends a standardized error response
 */
export const errorResponse = (
    res,
    message,
    statusCode = 500,
    code = "ERROR"
) => {
    return res.status(statusCode).json({
        success: false,
        message,
        code,
    });
};
