import { commitsDiffer, isSha, isWriteMethod } from "./commit.js"

describe("commitsDiffer", () => {
  it.each([
    ["abc1234", "abc1234def5678", false],
    ["ABC1234", "abc1234", false],
    ["sha-abc1234", "abc1234", false],
    ["abc1234", "def5678", true],
    ["abc1234def", "abc1235def", true],
  ])("%s vs %s → %s", (build, server, expected) => {
    expect(commitsDiffer(build, server)).toBe(expected)
  })

  it.each([
    [undefined, "abc1234"],
    ["abc1234", null],
    ["", "abc1234"],
    ["dev", "abc1234"],
    ["abc12", "def56"],
  ])("never reports an unknown build as outdated (%s, %s)", (build, server) => {
    expect(commitsDiffer(build, server)).toBe(false)
  })
})

describe("isSha", () => {
  it("accepts short and full SHAs and image tags, nothing else", () => {
    expect(["abc1234", "ABC1234DEF", "sha-abc1234"].map(isSha)).toEqual([true, true, true])
    expect([undefined, null, "", "dev", "unknown", "1.2.0", "abc12"].map(isSha)).toEqual([false, false, false, false, false, false, false])
  })
})

describe("isWriteMethod", () => {
  it("treats only GET, HEAD and OPTIONS as reads", () => {
    expect(["GET", "head", "OPTIONS", undefined].map(isWriteMethod)).toEqual([false, false, false, false])
    expect(["POST", "put", "PATCH", "DELETE"].map(isWriteMethod)).toEqual([true, true, true, true])
  })
})
