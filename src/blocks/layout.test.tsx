import { screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { LuLogs } from "react-icons/lu"

import { renderWithUi } from "../test-utils.js"
import { AccountMenu, AppShell, BuildInfo } from "./app-shell.js"
import { avatarPaletteFor } from "./member-avatar.js"
import { EmptyState, SectionHeader } from "./page-parts.js"

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

describe("AccountMenu", () => {
  it("runs the selected item", async () => {
    const signOut = vi.fn()
    const user = userEvent.setup()
    renderWithUi(<AccountMenu name="黃薰磊" detail="me@example.test" items={[{ value: "signout", label: "登出", onSelect: signOut }]} />, { locale: "zh-TW" })
    await user.click(screen.getByRole("button", { name: "黃薰磊" }))
    await user.click(await screen.findByRole("menuitem", { name: "登出" }))
    expect(signOut).toHaveBeenCalledOnce()
  })
})

describe("BuildInfo", () => {
  it("prefers the version, then the commit, then dev", () => {
    const { rerender } = renderWithUi(<BuildInfo version="1.2.0" commit="abc1234" />)
    expect(screen.getByText("1.2.0")).toBeInTheDocument()
    rerender(<BuildInfo />)
    expect(screen.getByText("dev")).toBeInTheDocument()
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
})
