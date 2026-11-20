"use client"

import { Badge, Box, EmptyState as ChakraEmptyState, Flex, Heading, HStack, Stack, Text, VStack, type BoxProps, type FlexProps } from "@chakra-ui/react"
import type { ReactNode } from "react"

/**
 * Keeps a page that is read top to bottom (a form, settings, a record) to the
 * 5xl column, centered, in an app whose AppShell is `width="wide"`. In a
 * column app it changes nothing.
 */
export function PageColumn(props: BoxProps) {
  return <Box maxW="5xl" mx="auto" {...props} />
}

export interface PageHeaderProps extends Omit<FlexProps, "title"> {
  title: ReactNode
  /** A status or tag beside the title, outside the heading (e.g. the batch's status). */
  badge?: ReactNode
  description?: ReactNode
  /** The page's own actions, e.g. 建立團隊; never navigation. */
  actions?: ReactNode
}

/** The one heading of a page, with the actions that change its content beside it. */
export function PageHeader({ title, badge, description, actions, ...rest }: PageHeaderProps) {
  return (
    <Flex align={{ base: "stretch", sm: "flex-start" }} direction={{ base: "column", sm: "row" }} justify="space-between" gap="3" mb="4" {...rest}>
      <Stack gap="1" minW="0">
        <HStack gap="3" wrap="wrap">
          <Heading as="h1" size="3xl">
            {title}
          </Heading>
          {badge}
        </HStack>
        {description && <Text color="fg.muted">{description}</Text>}
      </Stack>
      {actions && (
        <HStack gap="2" flexShrink={0}>
          {actions}
        </HStack>
      )}
    </Flex>
  )
}

export interface SectionHeaderProps extends Omit<FlexProps, "title"> {
  title: ReactNode
  /** How many items the section holds, shown as a badge after the title. */
  count?: number
  /** Small controls (refresh, filter) right after the title. */
  tools?: ReactNode
  /** The section's own actions, on the right. */
  actions?: ReactNode
  as?: "h2" | "h3"
}

/** One group on a page: a title, its count, and what can be done to it. */
export function SectionHeader({ title, count, tools, actions, as = "h2", ...rest }: SectionHeaderProps) {
  return (
    <Flex align="center" justify="space-between" gap="3" wrap="wrap" mb="3" {...rest}>
      <HStack gap="2" minW="0">
        <Heading as={as} size={as === "h2" ? "xl" : "md"}>
          {title}
        </Heading>
        {count !== undefined && (
          <Badge colorPalette="brand" size="md">
            {count}
          </Badge>
        )}
        {tools}
      </HStack>
      {actions && <HStack gap="2">{actions}</HStack>}
    </Flex>
  )
}

export interface EmptyStateProps extends Omit<ChakraEmptyState.RootProps, "title"> {
  icon?: ReactNode
  /** Short and specific: 現在沒人, 還沒有採購批次. */
  title: ReactNode
  /** What to do next. */
  description?: ReactNode
  actions?: ReactNode
}

/** What a list or section shows with nothing in it, instead of a bare line of text. */
export function EmptyState({ icon, title, description, actions, ...rest }: EmptyStateProps) {
  return (
    <ChakraEmptyState.Root size="sm" {...rest}>
      <ChakraEmptyState.Content>
        {icon && <ChakraEmptyState.Indicator>{icon}</ChakraEmptyState.Indicator>}
        <VStack textAlign="center">
          <ChakraEmptyState.Title>{title}</ChakraEmptyState.Title>
          {description && <ChakraEmptyState.Description>{description}</ChakraEmptyState.Description>}
        </VStack>
        {actions}
      </ChakraEmptyState.Content>
    </ChakraEmptyState.Root>
  )
}
