"use client"

import { ChakraProvider, type SystemContext } from "@chakra-ui/react"

import { ColorModeProvider, type ColorModeProviderProps } from "./chakra/color-mode.js"
import { resolveUiLocale, UiLocaleProvider } from "./i18n.js"
import { system as teamSystem } from "./theme.js"

export interface UiProviderProps extends ColorModeProviderProps {
  /** The app's current locale (any BCP 47 tag); picks the package's own strings. */
  locale?: string
  /** Defaults to the team theme; pass a system built on it to extend it. */
  system?: SystemContext
}

/** Chakra with the team theme, color mode (next-themes) and the package's locale. */
export function UiProvider({ locale, system = teamSystem, ...colorModeProps }: UiProviderProps) {
  return (
    <ChakraProvider value={system}>
      <UiLocaleProvider value={resolveUiLocale(locale)}>
        <ColorModeProvider {...colorModeProps} />
      </UiLocaleProvider>
    </ChakraProvider>
  )
}
