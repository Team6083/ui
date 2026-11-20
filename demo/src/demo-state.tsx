import { createContext, useContext } from "react"

/** What the demo's own controls change: the package's locale, the update banner and AppShell's width. */
export interface DemoState {
  locale: string
  setLocale: (locale: string) => void
  outdated: boolean
  setOutdated: (outdated: boolean) => void
  width: "column" | "wide"
  setWidth: (width: "column" | "wide") => void
}

export const DemoStateContext = createContext<DemoState | null>(null)

export function useDemoState(): DemoState {
  const state = useContext(DemoStateContext)
  if (!state) throw new Error("useDemoState outside the demo")
  return state
}
