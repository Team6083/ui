import { screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useState } from "react"

import { renderWithUi } from "../test-utils.js"
import { DataTable, type DataColumn, type DataPagination, type DataSort } from "./data-table.js"
import { FactList, FilterBar, SelectionBar, Totals } from "./data-parts.js"

interface Item {
  id: string
  name: string
  vendor: string
  qty: number
  ordered: boolean
}

const items: Item[] = [
  { id: "a", name: "Resistor kit", vendor: "Digikey", qty: 2, ordered: false },
  { id: "b", name: "Servo", vendor: "Mouser", qty: 4, ordered: false },
  { id: "c", name: "USB cable", vendor: "Digikey", qty: 10, ordered: true },
]

const columns: DataColumn<Item>[] = [
  { key: "name", header: "Name", cell: (r) => r.name, priority: "primary" },
  { key: "vendor", header: "Vendor", cell: (r) => r.vendor, priority: "secondary" },
  { key: "qty", header: "Qty", cell: (r) => r.qty, numeric: true },
]

function Picker({ onAct }: { onAct: (ids: string[]) => void }) {
  const [selected, setSelected] = useState<string[]>([])
  return (
    <>
      <DataTable
        rows={items}
        columns={columns}
        getRowId={(r) => r.id}
        selection={{ selected, onChange: setSelected, canSelect: (r) => !r.ordered }}
        groupBy={(r) => r.vendor}
      />
      <SelectionBar count={selected.length} onClear={() => setSelected([])}>
        <button onClick={() => onAct(selected)}>Order</button>
      </SelectionBar>
    </>
  )
}

describe("DataTable", () => {
  it("labels each cell for the phone layout and aligns numbers", () => {
    renderWithUi(<DataTable rows={items} columns={columns} getRowId={(r) => r.id} />)
    const qty = screen.getAllByRole("cell").find((c) => c.textContent === "4")!
    expect(qty).toHaveAttribute("data-label", "Qty")
    expect(screen.getAllByRole("cell").find((c) => c.textContent === "Servo")).toHaveAttribute("data-label", "")
  })

  it("puts style props on the whole block and the rest on the table", () => {
    renderWithUi(<DataTable rows={items} columns={columns} getRowId={(r) => r.id} mt="7" gap="8" css={{ outline: "2px solid" }} aria-label="Parts" />)
    const table = screen.getByRole("table", { name: "Parts" })
    const block = getComputedStyle(table.parentElement!.parentElement!)
    expect(block.marginTop).not.toMatch(/^(0px)?$/)
    expect(block.gap).toBe("32px")
    expect(block.outline).toContain("2px solid")
    expect(getComputedStyle(table).marginTop).toMatch(/^(0px)?$/)
  })

  it("shows the empty state instead of an empty table", () => {
    renderWithUi(<DataTable rows={[]} columns={columns} getRowId={(r) => r.id} empty={<p>No items</p>} />)
    expect(screen.getByText("No items")).toBeInTheDocument()
    expect(screen.queryByRole("table")).not.toBeInTheDocument()
  })

  it("picks rows one by one, by group and all at once, skipping rows that cannot be picked", async () => {
    const onAct = vi.fn()
    const user = userEvent.setup()
    renderWithUi(<Picker onAct={onAct} />)

    // One checkbox for all, one per group with pickable rows, one per pickable row.
    expect(screen.getAllByRole("checkbox", { name: "Select row" })).toHaveLength(2)
    expect(screen.queryByRole("region")).not.toBeInTheDocument()

    await user.click(screen.getAllByRole("checkbox", { name: "Select row" })[0]!)
    expect(screen.getByRole("region", { name: "1 selected" })).toBeInTheDocument()

    await user.click(screen.getAllByRole("checkbox", { name: "Select all" })[0]!)
    await user.click(within(screen.getByRole("region")).getByRole("button", { name: "Order" }))
    expect(onAct).toHaveBeenLastCalledWith(expect.arrayContaining(["a", "b"]))
    expect(onAct.mock.lastCall![0]).not.toContain("c")

    await user.click(screen.getByRole("button", { name: "Clear selection" }))
    expect(screen.queryByRole("region")).not.toBeInTheDocument()
  })

  it("folds a row's actions into one menu", async () => {
    const markUnpurchasable = vi.fn()
    const user = userEvent.setup()
    renderWithUi(
      <DataTable
        rows={items.slice(0, 1)}
        columns={columns}
        getRowId={(r) => r.id}
        rowActions={() => [{ value: "unpurchasable", label: "Mark unpurchasable", danger: true, onSelect: markUnpurchasable }]}
      />,
      { locale: "zh-TW" },
    )
    expect(screen.queryByRole("button", { name: "Mark unpurchasable" })).not.toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "更多動作" }))
    await user.click(await screen.findByRole("menuitem", { name: "Mark unpurchasable" }))
    expect(markUnpurchasable).toHaveBeenCalledOnce()
  })
})

