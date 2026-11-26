"use client"

import { Box, EmptyState as ChakraEmptyState, Heading, HStack, Stack, Text, VStack, type BoxProps, type StackProps, type HeadingProps } from "@chakra-ui/react"
import type { ReactNode } from "react"

/**
 * Keeps a page that is read top to bottom (a form, settings, a record) to the
 * 5xl column, centered, in an app whose AppShell is `width="wide"`. In a
 * column app it changes nothing.
 */
export function PageColumn(props: BoxProps) {
  return <Box maxW="5xl" mx="auto" {...props} />
}

export interface TitleBarProps extends Omit<StackProps, "title"> {
  title: ReactNode
  /**
   * Keeps `after` beside the title when the line runs out of room; the title
   * wraps instead. By default `after` moves under the title.
   */
  keepAfterInline?: boolean
  /** The heading's level: 1 for the page's one heading, 2 for its sections, 3–4 inside cards and dialogs. */
  level?: 1 | 2 | 3 | 4
  /** The heading's size; by default it follows `level` (2xl on a phone and 3xl from md, then xl, md, sm). */
  size?: HeadingProps["size"]
  /** Before the title on its line, e.g. a back button, a small `MemberAvatar` or an icon. */
  start?: ReactNode
  /** Right after the title and outside the heading: a status, a count, small tools. */
  after?: ReactNode
  /** Under the title, lined up with it. Text that should start at the edge instead goes under the `TitleBar`. */
  description?: ReactNode
  /**
   * The actions that change what the title is over, always on the right of
   * the title's line; they never wrap. On a narrow screen, keep them short:
   * fewer of them, or icon-only (the app decides, see the demo).
   */
  end?: ReactNode
}

// Only the page's heading changes with the screen: 3xl takes too much of a phone's line.
const SIZE_BY_LEVEL: Record<1 | 2 | 3 | 4, HeadingProps["size"]> = { 1: { base: "2xl", md: "3xl" }, 2: "xl", 3: "md", 4: "sm" }

/**
 * A heading with what belongs beside it, for a page, a section, a card or a
 * dialog alike: start, then the title's line (title, after, end on the right)
 * with the description under it, lined up with the title. It sets no outer spacing; the container decides that. Kept
 * because that layout is the same everywhere and easy to get wrong.
 */
export function TitleBar({ title, level = 2, size, start, after, description, end, keepAfterInline, ...rest }: TitleBarProps) {
  return (
    <HStack align="flex-start" gap="1" {...rest}>
      {start}
      <Stack gap="1" flex="1" minW="0">
        <HStack align="flex-start" gap="3">
          <HStack gap="2" wrap={keepAfterInline ? "nowrap" : "wrap"} flex="1" minW="0">
            <Heading as={`h${level}`} size={size ?? SIZE_BY_LEVEL[level]}>
              {title}
            </Heading>
            {after != null && (
              <HStack gap="2" flexShrink={0}>
                {after}
              </HStack>
            )}
          </HStack>
          {end != null && (
            <HStack gap="2" flexShrink={0}>
              {end}
            </HStack>
          )}
        </HStack>
        {description != null && <Text color="fg.muted">{description}</Text>}
      </Stack>
    </HStack>
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
