import { createContext, useContext } from "react"

/** "page": each page's own width (Data pages is wide, the rest column). */
export type DemoWidth = "page" | "column" | "wide"

/** What the demo's own controls change: the package's locale, the update banner and AppShell's widths. */
export interface DemoState {
  locale: string
  setLocale: (locale: string) => void
  outdated: boolean
  setOutdated: (outdated: boolean) => void
  frameWidth: "column" | "wide"
  setFrameWidth: (width: "column" | "wide") => void
  width: DemoWidth
  setWidth: (width: DemoWidth) => void
}

export const DemoStateContext = createContext<DemoState | null>(null)

export function useDemoState(): DemoState {
  const state = useContext(DemoStateContext)
  if (!state) throw new Error("useDemoState outside the demo")
  return state
}
