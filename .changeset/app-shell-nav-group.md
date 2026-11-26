---
"@team6083/ui": minor
---

`AppShell`'s `nav` accepts a group: `{ label, icon?, items: [...] }`, where
`items` are the same links as top-level items. On desktop the group is a ghost
button with a chevron that opens a menu of its pages, highlighted while any of
them is active, the active one marked `aria-current="page"`. In the phone
drawer it is a heading with its pages indented beneath it; picking one closes
the drawer. Links still go through `renderLink`. A group is for admin-style
sets of pages that share one entry, one level deep. `NavItem` is now
`NavLink | NavGroup` (both exported); existing `nav` arrays keep working.

Code that reads `item.href` from a `NavItem` no longer type-checks; type it as
`NavLink` instead. A group with no items is not shown, so apps can filter its
items by permission.
