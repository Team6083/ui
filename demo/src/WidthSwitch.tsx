import { SegmentGroup } from "@chakra-ui/react"

import { useDemoState, type DemoWidth } from "./demo-state"

const ITEMS: { value: DemoWidth; label: string }[] = [
  { value: "page", label: "Per page" },
  { value: "column", label: "column" },
  { value: "wide", label: "wide" },
]

/** Switches AppShell's width for every page, or back to each page's own. */
export function WidthSwitch() {
  const { width, setWidth } = useDemoState()
  return (
    <SegmentGroup.Root size="sm" value={width} onValueChange={(e) => e.value && setWidth(e.value as DemoWidth)}>
      <SegmentGroup.Indicator />
      <SegmentGroup.Items items={ITEMS} />
    </SegmentGroup.Root>
  )
}
