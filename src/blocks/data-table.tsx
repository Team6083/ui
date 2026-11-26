"use client"

import { Box, ButtonGroup, Button, Checkbox, Flex, HStack, IconButton, Menu, NativeSelect, Pagination, Portal, Table, Text, useChakraContext, type TableRootProps } from "@chakra-ui/react"
import { Fragment, useEffect, useRef, type ReactNode } from "react"
import { LuArrowDown, LuArrowUp, LuArrowUpDown, LuChevronLeft, LuChevronRight, LuEllipsis } from "react-icons/lu"

import { useUiLocale, useUiMessages } from "../i18n.js"

export type SortDirection = "asc" | "desc"

export interface DataSort {
  by: { key: string; direction: SortDirection } | null
  onChange: (by: { key: string; direction: SortDirection } | null) => void
}

export interface DataPagination {
  /** 1-based. */
  page: number
  pageSize: number
  onPageChange: (page: number) => void
  /** Shows the rows-per-page select when given; the page goes back to 1 with it. */
  onPageSizeChange?: (pageSize: number) => void
  /** Choices in the rows-per-page select; defaults to `[10, 25, 50]`. */
  pageSizes?: number[]
  /** Total rows when the server pages (`rows` is then the current page); leave out to page `rows` in the browser. */
  count?: number
}

export interface DataColumn<T> {
  key: string
  header: ReactNode
  /** The header as text, for the label in front of the value on a phone; defaults to `header` when it is a string. */
  label?: string
  cell: (row: T) => ReactNode
  /**
   * Makes the header a sort button (needs the table's `sort`): the value rows
   * are compared by. `null` sorts last in either direction.
   */
  sortValue?: (row: T) => string | number | Date | null
  /** Amounts, quantities, prices: right-aligned with tabular figures. */
  numeric?: boolean
  /**
   * "primary": the row's name; the title of the row's card on a phone.
   * "secondary": detail that can go when space runs out; hidden below lg.
   */
  priority?: "primary" | "secondary"
  width?: string
}

export interface RowAction {
  value: string
  label: ReactNode
  icon?: ReactNode
  onSelect: () => void
  /** Destructive actions (cancel, delete, mark unpurchasable) are shown in red. */
  danger?: boolean
  disabled?: boolean
}

export interface DataTableSelection<T> {
  selected: readonly string[]
  onChange: (ids: string[]) => void
  /** Rows that cannot be picked get no checkbox. */
  canSelect?: (row: T) => boolean
}

export interface DataTableProps<T> extends Omit<TableRootProps, "children" | "rows" | "columns"> {
  rows: T[]
  columns: DataColumn<T>[]
  getRowId: (row: T) => string
  /** Checkboxes for picking rows; act on the pick with a SelectionBar. */
  selection?: DataTableSelection<T>
  /**
   * Controlled sorting for the columns with a `sortValue`: a header click goes
   * ascending, descending, then off. On a phone, where cards have no headers,
   * the table shows a sort select instead. Not applied when `pagination.count`
   * is set: the server sorts and `rows` arrive in order.
   */
  sort?: DataSort
  /** Splits the rows into pages, under the table. Picks persist across pages; the header checkbox picks the current page. */
  pagination?: DataPagination
  /** A row's actions, folded into one ⋯ menu at the end of the row. */
  rowActions?: (row: T) => RowAction[]
  /** Splits the rows under group headings (e.g. by vendor), in first-seen order. */
  groupBy?: (row: T) => string
  /** Gets all of the group's rows, not just the ones on this page. */
  groupLabel?: (key: string, rows: T[]) => ReactNode
  /** Shown instead of the table when there are no rows, e.g. an EmptyState. */
  empty?: ReactNode
  /** Names the table for screen readers. */
  "aria-label"?: string
}

type SortValue = string | number | Date | null

// Invalid dates, NaN and null all count as "no value" and sort last, whichever the direction.
function normalize(v: SortValue): string | number | null {
  const x = v instanceof Date ? v.getTime() : v
  return x === null || (typeof x === "number" && Number.isNaN(x)) ? null : x
}

function compareValues(a: SortValue, b: SortValue, collator: Intl.Collator, sign: number) {
  const x = normalize(a)
  const y = normalize(b)
  if (x === null || y === null) return x === y ? 0 : x === null ? 1 : -1
  const order = typeof x === "number" && typeof y === "number" ? x - y : collator.compare(String(x), String(y))
  return order * sign
}

