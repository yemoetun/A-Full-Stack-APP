import { randomBytes } from "crypto";
import { OAuth2Client } from "google-auth-library";
import { getPool } from "../config/database";
import { hashPassword, comparePassword } from "../utils/password";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt";
import { Errors } from "../utils/errors";
import { INVITE_EXPIRY_DAYS } from "@projectflow/config";
import { emailService } from "./email.service";
import type { RegisterInput, LoginInput, AcceptInviteInput } from "../schemas/auth.schema";

export class AuthService {
  private pool = getPool();

  async register(input: RegisterInput) {
    const existing = await this.pool.query(
      "SELECT id FROM users WHERE email = $1", [input.email]
    );
    if (existing.rows.length) throw Errors.conflict("Email already registered");

    const passwordHash = await hashPassword(input.password);
    const { rows } = await this.pool.query(
      `INSERT INTO users (email, name, password_hash)
       VALUES ($1, $2, $3) RETURNING id, email, name, created_at`,
      [input.email, input.name, passwordHash]
    );

    const user = rows[0];

    // Create a default org for the new user
    const slug = input.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + Date.now();
    const { rows: newOrg } = await this.pool.query(
      "INSERT INTO orgs (name, slug) VALUES ($1, $2) RETURNING id",
      [`${input.name}'s Workspace`, slug]
    );
    await this.pool.query(
      "INSERT INTO org_members (org_id, user_id, role) VALUES ($1, $2, 'owner')",
      [newOrg[0].id, user.id]
    );

    return this.issueTokens(user);
  }

  async login(input: LoginInput) {
    const { rows } = await this.pool.query(
      "SELECT id, email, name, password_hash FROM users WHERE email = $1",
      [input.email]
    );
    if (!rows.length) throw Errors.unauthorized("Invalid email or password");

    const valid = await comparePassword(input.password, rows[0].password_hash);
    if (!valid) throw Errors.unauthorized("Invalid email or password");

    return this.issueTokens(rows[0]);
  }

  async refresh(refreshToken: string) {
    const { userId } = verifyRefreshToken(refreshToken);

    // Verify token exists and isn't revoked
    const tokenHash = this.hashToken(refreshToken);
    const { rows } = await this.pool.query(
      `SELECT id FROM refresh_tokens
       WHERE user_id = $1 AND token_hash = $2
         AND revoked_at IS NULL AND expires_at > NOW()`,
      [userId, tokenHash]
    );
    if (!rows.length) throw Errors.unauthorized("Refresh token invalid or expired");

    // Rotate: revoke old, issue new
    await this.pool.query(
      "UPDATE refresh_tokens SET revoked_at = NOW() WHERE id = $1",
      [rows[0].id]
    );

    const user = await this.pool.query(
      "SELECT id, email, name FROM users WHERE id = $1",
      [userId]
    );
    return this.issueTokens(user.rows[0]);
  }

  async logout(userId: string, refreshToken?: string) {
    if (refreshToken) {
      const tokenHash = this.hashToken(refreshToken);
      await this.pool.query(
        "UPDATE refresh_tokens SET revoked_at = NOW() WHERE user_id = $1 AND token_hash = $2",
        [userId, tokenHash]
      );
    } else {
      // Revoke all sessions
      await this.pool.query(
        "UPDATE refresh_tokens SET revoked_at = NOW() WHERE user_id = $1",
        [userId]
      );
    }
  }

  async me(userId: string) {
    const { rows } = await this.pool.query(
      `SELECT u.id, u.email, u.name, u.avatar_url, u.created_at,
              json_agg(json_build_object(
                'id', o.id, 'name', o.name, 'slug', o.slug, 'role', om.role
              )) FILTER (WHERE o.id IS NOT NULL) AS orgs
       FROM users u
       LEFT JOIN org_members om ON om.user_id = u.id
       LEFT JOIN orgs o ON o.id = om.org_id
       WHERE u.id = $1
       GROUP BY u.id`,
      [userId]
    );
    if (!rows.length) throw Errors.notFound("User");
    return rows[0];
  }

