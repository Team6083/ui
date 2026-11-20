import { Box, Button, Code, HStack, IconButton, Link, SegmentGroup, SimpleGrid, Stack, Switch, Text } from "@chakra-ui/react"
import { PageHeader, SectionHeader, Tooltip, useColorMode } from "@team6083/ui"
import { LuGithub } from "react-icons/lu"

import { useDemoState } from "../demo-state"
import { Example } from "../Example"
import { WidthSwitch } from "../WidthSwitch"

const SHADES = ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"]
const SEMANTIC = ["solid", "subtle", "muted", "emphasized", "fg", "border"]

export function OverviewPage() {
  const { locale, setLocale, outdated, setOutdated } = useDemoState()
  const { preference, setColorMode } = useColorMode()

  return (
    <>
      <PageHeader
        title="@team6083/ui"
        description="The team's Chakra UI v3 theme and the blocks every web app needs. Everything on these pages is the real component, imported from the package."
        actions={
          <Tooltip content="GitHub">
            <IconButton asChild size="sm" variant="ghost" aria-label="GitHub">
              <a href="https://github.com/Team6083/ui">
                <LuGithub />
              </a>
            </IconButton>
          </Tooltip>
        }
      />

      <Example
        title="Try it in another setting"
        description="The package's own strings come in English and 繁體中文; the app passes its locale to UiProvider. The same switches are in the header: the color mode button, and 語言 in the account menu. App width is AppShell’s width prop."
      >
        <Stack gap="4">
          <HStack gap="4" wrap="wrap">
            <Text minW="28" fontWeight="medium">
              Locale
            </Text>
            <SegmentGroup.Root size="sm" value={locale} onValueChange={(e) => e.value && setLocale(e.value)}>
              <SegmentGroup.Indicator />
              <SegmentGroup.Items items={[{ value: "en", label: "en" }, { value: "zh-TW", label: "zh-TW" }]} />
            </SegmentGroup.Root>
          </HStack>
          <HStack gap="4" wrap="wrap">
            <Text minW="28" fontWeight="medium">
              Color mode
            </Text>
            <SegmentGroup.Root size="sm" value={preference} onValueChange={(e) => e.value && setColorMode(e.value as typeof preference)}>
              <SegmentGroup.Indicator />
              <SegmentGroup.Items items={["system", "light", "dark"]} />
            </SegmentGroup.Root>
          </HStack>
          <HStack gap="4" wrap="wrap">
            <Text minW="28" fontWeight="medium">
              App width
            </Text>
            <WidthSwitch />
          </HStack>
          <HStack gap="4" wrap="wrap">
            <Text minW="28" fontWeight="medium">
              Update banner
            </Text>
            <Switch.Root checked={outdated} onCheckedChange={(e) => setOutdated(e.checked)}>
              <Switch.HiddenInput />
              <Switch.Control />
              <Switch.Label>The server runs a newer build</Switch.Label>
            </Switch.Root>
          </HStack>
        </Stack>
      </Example>

      <Example
        title="Install"
        description={
          <>
            The package is on GitHub Packages, so installing needs a token with <Code>read:packages</Code>; the README
            has the steps for machines, CI and Dependabot.
          </>
        }
        code={`
# .npmrc
@team6083:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=\${NODE_AUTH_TOKEN}

npm install @team6083/ui @chakra-ui/react next-themes react-icons
`}
      >
        <Text>
          Then wrap the app in <Code>UiProvider</Code> and build pages from the blocks. See{" "}
          <Link href="https://github.com/Team6083/ui#readme" colorPalette="brand">
            README
          </Link>{" "}
          for Next.js and Vite, and{" "}
          <Link href="https://github.com/Team6083/ui/blob/main/DESIGN.md" colorPalette="brand">
            DESIGN.md
          </Link>{" "}
          for how apps should look.
        </Text>
      </Example>

      <Example
        title="Theme"
        description="Chakra's defaults plus one brand palette (Chakra's blue until the team picks a color). Use colorPalette=&quot;brand&quot; for the app's own accents, never a raw color."
        code={`
import { UiProvider } from "@team6083/ui"

<UiProvider locale={locale}>
  <App />
</UiProvider>

<Button colorPalette="brand">建立批次</Button>
`}
      >
        <Stack gap="5">
          <SimpleGrid columns={{ base: 6, sm: 11 }} gap="1">
            {SHADES.map((shade) => (
              <Stack key={shade} gap="1">
                <Box h="10" rounded="l1" bg={`brand.${shade}`} />
                <Text textStyle="xs" color="fg.muted" textAlign="center">
                  {shade}
                </Text>
              </Stack>
            ))}
          </SimpleGrid>
          <SectionHeader as="h3" title="Semantic tokens" mb="0" />
          <SimpleGrid columns={{ base: 3, sm: 6 }} gap="2">
            {SEMANTIC.map((token) => (
              <Stack key={token} gap="1">
                <Box h="8" rounded="l1" bg={token === "fg" || token === "border" ? undefined : `brand.${token}`} borderWidth={token === "border" ? "2px" : undefined} borderColor="brand.border" color="brand.fg" display="flex" alignItems="center" justifyContent="center" fontWeight="semibold">
                  {token === "fg" ? "Aa" : null}
                </Box>
                <Text textStyle="xs" color="fg.muted" textAlign="center">
                  brand.{token}
                </Text>
              </Stack>
            ))}
          </SimpleGrid>
          <HStack gap="2" wrap="wrap">
            <Button colorPalette="brand">Solid</Button>
            <Button colorPalette="brand" variant="subtle">
              Subtle
            </Button>
            <Button colorPalette="brand" variant="outline">
              Outline
            </Button>
            <Button variant="ghost">Ghost</Button>
          </HStack>
        </Stack>
      </Example>
    </>
  )
}