const sortableColumns: DataColumn<Item>[] = [
  { ...columns[0]!, sortValue: (r) => r.name },
  columns[1]!,
  { ...columns[2]!, sortValue: (r) => (r.qty === 4 ? null : r.qty) },
]
const names = () => screen.getAllByRole("row").slice(1).map((r) => within(r).getAllByRole("cell")[0]!.textContent)

function Sortable({ groupBy }: { groupBy?: (r: Item) => string }) {
  const [by, setBy] = useState<DataSort["by"]>(null)
  return <DataTable rows={items} columns={sortableColumns} getRowId={(r) => r.id} sort={{ by, onChange: setBy }} groupBy={groupBy} />
}

describe("DataTable sorting", () => {
  it("cycles a header ascending, descending, off, and marks the sorted column", async () => {
    const user = userEvent.setup()
    renderWithUi(<Sortable />)
    const header = () => screen.getByRole("columnheader", { name: /Name/ })
    const click = () => user.click(within(header()).getByRole("button"))
    expect(screen.queryByRole("button", { name: "Vendor" })).not.toBeInTheDocument()
    expect(names()).toEqual(["Resistor kit", "Servo", "USB cable"])

    await click()
    expect(header()).toHaveAttribute("aria-sort", "ascending")
    await click()
    expect(header()).toHaveAttribute("aria-sort", "descending")
    expect(names()).toEqual(["USB cable", "Servo", "Resistor kit"])
    await click()
    expect(header()).toHaveAttribute("aria-sort", "none")
    expect(names()).toEqual(["Resistor kit", "Servo", "USB cable"])
  })

  it("puts null last in either direction", async () => {
    const user = userEvent.setup()
    renderWithUi(<Sortable />)
    const qty = () => within(screen.getByRole("columnheader", { name: /Qty/ })).getByRole("button")
    await user.click(qty())
    expect(names()).toEqual(["Resistor kit", "USB cable", "Servo"])
    await user.click(qty())
    expect(names()).toEqual(["USB cable", "Resistor kit", "Servo"])
  })

  it("sorts within groups and keeps the groups in their order", async () => {
    const user = userEvent.setup()
    renderWithUi(<Sortable groupBy={(r) => r.vendor} />)
    const nameButton = () => within(screen.getByRole("columnheader", { name: /Name/ })).getByRole("button")
    await user.click(nameButton())
    await user.click(nameButton())
    expect(names()).toEqual(["Digikey", "USB cable", "Resistor kit", "Mouser", "Servo"])
  })

  it("offers a sort select for the cards on a phone", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    renderWithUi(<DataTable rows={items} columns={sortableColumns} getRowId={(r) => r.id} sort={{ by: null, onChange }} />, { locale: "zh-TW" })
    await user.selectOptions(screen.getByRole("combobox", { name: "排序", hidden: true }), "qty")
    expect(onChange).toHaveBeenLastCalledWith({ key: "qty", direction: "asc" })
  })
})

