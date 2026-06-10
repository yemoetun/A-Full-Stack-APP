import jwt from "jsonwebtoken";
import { Errors } from "./errors";

export interface JwtPayload {
  userId: string;
  email: string;
  orgId?: string;
}

export function signAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: (process.env.JWT_EXPIRES_IN || "15m") as jwt.SignOptions["expiresIn"],
  });
}

export function signRefreshToken(payload: Pick<JwtPayload, "userId">): string {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || "7d") as jwt.SignOptions["expiresIn"],
  });
}

export function verifyAccessToken(token: string): JwtPayload {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
  } catch {
    throw Errors.unauthorized("Invalid or expired access token");
  }
}

export function verifyRefreshToken(token: string): Pick<JwtPayload, "userId"> {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as Pick<JwtPayload, "userId">;
  } catch {
    throw Errors.unauthorized("Invalid or expired refresh token");
  }
}
