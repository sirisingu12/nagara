export const ROLES = Object.freeze({
  CITIZEN: "citizen",
  OFFICER: "officer",
  WORKER: "worker",
});

export const COMPLAINT_STATUSES = Object.freeze({
  SUBMITTED: "submitted",
  UNDER_VERIFICATION: "under_verification",
  ASSIGNED: "assigned",
  IN_PROGRESS: "in_progress",
  ON_HOLD: "on_hold",
  RESOLUTION_SUBMITTED: "resolution_submitted",
  RESOLVED: "resolved",
  REOPENED: "reopened",
  REJECTED: "rejected",
});

export const PRIORITIES = Object.freeze({
  CRITICAL: "critical",
  HIGH: "high",
  MEDIUM: "medium",
  LOW: "low",
});

export const API_ERROR_CODES = Object.freeze({
  VALIDATION_ERROR: "VALIDATION_ERROR",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",
});
