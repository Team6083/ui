# @team6083/ui

The team's Chakra UI v3 theme and the blocks every web app needs under the
team standard, so each app stops copying the same snippets and writing the
same pages.

| Export | What it is | Standard |
| --- | --- | --- |
| `system`, `UiProvider` | The team theme (a `brand` palette) on Chakra's defaults; Chakra + color mode + the package's locale | Frontend: UI 套件 |
| `Toaster`, `toaster`, `Tooltip`, `ToggleTip`, `InfoTip`, color mode | The Chakra snippets apps used to copy into `components/ui` | |
| `NoAccessPage`, `isMissingRole` | The one page every app shows on `403 missing_role` | Auth: 使用權角色 |
| `AppCommitProvider`, `AppOutdatedBanner`, `useAppOutdated`, `useCommitCheckedFetch` | Compares the build's commit with `X-App-Commit`, shows 「系統已更新，請重新載入」 and blocks writes | Frontend: 執行期設定與托管 |
| `useFrontendOutdated` | Optional: notices a newer front end from a version file deployed with it, never an API; shows the banner without blocking writes | |
| `createRuntimeConfig`, `ConfigErrorPage`, `loadRuntimeConfig`, `parseBaseConfig` | Loads `config.json` before anything else and shows the config error page when it fails (SPAs) | Frontend: 執行期設定與托管 |
| `readApiError`, `ApiError`, `useApiErrorMessage` | Reads the standard error body; localized text for the standard codes | Common: HTTP API 慣例 |
| `StatusPage` | The layout the pages above share, for an app's own not-found or error pages | |
| `AppShell`, `AccountMenu`, `LanguageMenu`, `SignOutMenuItem`, `SignInButton`, `BuildInfo`, `ColorModeButton` | The frame every app shares, from OverHours: app name, pages with icons, color mode (system, light, dark), an account menu each app fills with its own items, phone drawer, footer, update banner | [DESIGN.md](DESIGN.md) |
| `PageHeader`, `PageColumn`, `SectionHeader`, `EmptyState`, `MemberAvatar` | A page's one heading, a page's 5xl column inside a wide app, a section's title with its count and actions, the empty-list message, a person's avatar | [DESIGN.md](DESIGN.md) |

| `DataTable`, `FilterBar`, `SelectionBar`, `FactList`, `Totals` | Pages of records to pick from and act on: a table that becomes cards on a phone with row actions in a ⋯ menu, filters behind one button, a bar for acting on the picked rows, a record's facts, amounts that add up | [DESIGN.md](DESIGN.md): Data pages |

