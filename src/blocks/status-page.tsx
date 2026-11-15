"use client"

import { Center, Heading, HStack, Icon, Stack, Text, type CenterProps } from "@chakra-ui/react"
import type { ReactNode } from "react"

export interface StatusPageProps extends Omit<CenterProps, "title"> {
  icon?: ReactNode
  title: ReactNode
  description?: ReactNode
  /** Buttons or links that offer the way out. */
  actions?: ReactNode
}

/** A full-page message about why the page can't show its content. */
export function StatusPage({ icon, title, description, actions, children, ...rest }: StatusPageProps) {
  return (
    <Center minH="60vh" px="4" py="12" {...rest}>
      <Stack gap="4" align="center" textAlign="center" maxW="md">
        {icon && (
          <Icon size="2xl" color="fg.muted" aria-hidden>
            {icon}
          </Icon>
        )}
        <Heading as="h1" size="xl">
          {title}
        </Heading>
        {description && <Text color="fg.muted">{description}</Text>}
        {children}
        {actions && (
          <HStack gap="2" wrap="wrap" justify="center">
            {actions}
          </HStack>
        )}
      </Stack>
    </Center>
  )
}
