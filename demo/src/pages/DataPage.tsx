import { Badge, Button, createListCollection, HStack, Portal, Select, Stack, Switch, Text } from "@chakra-ui/react"
import { DataTable, EmptyState, FactList, FilterBar, MemberAvatar, TitleBar, SelectionBar, toaster, Totals, type DataColumn, type DataSort } from "@team6083/ui"
import { useMemo, useState } from "react"
import { LuCheck, LuEye, LuSearchX, LuShoppingCart, LuX } from "react-icons/lu"

import { formatMoney, ITEMS, STATUS_COLOR, STATUS_LABEL, type Item, type ItemStatus } from "../data"
import { AVATARS } from "../avatars"
import { Example } from "../Example"

const statuses = createListCollection({
  items: (Object.keys(STATUS_LABEL) as ItemStatus[]).map((value) => ({ value, label: STATUS_LABEL[value] })),
})

const COLUMNS: DataColumn<Item>[] = [
  { key: "name", header: "Item", priority: "primary", sortValue: (item) => item.name, cell: (item) => item.name },
  {
    key: "requester",
    header: "Requested by",
    priority: "secondary",
    sortValue: (item) => item.requester,
    cell: (item) => (
      <HStack gap="2">
        <MemberAvatar name={item.requester} image={AVATARS[item.requester]} size="2xs" />
        {item.requester}
      </HStack>
    ),
  },
  { key: "status", header: "Status", cell: (item) => <Badge colorPalette={STATUS_COLOR[item.status]}>{STATUS_LABEL[item.status]}</Badge> },
  { key: "quantity", header: "Qty", numeric: true, sortValue: (item) => item.quantity, cell: (item) => item.quantity },
  { key: "unitPrice", header: "Unit price", numeric: true, sortValue: (item) => item.unitPrice, cell: (item) => formatMoney(item.unitPrice) },
  { key: "total", header: "Total", numeric: true, sortValue: (item) => item.quantity * item.unitPrice, cell: (item) => formatMoney(item.quantity * item.unitPrice) },
]

