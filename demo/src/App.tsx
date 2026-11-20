import { Menu } from "@chakra-ui/react"
import {
  AccountMenu,
  AppCommitProvider,
  AppShell,
  BuildInfo,
  LanguageMenu,
  SignInButton,
  SignOutMenuItem,
  Toaster,
  UiProvider,
  type NavItem,
} from "@team6083/ui"
import { useMemo, useState, type ReactNode } from "react"
import { LuBlocks, LuHouse, LuLayoutTemplate, LuShieldAlert, LuTable, LuUser } from "react-icons/lu"

import { DemoStateContext, type DemoState } from "./demo-state"
import { DataPage } from "./pages/DataPage"
import { LayoutPage } from "./pages/LayoutPage"
import { OverviewPage } from "./pages/OverviewPage"
import { SnippetsPage } from "./pages/SnippetsPage"
import { StandardPagesPage } from "./pages/StandardPagesPage"
import { useRoute } from "./route"

const PAGES: { path: string; label: string; icon: ReactNode; page: () => ReactNode; wide?: boolean }[] = [
  { path: "/", label: "Overview", icon: <LuHouse />, page: () => <OverviewPage /> },
  { path: "/layout", label: "Layout", icon: <LuLayoutTemplate />, page: () => <LayoutPage /> },
  { path: "/data", label: "Data pages", icon: <LuTable />, page: () => <DataPage />, wide: true },
  { path: "/standard", label: "Standard pages", icon: <LuShieldAlert />, page: () => <StandardPagesPage /> },
  { path: "/snippets", label: "Snippets", icon: <LuBlocks />, page: () => <SnippetsPage /> },
]

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "zh-TW", label: "繁體中文" },
]

export function App() {
  const route = useRoute()
  const [locale, setLocale] = useState("zh-TW")
  const [outdated, setOutdated] = useState(false)
  const [signedIn, setSignedIn] = useState(true)
  const state = useMemo<DemoState>(() => ({ locale, setLocale, outdated, setOutdated }), [locale, outdated])

  const page = PAGES.find((p) => p.path === route) ?? PAGES[0]!
  const nav: NavItem[] = PAGES.map((p) => ({ href: `#${p.path}`, label: p.label, icon: p.icon, active: p === page }))

  return (
    <UiProvider locale={locale}>
      <DemoStateContext.Provider value={state}>
        <AppCommitProvider buildCommit={null} outdated={outdated}>
          <AppShell
            appName="@team6083/ui"
            orgName="Team 6083"
            homeHref="#/"
            nav={nav}
            width={page.wide ? "wide" : "column"}
            account={
              signedIn ? (
                <AccountMenu name="Alex Chen" detail="alex@example.com">
                  <Menu.Item value="profile">
                    <LuUser />
                    Profile
                  </Menu.Item>
                  <LanguageMenu languages={LANGUAGES} value={locale} onChange={setLocale} />
                  <Menu.Separator />
                  <SignOutMenuItem onSelect={() => setSignedIn(false)} />
                </AccountMenu>
              ) : (
                <SignInButton onClick={() => setSignedIn(true)} />
              )
            }
            buildInfo={<BuildInfo commit={import.meta.env.VITE_COMMIT} builtAt={import.meta.env.VITE_BUILT_AT} />}
            footer={
              <>
                © {new Date().getFullYear()} Team 6083 ·{" "}
                <a href="https://github.com/Team6083/ui">GitHub</a>
              </>
            }
          >
            {page.page()}
          </AppShell>
          <Toaster />
        </AppCommitProvider>
      </DemoStateContext.Provider>
    </UiProvider>
  )
}