const many: Item[] = Array.from({ length: 25 }, (_, i) => ({ id: `r${i + 1}`, name: `Row ${String(i + 1).padStart(2, "0")}`, vendor: "V", qty: i, ordered: false }))

function Paged({ initial = 1, data = many, onPage }: { initial?: number; data?: Item[]; onPage?: (p: number) => void }) {
  const [page, setPage] = useState(initial)
  const [pageSize, setPageSize] = useState(10)
  const [selected, setSelected] = useState<string[]>([])
  const pagination: DataPagination = { page, pageSize, onPageChange: (p) => (onPage?.(p), setPage(p)), onPageSizeChange: setPageSize, pageSizes: [10, 20] }
  return (
    <>
      <DataTable rows={data} columns={columns} getRowId={(r) => r.id} pagination={pagination} selection={{ selected, onChange: setSelected }} />
      <SelectionBar count={selected.length} onClear={() => setSelected([])}>
        <button>Act</button>
      </SelectionBar>
    </>
  )
}

describe("DataTable pagination", () => {
  it("shows one page of rows with the range, and keeps picks across pages", async () => {
    const user = userEvent.setup()
    renderWithUi(<Paged />)
    expect(names()).toHaveLength(10)
    expect(screen.getByText("1–10 / 25")).toBeInTheDocument()

    await user.click(screen.getAllByRole("checkbox", { name: "Select all" })[0]!)
    expect(screen.getByRole("region", { name: "10 selected" })).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Next page" }))
    expect(screen.getByText("11–20 / 25")).toBeInTheDocument()
    expect(screen.getByText("Row 11")).toBeInTheDocument()
    expect(screen.queryByText("Row 01")).not.toBeInTheDocument()
    // The header checkbox starts empty here and adds only this page's rows.
    expect(screen.getByRole("region", { name: "10 selected" })).toBeInTheDocument()
    await user.click(screen.getAllByRole("checkbox", { name: "Select all" })[0]!)
    expect(screen.getByRole("region", { name: "20 selected" })).toBeInTheDocument()
  })

  it("goes back to the first page when the rows-per-page changes", async () => {
    const user = userEvent.setup()
    renderWithUi(<Paged initial={3} />)
    await user.selectOptions(screen.getByRole("combobox", { name: "Rows per page" }), "20")
    expect(screen.getByText("1–20 / 25")).toBeInTheDocument()
  })

  it("keeps the rows-per-page select while a smaller size would split the list, and pages groups whole", async () => {
    const user = userEvent.setup()
    function Big() {
      const [pageSize, setPageSize] = useState(10)
      return <DataTable rows={many} columns={columns} getRowId={(r) => r.id} pagination={{ page: 1, pageSize, onPageChange: () => {}, onPageSizeChange: setPageSize, pageSizes: [10, 50] }} />
    }
    renderWithUi(<Big />)
    await user.selectOptions(screen.getByRole("combobox", { name: "Rows per page", hidden: true }), "50")
    expect(screen.getByRole("combobox", { name: "Rows per page", hidden: true })).toHaveValue("50")
    expect(screen.queryByRole("button", { name: "Next page" })).not.toBeInTheDocument()

    const mixed = [items[0]!, items[1]!, items[2]!]
    renderWithUi(<DataTable rows={mixed} columns={columns} getRowId={(r) => r.id} groupBy={(r) => r.vendor} pagination={{ page: 1, pageSize: 2, onPageChange: () => {} }} />)
    // Digikey's two rows come first, so page 1 holds the whole group instead of Digikey, Mouser.
    expect(screen.getByText("USB cable")).toBeInTheDocument()
    expect(screen.queryAllByText("Servo")).toHaveLength(0)
  })

  it("labels a group with all its rows, not just the page's part", () => {
    const label = vi.fn((key: string, rows: Item[]) => `${key} · ${rows.length}`)
    renderWithUi(<DataTable rows={items} columns={columns} getRowId={(r) => r.id} groupBy={(r) => r.vendor} groupLabel={label} pagination={{ page: 1, pageSize: 1, onPageChange: () => {} }} />)
    expect(screen.getByText("Digikey · 2")).toBeInTheDocument()
  })

  it("does not reset the page while rows are still loading", () => {
    const onPage = vi.fn()
    renderWithUi(<DataTable rows={[]} columns={columns} getRowId={(r) => r.id} pagination={{ page: 3, pageSize: 10, onPageChange: onPage }} />)
    expect(onPage).not.toHaveBeenCalled()
  })

  it("hides the pager when everything fits on one page", () => {
    renderWithUi(<Paged data={many.slice(0, 5)} />)
    expect(screen.queryByRole("button", { name: "Next page" })).not.toBeInTheDocument()
  })

  it("draws only the pager when the server pages", () => {
    renderWithUi(<DataTable rows={many.slice(0, 3)} columns={columns} getRowId={(r) => r.id} pagination={{ page: 2, pageSize: 3, count: 134, onPageChange: () => {} }} />)
    expect(names()).toHaveLength(3)
    expect(screen.getByText("4–6 / 134")).toBeInTheDocument()
  })

  it("asks for the last page once when the list shrinks below the current page", () => {
    const onPage = vi.fn()
    const { rerender } = renderWithUi(<Paged initial={3} onPage={onPage} />)
    expect(onPage).not.toHaveBeenCalled()
    rerender(<Paged initial={3} data={many.slice(0, 12)} onPage={onPage} />)
    expect(onPage).toHaveBeenCalledExactlyOnceWith(2)
  })
})

