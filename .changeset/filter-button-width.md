---
"@team6083/ui": patch
---

`FilterBar`'s filter button keeps its width when the count badge appears or
goes away (for counts up to 9), so a popover anchored to its edge no longer jumps while filters are
set or cleared. Apps can drop CSS that set the trigger's `minW` through
`data-scope` / `data-part` selectors.
