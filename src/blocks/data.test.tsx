import { screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useState } from "react"

import { renderWithUi } from "../test-utils.js"
import { DataTable, type DataColumn } from "./data-table.js"
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
