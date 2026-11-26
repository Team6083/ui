---
"@team6083/ui": minor
---

`TitleBar` replaces `PageHeader` and `SectionHeader`, which are removed. It
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
