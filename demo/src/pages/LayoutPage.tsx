import { Badge, Box, Button, Card, HStack, IconButton, Stack, Text } from "@chakra-ui/react"
import { AppCommitProvider, BuildInfo, EmptyState, MemberAvatar, TitleBar } from "@team6083/ui"
import { LuArrowLeft, LuInbox, LuListChecks, LuLock, LuPencil, LuPlus, LuRefreshCw } from "react-icons/lu"

import { AVATARS } from "../avatars"
import { Example } from "../Example"
import { WidthSwitch } from "../WidthSwitch"

const API = { name: "API", version: "v0.3.1", commit: "3f9c2a1e7b55", builtAt: "2026-11-20T04:28:00Z" }
const PART_FINDER = { name: "part-finder", version: "v1.2.0", commit: "c41d9e0a2b", builtAt: "2026-11-02T09:15:00Z" }

const BUILD_CASES = [
  { label: "A release with a version", props: `version="v0.3.1" commit`, build: <BuildInfo version="v0.3.1" commit="3f9c2a1e7b55" builtAt="2026-11-20T04:30:00Z" /> },
  { label: "Only a commit: a hosted build without a tag", props: `commit="sha-3f9c2a1e7b"`, build: <BuildInfo commit="sha-3f9c2a1e7b" builtAt="2026-11-20T04:30:00Z" /> },
  { label: "Only a version", props: `version="1.4.0"`, build: <BuildInfo version="1.4.0" /> },
  { label: "No build at all: a dev build", props: "no props", build: <BuildInfo /> },
  { label: "With a service released on its own", props: `version="v0.3.1" commit, components={[API, part-finder]}`, build: <BuildInfo name="App" version="v0.3.1" commit="sha-3f9c2a1e7b" builtAt="2026-11-20T04:30:00Z" components={[API, PART_FINDER]} /> },
  {
    label: "Outdated: the server runs a newer build",
    props: `commit, components={[API]}, inside AppCommitProvider outdated`,
    build: (
      <AppCommitProvider buildCommit={null} outdated>
        <BuildInfo name="App" commit="sha-8d1e0f2" components={[API]} />
      </AppCommitProvider>
    ),
  },
]

const PEOPLE = ["Alex Chen", "林怡君", "Jordan Lee", "王小明", "Sam Rivera", "陳柏翰"]