describe("FilterBar", () => {
  it("searches, keeps the filters behind one button with their count, and clears them", async () => {
    const onSearch = vi.fn()
    const onClear = vi.fn()
    const user = userEvent.setup()
    renderWithUi(
      <FilterBar search={{ value: "", onChange: onSearch }} activeCount={2} onClear={onClear}>
        <label>
          Status
          <select />
        </label>
      </FilterBar>,
      { locale: "zh-TW" },
    )
    await user.type(screen.getByRole("textbox", { name: "搜尋" }), "s")
    expect(onSearch).toHaveBeenCalledWith("s")
    expect(screen.queryByLabelText("Status")).not.toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: /篩選\s*2/ }))
    expect(await screen.findByLabelText("Status")).toBeInTheDocument()
    await user.click(screen.getAllByRole("button", { name: "清除篩選" })[0]!)
    expect(onClear).toHaveBeenCalled()
  })

  it("keeps the filter button's badge laid out but hidden while no filter is set", () => {
    const { rerender } = renderWithUi(
      <FilterBar activeCount={0}>
        <select />
      </FilterBar>,
    )
    expect(screen.getByRole("button", { name: "Filter" })).toBeInTheDocument()
    // Hidden with visibility, not display, so it still takes its space.
    expect(screen.getByText("0")).toHaveStyle({ visibility: "hidden" })
    expect(screen.getByText("0")).not.toHaveStyle({ display: "none" })
    rerender(
      <FilterBar activeCount={3}>
        <select />
      </FilterBar>,
    )
    expect(screen.getByRole("button", { name: /^Filter\s*3$/ })).toBeInTheDocument()
    expect(screen.getByText("3")).toBeVisible()
  })
})

describe("FactList and Totals", () => {
  it("pairs labels with values", () => {
    renderWithUi(<FactList items={[{ label: "Deadline", value: "11/23 03:34" }]} />)
    expect(screen.getByText("Deadline").tagName).toBe("DT")
    expect(screen.getByText("11/23 03:34").tagName).toBe("DD")
  })

  it("sets the total apart", () => {
    renderWithUi(
      <Totals
        lines={[
          { label: "Items", value: "145.00 USD" },
          { label: "Estimate", value: "145.00 USD", emphasis: true },
        ]}
      />,
    )
    expect(screen.getByText("Estimate").tagName).toBe("DT")
    expect(screen.getAllByText("145.00 USD")).toHaveLength(2)
    expect(screen.getAllByText("145.00 USD")[0]!.closest("dd")).not.toBeNull()
  })
})
