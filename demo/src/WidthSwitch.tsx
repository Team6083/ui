import { HStack, SegmentGroup, Stack, Text } from "@chakra-ui/react"

import { useDemoState, type DemoWidth } from "./demo-state"

const PAGE_ITEMS: { value: DemoWidth; label: string }[] = [
  { value: "page", label: "Per page" },
  { value: "column", label: "column" },
  { value: "wide", label: "wide" },
]

/** AppShell's two widths: the app's frame, and every page's content or each page's own. */
export function WidthSwitch({ labelWidth }: { labelWidth?: string }) {
  const { frameWidth, setFrameWidth, width, setWidth } = useDemoState()
  return (
    <Stack gap="4">
      <HStack gap="4" wrap="wrap">
        <Text minW={labelWidth} fontWeight="medium">
          frameWidth
        </Text>
        <SegmentGroup.Root size="sm" value={frameWidth} onValueChange={(e) => e.value && setFrameWidth(e.value as "column" | "wide")}>
          <SegmentGroup.Indicator />
          <SegmentGroup.Items items={["column", "wide"]} />
        </SegmentGroup.Root>
      </HStack>
      <HStack gap="4" wrap="wrap">
        <Text minW={labelWidth} fontWeight="medium">
          width
        </Text>
        <SegmentGroup.Root size="sm" value={width} onValueChange={(e) => e.value && setWidth(e.value as DemoWidth)}>
          <SegmentGroup.Indicator />
          <SegmentGroup.Items items={PAGE_ITEMS} />
        </SegmentGroup.Root>
      </HStack>
    </Stack>
  )
}
