# Changelog

## [0.3.0] - 2026-11-27

### Minor Changes

- `AppShell`'s `nav` accepts a group: `{ label, icon?, items: [...] }`, where
  `items` are the same links as top-level items. On desktop the group is a ghost
  button with a chevron that opens a menu of its pages, highlighted while any of
  them is active; the active one is shaded and marked `aria-current="page"`. In the phone
  drawer it is a heading with its pages indented beneath it; picking one closes
  the drawer. Links still go through `renderLink`. A group is for admin-style
  sets of pages that share one entry, one level deep. `NavItem` is now
  `NavLink | NavGroup` (both exported); existing `nav` arrays keep working.

  Code that reads `item.href` from a `NavItem` no longer type-checks; type it as
  `NavLink` instead. A group with no items is not shown, so apps can filter its
  items by permission.
- `DataTable` looks like a plain Chakra table, as OverHours' tables did: no
  border or rounded frame around it on desktop, and no fill behind the header
  row (the header text stays muted). An app that wants the list set apart puts
  its `FilterBar`, table and pager together in a `Card.Root`.

  Style props passed to `DataTable` (`mt`, `w`, `maxW`, `display`, `css`…) now
  apply to the whole block (phone sort control, table and pager) instead of the
  table inside it, and an empty list's `empty` content gets them too. That
  includes props apps may have meant for the table, such as `minW`,
  `tableLayout`, `bg` or `borderWidth`; to style the table itself use
  `css={{ "& table": { … } }}`. The table's own props (`size`, `variant`,
  `striped`, `aria-label`…) still reach `Table.Root`.
- `DataTable` can sort and paginate, both opt-in and controlled by the app like
  `selection`.

  - `sort={{ by, onChange }}` with a `sortValue` on a column makes its header a
    button: ascending, descending, then off (`by: null`, back to the app's row
    order). The sorted header sets `aria-sort` and shows an arrow. Strings compare
    in the `UiProvider` locale, numbers and dates numerically, `null` last either
    way. With `groupBy`, rows sort within each group and the groups keep their
    order. On a phone, where cards have no headers, the table shows a sort select
    with a direction button instead.
  - `pagination={{ page, pageSize, onPageChange }}` slices `rows` after sorting
    and before grouping, with the range ("11–20 / 134") and page buttons under
    the table (prev / "3 / 14" / next on a phone). `onPageSizeChange` adds a
    rows-per-page select (`pageSizes`, default `[10, 25, 50]`); `count` is for
    server paging, where `rows` is already the current page and the table sorts
    nothing itself. The pager is hidden when everything fits on one page. Picks
    persist across pages; the header checkbox picks the current page. When the
    list shrinks below the current page, the table calls `onPageChange` with the
    last page.

  New exports: `DataSort`, `DataPagination`, `SortDirection`.
- `FactList` and `Totals` are built on Chakra's `DataList`. Their props are the
  same and they take `DataList.Root` props, but their text follows DataList's
  sizes: labels and values are `sm` by default (`size="lg"` for body-size text).
  `FactList` keeps `minChildWidth`, which now defaults to 9rem on a phone (two
  columns) and 12rem from md; apps that passed `{ base: "9rem", md: "12rem" }`
  can drop it.
