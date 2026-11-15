import { ConfigError, loadRuntimeConfig, parseBaseConfig } from "./runtime-config.js"

const valid = { apiBaseUrl: "https://api.example.test", oidc: { authority: "https://id.example.test/realms/x", clientId: "app-web", scope: "openid profile email" } }

function fetchReturning(response: Response | Error) {
  return vi.fn<typeof fetch>(async () => {
    if (response instanceof Error) throw response
    return response
  })
}

describe("parseBaseConfig", () => {
  it("accepts the common fields", () => {
    expect(parseBaseConfig(valid)).toEqual(valid)
  })

  it("lists every problem at once", () => {
    const error = (() => {
      try {
        parseBaseConfig({ apiBaseUrl: "", oidc: { clientId: "x" } })
      } catch (e) {
        return e
      }
    })()
    expect(error).toBeInstanceOf(ConfigError)
    expect((error as ConfigError).issues).toEqual([
      "apiBaseUrl is missing or empty",
      "oidc.authority is missing or empty",
      "oidc.scope is missing or empty",
    ])
  })
})

describe("loadRuntimeConfig", () => {
  it("fetches config.json under the base path without the HTTP cache", async () => {
    const fetchFn = fetchReturning(Response.json(valid))
    await expect(loadRuntimeConfig({ parse: parseBaseConfig, basePath: "/app", fetch: fetchFn })).resolves.toEqual(valid)
    expect(fetchFn).toHaveBeenCalledWith("/app/config.json", { cache: "no-cache" })
  })

  it.each([
    ["a network error", new TypeError("offline"), "could not fetch /config.json: offline"],
    ["an HTTP error", new Response("", { status: 404 }), "could not fetch /config.json: HTTP 404"],
    ["invalid JSON", new Response("{"), "/config.json is not valid JSON"],
    ["the SPA fallback's index.html", new Response("<!doctype html>", { headers: { "Content-Type": "text/html" } }), "/config.json was answered with an HTML page; is config.json deployed?"],
  ])("turns %s into a ConfigError", async (_, response, issue) => {
    await expect(loadRuntimeConfig({ parse: parseBaseConfig, fetch: fetchReturning(response) })).rejects.toMatchObject({
      name: "ConfigError",
      issues: [issue],
    })
  })

  it("wraps a parser's plain Error", async () => {
    const parse = () => {
      throw new Error("workspaces is empty")
    }
    await expect(loadRuntimeConfig({ parse, fetch: fetchReturning(Response.json({})) })).rejects.toMatchObject({
      issues: ["workspaces is empty"],
    })
  })
})
