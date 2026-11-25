import { renderHook } from "@testing-library/react"

import { usePoll } from "./poll.js"

describe("usePoll", () => {
  let visibility: DocumentVisibilityState

  beforeEach(() => {
    vi.useFakeTimers()
    visibility = "visible"
    vi.spyOn(document, "visibilityState", "get").mockImplementation(() => visibility)
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it("checks now and on every interval", () => {
    const check = vi.fn()
    renderHook(() => usePoll(check, 1000, true))
    expect(check).toHaveBeenCalledTimes(1)
    vi.advanceTimersByTime(3000)
    expect(check).toHaveBeenCalledTimes(4)
  })

  it("skips while the tab is hidden and checks when it comes back", () => {
    const check = vi.fn()
    visibility = "hidden"
    renderHook(() => usePoll(check, 1000, true))
    vi.advanceTimersByTime(3000)
    expect(check).not.toHaveBeenCalled()

    visibility = "visible"
    document.dispatchEvent(new Event("visibilitychange"))
    expect(check).toHaveBeenCalledTimes(1)
  })

  it("stops once disabled", () => {
    const check = vi.fn()
    const { rerender } = renderHook(({ enabled }) => usePoll(check, 1000, enabled), { initialProps: { enabled: true } })
    expect(check).toHaveBeenCalledTimes(1)
    rerender({ enabled: false })
    vi.advanceTimersByTime(3000)
    document.dispatchEvent(new Event("visibilitychange"))
    expect(check).toHaveBeenCalledTimes(1)
  })
})
