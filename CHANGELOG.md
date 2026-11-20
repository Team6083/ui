# Changelog

All notable changes to this package are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the package uses
[Semantic Versioning](https://semver.org/): a change that alters how apps look
or behave without code changes on their side is a major version.

## [Unreleased]

Not released yet; published as `0.1.0-alpha.<n>` prereleases.

### Fixed

- `DataTable`: in a grouped table with selection, the group heading's checkbox
  lines up with the group name on wide screens.
- `FilterBar`: when the screen is too short for the filters, the popover scrolls
  instead of spilling its fields over the page; a new `positioning` prop changes
  where it opens.

### Added

- `system`: the team theme on Chakra's defaults, with a `brand` palette (Chakra's
  blue until the team picks a color); fonts stay Chakra's system stack.
- `UiProvider`: Chakra, color mode and the package's locale (`en`, `zh-TW`).
- Chakra snippets: color mode (`ColorModeButton` offers system, light and dark), `Toaster`, `Tooltip`, `ToggleTip`, `InfoTip`.
- Standard blocks: `StatusPage`, `NoAccessPage`, `ConfigErrorPage`,
  `createRuntimeConfig`, `AppCommitProvider`, `AppOutdatedBanner`,
  `useCommitCheckedFetch`, `useApiErrorMessage`.
- Layout from OverHours: `AppShell` (header, pages, color mode, account, phone
  drawer, footer, update banner), `AccountMenu` (the app's own items as
  children), `LanguageMenu`, `SignOutMenuItem`, `SignInButton`, `BuildInfo`,
  `MemberAvatar`, `PageHeader` (with a `badge` beside the title), `SectionHeader`,
  `EmptyState`.
- `DESIGN.md`: the team's design rules, with OverHours as the reference.
- `AppCommitProvider` also takes `outdated` from apps that detect a new build
  themselves; `loadRuntimeConfig` treats an HTML answer (the SPA fallback) as a
  missing `config.json`.
- Data pages: `DataTable` (cards on a phone, row actions in a ⋯ menu, picking
  rows by row, group and all, group headings), `FilterBar`, `SelectionBar`,
  `FactList`, `Totals`; `AppShell width="wide"`; DESIGN.md's "Data pages"
  and "Reviewing a change".
- Helpers: `readApiError`, `ApiError`, `loadRuntimeConfig`, `parseBaseConfig`,
  `commitsDiffer`.
