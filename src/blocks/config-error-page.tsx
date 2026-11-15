"use client"

import { Box, List } from "@chakra-ui/react"
import { LuSettings } from "react-icons/lu"

import { useUiMessages } from "../i18n.js"
import { ConfigError } from "../lib/runtime-config.js"
import { StatusPage, type StatusPageProps } from "./status-page.js"

export interface ConfigErrorPageProps extends Partial<Omit<StatusPageProps, "icon">> {
  /** What went wrong; a ConfigError lists each problem on its own line. */
  error?: unknown
}

function issuesOf(error: unknown): string[] {
  if (error instanceof ConfigError) return error.issues
  if (error instanceof Error) return [error.message]
  return error === undefined ? [] : [String(error)]
}

/** Shown instead of the app when config.json can't be loaded or is invalid. */
export function ConfigErrorPage({ error, ...props }: ConfigErrorPageProps) {
  const m = useUiMessages().configError
  const issues = issuesOf(error)

  return (
    <StatusPage icon={<LuSettings />} title={m.title} description={m.description} {...props}>
      {issues.length > 0 && (
        <Box w="full" textAlign="start" bg="bg.muted" rounded="l2" px="4" py="3">
          <List.Root fontFamily="mono" textStyle="sm" gap="1" ps="4">
            {issues.map((issue) => (
              <List.Item key={issue}>{issue}</List.Item>
            ))}
          </List.Root>
        </Box>
      )}
    </StatusPage>
  )
}