function nextSort(by: DataSort["by"], key: string): DataSort["by"] {
  if (by?.key !== key) return { key, direction: "asc" }
  return by.direction === "asc" ? { key, direction: "desc" } : null
}

function groupRows<T>(rows: T[], groupBy?: (row: T) => string): [string, T[]][] {
  if (!groupBy) return [["", rows]]
  const groups = new Map<string, T[]>()
  for (const row of rows) {
    const key = groupBy(row)
    groups.set(key, [...(groups.get(key) ?? []), row])
  }
  return [...groups]
}

// Below md the same rows lay out as cards: one DOM, so tests and screen readers see one table.
const cardRow = {
  display: { base: "block", md: "table-row" },
  borderWidth: { base: "1px", md: "0" },
  rounded: { base: "l3", md: "0" },
  px: { base: "3", md: "0" },
  py: { base: "2", md: "0" },
  mb: { base: "3", md: "0" },
  position: "relative",
} as const

const cardCell = {
  display: { base: "flex", md: "table-cell" },
  justifyContent: "space-between",
  gap: "4",
  borderBottomWidth: { base: "0", md: "1px" },
  px: { base: "0", md: "3" },
  py: { base: "1", md: "2" },
  _before: { base: { content: "attr(data-label)", color: "fg.muted", flexShrink: 0 }, md: { content: "none" } },
} as const

// A card's name and checkbox have no label: they start at the left, with no empty label taking up the gap.
const unlabeledCell = { ...cardCell, justifyContent: "flex-start", _before: { content: "none" } } as const

// On a card the checkbox sits at the top left, beside the first line, instead of on a line of its own.
const cardCheckboxCell = {
  ...unlabeledCell,
  position: { base: "absolute", md: "static" },
  insetStart: "3",
  top: "2.5",
  py: { base: "0", md: "2" },
} as const

// The select shows the default order when `by` names a column that cannot sort.
function sortSelectValue<T>(key: string, sortable: DataColumn<T>[]) {
  return sortable.some((c) => c.key === key) ? key : ""
}

/**
 * The table for records people pick from and act on: numbers right-aligned,
 * secondary columns dropped when space runs out, a row's actions in one ⋯
 * menu, optional checkboxes and group headings, and cards instead of columns
 * on a phone.
 */
