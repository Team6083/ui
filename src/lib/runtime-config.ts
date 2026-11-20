// SPAs read their environment from /config.json at start-up instead of baking
// it into the build.

/** The fields every app's config.json has; apps add their own after these. */
export interface BaseRuntimeConfig {
  apiBaseUrl: string
  oidc: { authority: string; clientId: string; scope: string }
}

/** Every problem found in config.json, so they can be fixed in one pass. */
export class ConfigError extends Error {
  override readonly name = "ConfigError"

  constructor(readonly issues: string[]) {
    super(issues.join("\n"))
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

/**
 * Checks the common fields and returns the problems found (empty when valid).
 * Use it inside an app's own parser so the app's fields are reported together
 * with these.
 */
export function baseConfigIssues(raw: unknown): string[] {
  if (!isRecord(raw)) return ["config.json is not a JSON object"]

  const issues: string[] = []
  const requireString = (value: unknown, path: string) => {
    if (typeof value !== "string" || value.trim() === "") issues.push(`${path} is missing or empty`)
  }

  requireString(raw.apiBaseUrl, "apiBaseUrl")
  if (!isRecord(raw.oidc)) {
    issues.push("oidc is missing")
  } else {
    requireString(raw.oidc.authority, "oidc.authority")
    requireString(raw.oidc.clientId, "oidc.clientId")
    requireString(raw.oidc.scope, "oidc.scope")
  }
  return issues
}

/** Parser for apps whose config.json has only the common fields. */
export function parseBaseConfig(raw: unknown): BaseRuntimeConfig {
  const issues = baseConfigIssues(raw)
  if (issues.length > 0) throw new ConfigError(issues)
  return raw as BaseRuntimeConfig
}

export interface LoadRuntimeConfigOptions<T> {
  /** Validates the parsed JSON; throw a ConfigError listing every problem. */
  parse: (raw: unknown) => T
  /** The app's base path (Vite's import.meta.env.BASE_URL). Defaults to "/". */
  basePath?: string
  fetch?: typeof fetch
}

/** Fetches and validates config.json; throws a ConfigError on any failure. */
export async function loadRuntimeConfig<T>({ parse, basePath = "/", fetch: fetchFn = fetch }: LoadRuntimeConfigOptions<T>): Promise<T> {
  const url = `${basePath.endsWith("/") ? basePath : `${basePath}/`}config.json`

  let response: Response
  try {
    response = await fetchFn(url, { cache: "no-cache" })
  } catch (error) {
    throw new ConfigError([`could not fetch ${url}: ${error instanceof Error ? error.message : String(error)}`])
  }
  if (!response.ok) throw new ConfigError([`could not fetch ${url}: HTTP ${response.status}`])
  // A static host's SPA fallback answers a missing config.json with index.html.
  if (/text\/html/i.test(response.headers.get("Content-Type") ?? "")) {
    throw new ConfigError([`${url} was answered with an HTML page; is config.json deployed?`])
  }

  let raw: unknown
  try {
    raw = await response.json()
  } catch {
    throw new ConfigError([`${url} is not valid JSON`])
  }

  try {
    return parse(raw)
  } catch (error) {
    if (error instanceof ConfigError) throw error
    throw new ConfigError([error instanceof Error ? error.message : String(error)])
  }
}
