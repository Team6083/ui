"use client"

import { useCallback } from "react"

import { useUiLocale, uiMessages, type UiLocale } from "../i18n.js"
import { ApiError } from "../lib/api-error.js"

/**
 * The text to show a user for an error. Standard codes get the package's
 * localized text; an app's own codes come from `appMessages` when given.
 * Otherwise English shows the server's fallback message and other locales a
 * generic one, since the server's message is English only.
 */
export function apiErrorMessage(error: unknown, locale: UiLocale, appMessages?: Record<string, string>): string {
  const m = uiMessages[locale].apiError

  if (error instanceof TypeError) return m.network_error ?? m.fallback
  if (!(error instanceof ApiError)) return m.fallback

  const known = appMessages?.[error.code] ?? m[error.code]
  if (known) return known
  if (locale === "en" && error.message) return error.message
  return m.fallback
}

/** apiErrorMessage in the locale given to <UiProvider>. */
export function useApiErrorMessage(appMessages?: Record<string, string>): (error: unknown) => string {
  const locale = useUiLocale()
  return useCallback((error: unknown) => apiErrorMessage(error, locale, appMessages), [locale, appMessages])
}
