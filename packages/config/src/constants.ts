export const TASK_STATUSES = ["backlog", "todo", "in_progress", "in_review", "done"] as const;
export const TASK_PRIORITIES = ["none", "low", "medium", "high", "urgent"] as const;
export const ORG_ROLES = ["owner", "admin", "member", "viewer"] as const;
export const ORG_PLANS = ["free", "pro", "enterprise"] as const;

export const RATE_LIMITS = {
  auth: { points: 10, duration: 60 },         // 10 req/min on auth
  api: { points: 200, duration: 60 },          // 200 req/min general
  upload: { points: 20, duration: 60 },        // 20 uploads/min
} as const;

export const PAGINATION = {
  defaultPageSize: 20,
  maxPageSize: 100,
} as const;

export const FILE_LIMITS = {
  maxSizeMb: 50,
  allowedMimeTypes: [
    "image/jpeg", "image/png", "image/gif", "image/webp",
    "application/pdf",
    "text/plain", "text/csv",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
} as const;

export const INVITE_EXPIRY_DAYS = 7;
export const REFRESH_TOKEN_EXPIRY_DAYS = 7;
