"use client"

import {
  Box,
  Button,
  CloseButton,
  Container,
  Drawer,
  Flex,
  Heading,
  HStack,
  IconButton,
  Menu,
  Portal,
  Separator,
  Stack,
  Text,
  type ContainerProps,
} from "@chakra-ui/react"
import { cloneElement, isValidElement, type ReactElement, type ReactNode } from "react"
import { LuChevronRight, LuLanguages, LuLogIn, LuLogOut, LuMenu } from "react-icons/lu"

import { ColorModeButton } from "../chakra/color-mode.js"
import { useUiMessages } from "../i18n.js"
import { AppOutdatedBanner } from "./app-commit.js"
import { MemberAvatar } from "./member-avatar.js"

/**
 * Renders a client-side link around `children`. Next.js:
 * `(href, children) => <NextLink href={href}>{children}</NextLink>`; react-router:
 * `(href, children) => <Link to={href}>{children}</Link>`. Defaults to a plain <a>.
 */
export type RenderLink = (href: string, children: ReactNode) => ReactElement

const plainLink: RenderLink = (href, children) => <a href={href}>{children}</a>

export interface NavItem {
  href: string
  label: ReactNode
  /** A react-icons icon, shown before the label. */
  icon?: ReactNode
  /** The page the user is on; shown highlighted and marked aria-current. */
  active?: boolean
}

/** Other Container props (padding, margins) go to the content area, `<main>`. */
export interface AppShellProps extends Omit<ContainerProps, "title"> {
  /** The app's name, linking home. */
  appName: ReactNode
  /** The organization's display name, from configuration (never hard-coded). */
  orgName?: ReactNode
  homeHref?: string
  /** About five pages, each a word or two; they fold into a drawer on phones. */
  nav?: NavItem[]
  renderLink?: RenderLink
  /** An <AccountMenu>, or a sign-in button when signed out. */
  account?: ReactNode
  /** Extra controls left of the color mode toggle; keep it to icons. */
  actions?: ReactNode
  /** The build line in the footer and the drawer, e.g. <BuildInfo />. */
  buildInfo?: ReactNode
  /** The footer's left side, e.g. © year and the organization. */
  footer?: ReactNode
  /**
   * "column" (default): one 5xl column for pages read top to bottom.
   * "wide": up to 8xl, for pages whose point is a wide table (a batch's items,
   * placing orders). Text-only pages stay in the column. The header and
   * footer are always the wide width and a column page starts at their left
   * edge, so nothing moves when the user goes from one kind of page to the other.
   */
  width?: "column" | "wide"
  children: ReactNode
}

function NavButton({ item, renderLink, onClick }: { item: NavItem; renderLink: RenderLink; onClick?: () => void }) {
  const link = renderLink(
    item.href,
    <>
      {item.icon}
      {item.label}
    </>,
  )
  return (
    <Button size="sm" variant={item.active ? "subtle" : "ghost"} justifyContent="flex-start" asChild onClick={onClick}>
      {isValidElement(link) ? cloneElement(link as ReactElement<{ "aria-current"?: string }>, { "aria-current": item.active ? "page" : undefined }) : link}
    </Button>
  )
}

/**
 * The frame every team app shares (taken from OverHours): the app name and
 * organization on the left; the pages, the color mode toggle and the account on
 * the right; a drawer with the pages on phones; a quiet footer. Content sits in
 * one centered 5xl column. The update banner shows above it when the server is
 * on a newer build.
 */
export function AppShell({
  appName,
  orgName,
  homeHref = "/",
  nav = [],
  renderLink = plainLink,
  account,
  actions,
  buildInfo,
  footer,
  width = "column",
  children,
  ...containerProps
}: AppShellProps) {
  const m = useUiMessages().shell
  // The frame (header, content area, footer) is always 8xl, so it never moves;
  // a column page keeps its text to 5xl from the frame's left edge.
  const frameW = "8xl"
  const contentW = width === "wide" ? undefined : "5xl"

  return (
    <>
      <AppOutdatedBanner />
      <Container maxW={frameW} fluid px="4" pt="4" mt="2">
        <Flex as="header" align="center" justify="space-between" gap="3" mb="4">
          <Stack gap="0" minW="0">
            <Heading as="div" size="xl" display="flex" alignItems="baseline" gap="2">
              <Box as="span" truncate>
                {renderLink(homeHref, appName)}
              </Box>
              {orgName && (
                <Box as="span" textStyle="md" fontWeight="normal" hideBelow="md" truncate>
                  {orgName}
                </Box>
              )}
            </Heading>
            {orgName && (
              <Text as="span" textStyle="xs" hideFrom="md" truncate>
                {orgName}
              </Text>
            )}
          </Stack>

          <HStack gap="2" flexShrink={0}>
            {nav.length > 0 && (
              <HStack as="nav" gap="1" hideBelow="md">
                {nav.map((item) => (
                  <NavButton key={item.href} item={item} renderLink={renderLink} />
                ))}
              </HStack>
            )}
            {actions}
            <ColorModeButton hideBelow="md" />
            {account}

            <Drawer.Root size="xs" placement="start">
              <Drawer.Trigger asChild>
                <IconButton hideFrom="md" size="sm" variant="outline" aria-label={m.openMenu}>
                  <LuMenu />
                </IconButton>
              </Drawer.Trigger>
              <Portal>
                <Drawer.Backdrop />
                <Drawer.Positioner>
                  <Drawer.Content maxW="3xs">
                    <Drawer.Context>
                      {(drawer) => (
                        <>
                          <Drawer.Header>
                            <Drawer.Title>{m.menu}</Drawer.Title>
                          </Drawer.Header>
                          <Drawer.Body>
                            <Separator mb="4" />
                            <Stack as="nav" gap="2">
                              {nav.map((item) => (
                                <NavButton key={item.href} item={item} renderLink={renderLink} onClick={() => drawer.setOpen(false)} />
                              ))}
                            </Stack>
                          </Drawer.Body>
                          <Drawer.Footer justifyContent="space-between">
                            <Box textStyle="xs" color="fg.muted">
                              {buildInfo}
                            </Box>
                            <ColorModeButton />
                          </Drawer.Footer>
                        </>
                      )}
                    </Drawer.Context>
                    <Drawer.CloseTrigger asChild>
                      <CloseButton size="sm" />
                    </Drawer.CloseTrigger>
                  </Drawer.Content>
                </Drawer.Positioner>
              </Portal>
            </Drawer.Root>
          </HStack>
        </Flex>
      </Container>

      <Container as="main" maxW={frameW} fluid px="4" pb="4" mb="2" {...containerProps}>
        <Box maxW={contentW}>{children}</Box>
      </Container>

      {(footer || buildInfo) && (
        <Container as="footer" maxW={frameW} fluid mb="8">
          <Flex direction={{ base: "column", sm: "row" }} justify="space-between" gap="2" textStyle="xs" color="fg.muted" textAlign={{ base: "center", sm: "start" }}>
            <Box>{footer}</Box>
            <Box hideBelow="sm" textAlign="end">
              {buildInfo}
            </Box>
          </Flex>
        </Container>
      )}
    </>
  )
}

