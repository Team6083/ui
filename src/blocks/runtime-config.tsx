"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

import { loadRuntimeConfig, type LoadRuntimeConfigOptions } from "../lib/runtime-config.js"
import { ConfigErrorPage } from "./config-error-page.js"

export interface RuntimeConfigProviderProps {
  children: ReactNode
  /** Shown while config.json loads. */
  fallback?: ReactNode
}

type State<T> = { status: "loading" } | { status: "ready"; config: T } | { status: "error"; error: unknown }

/**
 * Creates a provider that loads config.json before rendering the app, and
 * shows ConfigErrorPage instead of the app when it fails. Wrap everything else
 * (OIDC, queries) in it, so nothing initializes without a valid config.
 *
 *   export const { RuntimeConfigProvider, useRuntimeConfig } =
 *     createRuntimeConfig({ parse: parseConfig, basePath: import.meta.env.BASE_URL })
 */
export function createRuntimeConfig<T>(options: LoadRuntimeConfigOptions<T>) {
  const Context = createContext<T | null>(null)

  function RuntimeConfigProvider({ children, fallback = null }: RuntimeConfigProviderProps) {
    const [state, setState] = useState<State<T>>({ status: "loading" })

    useEffect(() => {
      let active = true
      loadRuntimeConfig(options).then(
        (config) => active && setState({ status: "ready", config }),
        (error: unknown) => active && setState({ status: "error", error }),
      )
      return () => {
        active = false
      }
    }, [])

    if (state.status === "error") return <ConfigErrorPage error={state.error} />
    if (state.status === "loading") return fallback
    return <Context.Provider value={state.config}>{children}</Context.Provider>
  }

  function useRuntimeConfig(): T {
    const config = useContext(Context)
    if (config === null) throw new Error("useRuntimeConfig must be used inside <RuntimeConfigProvider>")
    return config
  }

  return { RuntimeConfigProvider, useRuntimeConfig }
}
