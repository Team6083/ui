import { ApiError, isMissingRole, readApiError } from "./api-error.js"

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } })

describe("readApiError", () => {
  it("reads the standard error body", async () => {
    const error = await readApiError(
      json(400, { error: { code: "invalid_request", message: "bad", details: { fields: { name: "required" } } } }),
    )
    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({ status: 400, code: "invalid_request", message: "bad", details: { fields: { name: "required" } } })
  })

  it("keeps an app's own business code", async () => {
    expect((await readApiError(json(409, { error: { code: "order_closed", message: "closed" } }))).code).toBe("order_closed")
  })

  it.each([
    [401, "unauthenticated"],
    [404, "not_found"],
    [418, "invalid_request"],
    [502, "upstream_unavailable"],
    [504, "upstream_timeout"],
    [507, "internal_error"],
  ])("falls back to the status when the body is not standard (%i → %s)", async (status, code) => {
    const error = await readApiError(new Response("<html>gateway</html>", { status }))
    expect(error.code).toBe(code)
    expect(error.details).toEqual({})
  })
})

describe("isMissingRole", () => {
  it("matches only missing_role", () => {
    expect(isMissingRole(new ApiError(403, "missing_role", ""))).toBe(true)
    expect(isMissingRole(new ApiError(403, "forbidden", ""))).toBe(false)
    expect(isMissingRole(new Error("missing_role"))).toBe(false)
  })
})