export interface AccountMenuProps {
  name: string
  image?: string | null
  /** Shown under the name at the top of the menu, e.g. the email. */
  detail?: ReactNode
  /**
   * The menu's contents, in the app's own order: Chakra's Menu.Item,
   * Menu.Separator and Menu.ItemGroup, and this package's LanguageMenu and
   * SignOutMenuItem. Sign out goes last.
   */
  children: ReactNode
  /** Called with the selected item's value; a Next.js server action works too. */
  onSelect?: (value: string) => void | Promise<void>
}

/** The signed-in user's avatar, opening the app's account menu under their name. */
export function AccountMenu({ name, image, detail, children, onSelect }: AccountMenuProps) {
  return (
    <Menu.Root positioning={{ placement: "bottom-end" }} onSelect={onSelect && (({ value }) => void onSelect(value))}>
      <Menu.Trigger asChild>
        <Button variant="plain" p="0" h="auto" minW="0" rounded="full" aria-label={name}>
          <MemberAvatar name={name} image={image} size="sm" />
        </Button>
      </Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <Menu.Content minW="48">
            <Box px="2" py="1.5">
              <Text fontWeight="medium" truncate>
                {name}
              </Text>
              {detail && (
                <Text textStyle="xs" color="fg.muted" truncate>
                  {detail}
                </Text>
              )}
            </Box>
            <Menu.Separator />
            {children}
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  )
}

export interface LanguageMenuProps {
  /** The languages to offer, each labeled in its own language (English, 繁體中文). */
  languages: { value: string; label: string }[]
  value: string
  onChange: (value: string) => void
}

/** A 語言 item in the account menu that opens the languages beside it, the current one checked. */
export function LanguageMenu({ languages, value, onChange }: LanguageMenuProps) {
  const m = useUiMessages().shell
  const current = languages.find((l) => l.value === value)
  return (
    <Menu.Root positioning={{ placement: "left-start", gutter: 2 }}>
      <Menu.TriggerItem>
        <LuLanguages />
        <Box flex="1">{m.language}</Box>
        {current && (
          <Text as="span" color="fg.muted" textStyle="xs">
            {current.label}
          </Text>
        )}
        <LuChevronRight />
      </Menu.TriggerItem>
      <Portal>
        <Menu.Positioner>
          <Menu.Content>
            <Menu.RadioItemGroup value={value} onValueChange={(e) => onChange(e.value)}>
              {languages.map((language) => (
                <Menu.RadioItem key={language.value} value={language.value}>
                  <Menu.ItemText>{language.label}</Menu.ItemText>
                  <Menu.ItemIndicator />
                </Menu.RadioItem>
              ))}
            </Menu.RadioItemGroup>
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  )
}

/** The last item of the account menu. */
export function SignOutMenuItem({ value = "signout", onSelect }: { value?: string; onSelect?: () => void }) {
  const m = useUiMessages().shell
  return (
    <Menu.Item value={value} onSelect={onSelect}>
      <LuLogOut />
      {m.signOut}
    </Menu.Item>
  )
}

/** The account slot when signed out. */
export function SignInButton({ onClick }: { onClick: () => void | Promise<void> }) {
  const m = useUiMessages().shell
  return (
    <Button size="sm" onClick={() => void onClick()}>
      {m.signIn}
      <LuLogIn />
    </Button>
  )
}

export interface BuildInfoProps {
  /** A release version; shown instead of the commit when set. */
  version?: string | null
  commit?: string | null
  /** ISO time the build ran. */
  builtAt?: string | null
}

/** Which build is running: the version, else the short commit and build time, else "dev". */
export function BuildInfo({ version, commit, builtAt }: BuildInfoProps) {
  if (version) return <Text as="span">{version}</Text>
  if (!commit) return <Text as="span">dev</Text>
  const time = builtAt ? new Date(builtAt) : null
  return (
    <Text as="span" fontFamily="mono">
      {commit.replace(/^sha-/, "").slice(0, 7)}
      {time && !Number.isNaN(time.getTime()) && <Text as="span" fontFamily="body" suppressHydrationWarning>{` · ${time.toLocaleString()}`}</Text>}
    </Text>
  )
}
