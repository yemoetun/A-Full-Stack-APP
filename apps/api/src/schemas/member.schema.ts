import { z } from "zod";

export const inviteMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(["admin", "member", "viewer"]).default("member"),
});

export const updateRoleSchema = z.object({
  role: z.enum(["admin", "member", "viewer"]),
});

export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
