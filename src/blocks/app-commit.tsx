"use client"

import { Alert, Button } from "@chakra-ui/react"
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react"

import { useUiMessages } from "../i18n.js"
import { ApiError } from "../lib/api-error.js"
import { COMMIT_HEADER, commitsDiffer, isWriteMethod } from "../lib/commit.js"
import { usePoll } from "./poll.js"

interface AppCommitContextValue {
  /** The server runs another build: writes are unsafe. */
  outdated: boolean
  /** The user should reload: the server or the deployed front end runs another build. */
  reload: boolean
  /** Checks a response's X-App-Commit against the build. */
  observe: (response: Response | Headers) => void
}

const AppCommitContext = createContext<AppCommitContextValue>({ outdated: false, reload: false, observe: () => {} })

export interface AppCommitProviderProps {
  children: ReactNode
  /** The commit this build came from; leave empty in dev builds to turn the check off. */
  buildCommit: string | null | undefined
  /**
   * A cheap same-origin endpoint that returns X-App-Commit (e.g. /api/healthz).
   * Checked when the tab regains focus and every `pollIntervalMs`. Needed when
   * the app's writes don't go through fetch (Next.js server actions).
   */
  pollUrl?: string
  pollIntervalMs?: number
  /**
   * For apps that already detect a newer build themselves (e.g. in their API
   * client): true shows the banner and turns on useAppOutdated.
   */
  outdated?: boolean
  /**
   * A newer front end is deployed, e.g. from useFrontendOutdated: true shows
   * the banner but leaves writes alone, since the API may still match.
   */
  frontendOutdated?: boolean
}

/** Tracks whether the server runs a newer build than this page. */
export function AppCommitProvider({ children, buildCommit, pollUrl, pollIntervalMs = 5 * 60_000, outdated: reported = false, frontendOutdated = false }: AppCommitProviderProps) {
  const [detected, setOutdated] = useState(false)
  const outdated = detected || reported

  const observe = useCallback(
    (response: Response | Headers) => {
      const headers = response instanceof Headers ? response : response.headers
      if (commitsDiffer(buildCommit, headers.get(COMMIT_HEADER))) setOutdated(true)
    },
    [buildCommit],
  )

  const check = useCallback(() => {
    if (pollUrl) fetch(pollUrl, { method: "HEAD", cache: "no-store" }).then(observe, () => {})
  }, [pollUrl, observe])
  usePoll(check, pollIntervalMs, !!pollUrl && !!buildCommit && !outdated)

  const reload = outdated || frontendOutdated
  const value = useMemo(() => ({ outdated, reload, observe }), [outdated, reload, observe])
  return <AppCommitContext.Provider value={value}>{children}</AppCommitContext.Provider>
}

/** True once the server is on a different build; disable save buttons with it. */
export function useAppOutdated(): boolean {
  return useContext(AppCommitContext).outdated
}

/** True once the user should reload: the server or the deployed front end runs another build. */
export function useReloadNeeded(): boolean {
  return useContext(AppCommitContext).reload
}

/**
 * fetch that checks X-App-Commit on every response and, once the app is
 * outdated, refuses writes (anything but GET/HEAD/OPTIONS) with an ApiError
 * whose code is app_outdated. Use it as the base of the app's API client.
 */
export function useCommitCheckedFetch(): typeof fetch {
  const { outdated, observe } = useContext(AppCommitContext)

  return useCallback<typeof fetch>(
    async (input, init) => {
      const method = init?.method ?? (input instanceof Request ? input.method : "GET")
      if (outdated && isWriteMethod(method)) {
        throw new ApiError(0, "app_outdated", "The system has been updated; reload the page")
      }
      const response = await fetch(input, init)
      observe(response)
      return response
    },
    [outdated, observe],
  )
}

export interface AppOutdatedBannerProps {
  /** Defaults to reloading the page. */
  onReload?: () => void
}

/** Tells the user to reload once the app or its front end is outdated; renders nothing before that. */
export function AppOutdatedBanner({ onReload = () => window.location.reload() }: AppOutdatedBannerProps) {
  const reload = useReloadNeeded()
  // Only the API's build pauses saving; a newer front end alone doesn't.
  const writesBlocked = useAppOutdated()
  const m = useUiMessages().outdated
  if (!reload) return null

  return (
    <Alert.Root status="warning" position="sticky" top="0" zIndex="banner" rounded="none" data-testid="app-outdated-banner">
      <Alert.Indicator />
      <Alert.Content>
        <Alert.Title>{m.title}</Alert.Title>
        <Alert.Description>{writesBlocked ? m.description : m.frontendDescription}</Alert.Description>
      </Alert.Content>
      <Button size="sm" variant="solid" colorPalette="orange" alignSelf="center" onClick={onReload}>
        {m.reload}
      </Button>
    </Alert.Root>
  )
}
