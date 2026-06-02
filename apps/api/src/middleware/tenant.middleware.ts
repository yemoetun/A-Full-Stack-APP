import { Request, Response, NextFunction } from "express";
import { getPool } from "../config/database";
import { Errors } from "../utils/errors";
import { OrgRole } from "@projectflow/types";

/**
 * Resolves the org from the route param :orgId and verifies
 * the authenticated user is a member. Attaches req.orgId.
 *
 * This is the core of tenant isolation — every protected route
 * goes through this middleware, and every DB query uses req.orgId.
 */
export function resolveTenant(requiredRole?: OrgRole) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    const orgId = req.params.orgId || req.headers["x-org-id"] as string;
    if (!orgId) throw Errors.badRequest("orgId is required");

    const pool = getPool();
    const { rows } = await pool.query(
      `SELECT role FROM org_members
       WHERE org_id = $1 AND user_id = $2`,
      [orgId, req.user.userId]
    );

    if (!rows.length) {
      throw Errors.forbidden("You are not a member of this organization");
    }

    // Role hierarchy check
    if (requiredRole) {
      const hierarchy: OrgRole[] = ["viewer", "member", "admin", "owner"];
      const userLevel = hierarchy.indexOf(rows[0].role);
      const requiredLevel = hierarchy.indexOf(requiredRole);
      if (userLevel < requiredLevel) {
        throw Errors.forbidden("Insufficient permissions");
      }
    }

    req.orgId = orgId;
    next();
  };
}
