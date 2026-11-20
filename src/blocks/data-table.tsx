"use client"

import { Checkbox, IconButton, Menu, Portal, Table, Text, type TableRootProps } from "@chakra-ui/react"
import { Fragment, type ReactNode } from "react"
import { LuEllipsis } from "react-icons/lu"

import { useUiMessages } from "../i18n.js"

export interface DataColumn<T> {
  key: string
  header: ReactNode
  /** The header as text, for the label in front of the value on a phone; defaults to `header` when it is a string. */
  label?: string
  cell: (row: T) => ReactNode
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
  /** A row's actions, folded into one ⋯ menu at the end of the row. */
  rowActions?: (row: T) => RowAction[]
  /** Splits the rows under group headings (e.g. by vendor), in first-seen order. */
  groupBy?: (row: T) => string
  groupLabel?: (key: string, rows: T[]) => ReactNode
  /** Shown instead of the table when there are no rows, e.g. an EmptyState. */
  empty?: ReactNode
  /** Names the table for screen readers. */
  "aria-label"?: string
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
  rowActions,
  groupBy,
  groupLabel,
  empty,
  ...rest
}: DataTableProps<T>) {
  const m = useUiMessages().data
  if (rows.length === 0 && empty) return <>{empty}</>

  const selected = new Set(selection?.selected ?? [])
  const selectable = selection ? rows.filter((r) => selection.canSelect?.(r) ?? true) : []
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
  const hideSecondary = (c: DataColumn<T>) => (c.priority === "secondary" ? { hideBelow: "lg" as const } : {})

  const checkbox = (checked: boolean | "indeterminate", label: string, onChange: (on: boolean) => void) => (
    <Checkbox.Root size="sm" checked={checked} onCheckedChange={(e) => onChange(e.checked === true)} aria-label={label}>
      <Checkbox.HiddenInput />
      <Checkbox.Control />
    </Checkbox.Root>
  )

  return (
    <Table.ScrollArea borderWidth={{ base: "0", md: "1px" }} rounded="l3">
      <Table.Root size="sm" display={{ base: "block", md: "table" }} {...rest}>
        <Table.Header display={{ base: "none", md: "table-header-group" }}>
          <Table.Row bg="bg.subtle">
            {selection && (
              <Table.ColumnHeader w="10">
                {selectable.length > 0 && checkbox(allState(selectable.map(getRowId)), m.selectAll, (on) => toggle(selectable.map(getRowId), on))}
              </Table.ColumnHeader>
            )}
            {columns.map((c) => (
              <Table.ColumnHeader key={c.key} textAlign={c.numeric ? "end" : "start"} w={c.width} whiteSpace="nowrap" color="fg.muted" fontWeight="medium" {...hideSecondary(c)}>
                {c.header}
              </Table.ColumnHeader>
            ))}
            {rowActions && <Table.ColumnHeader w="10" />}
          </Table.Row>
        </Table.Header>
        <Table.Body display={{ base: "block", md: "table-row-group" }}>
          {groupRows(rows, groupBy).map(([key, groupRowsList]) => {
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
                      {groupLabel ? groupLabel(key, groupRowsList) : key}
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
  )
}
