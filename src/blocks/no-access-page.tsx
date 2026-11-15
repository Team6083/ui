"use client"

import { LuShieldX } from "react-icons/lu"

import { useUiMessages } from "../i18n.js"
import { StatusPage, type StatusPageProps } from "./status-page.js"

export type NoAccessPageProps = Partial<Omit<StatusPageProps, "icon">>

/**
 * Shown when the API answers 403 missing_role (the user is signed in but has
 * none of ALLOWED_ROLES). Every app shows this same page; pass a sign-out
 * button as `actions` so the user can switch accounts.
 */
export function NoAccessPage(props: NoAccessPageProps) {
  const m = useUiMessages().noAccess
  return <StatusPage icon={<LuShieldX />} title={m.title} description={m.description} {...props} />
}
