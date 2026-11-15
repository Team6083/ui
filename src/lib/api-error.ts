// The team's error body: {"error":{"code":"...","message":"...","details":{...}}}.
// See the wiki's common standard, "HTTP API 慣例".

export const STANDARD_ERROR_CODES = [
  "invalid_request",
  "unauthenticated",
  "forbidden",
  "missing_role",
  "not_found",
  "version_conflict",
  "invalid_transition",
  "payload_too_large",
  "rate_limited",
  "internal_error",
  "config_error",
  "upstream_unavailable",
  "upstream_timeout",
] as const

export type StandardErrorCode = (typeof STANDARD_ERROR_CODES)[number]

/** Client-side codes for failures that never reached a standard error body. */
export type ClientErrorCode = "network_error" | "app_outdated"

// Used when a response has no standard body (a proxy's HTML page, an empty 502).
const CODE_BY_STATUS: Record<number, StandardErrorCode> = {
  400: "invalid_request",
  401: "unauthenticated",
  403: "forbidden",
  404: "not_found",
  409: "version_conflict",
  413: "payload_too_large",
  429: "rate_limited",
  500: "internal_error",
  502: "upstream_unavailable",
  503: "upstream_unavailable",
  504: "upstream_timeout",
}

export class ApiError extends Error {
  override readonly name = "ApiError"

  constructor(
    /** HTTP status; 0 when the request never got a response. */
    readonly status: number,
    /** A standard code, an app's own business code, or a client code. */
    readonly code: StandardErrorCode | ClientErrorCode | (string & {}),
    /** The server's English fallback text; not for display in other locales. */
    message: string,
    readonly details: Record<string, unknown> = {},
  ) {
    super(message)
  }
}

function codeForStatus(status: number): StandardErrorCode {
  return CODE_BY_STATUS[status] ?? (status >= 500 ? "internal_error" : "invalid_request")
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

/** Reads a failed response into an ApiError, falling back to the status when the body is not standard. */
export async function readApiError(response: Response): Promise<ApiError> {
  let body: unknown
  try {
    body = await response.json()
  } catch {
    body = undefined
  }

  const error = isRecord(body) && isRecord(body.error) ? body.error : undefined
  const code = typeof error?.code === "string" && error.code !== "" ? error.code : codeForStatus(response.status)
  const message = typeof error?.message === "string" ? error.message : response.statusText
  const details = isRecord(error?.details) ? error.details : {}
  return new ApiError(response.status, code, message, details)
}

export function isApiError(error: unknown, code?: string): error is ApiError {
  return error instanceof ApiError && (code === undefined || error.code === code)
}

/** The 403 that means "show the no-access page", per the auth standard. */
export function isMissingRole(error: unknown): error is ApiError {
  return isApiError(error, "missing_role")
}
