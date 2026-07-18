import { ApiError } from "../utils/ApiError.js";

export function notFound(req, _res, next) {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

export function errorHandler(error, _req, res, _next) {
  if (error.name === "SequelizeUniqueConstraintError") {
    return res.status(409).json({
      error: {
        code: "CONFLICT",
        message: "A record with that value already exists"
      }
    });
  }

  const statusCode = error.statusCode ?? 500;
  const isOperational = error instanceof ApiError;

  if (!isOperational) console.error(error);

  res.status(statusCode).json({
    error: {
      code: statusCode === 500 ? "INTERNAL_SERVER_ERROR" : error.name,
      message: statusCode === 500 ? "An unexpected error occurred" : error.message,
      ...(error.details ? { details: error.details } : {})
    }
  });
}