export function LayoutPage() {
  return (
    <>
      <TitleBar
        level={1}
        mb="6"
        title="Layout"
        description="The frame around this page is AppShell; the pieces below go inside it."
      />

      <Example
        title="AppShell"
        description="The app name and organization on the left; pages, color mode and the account on the right. On a phone the pages fold into a drawer. Narrow the window to see it. A nav item with items is a group for admin-style pages: a menu on desktop, a heading with its pages indented under it in the drawer. width is the app’s, set once: column (5xl) by default, wide (8xl) for an app with wide tables like the Data pages tab. A wide app wraps its other pages in PageColumn, so they stay in a centered 5xl column while the header stays put."
        code={`
<AppShell
  appName="採購中心"
  orgName={config.orgName}
  nav={[
    { href: "/batches", label: "批次", icon: <LuPackage />, active: true },
    // Admin pages share one entry: a menu on desktop, an indented list in the drawer.
    {
      label: "管理",
      icon: <LuSettings />,
      items: [
        { href: "/admin/users", label: "使用者" },
        { href: "/admin/teams", label: "團隊" },
      ],
    },
  ]}
  renderLink={(href, children) => <NextLink href={href}>{children}</NextLink>}
  width="wide" // the app has wide tables; leave it out if every page is a column
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
        <Stack gap="4">
          <Text color="fg.muted">
            You are looking at it: the header above and the footer below. Open the avatar for the account menu, sign out
            to see the sign-in button.
          </Text>
          <HStack gap="4" wrap="wrap">
            <Text fontWeight="medium">width</Text>
            <WidthSwitch />
          </HStack>
        </Stack>
      </Example>

      <Example
        title="TitleBar"
        description="A heading with what belongs beside it, wherever it sits: the page's one h1, a section, a card. level sets the heading (1–4) and its size. start goes before the title (a back button, an avatar), after right behind it (a status, a count, a refresh button), end on the right (the actions), and the description under the title, lined up with it. end never wraps, so on a phone the app keeps it short: here the buttons drop their text below sm. When the line runs out of room, after moves under the title; keepAfterInline keeps it beside the title and wraps the title instead, for a status that reads with it. It sets no margin: the container spaces it."
        code={`
// The page's one heading
<TitleBar
  level={1}
  title="2026 春季採購"
  after={<Badge colorPalette="green">Open</Badge>}
  description="Closes on 3/15"
  end={
    // end never wraps: on a phone, this app shows only the icon
    <Button size="sm" px={{ base: "0", sm: "3.5" }} aria-label="Add item">
      <LuPlus />
      <Box as="span" hideBelow="sm">Add item</Box>
    </Button>
  }
/>

// A record's page: back to its list in start
<TitleBar
  level={1}
  title="#7 Spring order"
  start={
    <IconButton asChild variant="ghost" size="sm" aria-label="Back to batches">
      <NextLink href="/batches"><LuArrowLeft /></NextLink>
    </IconButton>
  }
  after={<Badge colorPalette="orange">Collecting</Badge>}
  description="Opened by 林怡君 on 11/20 · closes 12/1"
  end={
    <Button size="sm" variant="outline" px={{ base: "0", sm: "3.5" }} aria-label="Edit">
      <LuPencil />
      <Box as="span" hideBelow="sm">Edit</Box>
    </Button>
  }
/>

// A section: the count is a Badge, brand only for a live list
<TitleBar
  title="Waiting for review"
  after={<>
    <Badge>3</Badge>
    <IconButton size="xs" variant="ghost" aria-label="Refresh"><LuRefreshCw /></IconButton>
  </>}
  end={
    <Button size="xs" variant="outline" px={{ base: "0", sm: "2.5" }} aria-label="Review all">
      <LuListChecks />
      <Box as="span" hideBelow="sm">Review all</Box>
    </Button>
  }
/>

// A card about a person
<Card.Header>
  <TitleBar
    level={3}
    title="林怡君"
    start={<MemberAvatar name="林怡君" size="xs" />}
    after={<Badge colorPalette="green">Present</Badge>}
  />
</Card.Header>

// A long title in a narrow card: after moves under it by default;
// keepAfterInline keeps the status beside it and wraps the title instead
<TitleBar
  level={3}
  keepAfterInline
  title="Laser-cut acrylic panels for the robot's side covers"
  after={<Badge colorPalette="orange">Collecting</Badge>}
  end={<IconButton size="xs" variant="ghost" aria-label="Edit"><LuPencil /></IconButton>}
/>
`}
      >
        <Stack gap="8">
          <TitleBar
            level={1}
            title="2026 春季採購"
            after={<Badge colorPalette="green">Open</Badge>}
            description="Closes on 3/15"
            end={
              <>
                <Button size="sm" variant="outline" px={{ base: "0", sm: "3.5" }} aria-label="Close collection">
                  <LuLock />
                  <Box as="span" hideBelow="sm">
                    Close collection
                  </Box>
                </Button>
                <Button size="sm" px={{ base: "0", sm: "3.5" }} aria-label="Add item">
                  <LuPlus />
                  <Box as="span" hideBelow="sm">
                    Add item
                  </Box>
                </Button>
              </>
            }
          />
          <TitleBar
            level={1}
            title="#7 Spring order"
            start={
              <IconButton asChild variant="ghost" size="sm" aria-label="Back to batches">
                <a href="#/layout">
                  <LuArrowLeft />
                </a>
              </IconButton>
            }
            after={<Badge colorPalette="orange">Collecting</Badge>}
            description="Opened by 林怡君 on 11/20 · closes 12/1"
            end={
              <Button size="sm" variant="outline" px={{ base: "0", sm: "3.5" }} aria-label="Edit">
                <LuPencil />
                <Box as="span" hideBelow="sm">
                  Edit
                </Box>
              </Button>
            }
          />
          <TitleBar
            title="Waiting for review"
            after={
              <>
                <Badge>3</Badge>
                <IconButton size="xs" variant="ghost" aria-label="Refresh">
                  <LuRefreshCw />
                </IconButton>
              </>
            }
            end={
              <Button size="xs" variant="outline" px={{ base: "0", sm: "2.5" }} aria-label="Review all">
                <LuListChecks />
                <Box as="span" hideBelow="sm">
                  Review all
                </Box>
              </Button>
            }
          />
          <Card.Root size="sm" maxW="sm">
            <Card.Header>
              <TitleBar level={3} title="林怡君" start={<MemberAvatar name="林怡君" size="xs" />} after={<Badge colorPalette="green">Present</Badge>} />
            </Card.Header>
            <Card.Body>
              <Text color="fg.muted">Signed in since 09:12.</Text>
            </Card.Body>
          </Card.Root>
          <HStack align="flex-start" gap="4" wrap="wrap">
            {[false, true].map((keepAfterInline) => (
              <Card.Root key={String(keepAfterInline)} size="sm" w="2xs">
                <Card.Header>
                  <TitleBar
                    level={3}
                    keepAfterInline={keepAfterInline}
                    title="Laser-cut acrylic panels for the robot's side covers"
                    after={<Badge colorPalette="orange">Collecting</Badge>}
                    end={
                      <IconButton size="xs" variant="ghost" aria-label="Edit">
                        <LuPencil />
                      </IconButton>
                    }
                  />
                </Card.Header>
                <Card.Body>
                  <Text color="fg.muted" textStyle="sm">
                    {keepAfterInline ? "keepAfterInline" : "Default"}
                  </Text>
                </Card.Body>
              </Card.Root>
            ))}
          </HStack>
        </Stack>
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
        description="Which build is running, for the footer and the drawer: the version, else the short commit, else dev. Pass the other components' builds too, each named by the app: the line shows this page's own build and nothing else, with a warning mark while the app is outdated. Click one for every build's version, commit and build time, and a button that copies them for an issue."
        code={`<BuildInfo
  name="App"
  commit={config.commit}
  builtAt={config.builtAt}
  // { version, commit, builtAt } of each
  components={[{ name: "API", ...meta.build }, { name: "part-finder", ...meta.partFinder }]}
/>`}
      >
        {/* Its own provider, so the demo's outdated switch only reaches the outdated case. */}
        <AppCommitProvider buildCommit={null}>
          <Stack gap="0" textStyle="sm" divideY="1px">
            {BUILD_CASES.map(({ label, props, build }) => (
              <HStack key={label} justify="space-between" gap="4" py="2">
                <Stack gap="0.5" minW="0">
                  <Text>{label}</Text>
                  <Text color="fg.muted" fontFamily="mono" textStyle="xs">
                    {props}
                  </Text>
                </Stack>
                <Box flexShrink="0">{build}</Box>
              </HStack>
            ))}
          </Stack>
        </AppCommitProvider>
      </Example>
    </>
  )
}
