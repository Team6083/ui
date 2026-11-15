"use client"

import { createContext, useContext } from "react"

// The package carries its own strings so it works the same under next-intl and
// react-i18next. Apps pass their current locale to <UiProvider locale>.

export type UiLocale = "en" | "zh-TW"

export interface UiMessages {
  noAccess: { title: string; description: string }
  configError: { title: string; description: string }
  outdated: { title: string; description: string; reload: string }
  apiError: Record<string, string> & { fallback: string }
  colorMode: { label: string; system: string; light: string; dark: string }
  shell: { menu: string; openMenu: string; signIn: string; signOut: string; language: string }
}

export const uiMessages: Record<UiLocale, UiMessages> = {
  en: {
    noAccess: {
      title: "You don't have access to this service",
      description: "Contact an admin to get access.",
    },
    configError: {
      title: "Couldn't load the configuration",
      description: "This app can't start until its configuration is fixed. Contact an admin.",
    },
    outdated: {
      title: "The system has been updated",
      description: "Reload the page to continue. Saving is paused until you reload.",
      reload: "Reload",
    },
    apiError: {
      invalid_request: "Some of the data is invalid. Check it and try again.",
      unauthenticated: "Your session has expired. Sign in again.",
      forbidden: "You don't have permission to do this.",
      missing_role: "You don't have access to this service. Contact an admin.",
      not_found: "This item doesn't exist, or you don't have access to it.",
      version_conflict: "Someone else changed this at the same time. Reload and try again.",
      invalid_transition: "This action isn't allowed in the current state.",
      payload_too_large: "The data is too large.",
      rate_limited: "Too many requests. Wait a moment and try again.",
      internal_error: "Something went wrong on the server. Try again later.",
      config_error: "The service is misconfigured. Contact an admin.",
      upstream_unavailable: "A service this depends on is unavailable. Try again later.",
      upstream_timeout: "A service this depends on took too long to respond. Try again later.",
      app_outdated: "The system has been updated. Reload the page to continue.",
      network_error: "Couldn't reach the server. Check your connection and try again.",
      fallback: "Something went wrong. Try again.",
    },
    colorMode: { label: "Color mode", system: "System", light: "Light", dark: "Dark" },
    shell: { menu: "Menu", openMenu: "Open menu", signIn: "Sign in", signOut: "Sign out", language: "Language" },
  },
  "zh-TW": {
    noAccess: {
      title: "你沒有這個服務的存取權",
      description: "請聯絡 admin。",
    },
    configError: {
      title: "無法載入設定",
      description: "設定修正之前這個服務無法使用，請聯絡 admin。",
    },
    outdated: {
      title: "系統已更新，請重新載入",
      description: "重新載入之前無法儲存變更。",
      reload: "重新載入",
    },
    apiError: {
      invalid_request: "資料有誤，請檢查後再試一次。",
      unauthenticated: "登入已過期，請重新登入。",
      forbidden: "你沒有權限執行這個操作。",
      missing_role: "你沒有這個服務的存取權，請聯絡 admin。",
      not_found: "找不到這筆資料，或你沒有權限查看。",
      version_conflict: "這筆資料剛被其他人修改，請重新載入後再試一次。",
      invalid_transition: "目前的狀態不允許這個操作。",
      payload_too_large: "資料太大。",
      rate_limited: "請求太頻繁，請稍後再試。",
      internal_error: "伺服器發生錯誤，請稍後再試。",
      config_error: "服務設定有誤，請聯絡 admin。",
      upstream_unavailable: "依賴的服務暫時無法使用，請稍後再試。",
      upstream_timeout: "依賴的服務回應逾時，請稍後再試。",
      app_outdated: "系統已更新，請重新載入。",
      network_error: "無法連線到伺服器，請檢查網路後再試一次。",
      fallback: "發生錯誤，請再試一次。",
    },
    colorMode: { label: "外觀", system: "跟隨系統", light: "淺色", dark: "深色" },
    shell: { menu: "選單", openMenu: "開啟選單", signIn: "登入", signOut: "登出", language: "語言" },
  },
}

/** Maps any BCP 47 tag to a supported locale: Chinese → zh-TW, everything else → en. */
export function resolveUiLocale(locale?: string | null): UiLocale {
  return locale?.toLowerCase().startsWith("zh") ? "zh-TW" : "en"
}

const UiLocaleContext = createContext<UiLocale>("en")

export const UiLocaleProvider = UiLocaleContext.Provider

export function useUiLocale(): UiLocale {
  return useContext(UiLocaleContext)
}

export function useUiMessages(): UiMessages {
  return uiMessages[useUiLocale()]
}