How apps should look, and what to use these for, is in [DESIGN.md](DESIGN.md).
OverHours is the reference. Every block is on show, live and with its code, in
the [demo](https://ui.cmsrobotics.org/).

Strings come in `en` and `zh-TW`. The package does not depend on next-intl or
react-i18next: pass the app's locale to `UiProvider`.

## Install

The package is on npm:

```bash
npm install @team6083/ui @chakra-ui/react next-themes react-icons
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

## Notice a newer front end (optional)

`useFrontendOutdated` asks the front end's own deployment whether it now runs
another build, so it works however many APIs the page calls. It only shows the
banner: writes stay allowed, since the API may still match.

Deploy a version file holding the build's git SHA with the front end. In Vite,
read the commit with `loadEnv`, which also sees `.env` files, and use the same
variable for the page:

```ts
// vite.config.ts
import { defineConfig, loadEnv } from "vite"

export default defineConfig(({ mode }) => {
  const commit = loadEnv(mode, process.cwd()).VITE_COMMIT_SHA
  return {
    plugins: [
      {
        name: "version-file",
        apply: "build",
        generateBundle() {
          if (!commit && mode === "production") throw new Error("VITE_COMMIT_SHA is not set")
          this.emitFile({ type: "asset", fileName: "version.json", source: JSON.stringify({ commit }) })
        },
      },
    ],
  }
})
```

In Next.js, write `public/version.json` in a prebuild step instead.

```tsx
function Root() {
  const frontendOutdated = useFrontendOutdated({ buildCommit: import.meta.env.VITE_COMMIT_SHA, url: `${import.meta.env.BASE_URL}version.json` })
  return (
    <AppCommitProvider buildCommit={null} frontendOutdated={frontendOutdated}>
      <App />
    </AppCommitProvider>
  )
}
```

- `buildCommit={null}` leaves the `X-App-Commit` check off. Pass the commit
  there too if an API ships from the same commit and you want both.
- `url` must be absolute: with Vite's `base: "./"`, `BASE_URL` is relative and
  the file would be looked up under the current route.
- The file must hold a git SHA. A version or `unknown` never counts as a new
  build.
- Serve `version.json` and `index.html` with `Cache-Control: no-cache`. If
  `index.html` is cached, a reload brings back the old build and the banner
  stays. A service worker that precaches the app must skip `version.json`.

## Frame

`AppShell` is a client component, and `renderLink` is a function, so a Next.js
server layout cannot pass it directly. Put the frame in a small client file and
hand it what the server knows (session, server actions):

```tsx
// app/_components/frame.tsx
"use client"

import NextLink from "next/link"
import { usePathname } from "next/navigation"
import { Menu } from "@chakra-ui/react"
import { AccountMenu, AppShell, BuildInfo, SignOutMenuItem, type AppBuild } from "@team6083/ui"
import { LuLogs, LuUser } from "react-icons/lu"

// build: the API's { version, commit, builtAt }, e.g. from GET /api/v1/meta
export function Frame({ user, build, signOut, children }: { user: { name: string; image?: string }; build?: AppBuild; signOut: () => Promise<void>; children: React.ReactNode }) {
  const pathname = usePathname()
  return (
    <AppShell
      appName="OverHours"
      orgName={process.env.NEXT_PUBLIC_ORG_NAME}
      nav={[{ href: "/logs", label: "紀錄", icon: <LuLogs />, active: pathname.startsWith("/logs") }]}
      renderLink={(href, children) => <NextLink href={href}>{children}</NextLink>}
      account={
        <AccountMenu name={user.name} image={user.image}>
          {/* The app arranges its own items; the package offers LanguageMenu and SignOutMenuItem. */}
          <Menu.Item value="profile" asChild>
            <NextLink href="/profile"><LuUser />個人資料</NextLink>
          </Menu.Item>
          <SignOutMenuItem onSelect={() => void signOut()} />
        </AccountMenu>
      }
      buildInfo={<BuildInfo commit={process.env.NEXT_PUBLIC_COMMIT_SHA} builtAt={process.env.NEXT_PUBLIC_BUILD_DATE} components={build && [{ name: "API", ...build }]} />}
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

## Versions

Releases are on npm, as `latest`. Apps pin the exact version.

Each PR that changes the package adds a changeset: run `npx changeset`, pick
patch, minor or major, and write the line the changelog will carry. A change
that alters how apps look or behave without code changes on their side is a
major (a minor while on 0.x). A PR that changes nothing apps see adds
`npx changeset --empty`; CI checks for one. Branches never touch `version` in
`package.json`: it stays the last release.

A release: in one PR from a `release/vX.Y.Z` branch (CI skips the changeset
check there), run `npx changeset version`, which sets `version` from the
pending changesets, writes them into `CHANGELOG.md` and deletes them; merge,
then push a matching tag (`git tag v0.2.0 && git push origin v0.2.0`).
The release workflow checks and builds it and stages it on npm, with provenance
linking it to the workflow run. A maintainer then approves it with 2FA, under
Staged Packages on npmjs.com or with `npm stage list` and
`npm stage approve <stage-id>`, and it goes live as `latest`.

Each push to `main` that changes the package publishes a prerelease,
`<version>-alpha.<n>`, to GitHub Packages under the `next` dist-tag, so a change
can be tried in an app before it is released. `<version>` is what the pending
changesets would release, and `<n>` counts the commits since the latest release
tag, so each alpha sorts above the last release.
The
GitHub registry needs a token even though the package is public: add to the
app's `.npmrc`

```ini
@team6083:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
```

set `NODE_AUTH_TOKEN` to a token with `read:packages` (`gh auth refresh -h
github.com -s read:packages`, then `export NODE_AUTH_TOKEN=$(gh auth token)`;
in a workflow, `secrets.GITHUB_TOKEN` with `packages: read`), and run
`npm install --save-exact @team6083/ui@next`. Go back to a release by removing
those lines.

## Development

See [CONTRIBUTING.md](CONTRIBUTING.md). Configuration is in
[docs/configuration.md](docs/configuration.md).

## License

[Apache-2.0](LICENSE)
