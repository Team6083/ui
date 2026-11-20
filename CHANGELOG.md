# Changelog

All notable changes to this package are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the package uses
[Semantic Versioning](https://semver.org/): a change that alters how apps look
or behave without code changes on their side is a major version.

## [Unreleased]

## [0.1.0] - 2026-11-20

The first release. `0.1.0-alpha.<n>` prereleases came before it.

### Theme and setup

- `system`: the team theme on Chakra's defaults, with a `brand` palette (Chakra's
  blue until the team picks a color); fonts stay Chakra's system stack.
- `UiProvider`: Chakra, color mode and the package's locale (`en`, `zh-TW`).
- Chakra snippets: color mode (`ColorModeButton` offers system, light and dark),
  `Toaster`, `Tooltip`, `ToggleTip`, `InfoTip`.

### Standard blocks

- `StatusPage`, `NoAccessPage`, `ConfigErrorPage`.
- `createRuntimeConfig`, `loadRuntimeConfig` (an HTML answer, the SPA fallback,
  counts as a missing `config.json`), `parseBaseConfig`.
- `AppCommitProvider` (compares the build's commit with `X-App-Commit`, or takes
  `outdated` from apps that detect a new build themselves), `AppOutdatedBanner`,
  `useCommitCheckedFetch`, `commitsDiffer`.
- `readApiError`, `ApiError`, `useApiErrorMessage`.

### Layout

- From OverHours: `AppShell` (header, pages, color mode, account, phone drawer,
  footer, update banner; `width="wide"` for data pages), `AccountMenu` (the
  app's own items as children), `LanguageMenu`, `SignOutMenuItem`,
  `SignInButton`, `BuildInfo`, `MemberAvatar`, `PageHeader` (with a `badge`
  beside the title), `SectionHeader`, `EmptyState`.

### Data pages

- `DataTable`: cards on a phone, row actions in a ⋯ menu, picking rows by row,
  group and all, group headings.
- `FilterBar` (search and one button for the filters; `positioning` sets where
  the popover opens, and it scrolls on short screens), `SelectionBar`,
  `FactList`, `Totals`.

### Docs

- `DESIGN.md`: the team's design rules, with OverHours as the reference,
  including "Data pages" and "Reviewing a change".

[Unreleased]: https://github.com/Team6083/ui/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/Team6083/ui/releases/tag/v0.1.0