export function DataTable<T>({
  rows,
  columns,
  getRowId,
  selection,
  sort,
  pagination,
  rowActions,
  groupBy,
  groupLabel,
  empty,
  ...rest
}: DataTableProps<T>) {
  const m = useUiMessages().data
  const locale = useUiLocale()
  // Style props (margins, width…) go on the whole block; the rest (size, variant, aria-label…) on the table.
  const [blockStyle, tableProps] = useChakraContext().splitCssProps(rest)

  // Sort, then page, then group. With groupBy the groups keep their first-seen
  // order and rows sort within each, so the page still slices what the sort shows.
  const sortColumn = sort?.by && pagination?.count === undefined ? columns.find((c) => c.key === sort.by!.key && c.sortValue) : undefined
  const sorted = (() => {
    const active = sortColumn?.sortValue && sort?.by
    // Groups keep their first-seen order whether or not a sort is active, so a page never repeats a group.
    if (!active) return groupBy ? groupRows(rows, groupBy).flatMap(([, list]) => list) : rows
    const collator = new Intl.Collator(locale)
    const sign = sort.by!.direction === "asc" ? 1 : -1
    const value = sortColumn!.sortValue!
    const sortGroup = (list: T[]) => [...list].sort((a, b) => compareValues(value(a), value(b), collator, sign))
    return groupBy ? groupRows(rows, groupBy).flatMap(([, list]) => sortGroup(list)) : sortGroup(rows)
  })()

  // A group's label sees the whole group, even when its rows span pages (in server paging, only the rows it was given).
  const fullGroups = new Map(groupBy ? groupRows(sorted, groupBy) : [])

  const total = pagination ? (pagination.count ?? sorted.length) : sorted.length
  const pageSize = Math.max(1, pagination?.pageSize ?? 1)
  const pageCount = Math.max(1, Math.ceil(total / pageSize))
  const page = pagination ? Math.min(Math.max(1, pagination.page), pageCount) : 1
  const pageRows = pagination && pagination.count === undefined ? sorted.slice((page - 1) * pageSize, page * pageSize) : sorted

  // A list that shrank below the current page asks the app for the last page once, not on every render.
  const paginationRef = useRef(pagination)
  useEffect(() => {
    paginationRef.current = pagination
  })
  const requestedPage = pagination?.page
  const loaded = total > 0 // an empty total is usually rows still loading; keep the requested page until they arrive
  useEffect(() => {
    if (loaded && requestedPage !== undefined && requestedPage > pageCount) paginationRef.current?.onPageChange(pageCount)
  }, [requestedPage, pageCount, loaded])

  if (rows.length === 0 && empty) return <Box {...blockStyle}>{empty}</Box>

  const selected = new Set(selection?.selected ?? [])
  const selectable = selection ? pageRows.filter((r) => selection.canSelect?.(r) ?? true) : []
  const toggle = (ids: string[], on: boolean) => {
    if (!selection) return
    const next = new Set(selected)
    for (const id of ids) {
      if (on) next.add(id)
      else next.delete(id)
    }
    selection.onChange([...next])
  }
  const allState = (ids: string[]) => {
    const picked = ids.filter((id) => selected.has(id)).length
    return picked === 0 ? false : picked === ids.length ? true : "indeterminate"
  }
  const span = columns.length + (selection ? 1 : 0) + (rowActions ? 1 : 0)
  const sortable = sort ? columns.filter((c) => c.sortValue) : []
  const columnText = (c: DataColumn<T>) => c.label ?? (typeof c.header === "string" ? c.header : c.key)
  const hideSecondary = (c: DataColumn<T>) => (c.priority === "secondary" ? { hideBelow: "lg" as const } : {})

  const checkbox = (checked: boolean | "indeterminate", label: string, onChange: (on: boolean) => void) => (
    <Checkbox.Root size="sm" checked={checked} onCheckedChange={(e) => onChange(e.checked === true)} aria-label={label}>
      <Checkbox.HiddenInput />
      <Checkbox.Control />
    </Checkbox.Root>
  )

  const sortByValue = sort?.by?.key ?? ""
  const sortSelect = sortable.length > 0 && sort && (
    <HStack hideFrom="md" gap="2">
      <NativeSelect.Root size="sm" flex="1">
        <NativeSelect.Field
          aria-label={m.sortBy}
          value={sortSelectValue(sortByValue, sortable)}
          onChange={(e) => {
            const key = e.currentTarget.value
            sort.onChange(key ? { key, direction: sort.by?.direction ?? "asc" } : null)
          }}
        >
          <option value="">{m.defaultOrder}</option>
          {sortable.map((c) => (
            <option key={c.key} value={c.key}>
              {m.sortBy}: {columnText(c)}
            </option>
          ))}
        </NativeSelect.Field>
        <NativeSelect.Indicator />
      </NativeSelect.Root>
      {sort.by && (
        <IconButton
          size="sm"
          variant="outline"
          aria-label={sort.by.direction === "asc" ? m.sortDescending : m.sortAscending}
          onClick={() => sort.onChange({ key: sort.by!.key, direction: sort.by!.direction === "asc" ? "desc" : "asc" })}
        >
          {sort.by.direction === "asc" ? <LuArrowUp /> : <LuArrowDown />}
        </IconButton>
      )}
    </HStack>
  )

  const fill = (text: string, values: Record<string, string | number>) => text.replace(/\{(\w+)\}/g, (_, k: string) => String(values[k] ?? ""))
  const sizes = pagination ? [...new Set([...(pagination.pageSizes ?? [10, 25, 50]), pageSize])].sort((x, y) => x - y) : []
  // The size select stays while some size would split the list, so a big pick can be undone.
  const pager = pagination && (total > pageSize || (pagination.onPageSizeChange && total > sizes[0]!)) && (
    <Flex gap="3" align="center" justify="space-between" wrap="wrap">
      <HStack gap="3">
        <Text textStyle="sm" color="fg.muted" fontVariantNumeric="tabular-nums">
          {fill(m.range, { from: (page - 1) * pageSize + 1, to: Math.min(page * pageSize, total), total })}
        </Text>
        {pagination.onPageSizeChange && (
          <NativeSelect.Root size="xs" w="auto">
            <NativeSelect.Field
              aria-label={m.rowsPerPage}
              value={pageSize}
              onChange={(e) => {
                pagination.onPageSizeChange!(Number(e.currentTarget.value))
                pagination.onPageChange(1)
              }}
            >
              {sizes.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
        )}
      </HStack>
      {total > pageSize && (
      <Pagination.Root
        count={total}
        pageSize={pageSize}
        page={page}
        onPageChange={(e) => pagination.onPageChange(e.page)}
        translations={{
          rootLabel: m.pagination,
          prevTriggerLabel: m.previousPage,
          nextTriggerLabel: m.nextPage,
          itemLabel: ({ page: n }) => fill(m.goToPage, { page: n }),
        }}
      >
        <ButtonGroup variant="ghost" size="sm" attached={false}>
          <Pagination.PrevTrigger asChild>
            <IconButton>
              <LuChevronLeft />
            </IconButton>
          </Pagination.PrevTrigger>
          <Pagination.Items
            ellipsis={
              <IconButton as="span" variant="ghost" hideBelow="md">
                <LuEllipsis />
              </IconButton>
            }
            render={(item) => (
              <IconButton hideBelow="md" variant={{ base: "ghost", _selected: "outline" }}>
                {item.value}
              </IconButton>
            )}
          />
          <Text hideFrom="md" textStyle="sm" px="2" fontVariantNumeric="tabular-nums" aria-live="polite">
            {fill(m.pageOf, { page, pages: pageCount })}
          </Text>
          <Pagination.NextTrigger asChild>
            <IconButton>
              <LuChevronRight />
            </IconButton>
          </Pagination.NextTrigger>
        </ButtonGroup>
      </Pagination.Root>
      )}
    </Flex>
  )

  return (
    // A Box, not a Stack: the app's style props come last so they win (display, gap), and the CSS
    // `direction` property must not be read as Stack's flex direction.
    <Box display="flex" flexDirection="column" gap="3" {...blockStyle}>
    {sortSelect}
    <Table.ScrollArea>
      <Table.Root size="sm" display={{ base: "block", md: "table" }} {...tableProps}>
        {/* Header cells take the body cells' padding, so the checkboxes and column text line up. */}
        <Table.Header display={{ base: "none", md: "table-header-group" }}>
          <Table.Row>
            {selection && (
              <Table.ColumnHeader w="10" px="3">
                {selectable.length > 0 && checkbox(allState(selectable.map(getRowId)), m.selectAll, (on) => toggle(selectable.map(getRowId), on))}
              </Table.ColumnHeader>
            )}
            {columns.map((c) => {
              const dir = sort?.by?.key === c.key ? sort.by.direction : null
              return (
                <Table.ColumnHeader
                  key={c.key}
                  px="3"
                  textAlign={c.numeric ? "end" : "start"}
                  w={c.width}
                  whiteSpace="nowrap"
                  color="fg.muted"
                  fontWeight="medium"
                  aria-sort={sort && c.sortValue ? (dir === "asc" ? "ascending" : dir === "desc" ? "descending" : "none") : undefined}
                  {...hideSecondary(c)}
                >
                  {sort && c.sortValue ? (
                    <Button
                      variant="plain"
                      size="sm"
                      h="auto"
                      minW="0"
                      p="0"
                      fontWeight="inherit"
                      color={dir ? "fg" : "inherit"}
                      _hover={{ color: "fg" }}
                      onClick={() => sort.onChange(nextSort(sort.by, c.key))}
                    >
                      {c.header}
                      {dir === "asc" ? <LuArrowUp /> : dir === "desc" ? <LuArrowDown /> : <LuArrowUpDown opacity="0.4" />}
                    </Button>
                  ) : (
                    c.header
                  )}
                </Table.ColumnHeader>
              )
            })}
            {rowActions && <Table.ColumnHeader w="10" px="3" />}
          </Table.Row>
        </Table.Header>
        <Table.Body display={{ base: "block", md: "table-row-group" }}>
          {groupRows(pageRows, groupBy).map(([key, groupRowsList]) => {
            const groupIds = groupRowsList.filter((r) => selection?.canSelect?.(r) ?? true).map(getRowId)
            return (
              <Fragment key={key}>
                {groupBy && (
                  <Table.Row display={{ base: "flex", md: "table-row" }} alignItems="center" gap="2" mb={{ base: "2", md: "0" }}>
                    {selection && (
                      <Table.Cell borderBottomWidth={{ base: "0", md: "1px" }} px={{ base: "0", md: "3" }} pt={{ md: "4" }}>
                        {groupIds.length > 0 && checkbox(allState(groupIds), m.selectAll, (on) => toggle(groupIds, on))}
                      </Table.Cell>
                    )}
                    <Table.Cell colSpan={span} fontWeight="semibold" borderBottomWidth={{ base: "0", md: "1px" }} px={{ base: "0", md: "3" }} pt={{ md: "4" }}>
                      {groupLabel ? groupLabel(key, fullGroups.get(key) ?? groupRowsList) : key}
                    </Table.Cell>
                  </Table.Row>
                )}
                {groupRowsList.map((row) => {
                  const id = getRowId(row)
                  const actions = rowActions?.(row) ?? []
                  const canPick = selection && (selection.canSelect?.(row) ?? true)
                  return (
                    <Table.Row key={id} css={cardRow} data-selected={selected.has(id) ? "" : undefined} _selected={{ bg: "brand.subtle/40" }}>
                      {selection && (
                        <Table.Cell css={canPick ? cardCheckboxCell : unlabeledCell} data-label="" w={{ md: "10" }} display={canPick ? undefined : { base: "none", md: "table-cell" }}>
                          {canPick && checkbox(selected.has(id), m.selectRow, (on) => toggle([id], on))}
                        </Table.Cell>
                      )}
                      {columns.map((c, i) => {
                        const label = c.label ?? (typeof c.header === "string" ? c.header : "")
                        const primary = c.priority === "primary"
                        return (
                          <Table.Cell
                            key={c.key}
                            css={primary ? unlabeledCell : cardCell}
                            data-label={primary ? "" : label}
                            // The card's first line leaves room for the checkbox at its top left and the ⋯ button at its top right.
                            ps={i === 0 && canPick ? { base: "7", md: "3" } : undefined}
                            pe={i === 0 && rowActions ? { base: "8", md: "3" } : undefined}
                            textAlign={c.numeric ? "end" : "start"}
                            fontVariantNumeric={c.numeric ? "tabular-nums" : undefined}
                            whiteSpace={c.numeric ? "nowrap" : undefined}
                            fontWeight={primary ? "medium" : undefined}
                            {...hideSecondary(c)}
                          >
                            <Text as="span" textAlign={c.numeric ? "end" : primary ? "start" : { base: "end", md: "start" }} minW="0" overflowWrap={{ base: "anywhere", md: "normal" }}>
                              {c.cell(row)}
                            </Text>
                          </Table.Cell>
                        )
                      })}
                      {rowActions && (
                        <Table.Cell css={unlabeledCell} data-label="" w={{ md: "10" }} textAlign="end" position={{ base: "absolute", md: "static" }} top="1" right="1">
                          {actions.length > 0 && (
                            <Menu.Root positioning={{ placement: "bottom-end" }}>
                              <Menu.Trigger asChild>
                                <IconButton size="xs" variant="ghost" aria-label={m.rowActions}>
                                  <LuEllipsis />
                                </IconButton>
                              </Menu.Trigger>
                              <Portal>
                                <Menu.Positioner>
                                  <Menu.Content>
                                    {actions.map((a) => (
                                      <Menu.Item key={a.value} value={a.value} disabled={a.disabled} onSelect={a.onSelect} color={a.danger ? "fg.error" : undefined} _highlighted={a.danger ? { bg: "bg.error", color: "fg.error" } : undefined}>
                                        {a.icon}
                                        {a.label}
                                      </Menu.Item>
                                    ))}
                                  </Menu.Content>
                                </Menu.Positioner>
                              </Portal>
                            </Menu.Root>
                          )}
                        </Table.Cell>
                      )}
                    </Table.Row>
                  )
                })}
              </Fragment>
            )
          })}
        </Table.Body>
      </Table.Root>
    </Table.ScrollArea>
    {pager}
    </Box>
  )
}
