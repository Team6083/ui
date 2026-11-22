"use client"

import { useCallback, useState } from "react"

import { commitsDiffer } from "../lib/commit.js"
import { usePoll } from "./poll.js"

export interface NewFrontendBuildOptions {
  /** The commit this build came from; leave empty in dev builds to turn the check off. */
  buildCommit: string | null | undefined
  /**
   * A file deployed with the front end that names its build, e.g. /version.json
   * holding { "commit": "…" }. Fetched when the tab regains focus and every
   * `intervalMs`.
   */
  url: string
  intervalMs?: number
}

/**
 * True once the deployed front end is a different build from this page. It asks
 * only the front end's own deployment, never an API. Pass it to
 * AppCommitProvider's `outdated` to show the banner.
 */
export function useNewFrontendBuild({ buildCommit, url, intervalMs = 5 * 60_000 }: NewFrontendBuildOptions): boolean {
  const [found, setFound] = useState(false)

  const check = useCallback(() => {
    fetch(url, { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((body: unknown) => {
        const commit = (body as { commit?: unknown } | null)?.commit
        if (typeof commit === "string" && commitsDiffer(buildCommit, commit)) setFound(true)
      })
      // A missing file, or the SPA fallback answering with HTML, is not a new build.
      .catch(() => {})
  }, [url, buildCommit])

  usePoll(check, intervalMs, !!buildCommit && !found)
  return found
}
