"use client"

import {
  Badge,
  Box,
  Button,
  Flex,
  HStack,
  Input,
  InputGroup,
  Popover,
  Portal,
  Separator,
  SimpleGrid,
  Stack,
  Text,
  type FlexProps,
  type PopoverRootProps,
  type SimpleGridProps,
  type StackProps,
} from "@chakra-ui/react"
import type { ReactNode } from "react"
import { LuListFilter, LuSearch, LuX } from "react-icons/lu"

import { useUiMessages } from "../i18n.js"

export interface FilterBarProps extends Omit<FlexProps, "children"> {
  search?: { value: string; onChange: (value: string) => void; placeholder?: string }
  /** How many filters are set; shown on the button so a filtered list never looks complete. */
  activeCount?: number
  onClear?: () => void
  /** The filter fields (selects, date pickers), shown in a popover under the 篩選 button. */
  children?: ReactNode
  /** Actions on the right of the bar, e.g. 新增批次 when the page header is far away. */
  actions?: ReactNode
  /**
   * Where the filter popover opens, merged over the default (below the button,
   * flipping above it when there is no room).
   */
  positioning?: PopoverRootProps["positioning"]
}

/** A search box and one 篩選 button, instead of a row of always-open selects. */
export function FilterBar({ search, activeCount = 0, onClear, children, actions, positioning, ...rest }: FilterBarProps) {
  const m = useUiMessages().data
  return (
    <Flex gap="2" align="center" wrap="wrap" mb="3" {...rest}>
      {search && (
        <InputGroup startElement={<LuSearch />} flex="1" minW="48" maxW={{ md: "sm" }}>
          <Input size="sm" value={search.value} onChange={(e) => search.onChange(e.currentTarget.value)} placeholder={search.placeholder ?? m.search} aria-label={search.placeholder ?? m.search} />
        </InputGroup>
      )}
      {children && (
        <Popover.Root positioning={{ placement: "bottom-start", ...positioning }} lazyMount unmountOnExit>
          <Popover.Trigger asChild>
            <Button size="sm" variant="outline">
              <LuListFilter />
              {m.filter}
              {activeCount > 0 && (
                <Badge size="sm" colorPalette="brand" variant="solid">
                  {activeCount}
                </Badge>
              )}
            </Button>
          </Popover.Trigger>
          <Portal>
            <Popover.Positioner>
              {/* Content is capped at the room left on screen; scroll inside it instead of spilling over the page. */}
              <Popover.Content w="xs" overflowY="auto">
                <Popover.Body>
                  <Stack gap="3">{children}</Stack>
                </Popover.Body>
                {onClear && activeCount > 0 && (
                  <Popover.Footer justifyContent="flex-end">
                    <Button size="xs" variant="ghost" onClick={onClear}>
                      {m.clearFilters}
                    </Button>
                  </Popover.Footer>
                )}
              </Popover.Content>
            </Popover.Positioner>
          </Portal>
        </Popover.Root>
      )}
      {onClear && activeCount > 0 && (
        <Button size="sm" variant="ghost" onClick={onClear}>
          <LuX />
          {m.clearFilters}
        </Button>
      )}
      {actions && (
        <HStack gap="2" ms="auto">
          {actions}
        </HStack>
      )}
    </Flex>
  )
}

export interface SelectionBarProps extends Omit<FlexProps, "children"> {
  count: number
  onClear: () => void
  /** What can be done to the picked rows; the main one solid, the rest outline. */
  children: ReactNode
}

/**
 * Appears once rows are picked, pinned to the bottom of the screen, with what
 * can be done to them. Actions on a pick live here instead of as disabled
 * "(0)" buttons above the table.
 */
export function SelectionBar({ count, onClear, children, ...rest }: SelectionBarProps) {
  const m = useUiMessages().data
  if (count === 0) return null
  return (
    <Flex
      role="region"
      aria-label={m.selected.replace("{count}", String(count))}
      position="sticky"
      bottom="4"
      zIndex="sticky"
      mt="3"
      align="center"
      gap="3"
      wrap="wrap"
      bg="bg.panel"
      borderWidth="1px"
      rounded="l3"
      shadow="lg"
      px="4"
      py="2.5"
      {...rest}
    >
      <Text fontWeight="medium" fontVariantNumeric="tabular-nums">
        {m.selected.replace("{count}", String(count))}
      </Text>
      <Button size="xs" variant="ghost" onClick={onClear}>
        {m.clearSelection}
      </Button>
      <HStack gap="2" ms="auto" wrap="wrap">
        {children}
      </HStack>
    </Flex>
  )
}

export interface Fact {
  label: ReactNode
  value: ReactNode
}

export interface FactListProps extends Omit<SimpleGridProps, "children"> {
  items: Fact[]
}

/** One record's facts in a grid of label over value; columns at least 12rem wide, so dates never wrap. */
export function FactList({ items, ...rest }: FactListProps) {
  return (
    <SimpleGrid as="dl" minChildWidth="12rem" gap="4" {...rest}>
      {items.map((item, i) => (
        <Box key={i} minW="0">
          <Text as="dt" textStyle="xs" color="fg.muted">
            {item.label}
          </Text>
          <Box as="dd">{item.value}</Box>
        </Box>
      ))}
    </SimpleGrid>
  )
}

export interface TotalsLine {
  label: ReactNode
  value: ReactNode
  /** The bottom line (the total to pay); set apart and in bold. */
  emphasis?: boolean
  hint?: ReactNode
}

export interface TotalsProps extends StackProps {
  lines: TotalsLine[]
}

/** Amounts that add up, right-aligned under a list or table; the emphasized line is the total. */
export function Totals({ lines, ...rest }: TotalsProps) {
  return (
    <Stack gap="1.5" ms="auto" w="full" maxW={{ md: "sm" }} {...rest}>
      {lines.map((line, i) => (
        <Box key={i}>
          {line.emphasis && i > 0 && <Separator mb="1.5" />}
          <HStack justify="space-between" gap="4" fontWeight={line.emphasis ? "semibold" : undefined}>
            <Text color={line.emphasis ? "fg" : "fg.muted"}>{line.label}</Text>
            <Text fontVariantNumeric="tabular-nums" whiteSpace="nowrap">
              {line.value}
            </Text>
          </HStack>
          {line.hint && (
            <Text textStyle="xs" color="fg.muted" textAlign="end">
              {line.hint}
            </Text>
          )}
        </Box>
      ))}
    </Stack>
  )
}
