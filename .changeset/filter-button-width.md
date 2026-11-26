---
"@team6083/ui": patch
---

`FilterBar`'s filter popover stays where it opened while filters are set or
cleared, even though the button grows and shrinks with the count badge (and,
on a phone, moves as the search box makes room). It takes the button's new
size the next time it opens; it still follows when the window is resized.
Apps can drop CSS that set the trigger's `minW` through `data-scope` /
`data-part` selectors. Passing `listeners` in `positioning` replaces this.
