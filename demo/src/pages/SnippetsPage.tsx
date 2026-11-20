import { Button, HStack, Stack, Text } from "@chakra-ui/react"
import { ColorModeButton, InfoTip, PageHeader, toaster, ToggleTip, Tooltip } from "@team6083/ui"
import { LuInfo } from "react-icons/lu"

import { Example } from "../Example"

export function SnippetsPage() {
  return (
    <>
      <PageHeader
        title="Snippets"
        description="The Chakra snippets every app used to copy into components/ui. Import them from the package instead."
      />

      <Example
        title="Toaster"
        description="Put <Toaster /> once at the root, then call toaster.create anywhere."
        code={`
toaster.create({ type: "success", title: "Saved" })
toaster.create({ type: "error", title: message(error) })
`}
      >
        <HStack gap="2" wrap="wrap">
          <Button size="sm" variant="outline" onClick={() => toaster.create({ type: "success", title: "Saved" })}>
            Success
          </Button>
          <Button size="sm" variant="outline" onClick={() => toaster.create({ type: "error", title: "Couldn't save", description: "Check your connection and try again." })}>
            Error
          </Button>
          <Button size="sm" variant="outline" onClick={() => toaster.create({ type: "info", title: "Batch closes tomorrow" })}>
            Info
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const promise = new Promise((resolve) => setTimeout(resolve, 1500))
              toaster.promise(promise, { loading: { title: "Placing order…" }, success: { title: "Order placed" }, error: { title: "Couldn't place the order" } })
            }}
          >
            Loading
          </Button>
        </HStack>
      </Example>

      <Example
        title="Tooltip"
        description="A label for something that has none, like an icon button. Hover or focus."
        code={`
<Tooltip content="Refresh">
  <IconButton aria-label="Refresh"><LuRefreshCw /></IconButton>
</Tooltip>
`}
      >
        <Tooltip content="This is a tooltip" showArrow>
          <Button size="sm" variant="outline">
            Hover me
          </Button>
        </Tooltip>
      </Example>

      <Example
        title="ToggleTip and InfoTip"
        description="Extra explanation that opens on click, so it works on a phone too. InfoTip is the ⓘ button."
        code={`
<InfoTip content="Only approved items can be ordered." />
`}
      >
        <Stack gap="3">
          <HStack gap="1">
            <Text>Budget line</Text>
            <InfoTip content="Where the money comes from; set by the batch owner." />
          </HStack>
          <ToggleTip content="ToggleTip wraps any trigger.">
            <Button size="sm" variant="outline" alignSelf="flex-start">
              <LuInfo />
              Click me
            </Button>
          </ToggleTip>
        </Stack>
      </Example>

      <Example
        title="ColorModeButton"
        description="Cycles system, light and dark. AppShell already has one; use it elsewhere only on pages without the shell."
        code={`<ColorModeButton />`}
      >
        <ColorModeButton />
      </Example>
    </>
  )
}
