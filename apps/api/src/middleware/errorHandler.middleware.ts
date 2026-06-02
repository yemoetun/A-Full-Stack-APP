import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { AppError } from "../utils/errors";
import { logger } from "../utils/logger";

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  // Zod validation errors
  if (err instanceof ZodError) {
    const details: Record<string, string[]> = {};
    err.errors.forEach((e) => {
      const key = e.path.join(".");
      details[key] = details[key] ?? [];
      details[key].push(e.message);
    });
    return res.status(400).json({
      error: "VALIDATION_ERROR",
      message: "Validation failed",
      statusCode: 400,
      details,
    });
  }

  // Known app errors
  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      logger.error({ err, url: req.url, method: req.method }, "App error");
    }
    return res.status(err.statusCode).json({
      error: err.error,
      message: err.message,
      statusCode: err.statusCode,
      ...(err.details && { details: err.details }),
    });
  }

  // Unknown errors
  logger.error({ err, url: req.url, method: req.method }, "Unhandled error");
  return res.status(500).json({
    error: "INTERNAL_ERROR",
    message: "An unexpected error occurred",
    statusCode: 500,
  });
}
