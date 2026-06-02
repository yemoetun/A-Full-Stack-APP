import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

export function validate(schema: ZodSchema, source: "body" | "query" | "params" = "body") {
  return (req: Request, _res: Response, next: NextFunction) => {
    // ZodError will be caught by the global error handler
    req[source] = schema.parse(req[source]);
    next();
  };
}