  async acceptInvite(input: AcceptInviteInput) {
    const { rows: invites } = await this.pool.query(
      `SELECT * FROM invites
       WHERE token = $1 AND accepted_at IS NULL AND expires_at > NOW()`,
      [input.token]
    );
    if (!invites.length) throw Errors.badRequest("Invite is invalid or expired");
    const invite = invites[0];

    // Find or create user
    let user = (await this.pool.query("SELECT id FROM users WHERE email = $1", [invite.email])).rows[0];
    if (!user) {
      if (!input.password || !input.name) {
        throw Errors.badRequest("Name and password are required for new users");
      }
      const hash = await hashPassword(input.password);
      user = (await this.pool.query(
        "INSERT INTO users (email, name, password_hash) VALUES ($1, $2, $3) RETURNING id",
        [invite.email, input.name, hash]
      )).rows[0];
    }

    // Add to org
    await this.pool.query(
      `INSERT INTO org_members (org_id, user_id, role)
       VALUES ($1, $2, $3) ON CONFLICT (org_id, user_id) DO UPDATE SET role = EXCLUDED.role`,
      [invite.org_id, user.id, invite.role]
    );

    // Mark invite accepted
    await this.pool.query(
      "UPDATE invites SET accepted_at = NOW() WHERE id = $1",
      [invite.id]
    );

    return this.issueTokens(user);
  }

  getGoogleAuthUrl(): string {
    const client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.API_URL}/api/v1/auth/google/callback`
    );
    return client.generateAuthUrl({
      access_type: "offline",
      scope: ["email", "profile"],
      prompt: "select_account",
    });
  }

  async handleGoogleCallback(code: string) {
    const client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.API_URL}/api/v1/auth/google/callback`
    );

    const { tokens } = await client.getToken(code);
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token!,
      audience: process.env.GOOGLE_CLIENT_ID!,
    });

    const payload = ticket.getPayload()!;
    const { email, name, sub: googleId } = payload;
    if (!email) throw Errors.badRequest("No email from Google");

    // Find or create user
    let { rows } = await this.pool.query(
      "SELECT id, email, name FROM users WHERE email = $1", [email]
    );

    const isNewUser = !rows.length;

    if (isNewUser) {
      // Create new user with random password (they'll use Google to sign in)
      const randomPw = await hashPassword(randomBytes(32).toString("hex"));
      const result = await this.pool.query(
        `INSERT INTO users (email, name, password_hash)
         VALUES ($1, $2, $3) RETURNING id, email, name`,
        [email, name ?? email.split("@")[0], randomPw]
      );
      rows = result.rows;
    }

    const user = rows[0];

    // If new user or has no orgs, create a default personal org
    const { rows: orgs } = await this.pool.query(
      "SELECT org_id FROM org_members WHERE user_id = $1 LIMIT 1",
      [user.id]
    );

    if (!orgs.length) {
      const userName = user.name ?? email.split("@")[0];
      const slug = userName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + Date.now();
      const { rows: newOrg } = await this.pool.query(
        "INSERT INTO orgs (name, slug) VALUES ($1, $2) RETURNING id",
        [`${userName}'s Workspace`, slug]
      );
      await this.pool.query(
        "INSERT INTO org_members (org_id, user_id, role) VALUES ($1, $2, 'owner')",
        [newOrg[0].id, user.id]
      );
    }

    return this.issueTokens(user);
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const { rows } = await this.pool.query(
      "SELECT password_hash FROM users WHERE id = $1", [userId]
    );
    if (!rows.length) throw Errors.notFound("User");
    const valid = await comparePassword(currentPassword, rows[0].password_hash);
    if (!valid) throw Errors.unauthorized("Current password is incorrect");
    const newHash = await hashPassword(newPassword);
    await this.pool.query("UPDATE users SET password_hash = $1 WHERE id = $2", [newHash, userId]);
  }

  private async issueTokens(user: { id: string; email: string }) {
    const accessToken = signAccessToken({ userId: user.id, email: user.email });
    const refreshToken = signRefreshToken({ userId: user.id });

    const tokenHash = this.hashToken(refreshToken);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.pool.query(
      "INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)",
      [user.id, tokenHash, expiresAt]
    );

    return { accessToken, refreshToken, expiresIn: 15 * 60 };
  }

  private hashToken(token: string): string {
    const { createHash } = require("crypto");
    return createHash("sha256").update(token).digest("hex");
  }
}
