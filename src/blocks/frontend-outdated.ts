"use client"

import { useCallback, useState } from "react"

import { commitsDiffer } from "../lib/commit.js"
import { usePoll } from "./poll.js"

export interface FrontendOutdatedOptions {
  /** The commit this build came from; leave empty in dev builds to turn the check off. */
  buildCommit: string | null | undefined
  /**
   * An absolute path or URL to a file deployed with the front end that names its
   * build's git SHA, e.g. /version.json holding { "commit": "3f9c2a1…" }. Anything
   * that isn't a SHA (a version, "unknown") never counts as a new build. Fetched
   * when the tab regains focus and every `pollIntervalMs`.
   */
  url: string
  pollIntervalMs?: number
}

/**
 * True once the deployed front end is a different build from this page. It asks
 * only the front end's own deployment, never an API. Pass it to
 * AppCommitProvider's `frontendOutdated` to show the banner.
 */
export function useFrontendOutdated({ buildCommit, url, pollIntervalMs = 5 * 60_000 }: FrontendOutdatedOptions): boolean {
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

  usePoll(check, pollIntervalMs, !!buildCommit && !found)
  return found
}
