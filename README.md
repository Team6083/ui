# @team6083/ui

The team's Chakra UI v3 theme and the blocks every web app needs under the
team standard (the wiki's `/it-team/standards`), so each app stops copying the
same snippets and writing the same pages.

| Export | What it is | Standard |
| --- | --- | --- |
| `system`, `UiProvider` | The team theme (a `brand` palette) on Chakra's defaults; Chakra + color mode + the package's locale | Frontend: UI 套件 |
| `Toaster`, `toaster`, `Tooltip`, `ToggleTip`, `InfoTip`, color mode | The Chakra snippets apps used to copy into `components/ui` | |
| `NoAccessPage`, `isMissingRole` | The one page every app shows on `403 missing_role` | Auth: 使用權角色 |
| `AppCommitProvider`, `AppOutdatedBanner`, `useAppOutdated`, `useCommitCheckedFetch` | Compares the build's commit with `X-App-Commit`, shows 「系統已更新，請重新載入」 and blocks writes | Frontend: 執行期設定與托管 |
| `createRuntimeConfig`, `ConfigErrorPage`, `loadRuntimeConfig`, `parseBaseConfig` | Loads `config.json` before anything else and shows the config error page when it fails (SPAs) | Frontend: 執行期設定與托管 |
| `readApiError`, `ApiError`, `useApiErrorMessage` | Reads the standard error body; localized text for the standard codes | Common: HTTP API 慣例 |
| `StatusPage` | The layout the pages above share, for an app's own not-found or error pages | |
| `AppShell`, `AccountMenu`, `SignInButton`, `BuildInfo` | The frame every app shares, from OverHours: app name, pages with icons, color mode, account, phone drawer, footer, update banner | [DESIGN.md](DESIGN.md) |
| `PageHeader`, `SectionHeader`, `EmptyState`, `MemberAvatar` | A page's one heading, a section's title with its count and actions, the empty-list message, a person's avatar | [DESIGN.md](DESIGN.md) |

How apps should look, and what to use these for, is in [DESIGN.md](DESIGN.md).
OverHours is the reference.

Strings come in `en` and `zh-TW`. The package does not depend on next-intl or
react-i18next: pass the app's locale to `UiProvider`.

## Install

```bash
npm install @team6083/ui @chakra-ui/react next-themes
```

Then delete the app's own copies of `components/ui/provider.tsx`,
`color-mode.tsx`, `toaster.tsx`, `tooltip.tsx` and `toggle-tip.tsx`, and import
them from the package.

## Use it in Next.js

```tsx
// app/providers.tsx
"use client"

import { AppCommitProvider, AppOutdatedBanner, Toaster, UiProvider } from "@team6083/ui"

export function Providers({ locale, nonce, children }: { locale: string; nonce?: string; children: React.ReactNode }) {
  return (
    <UiProvider locale={locale} nonce={nonce}>
      {/* Server actions don't expose response headers, so poll an endpoint that sends X-App-Commit. */}
      <AppCommitProvider buildCommit={process.env.NEXT_PUBLIC_COMMIT_SHA} pollUrl="/api/healthz">
        <AppOutdatedBanner />
        {children}
        <Toaster />
      </AppCommitProvider>
    </UiProvider>
  )
}
```

Disable save buttons with `useAppOutdated()`. When the server returns
`missing_role`, render `<NoAccessPage actions={<SignOutButton />} />`.

## Use it in a Vite SPA

```tsx
// src/config.ts
import { baseConfigIssues, ConfigError, createRuntimeConfig, type BaseRuntimeConfig } from "@team6083/ui"

export type AppConfig = BaseRuntimeConfig & { slackUrl: string }

function parseConfig(raw: unknown): AppConfig {
  const issues = baseConfigIssues(raw)
  const slackUrl = (raw as Partial<AppConfig> | null)?.slackUrl
  if (typeof slackUrl !== "string" || slackUrl === "") issues.push("slackUrl is missing or empty")
  if (issues.length > 0) throw new ConfigError(issues)
  return raw as AppConfig
}

export const { RuntimeConfigProvider, useRuntimeConfig } = createRuntimeConfig({
  parse: parseConfig,
  basePath: import.meta.env.BASE_URL,
})
```

```tsx
// src/main.tsx
<UiProvider locale={i18n.language}>
  <RuntimeConfigProvider>
    <AppCommitProvider buildCommit={import.meta.env.VITE_COMMIT_SHA}>
      <AppOutdatedBanner />
      <App />
    </AppCommitProvider>
  </RuntimeConfigProvider>
</UiProvider>
```

Build the API client on `useCommitCheckedFetch()`: it checks `X-App-Commit` on
every response and, once the app is outdated, rejects writes with an `ApiError`
whose code is `app_outdated`. Turn failed responses into errors with
`readApiError(response)` and show them with `useApiErrorMessage()`.

## Frame

`AppShell` is a client component, and `renderLink` is a function, so a Next.js
server layout cannot pass it directly. Put the frame in a small client file and
hand it what the server knows (session, server actions):

```tsx
// app/_components/frame.tsx
"use client"

import NextLink from "next/link"
import { usePathname } from "next/navigation"
import { AccountMenu, AppShell, BuildInfo } from "@team6083/ui"
import { LuLogOut, LuLogs } from "react-icons/lu"

export function Frame({ user, signOut, children }: { user: { name: string; image?: string }; signOut: () => Promise<void>; children: React.ReactNode }) {
  const pathname = usePathname()
  return (
    <AppShell
      appName="OverHours"
      orgName={process.env.NEXT_PUBLIC_ORG_NAME}
      nav={[{ href: "/logs", label: "紀錄", icon: <LuLogs />, active: pathname.startsWith("/logs") }]}
      renderLink={(href, children) => <NextLink href={href}>{children}</NextLink>}
      account={<AccountMenu name={user.name} image={user.image} items={[{ value: "signout", label: "登出", icon: <LuLogOut />, onSelect: signOut }]} />}
      buildInfo={<BuildInfo commit={process.env.NEXT_PUBLIC_COMMIT_SHA} builtAt={process.env.NEXT_PUBLIC_BUILD_DATE} />}
    >
      {children}
    </AppShell>
  )
}
```

With react-router: `renderLink={(href, children) => <Link to={href}>{children}</Link>}`.

## Theme

`brand` is the primary color: use `colorPalette="brand"` for the app's own
emphasis (today, the current user, primary actions) instead of naming a hue.
The team has no brand color yet, so it points at Chakra's blue. Every other
token is Chakra's default until the team decides otherwise.

## Development

See [CONTRIBUTING.md](CONTRIBUTING.md). Configuration is in
[docs/configuration.md](docs/configuration.md).

## License

[Apache-2.0](LICENSE)
