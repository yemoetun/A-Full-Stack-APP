export class AppError extends Error {
  constructor(
    public statusCode: number,
    public error: string,
    message: string,
    public details?: Record<string, string[]>
  ) {
    super(message);
    this.name = "AppError";
  }
}

export const Errors = {
  badRequest: (message: string, details?: Record<string, string[]>) =>
    new AppError(400, "BAD_REQUEST", message, details),
  unauthorized: (message = "Unauthorized") =>
    new AppError(401, "UNAUTHORIZED", message),
  forbidden: (message = "Forbidden") =>
    new AppError(403, "FORBIDDEN", message),
  notFound: (resource = "Resource") =>
    new AppError(404, "NOT_FOUND", `${resource} not found`),
  conflict: (message: string) =>
    new AppError(409, "CONFLICT", message),
  tooManyRequests: () =>
    new AppError(429, "TOO_MANY_REQUESTS", "Rate limit exceeded. Try again later."),
  internal: (message = "Internal server error") =>
    new AppError(500, "INTERNAL_ERROR", message),
};
