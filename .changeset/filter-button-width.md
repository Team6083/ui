---
"@team6083/ui": patch
---

`FilterBar`'s filter popover no longer slides sideways while filters are set or
cleared, even though the button grows and shrinks with the count badge (and, on
a phone, moves as the search box makes room). While open, it keeps the button's
horizontal place and width from when it opened; it still follows scrolling,
flips above the button when there is no room, and re-places as its own content
grows. The next open uses the button's new size. Apps can drop CSS that set the
trigger's `minW` through `data-scope` / `data-part` selectors. Passing
`getAnchorRect` in `positioning` replaces this.
