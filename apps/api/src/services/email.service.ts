import { Resend } from "resend";
import { logger } from "../utils/logger";

const resend = new Resend(process.env.RESEND_API_KEY || "re_placeholder");
const FROM = process.env.EMAIL_FROM || "noreply@projectflow.app";
const APP_URL = process.env.FRONTEND_URL || "http://localhost:3000";

export const emailService = {
  async sendInvite(params: {
    to: string;
    orgName: string;
    inviterName: string;
    role: string;
    token: string;
  }) {
    const link = `${APP_URL}/accept-invite?token=${params.token}`;
    try {
      await resend.emails.send({
        from: FROM,
        to: params.to,
        subject: `You're invited to join ${params.orgName} on ProjectFlow`,
        html: `
          <h2>You've been invited!</h2>
          <p>${params.inviterName} has invited you to join <strong>${params.orgName}</strong> as a <strong>${params.role}</strong>.</p>
          <p><a href="${link}" style="background:#6366f1;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;">Accept Invite</a></p>
          <p>This invite expires in 7 days.</p>
        `,
      });
    } catch (err) {
      logger.error({ err, to: params.to }, "Failed to send invite email");
    }
  },

  async sendTaskAssigned(params: {
    to: string;
    assigneeName: string;
    taskTitle: string;
    projectName: string;
    taskUrl: string;
  }) {
    try {
      await resend.emails.send({
        from: FROM,
        to: params.to,
        subject: `You've been assigned: ${params.taskTitle}`,
        html: `
          <h2>New task assigned to you</h2>
          <p>Hi ${params.assigneeName},</p>
          <p>You've been assigned the task <strong>${params.taskTitle}</strong> in <strong>${params.projectName}</strong>.</p>
          <p><a href="${params.taskUrl}">View Task →</a></p>
        `,
      });
    } catch (err) {
      logger.error({ err, to: params.to }, "Failed to send task assigned email");
    }
  },
};