export function DataPage() {
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState<string[]>([])
  const [grouped, setGrouped] = useState(true)
  const [selected, setSelected] = useState<string[]>([])
  const [sort, setSort] = useState<DataSort["by"]>(null)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(4)

  const rows = useMemo(
    () =>
      ITEMS.filter((item) => item.name.toLowerCase().includes(search.trim().toLowerCase()) && (status.length === 0 || status.includes(item.status))),
    [search, status],
  )
  const picked = ITEMS.filter((item) => selected.includes(item.id))
  const subtotal = picked.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
  const shipping = picked.length > 0 ? 600 : 0

  const act = (title: string) => {
    toaster.create({ title, type: "success" })
    setSelected([])
  }

  return (
    <>
      <TitleBar
        level={1}
        mb="6"
        title="2026 春季採購"
        after={<Badge colorPalette="green">Open</Badge>}
        description="Data pages: a table people pick rows from and act on. Narrow the window to see the rows turn into cards."
      />

      <Example
        title="FilterBar, DataTable and SelectionBar"
        framed={false}
        description="Search and one 篩選 button instead of a row of selects; rows grouped under headings; pick rows by row, group or all, then act on them in the bar that appears at the bottom. Each row's own actions sit in its ⋯ menu. Click a header to sort (ascending, descending, off; on a phone use the sort select above the cards), and use the pager under the table; picks stay when you change page, and the header checkbox picks the current page. Sorting and paging are controlled, so the app can keep them in the URL or send them to a server."
        code={`
<FilterBar
  search={{ value: search, onChange: setSearch }}
  activeCount={status.length}
  onClear={() => setStatus([])}
  positioning={{ placement: "right-start", flip: ["bottom-end"] }} // beside the button; under it on a phone
>
  <Select.Root …>{/* filter fields */}</Select.Root>
</FilterBar>

<DataTable
  rows={rows}
  columns={columns}
  getRowId={(item) => item.id}
  groupBy={(item) => item.vendor}
  sort={{ by: sort, onChange: setSort }}
  pagination={{ page, pageSize, onPageChange: setPage, onPageSizeChange: setPageSize, pageSizes: [4, 8] }}
  selection={{ selected, onChange: setSelected, canSelect: (item) => item.status === "approved" }}
  rowActions={(item) => [
    { value: "view", label: "View", icon: <LuEye />, onSelect: () => open(item) },
    { value: "cancel", label: "Cancel", icon: <LuX />, danger: true, onSelect: () => cancel(item) },
  ]}
  empty={<EmptyState title="Nothing matches" />}
/>

<SelectionBar count={selected.length} onClear={() => setSelected([])}>
  <Button size="sm">Place order</Button>
</SelectionBar>
`}
      >
        <Stack gap="0">
          <FilterBar
            search={{ value: search, onChange: setSearch, placeholder: "Search items" }}
            activeCount={status.length}
            onClear={() => setStatus([])}
            positioning={{ placement: "right-start", flip: ["bottom-end"] }}
            actions={
              <Switch.Root size="sm" checked={grouped} onCheckedChange={(e) => setGrouped(e.checked)}>
                <Switch.HiddenInput />
                <Switch.Control />
                <Switch.Label>Group by vendor</Switch.Label>
              </Switch.Root>
            }
          >
            <Select.Root multiple collection={statuses} size="sm" value={status} onValueChange={(e) => setStatus(e.value)}>
              <Select.HiddenSelect />
              <Select.Label>Status</Select.Label>
              <Select.Control>
                <Select.Trigger>
                  <Select.ValueText placeholder="Any status" />
                </Select.Trigger>
                <Select.IndicatorGroup>
                  <Select.Indicator />
                </Select.IndicatorGroup>
              </Select.Control>
              <Portal>
                <Select.Positioner>
                  <Select.Content>
                    {statuses.items.map((item) => (
                      <Select.Item key={item.value} item={item}>
                        {item.label}
                        <Select.ItemIndicator />
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Positioner>
              </Portal>
            </Select.Root>
          </FilterBar>

          <DataTable
            aria-label="Items"
            rows={rows}
            columns={COLUMNS}
            getRowId={(item) => item.id}
            groupBy={grouped ? (item) => item.vendor : undefined}
            groupLabel={(vendor, items) => `${vendor} · ${items.length}`}
            sort={{ by: sort, onChange: setSort }}
            pagination={{ page, pageSize, onPageChange: setPage, onPageSizeChange: setPageSize, pageSizes: [4, 8] }}
            selection={{ selected, onChange: setSelected, canSelect: (item) => item.status === "approved" }}
            rowActions={(item) => [
              { value: "view", label: "View", icon: <LuEye />, onSelect: () => toaster.create({ title: item.name }) },
              { value: "approve", label: "Approve", icon: <LuCheck />, disabled: item.status !== "requested", onSelect: () => act(`Approved ${item.name}`) },
              { value: "cancel", label: "Cancel", icon: <LuX />, danger: true, onSelect: () => act(`Cancelled ${item.name}`) },
            ]}
            empty={<EmptyState icon={<LuSearchX />} title="Nothing matches" description="Try another search or clear the filters." />}
          />

          <SelectionBar count={selected.length} onClear={() => setSelected([])}>
            <Button size="sm" variant="outline" onClick={() => act(`Sent ${selected.length} back for review`)}>
              Send back
            </Button>
            <Button size="sm" onClick={() => act(`Ordered ${selected.length} items`)}>
              <LuShoppingCart />
              Place order
            </Button>
          </SelectionBar>
          <Text textStyle="xs" color="fg.muted" mt="3">
            Only approved items can be picked; the others have no checkbox.
          </Text>
        </Stack>
      </Example>

      <Example
        title="Totals"
        description="Amounts that add up, right-aligned under a list; the emphasized line is what gets paid. Pick rows above to change it."
        code={`
<Totals
  lines={[
    { label: "Subtotal", value: formatMoney(subtotal) },
    { label: "Shipping", value: formatMoney(shipping), hint: "Flat rate per order" },
    { label: "Total", value: formatMoney(subtotal + shipping), emphasis: true },
  ]}
/>
`}
      >
        <Totals
          lines={[
            { label: `Subtotal (${picked.length} items)`, value: formatMoney(subtotal) },
            { label: "Shipping", value: formatMoney(shipping), hint: "Flat rate per order" },
            { label: "Total", value: formatMoney(subtotal + shipping), emphasis: true },
          ]}
        />
      </Example>

      <Example
        title="FactList"
        description="One record's facts, label over value: two columns on a phone, columns at least 12rem wide from md."
        code={`
<FactList
  items={[
    { label: "Vendor", value: "REV Robotics" },
    { label: "Requested by", value: "林怡君" },
  ]}
/>
`}
      >
        <FactList
          items={[
            { label: "Batch", value: "2026 春季採購" },
            { label: "Vendor", value: "REV Robotics" },
            { label: "Requested by", value: <HStack gap="2"><MemberAvatar name="林怡君" image={AVATARS["林怡君"]} size="2xs" />林怡君</HStack> },
            { label: "Status", value: <Badge colorPalette="blue">Approved</Badge> },
            { label: "Requested on", value: "2026-03-02 14:20" },
            { label: "Budget line", value: "Drivetrain" },
          ]}
        />
      </Example>
    </>
  )
}
