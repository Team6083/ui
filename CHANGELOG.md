# Changelog

All notable changes to this package are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the package uses
[Semantic Versioning](https://semver.org/): a change that alters how apps look
or behave without code changes on their side is a major version.

## [Unreleased]

### Added

- `system`: the team theme on Chakra's defaults, with a `brand` palette (Chakra's
  blue until the team picks a color); fonts stay Chakra's system stack.
- `UiProvider`: Chakra, color mode and the package's locale (`en`, `zh-TW`).
- Chakra snippets: color mode, `Toaster`, `Tooltip`, `ToggleTip`, `InfoTip`.
- Standard blocks: `StatusPage`, `NoAccessPage`, `ConfigErrorPage`,
  `createRuntimeConfig`, `AppCommitProvider`, `AppOutdatedBanner`,
  `useCommitCheckedFetch`, `useApiErrorMessage`.
- Layout from OverHours: `AppShell` (header, pages, color mode, account, phone
  drawer, footer, update banner), `AccountMenu`, `SignInButton`, `BuildInfo`,
  `MemberAvatar`, `PageHeader`, `SectionHeader`, `EmptyState`.
- `DESIGN.md`: the team's design rules, with OverHours as the reference.
- Helpers: `readApiError`, `ApiError`, `loadRuntimeConfig`, `parseBaseConfig`,
  `commitsDiffer`.
