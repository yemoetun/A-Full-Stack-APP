import { randomBytes } from "crypto";
import { getPool } from "../config/database";
import { cache } from "./cache.service";
import { emailService } from "./email.service";
import { Errors } from "../utils/errors";
import { INVITE_EXPIRY_DAYS } from "@projectflow/config";
import type { InviteMemberInput } from "../schemas/member.schema";
import type { OrgRole } from "@projectflow/types";

export class MembersService {
  private pool = getPool();

  async list(orgId: string) {
    const cacheKey = cache.keys.members(orgId);
    const cached = await cache.get(cacheKey);
    if (cached) return cached;

    const { rows } = await this.pool.query(
      `SELECT u.id AS "userId", u.email, u.name, u.avatar_url AS "avatarUrl",
              om.role, om.joined_at AS "joinedAt"
       FROM org_members om
       JOIN users u ON u.id = om.user_id
       WHERE om.org_id = $1
       ORDER BY om.joined_at`,
      [orgId]
    );

    await cache.set(cacheKey, rows, 60);
    return rows;
  }

  async invite(orgId: string, inviterId: string, input: InviteMemberInput) {
    // Check if already a member
    const { rows: existing } = await this.pool.query(
      `SELECT om.user_id FROM org_members om
       JOIN users u ON u.id = om.user_id
       WHERE om.org_id = $1 AND u.email = $2`,
      [orgId, input.email]
    );
    if (existing.length) throw Errors.conflict("User is already a member of this organization");

    // Revoke any pending invites for same email+org
    await this.pool.query(
      "DELETE FROM invites WHERE org_id = $1 AND email = $2 AND accepted_at IS NULL",
      [orgId, input.email]
    );

    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + INVITE_EXPIRY_DAYS);

    await this.pool.query(
      `INSERT INTO invites (org_id, email, role, token, invited_by, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [orgId, input.email, input.role, token, inviterId, expiresAt]
    );

    // Get org + inviter details for email
    const [orgRes, inviterRes] = await Promise.all([
      this.pool.query("SELECT name FROM orgs WHERE id = $1", [orgId]),
      this.pool.query("SELECT name FROM users WHERE id = $1", [inviterId]),
    ]);

    await emailService.sendInvite({
      to: input.email,
      orgName: orgRes.rows[0].name,
      inviterName: inviterRes.rows[0].name,
      role: input.role,
      token,
    });

    return { message: "Invite sent" };
  }

  async updateRole(orgId: string, targetUserId: string, role: OrgRole) {
    const { rowCount } = await this.pool.query(
      "UPDATE org_members SET role = $1 WHERE org_id = $2 AND user_id = $3",
      [role, orgId, targetUserId]
    );
    if (!rowCount) throw Errors.notFound("Member");
    await cache.del(cache.keys.members(orgId));
  }

  async remove(orgId: string, targetUserId: string, requestingUserId: string) {
    if (targetUserId === requestingUserId) {
      throw Errors.badRequest("You cannot remove yourself");
    }
    // Cannot remove the last owner
    const { rows } = await this.pool.query(
      "SELECT user_id FROM org_members WHERE org_id = $1 AND role = 'owner'",
      [orgId]
    );
    if (rows.length === 1 && rows[0].user_id === targetUserId) {
      throw Errors.badRequest("Cannot remove the last owner");
    }

    await this.pool.query(
      "DELETE FROM org_members WHERE org_id = $1 AND user_id = $2",
      [orgId, targetUserId]
    );
    await cache.del(cache.keys.members(orgId));
  }
}
