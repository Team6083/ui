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
import { LuLogIn, LuMenu } from "react-icons/lu"

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
  children,
  ...containerProps
}: AppShellProps) {
  const m = useUiMessages().shell

  return (
    <>
      <AppOutdatedBanner />
      <Container maxW="5xl" fluid p="4" my="2" {...containerProps}>
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

        <Box as="main">{children}</Box>
      </Container>

      {(footer || buildInfo) && (
        <Container as="footer" maxW="5xl" fluid mb="8">
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

export interface AccountMenuItem {
  value: string
  label: ReactNode
  icon?: ReactNode
  /** Runs on select; a Next.js server action works too. */
  onSelect?: () => void | Promise<void>
}

export interface AccountMenuProps {
  name: string
  image?: string | null
  /** Shown under the name at the top of the menu, e.g. the email. */
  detail?: ReactNode
  /** Sign out goes last. */
  items: AccountMenuItem[]
}

/** The signed-in user's avatar, opening a menu of account actions. */
export function AccountMenu({ name, image, detail, items }: AccountMenuProps) {
  return (
    <Menu.Root positioning={{ placement: "bottom-end" }} onSelect={({ value }) => void items.find((i) => i.value === value)?.onSelect?.()}>
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
            {items.map((item) => (
              <Menu.Item key={item.value} value={item.value}>
                {item.icon}
                {item.label}
              </Menu.Item>
            ))}
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
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
