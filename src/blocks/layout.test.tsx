import { Menu } from "@chakra-ui/react"
import { screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { LuLogs } from "react-icons/lu"

import { renderWithUi } from "../test-utils.js"
import { ColorModeButton } from "../chakra/color-mode.js"
import { AppCommitProvider } from "./app-commit.js"
import { AccountMenu, AppShell, BuildInfo, LanguageMenu, SignOutMenuItem } from "./app-shell.js"
import { avatarPaletteFor } from "./member-avatar.js"
import { EmptyState, PageColumn, PageHeader, SectionHeader } from "./page-parts.js"

describe("AppShell", () => {
  const nav = [
    { href: "/logs", label: "Logs", icon: <LuLogs />, active: true },
    { href: "/report", label: "Reports" },
  ]

  it("links the app name home and marks the current page", () => {
    renderWithUi(
      <AppShell appName="OverHours" orgName="Org" nav={nav}>
        <p>content</p>
      </AppShell>,
    )
    expect(screen.getByRole("link", { name: "OverHours" })).toHaveAttribute("href", "/")
    const header = screen.getByRole("banner")
    expect(within(header).getByRole("link", { name: "Logs" })).toHaveAttribute("aria-current", "page")
    expect(within(header).getByRole("link", { name: "Reports" })).not.toHaveAttribute("aria-current")
    expect(screen.getByRole("main")).toHaveTextContent("content")
  })

  it("renders links through renderLink", () => {
    renderWithUi(
      <AppShell appName="App" nav={nav} renderLink={(href, children) => <a href={`/base${href}`} data-router>{children}</a>}>
        <p />
      </AppShell>,
    )
    expect(within(screen.getByRole("banner")).getByRole("link", { name: "Reports" })).toHaveAttribute("href", "/base/report")
  })

  it("shows the footer and build only when given", () => {
    const { unmount } = renderWithUi(<AppShell appName="App"><p /></AppShell>)
    expect(screen.queryByRole("contentinfo")).not.toBeInTheDocument()
    unmount()
    renderWithUi(<AppShell appName="App" footer="© 2026" buildInfo={<BuildInfo commit="sha-abc1234def" />}><p /></AppShell>)
    expect(screen.getByRole("contentinfo")).toHaveTextContent("© 2026")
    expect(screen.getByRole("contentinfo")).toHaveTextContent("abc1234")
  })
})

describe("PageColumn", () => {
  it("holds the page's content inside the app's main area", () => {
    renderWithUi(
      <AppShell appName="App" width="wide">
        <PageColumn>
          <PageHeader title="Settings" />
        </PageColumn>
      </AppShell>,
    )
    expect(within(screen.getByRole("main")).getByRole("heading", { level: 1, name: "Settings" })).toBeInTheDocument()
  })
})

describe("AccountMenu", () => {
  it("holds the app's own items, a language submenu and sign out", async () => {
    const signOut = vi.fn()
    const changeLanguage = vi.fn()
    const onSelect = vi.fn()
    const user = userEvent.setup()
    renderWithUi(
      <AccountMenu name="黃薰磊" detail="me@example.test" onSelect={onSelect}>
        <Menu.Item value="profile">個人資料</Menu.Item>
        <LanguageMenu
          languages={[
            { value: "en", label: "English" },
            { value: "zh-TW", label: "繁體中文" },
          ]}
          value="zh-TW"
          onChange={changeLanguage}
        />
        <SignOutMenuItem onSelect={signOut} />
      </AccountMenu>,
      { locale: "zh-TW" },
    )
    await user.click(screen.getByRole("button", { name: "黃薰磊" }))
    // The languages stay folded under one item.
    expect(screen.queryByRole("menuitemradio", { name: "English" })).not.toBeInTheDocument()
    await user.click(await screen.findByRole("menuitem", { name: /語言/ }))
    await user.click(await screen.findByRole("menuitemradio", { name: "English" }))
    expect(changeLanguage).toHaveBeenCalledWith("en")

    await user.click(screen.getByRole("button", { name: "黃薰磊" }))
    await user.click(await screen.findByRole("menuitem", { name: "個人資料" }))
    expect(onSelect).toHaveBeenCalledWith("profile")

    await user.click(screen.getByRole("button", { name: "黃薰磊" }))
    await user.click(await screen.findByRole("menuitem", { name: "登出" }))
    expect(signOut).toHaveBeenCalledOnce()
  })
})

describe("ColorModeButton", () => {
  it("offers system, light and dark", async () => {
    const user = userEvent.setup()
    renderWithUi(<ColorModeButton />, { locale: "zh-TW" })
    await user.click(await screen.findByRole("button", { name: "外觀" }))
    const options = await screen.findAllByRole("menuitemradio")
    expect(options.map((o) => o.textContent)).toEqual(["跟隨系統", "淺色", "深色"])
    expect(screen.getByRole("menuitemradio", { name: "跟隨系統" })).toHaveAttribute("aria-checked", "true")
    await user.click(screen.getByRole("menuitemradio", { name: "深色" }))
    await waitFor(() => expect(document.documentElement).toHaveClass("dark"))
  })
})

describe("BuildInfo", () => {
  it("shows the version, else the short commit, else dev", () => {
    const { rerender } = renderWithUi(<BuildInfo version="1.2.0" commit="sha-abc1234def" />)
    expect(screen.getByRole("button", { name: "Build details" })).toHaveTextContent(/^1\.2\.0$/)
    rerender(<BuildInfo commit="sha-abc1234def" />)
    expect(screen.getByRole("button", { name: "Build details" })).toHaveTextContent(/^abc1234$/)
    rerender(<BuildInfo />)
    expect(screen.getByText("dev")).toBeInTheDocument()
    expect(screen.queryByRole("button")).not.toBeInTheDocument()
  })

  it("shows one name while every build shares a commit and a version", () => {
    renderWithUi(<BuildInfo name="App" commit="a1b2c3d" components={[{ name: "API", version: "v0.3.1", commit: "a1b2c3d4e5f6" }, { name: "Worker", commit: "a1b2c3d" }]} />)
    expect(screen.getByRole("button", { name: "Build details" })).toHaveTextContent(/^v0\.3\.1$/)
  })

  it("shows this page's build when the builds differ, marked while outdated", () => {
    const { rerender } = renderWithUi(<BuildInfo name="App" version="2.0.0" commit="a1b2c3d" components={[{ name: "API", version: "v0.3.1", commit: "e4f5a6b" }]} />)
    const trigger = () => screen.getByRole("button", { name: "Build details" })
    expect(trigger()).toHaveTextContent(/^2\.0\.0$/)
    expect(trigger().querySelector("svg")).toBeNull()
    rerender(
      <AppCommitProvider buildCommit="a1b2c3d" outdated>
        <BuildInfo name="App" commit="a1b2c3d" components={[{ name: "API", version: "v0.3.1", commit: "e4f5a6b" }]} />
      </AppCommitProvider>,
    )
    expect(trigger()).toHaveTextContent(/^a1b2c3d$/)
    expect(trigger().querySelector("svg")).not.toBeNull()
  })

  it("lists every build and copies them", async () => {
    const user = userEvent.setup()
    renderWithUi(<BuildInfo name="App" commit="a1b2c3d" builtAt="2026-11-20T04:30:00Z" components={[{ name: "API", version: "v0.3.1", commit: "e4f5a6b", builtAt: "2026-11-20T04:28:00Z" }]} />)
    await user.click(screen.getByRole("button", { name: "Build details" }))
    const details = within(await screen.findByRole("dialog"))
    expect(details.getByText("App")).toBeVisible()
    expect(details.getByText("API")).toBeVisible()
    expect(details.getByText("v0.3.1")).toBeVisible()
    await user.click(details.getByRole("button", { name: /copy/i }))
    expect(await navigator.clipboard.readText()).toBe("App: a1b2c3d 2026-11-20T04:30:00Z\nAPI: v0.3.1 e4f5a6b 2026-11-20T04:28:00Z")
  })
})

describe("avatarPaletteFor", () => {
  it("is stable per name", () => {
    expect(avatarPaletteFor("黃薰磊")).toBe(avatarPaletteFor("黃薰磊"))
  })
})

describe("SectionHeader and EmptyState", () => {
  it("shows the count and the actions", () => {
    renderWithUi(<SectionHeader title="目前簽到中的使用者" count={0} actions={<button>幫其他使用者簽到</button>} />)
    expect(screen.getByRole("heading", { name: "目前簽到中的使用者" })).toBeInTheDocument()
    expect(screen.getByText("0")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "幫其他使用者簽到" })).toBeInTheDocument()
  })

  it("renders title and description", () => {
    renderWithUi(<EmptyState title="現在沒人" description="目前沒有使用者簽到中。" />)
    expect(screen.getByText("現在沒人")).toBeInTheDocument()
    expect(screen.getByText("目前沒有使用者簽到中。")).toBeInTheDocument()
  })

  it("keeps the page badge out of the heading's name", () => {
    renderWithUi(<PageHeader title="#7 Spring order" badge={<span>Collecting</span>} />)
    expect(screen.getByRole("heading", { name: "#7 Spring order" })).toBeInTheDocument()
    expect(screen.getByText("Collecting")).toBeInTheDocument()
  })
})
