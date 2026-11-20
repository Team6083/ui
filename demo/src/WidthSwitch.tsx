import { SegmentGroup } from "@chakra-ui/react"

import { useDemoState } from "./demo-state"

/** AppShell's width for the whole demo. */
export function WidthSwitch() {
  const { width, setWidth } = useDemoState()
  return (
    <SegmentGroup.Root size="sm" value={width} onValueChange={(e) => e.value && setWidth(e.value as "column" | "wide")}>
      <SegmentGroup.Indicator />
      <SegmentGroup.Items items={["column", "wide"]} />
    </SegmentGroup.Root>
  )
}
