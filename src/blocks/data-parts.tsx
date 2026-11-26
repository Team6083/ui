"use client"

import {
  Badge,
  Button,
  DataList,
  Flex,
  HStack,
  Input,
  InputGroup,
  Popover,
  Portal,
  Stack,
  Text,
  type ConditionalValue,
  type FlexProps,
  type PopoverRootProps,
} from "@chakra-ui/react"
import { useRef, type ReactNode } from "react"
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
   * flipping above it when there is no room). While it is open it keeps the
   * button's horizontal place and width from when it opened; passing
   * `getAnchorRect` replaces that.
   */
  positioning?: PopoverRootProps["positioning"]
}

/** A search box and one 篩選 button, instead of a row of always-open selects. */
export function FilterBar({ search, activeCount = 0, onClear, children, actions, positioning, ...rest }: FilterBarProps) {
  const m = useUiMessages().data
  // The button's left edge (in the page) and width when the popover opened. The button grows
  // with the badge, and on a phone moves as the search box shrinks; the open popover keeps to
  // this instead, so it doesn't slide sideways. Its vertical place is live, so it still
  // follows scrolling, flips and its own size. Cleared on close: the next open measures again.
  const openedAt = useRef<{ left: number; width: number } | null>(null)
  const anchorRect: NonNullable<PopoverRootProps["positioning"]>["getAnchorRect"] = (el) => {
    if (!el) return null
    const r = el.getBoundingClientRect()
    openedAt.current ??= { left: r.left + window.scrollX, width: r.width }
    return { x: openedAt.current.left - window.scrollX, y: r.top, width: openedAt.current.width, height: r.height }
  }
  return (
    <Flex gap="2" align="center" wrap="wrap" mb="3" {...rest}>
      {search && (
        <InputGroup startElement={<LuSearch />} flex="1" minW="48" maxW={{ md: "sm" }}>
          <Input size="sm" value={search.value} onChange={(e) => search.onChange(e.currentTarget.value)} placeholder={search.placeholder ?? m.search} aria-label={search.placeholder ?? m.search} />
        </InputGroup>
      )}
      {children && (
        <Popover.Root
          positioning={{ placement: "bottom-start", getAnchorRect: anchorRect, ...positioning }}
          onOpenChange={(e) => {
            if (!e.open) openedAt.current = null
          }}
          lazyMount
          unmountOnExit
        >
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

export interface FactListProps extends Omit<DataList.RootProps, "children"> {
  items: Fact[]
  /**
   * The narrowest a column may get; as many columns as fit side by side.
   * Defaults to 9rem on a phone (two columns) and 12rem from md, so a date and
   * time never wrap.
   */
  minChildWidth?: ConditionalValue<string>
}

const columnsOf = (width: string) => `repeat(auto-fit, minmax(${width}, 1fr))`

function gridColumns(width: ConditionalValue<string>): ConditionalValue<string> {
  if (typeof width === "string") return columnsOf(width)
  if (Array.isArray(width)) return width.map((w) => (w == null ? w : columnsOf(w)))
  return Object.fromEntries(Object.entries(width).map(([bp, w]) => [bp, w == null ? w : columnsOf(w as string)]))
}

/**
 * One record's facts, label over value, in as many columns as fit.
 *
 * Chakra's DataList stacks items in one column; a record's page needs them side
 * by side, with columns wide enough that a date and time never wrap. Pass the
 * facts as a list instead of writing out DataList's parts for each one.
 */
export function FactList({ items, minChildWidth = { base: "9rem", md: "12rem" }, ...rest }: FactListProps) {
  return (
    <DataList.Root orientation="vertical" display="grid" gridTemplateColumns={gridColumns(minChildWidth)} {...rest}>
      {items.map((item, i) => (
        <DataList.Item key={i} minW="0">
          <DataList.ItemLabel>{item.label}</DataList.ItemLabel>
          <DataList.ItemValue>{item.value}</DataList.ItemValue>
        </DataList.Item>
      ))}
    </DataList.Root>
  )
}

export interface TotalsLine {
  label: ReactNode
  value: ReactNode
  /** The bottom line (the total to pay); set apart and in bold. */
  emphasis?: boolean
  /** A note under the amount, e.g. how shipping is charged. */
  hint?: ReactNode
}

export interface TotalsProps extends Omit<DataList.RootProps, "children"> {
  lines: TotalsLine[]
}

/**
 * Amounts that add up, under a list or table: right-aligned in tabular figures,
 * the emphasized line (the total) set apart by a rule and in bold.
 *
 * Built on Chakra's horizontal DataList; this adds the alignment and the total's
 * emphasis so every app's totals read the same.
 */
export function Totals({ lines, ...rest }: TotalsProps) {
  return (
    <DataList.Root orientation="horizontal" gap="2" ms="auto" w="full" maxW={{ md: "sm" }} {...rest}>
      {lines.map((line, i) => (
        <DataList.Item
          key={i}
          justifyContent="space-between"
          alignItems="flex-start"
          fontWeight={line.emphasis ? "semibold" : undefined}
          {...(line.emphasis && i > 0 ? { borderTopWidth: "1px", pt: "2" } : {})}
        >
          <DataList.ItemLabel minW="0" color={line.emphasis ? "fg" : undefined}>
            {line.label}
          </DataList.ItemLabel>
          <DataList.ItemValue flexDirection="column" alignItems="flex-end" textAlign="end">
            <Text as="span" fontVariantNumeric="tabular-nums" whiteSpace="nowrap">
              {line.value}
            </Text>
            {line.hint && (
              <Text as="span" textStyle="xs" color="fg.muted" fontWeight="normal">
                {line.hint}
              </Text>
            )}
          </DataList.ItemValue>
        </DataList.Item>
      ))}
    </DataList.Root>
  )
}
