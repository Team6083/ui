import { useEffect } from "react"

/** Runs check now, every intervalMs and when the tab comes back, while the tab is visible and enabled is true. */
export function usePoll(check: () => void, intervalMs: number, enabled: boolean) {
  useEffect(() => {
    if (!enabled) return

    const run = () => {
      if (document.visibilityState === "visible") check()
    }
    run()
    const timer = window.setInterval(run, intervalMs)
    document.addEventListener("visibilitychange", run)
    return () => {
      window.clearInterval(timer)
      document.removeEventListener("visibilitychange", run)
    }
  }, [check, intervalMs, enabled])
}
