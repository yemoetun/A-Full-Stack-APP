import { Request, Response, NextFunction } from "express";
import { verifyAccessToken, JwtPayload } from "../utils/jwt";
import { Errors } from "../utils/errors";

// Extend Express Request to include auth context
declare global {
  namespace Express {
    interface Request {
      user: JwtPayload;
      orgId: string;
    }
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    throw Errors.unauthorized("Missing or malformed Authorization header");
  }

  const token = authHeader.slice(7);
  req.user = verifyAccessToken(token);
  next();
}
