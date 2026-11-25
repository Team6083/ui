// Every API response carries X-App-Commit; the front end compares it with the
// commit it was built from.

export const COMMIT_HEADER = "X-App-Commit"

const SHORT_SHA = 7

function normalize(commit: string | null | undefined): string | undefined {
  const value = commit?.trim().toLowerCase().replace(/^sha-/, "")
  return value && /^[0-9a-f]+$/.test(value) && value.length >= SHORT_SHA ? value : undefined
}

/** Whether a commit is a SHA (short or full, or an image tag like sha-abc1234) that commitsDiffer can compare. */
export function isSha(commit: string | null | undefined): boolean {
  return normalize(commit) !== undefined
}

/**
 * Whether two commits differ. Short and full SHAs compare by prefix, and an
 * image tag (sha-abc1234) counts as its SHA. Returns false when either side is
 * missing or not a SHA (a dev build, a server without the header), so an
 * unknown build is never reported as outdated.
 */
export function commitsDiffer(build: string | null | undefined, server: string | null | undefined): boolean {
  const a = normalize(build)
  const b = normalize(server)
  if (!a || !b) return false
  return !(a.startsWith(b) || b.startsWith(a))
}

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"])

/** Writes are blocked while the app is outdated; reads still go through. */
export function isWriteMethod(method: string | undefined): boolean {
  return !SAFE_METHODS.has((method ?? "GET").toUpperCase())
}