- `TitleBar` replaces `PageHeader` and `SectionHeader`, which are removed. It
  assumes nothing about where it sits, so the same component heads a page, a
  section, a card or a dialog. Its slots are named by place, not by content:

  - `level` (1–4) sets the heading and its default size (`3xl`, `2xl` below
    `md`; then `xl`, `md`, `sm`); `size` overrides the size. It is `2` by
    default.
  - `start` goes before the title (a back button, an avatar, an icon), `after`
    right behind it (a status, a count, small tools), `end` on the right
    (actions), all on one line; `description` goes under the title, lined up
    with it.
  - `end` never wraps; on a phone the app keeps it short, e.g. icon-only
    buttons below `sm`.
  - When the title's line runs out of room, `after` moves under the title as
    one group. `keepAfterInline` keeps it beside the title and wraps the title
    instead, for a status that reads with the title.
  - It sets no margin; space it from its container.

  To migrate:

  - `<PageHeader title badge actions />` →
    `<TitleBar level={1} title after end />`, plus the spacing the page needs
    (the old one had `mb="4"`).
  - `<SectionHeader title count={n} tools actions />` →
    `<TitleBar title after={<><Badge colorPalette="brand">{n}</Badge>{tools}</>} end />`
    (the old one had `mb="3"`). Use `colorPalette="brand"` only for a live list.
  - `<SectionHeader as="h3" />` → `<TitleBar level={3} />`.

### Patch Changes

- `DataTable`'s header row lines up with the rows under it on desktop: the
  select-all checkbox now sits over the row checkboxes, and the column headings
  start where the cell text starts, instead of 4px to the left.
- `DataTable`'s sortable numeric columns put the sort arrow before the heading,
  so the heading ends where the numbers under it end. A group heading row no
  longer spans one column more than the table has when rows can be picked.
- `FilterBar`'s filter popover no longer slides sideways while filters are set or
  cleared, even though the button grows and shrinks with the count badge (and, on
  a phone, moves as the search box makes room). While open, it keeps the button's
  horizontal place and width from when it opened; it still follows scrolling,
  flips above the button when there is no room, and re-places as its own content
  grows. The next open uses the button's new size. Apps can drop CSS that set the
  trigger's `minW` through `data-scope` / `data-part` selectors. Passing
  `getAnchorElement` in `positioning` replaces this.
- `useFrontendOutdated` and `AppCommitProvider`'s `pollUrl` no longer poll when
  `buildCommit` isn't a SHA (`dev`, `unknown`, `1.2.0`): such a build can never
  be reported as outdated, so the requests were wasted. The README now lists
  `useReloadNeeded`, says what to use for `url` instead of a relative
  `BASE_URL`, and its Vite snippet reads the commit from the resolved config, so
  `version.json` matches the page when `root` or `envDir` is set.

## [0.2.0] - 2026-11-22

### Minor Changes

- `BuildInfo` takes a `name` for this page's build and the builds of the other components it works with as `components` (`[{ name: "API", version, commit, builtAt }]`, e.g. from `GET /api/v1/meta`). The line shows this page's own build, with a warning mark while the app is outdated. Clicking it lists every build's version, commit and build time, with a button that copies them for an issue.

  The line shows the version, else the short commit, in the footer's own color; the build time moves to the details. Only an outdated app's build stands out, in orange with a warning mark.
- `useFrontendOutdated({ buildCommit, url })` is an optional check for a newer front end: it fetches a version file deployed with the front end (e.g. `/version.json` holding `{ "commit": "…" }`) on load, whenever the tab becomes visible again and every `pollIntervalMs` (five minutes by default), and turns true once that commit differs from the build's. It asks no API, so it works however many APIs a page calls. Pass it to `AppCommitProvider`'s new `frontendOutdated`: the banner and `BuildInfo`'s mark show, but `useAppOutdated` stays false and `useCommitCheckedFetch` keeps allowing writes. The banner then says a newer version is available instead of that saving is paused (`outdated.frontendDescription` in the messages). `useReloadNeeded` is true for either kind.

### Patch Changes

- Releases move to npm, where installing needs no token; from this one on, each carries provenance. 0.1.0 is on npm too. Prereleases stay on GitHub Packages. Apps on 0.1.0: remove the `@team6083` lines from `.npmrc`, and the `packages: read` permission and `NODE_AUTH_TOKEN` from the steps that install dependencies.

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
  footer, update banner; `width="wide"` for apps with wide tables),
  `PageColumn` (a page's 5xl column inside a wide app), `AccountMenu` (the
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
