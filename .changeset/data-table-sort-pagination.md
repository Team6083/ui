---
"@team6083/ui": minor
---

`DataTable` can sort and paginate, both opt-in and controlled by the app like
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
