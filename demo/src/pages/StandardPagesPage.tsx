import { Button, Code, NativeSelect, Stack, Switch, Text } from "@chakra-ui/react"
import { ApiError, ConfigError, ConfigErrorPage, NoAccessPage, TitleBar, StatusPage, STANDARD_ERROR_CODES, useApiErrorMessage } from "@team6083/ui"
import { useState } from "react"
import { LuFileQuestion } from "react-icons/lu"

import { useDemoState } from "../demo-state"
import { Example } from "../Example"

export function StandardPagesPage() {
  const { outdated, setOutdated } = useDemoState()
  const [code, setCode] = useState<string>("version_conflict")
  const message = useApiErrorMessage()

  return (
    <>
      <TitleBar
        level={1}
        mb="6"
        title="Standard pages"
        description="What every app shows when it can't show its content. Wording and behavior are the team standard's, so every app says the same thing."
      />

      <Example
        title="NoAccessPage"
        description="The API answered 403 missing_role: the user is signed in but has none of the app's roles. Give them a way to switch accounts."
        code={`
if (isMissingRole(error)) {
  return <NoAccessPage actions={<Button onClick={signOut}>Sign out</Button>} />
}
`}
      >
        <NoAccessPage minH="0" py="6" actions={<Button size="sm" variant="outline">Sign out</Button>} />
      </Example>

      <Example
        title="ConfigErrorPage"
        description="config.json is missing or invalid; each problem is listed on its own line. createRuntimeConfig shows it for you."
        code={`
export const { RuntimeConfigProvider, useRuntimeConfig } =
  createRuntimeConfig({ parse: parseConfig })

<RuntimeConfigProvider fallback={<Spinner />}>
  <App />
</RuntimeConfigProvider>
`}
      >
        <ConfigErrorPage minH="0" py="6" error={new ConfigError(["apiBaseUrl: missing", "orgName: must be a string"])} />
      </Example>

      <Example
        title="StatusPage"
        description="The layout the pages above share, for an app's own not-found or error pages."
        code={`
<StatusPage
  icon={<LuFileQuestion />}
  title="找不到這個批次"
  description="It may have been deleted, or the link is wrong."
  actions={<Button asChild><a href="/batches">All batches</a></Button>}
/>
`}
      >
        <StatusPage
          minH="0"
          py="6"
          icon={<LuFileQuestion />}
          title="找不到這個批次"
          description="It may have been deleted, or the link is wrong."
          actions={<Button size="sm">All batches</Button>}
        />
      </Example>

      <Example
        title="AppOutdatedBanner"
        description="When a response's X-App-Commit differs from the build's commit, the banner asks for a reload and useCommitCheckedFetch blocks writes until then. AppShell shows it above the page. Optional: useFrontendOutdated checks a version file deployed with the front end instead; then the banner shows but writes stay allowed."
        code={`
<AppCommitProvider buildCommit={config.commit} pollUrl="/api/healthz">
  <AppShell …>{children}</AppShell>
</AppCommitProvider>

const fetch = useCommitCheckedFetch()

// Or, whatever APIs the page calls: ask the front end's own deployment
const frontendOutdated = useFrontendOutdated({ buildCommit: config.commit, url: "/version.json" })
<AppCommitProvider buildCommit={null} frontendOutdated={frontendOutdated}>…</AppCommitProvider>
`}
      >
        <Switch.Root checked={outdated} onCheckedChange={(e) => setOutdated(e.checked)}>
          <Switch.HiddenInput />
          <Switch.Control />
          <Switch.Label>Show the banner (look at the top of the page)</Switch.Label>
        </Switch.Root>
      </Example>

      <Example
        title="API error messages"
        description="readApiError turns the standard error body into an ApiError; useApiErrorMessage gives the localized text for the standard codes, in the locale passed to UiProvider."
        code={`
try {
  await save()
} catch (error) {
  toaster.create({ type: "error", title: message(error) })
}
`}
      >
        <Stack gap="3" maxW="md">
          <NativeSelect.Root size="sm">
            <NativeSelect.Field value={code} onChange={(e) => setCode(e.currentTarget.value)} aria-label="Error code">
              {STANDARD_ERROR_CODES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
          <Text>
            <Code>{code}</Code> → {message(new ApiError(400, code, "server text"))}
          </Text>
        </Stack>
      </Example>
    </>
  )
}
