/**
 * Standardized JSON API Response Helper
 * Enforces consistent response envelope across all endpoints:
 * Success: { success: true, message, data, meta }
 * Error:   { success: false, error: { message, code, details } }
 */
export class ApiResponse {
  /**
   * Send a successful JSON response
   */
  static success(res, { data = null, message = 'Success', statusCode = 200, meta = null }) {
    const payload = {
      success: true,
      message,
      data
    };

    if (meta !== null) {
      payload.meta = meta;
    }

    return res.status(statusCode).json(payload);
  }

  /**
   * Send an error JSON response
   */
  static error(
    res,
    { message = 'Internal Error', statusCode = 500, code = 'ERROR', details = null }
  ) {
    const payload = {
      success: false,
      error: {
        code,
        message
      }
    };

    if (details !== null && details !== undefined) {
      payload.error.details = details;
    }

    return res.status(statusCode).json(payload);
  }
}
