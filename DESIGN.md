# Design rules

How a team app looks. The reference is OverHours: when this file is silent,
do what OverHours does. The blocks in this package already follow these rules;
the rules are for what each app builds on top of them.

## Frame

- Every app uses `AppShell`: the app name (linking home) and the organization
  on the left; the pages, the color mode toggle and the account on the right;
  the pages fold into a drawer on phones; a quiet footer with the build.
- Content sits in one centered column, `maxW="5xl"`. Never let a page run the
  full width of a monitor: cards stretched across 1800px are mostly empty.
- The width is the app's, not the page's: set `AppShell width` once, so the
  header never moves while navigating. An app with wide tables uses
  `width="wide"` (8xl) and wraps its other pages in `PageColumn`.
- Navigation is ghost buttons with an icon and a word or two, never a row of
  blue text links. The current page is highlighted. Keep it to about five
  pages; admin pages share one entry.
- The organization name comes from configuration (`ORG_NAME`, `config.json`),
  never from the code.
- No language picker in the header. The locale follows the browser; an app
  that needs a switch puts `LanguageMenu` in the account menu, where the
  languages stay folded under one 語言 item.
- The account menu holds the app's own account items (profile, settings,
  language) in the app's order, then `SignOutMenuItem` last.
- Color mode is one icon button with three choices: 跟隨系統, 淺色, 深色.

## Color

- Chakra's gray is the default palette: solid buttons are near-black, links
  and text are `fg`. Do not set `colorPalette` on `html` or `body`.
- `brand` marks what is the user's or what is now: today, "You", the current
  user's name, the count of a live list, the main action of a card (簽到).
  A page has a few brand spots, not a brand-colored everything.
- Status colors mean status: `green` done or present, `orange` needs
  attention or locked, `red` destructive or absent, `purple` finished.
  Destructive buttons are `colorPalette="red"`.
- Other hues (teal, cyan, pink) only tell items apart, e.g. avatars by name
  (`MemberAvatar`) or one badge color per role.
- Use semantic tokens (`fg.muted`, `bg.muted`, `border.muted`, `brand.solid`),
  never shade numbers (`gray.500`), so dark mode works without extra code.

## Type

- Chakra's system font stack; no web fonts.
- One heading per page (`PageHeader`, `3xl`). Sections use `SectionHeader`
  (`xl`), cards `md`. The app name in the header is `xl`, two steps below the
  page's title so the two never compete. Secondary text is `fg.muted`, not
  smaller gray.
- Do not repeat a heading: a page titled 我的待辦 does not also hold a card
  titled 我的待辦.
- Numbers that line up in a table use `fontVariantNumeric="tabular-nums"`;
  durations read like `28d 20h 52m`.

## Page structure

- Group with `Card.Root` (`size="sm"` for side cards, `variant="elevated"`
  for the one card that is the point of the page, like the user's own status)
  or with a `SectionHeader` and no frame. Wide screens put the person's own
  card on the left and the shared lists on the right (`SimpleGrid`).
- A section's count goes in a badge beside its title; small tools (refresh,
  search) sit right after it; the section's actions sit on the right
  (幫其他使用者簽到). Page actions (建立團隊) go in `PageHeader`, next to the
  content they change, never in the navigation.
- An empty list shows `EmptyState`: an icon, a short title (現在沒人) and what to
  do next. Never a bare line of gray text.
- Tables are `Table.Root size="sm"`; ranks, statuses and roles are badges.
- Loading shows skeletons in the shape of the content on first load, then
  keeps the old content while refreshing, with "last updated" text.

## Data pages

Pages whose point is a set of records people pick from and act on (a batch's
items, placing orders, a review queue). OverHours has none this large, so these
rules are the reference here.

- Lists of records are a `DataTable`: numbers right-aligned in tabular figures,
  the record's name as the `primary` column, detail that can go when space runs
  out as `secondary`. On a phone the same rows become cards; never let a phone
  scroll a table sideways to reach a column.
- A table with more than about six columns needs `AppShell width="wide"`. If
  it still does not fit, drop `secondary` columns before shrinking text.
- A row's actions go into its ⋯ menu (`rowActions`), destructive ones in red.
  No buttons inside rows, and never a red button on every row.
- Filters sit behind one 篩選 button with the count of what is set
  (`FilterBar`), next to a search box. Never a row of always-open selects.
- Acting on several records: checkboxes in the table and a `SelectionBar`
  that appears once something is picked, holding the actions and the fields
  they need (e.g. the vendor for a new order). No disabled "Create order from
  0 items" buttons waiting above or below the table.
- Never show a disabled main action as the page's call to action. Hide it
  until it can be used, or say beside it what is missing.
- A record's facts are a `FactList` in a card; amounts that add up are
  `Totals` under the table, the total emphasized.
- Show people and things by name, never by id. An id on screen is a bug.
- Counts go in a badge (`SectionHeader count`, `Badge`), not in parentheses
  inside a link.
- Dates: `toLocaleDateString` with the time only when it matters, short form
  (`11/23 03:34`); never seconds.

## Reviewing a change

Tests passing says nothing about how a page looks. A change to a page is done
when its screenshots, desktop and phone, have been looked at against this file.
Apps keep a Playwright spec that saves those screenshots for every page.

## Buttons

- One solid button per card or dialog, for its main action. Everything else
  is `outline`, `ghost` or `subtle`.
- Icon buttons have an `aria-label`. Icons come from `react-icons/lu`.
- Buttons that change data lock while they run (`loading`), and are disabled
  while `useAppOutdated()` is true.

## States

- Not signed in to a page that needs it: send to sign-in. Signed in without
  the role: `NoAccessPage`. Bad `config.json`: `ConfigErrorPage`. A newer
  build on the server, or of the front end (`useFrontendOutdated`): the banner
  from `AppShell`; only a newer server build pauses saving. Other errors: an
  `Alert` with the text from `useApiErrorMessage()`.
- Toasts (`toaster`) confirm what just happened; they never carry the only
  copy of an error the user must act on.
