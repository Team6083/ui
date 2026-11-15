"use client"

import type { IconButtonProps, SpanProps } from "@chakra-ui/react"
import { ClientOnly, IconButton, Menu, Portal, Skeleton, Span } from "@chakra-ui/react"
import { useUiMessages } from "../i18n.js"
import { ThemeProvider, useTheme } from "next-themes"
import type { ThemeProviderProps } from "next-themes"
import * as React from "react"
import { LuMonitor, LuMoon, LuSun } from "react-icons/lu"

export type ColorModeProviderProps = ThemeProviderProps

export function ColorModeProvider(props: ColorModeProviderProps) {
  return (
    <ThemeProvider attribute="class" disableTransitionOnChange {...props} />
  )
}

export type ColorMode = "light" | "dark"
/** What the user picked: follow the system, or always light or dark. */
export type ColorModePreference = "system" | ColorMode

export interface UseColorModeReturn {
  /** The mode on screen now. */
  colorMode: ColorMode
  /** The user's choice; "system" follows the operating system. */
  preference: ColorModePreference
  setColorMode: (preference: ColorModePreference) => void
  toggleColorMode: () => void
}

export function useColorMode(): UseColorModeReturn {
  const { theme, resolvedTheme, setTheme, forcedTheme } = useTheme()
  const colorMode = forcedTheme || resolvedTheme
  const preference = theme === "light" || theme === "dark" ? theme : "system"
  const toggleColorMode = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark")
  }
  return {
    colorMode: colorMode as ColorMode,
    preference,
    setColorMode: setTheme,
    toggleColorMode,
  }
}

export function useColorModeValue<T>(light: T, dark: T) {
  const { colorMode } = useColorMode()
  return colorMode === "dark" ? dark : light
}

export function ColorModeIcon() {
  const { colorMode } = useColorMode()
  return colorMode === "dark" ? <LuMoon /> : <LuSun />
}

type ColorModeButtonProps = Omit<IconButtonProps, "aria-label">

const PREFERENCE_ICONS: Record<ColorModePreference, React.ReactNode> = {
  system: <LuMonitor />,
  light: <LuSun />,
  dark: <LuMoon />,
}

/** An icon button showing the current choice; it opens a menu of system, light and dark. */
export const ColorModeButton = React.forwardRef<
  HTMLButtonElement,
  ColorModeButtonProps
>(function ColorModeButton(props, ref) {
  const { preference, setColorMode } = useColorMode()
  const m = useUiMessages().colorMode
  return (
    <ClientOnly fallback={<Skeleton boxSize="9" />}>
      <Menu.Root positioning={{ placement: "bottom-end" }}>
        <Menu.Trigger asChild>
          <IconButton
            variant="ghost"
            aria-label={m.label}
            size="sm"
            ref={ref}
            {...props}
            css={{
              _icon: {
                width: "5",
                height: "5",
              },
            }}
          >
            {PREFERENCE_ICONS[preference]}
          </IconButton>
        </Menu.Trigger>
        <Portal>
          <Menu.Positioner>
            <Menu.Content>
              <Menu.RadioItemGroup value={preference} onValueChange={(e) => setColorMode(e.value as ColorModePreference)}>
                {(["system", "light", "dark"] as const).map((value) => (
                  <Menu.RadioItem key={value} value={value}>
                    {PREFERENCE_ICONS[value]}
                    <Menu.ItemText>{m[value]}</Menu.ItemText>
                    <Menu.ItemIndicator />
                  </Menu.RadioItem>
                ))}
              </Menu.RadioItemGroup>
            </Menu.Content>
          </Menu.Positioner>
        </Portal>
      </Menu.Root>
    </ClientOnly>
  )
})

export const LightMode = React.forwardRef<HTMLSpanElement, SpanProps>(
  function LightMode(props, ref) {
    return (
      <Span
        color="fg"
        display="contents"
        className="chakra-theme light"
        colorPalette="gray"
        colorScheme="light"
        ref={ref}
        {...props}
      />
    )
  },
)

export const DarkMode = React.forwardRef<HTMLSpanElement, SpanProps>(
  function DarkMode(props, ref) {
    return (
      <Span
        color="fg"
        display="contents"
        className="chakra-theme dark"
        colorPalette="gray"
        colorScheme="dark"
        ref={ref}
        {...props}
      />
    )
  },
)
