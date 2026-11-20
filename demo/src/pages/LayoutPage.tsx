import { Badge, Box, Button, HStack, IconButton, Stack, Text } from "@chakra-ui/react"
import { BuildInfo, EmptyState, MemberAvatar, PageHeader, SectionHeader } from "@team6083/ui"
import { LuInbox, LuPlus, LuRefreshCw } from "react-icons/lu"

import { AVATARS } from "../avatars"
import { Example } from "../Example"

const PEOPLE = ["Alex Chen", "林怡君", "Jordan Lee", "王小明", "Sam Rivera", "陳柏翰"]

export function LayoutPage() {
  return (
    <>
      <PageHeader
        title="Layout"
        description="The frame around this page is AppShell; the pieces below go inside it."
      />

      <Example
        title="AppShell"
        description="The app name and organization on the left; pages, color mode and the account on the right. On a phone the pages fold into a drawer. Narrow the window to see it. width=&quot;wide&quot; gives data pages up to 8xl (the Data pages tab uses it)."
        code={`
<AppShell
  appName="採購中心"
  orgName={config.orgName}
  nav={[{ href: "/batches", label: "批次", icon: <LuPackage />, active: true }]}
  renderLink={(href, children) => <NextLink href={href}>{children}</NextLink>}
  account={
    <AccountMenu name={user.name} detail={user.email}>
      <LanguageMenu languages={languages} value={locale} onChange={setLocale} />
      <Menu.Separator />
      <SignOutMenuItem onSelect={signOut} />
    </AccountMenu>
  }
  buildInfo={<BuildInfo commit={config.commit} builtAt={config.builtAt} />}
>
  {children}
</AppShell>
`}
      >
        <Text color="fg.muted">
          You are looking at it: the header above and the footer below. Open the avatar for the account menu, sign out
          to see the sign-in button.
        </Text>
      </Example>

      <Example
        title="PageHeader"
        description="The one h1 of a page, a status badge beside it, and the actions that change what the page shows. Never navigation."
        code={`
<PageHeader
  title="2026 春季採購"
  badge={<Badge colorPalette="green">Open</Badge>}
  description="Closes on 3/15"
  actions={<Button size="sm"><LuPlus /> Add item</Button>}
/>
`}
      >
        <PageHeader
          mb="0"
          title="2026 春季採購"
          badge={<Badge colorPalette="green">Open</Badge>}
          description="Closes on 3/15"
          actions={
            <>
              <Button size="sm" variant="outline">
                Close collection
              </Button>
              <Button size="sm">
                <LuPlus />
                Add item
              </Button>
            </>
          }
        />
      </Example>

      <Example
        title="SectionHeader"
        description="One group on a page: a title, how many it holds, small tools beside the title, and the section's actions on the right."
        code={`
<SectionHeader
  title="Waiting for review"
  count={3}
  tools={<IconButton size="xs" variant="ghost" aria-label="Refresh"><LuRefreshCw /></IconButton>}
  actions={<Button size="xs" variant="outline">Review all</Button>}
/>
`}
      >
        <SectionHeader
          mb="0"
          title="Waiting for review"
          count={3}
          tools={
            <IconButton size="xs" variant="ghost" aria-label="Refresh">
              <LuRefreshCw />
            </IconButton>
          }
          actions={
            <Button size="xs" variant="outline">
              Review all
            </Button>
          }
        />
      </Example>

      <Example
        title="EmptyState"
        description="What a list shows with nothing in it: short and specific, with what to do next."
        code={`
<EmptyState
  icon={<LuInbox />}
  title="還沒有採購批次"
  description="Start one to collect what everyone needs."
  actions={<Button size="sm">Start a batch</Button>}
/>
`}
      >
        <EmptyState
          icon={<LuInbox />}
          title="還沒有採購批次"
          description="Start one to collect what everyone needs."
          actions={<Button size="sm">Start a batch</Button>}
        />
      </Example>

      <Example
        title="MemberAvatar"
        description="A person's picture, or, without one, their initials on a color picked from their name: the same person gets the same color in every app."
        code={`<MemberAvatar name="林怡君" image={member.avatarUrl} />`}
      >
        <HStack gap="4" wrap="wrap">
          {PEOPLE.map((name) => (
            <Stack key={name} align="center" gap="1">
              <MemberAvatar name={name} image={AVATARS[name]} />
              <Text textStyle="xs" color="fg.muted">
                {name}
              </Text>
            </Stack>
          ))}
        </HStack>
      </Example>

      <Example
        title="BuildInfo"
        description="Which build is running, for the footer and the drawer: a release version, else the short commit and build time, else dev."
        code={`<BuildInfo version={config.version} commit={config.commit} builtAt={config.builtAt} />`}
      >
        <Stack gap="1" textStyle="sm">
          <Box>
            <BuildInfo version="1.4.0" />
          </Box>
          <Box>
            <BuildInfo commit="sha-3f9c2a1e7b" builtAt="2026-11-20T04:30:00Z" />
          </Box>
          <Box>
            <BuildInfo />
          </Box>
        </Stack>
      </Example>
    </>
  )
}
