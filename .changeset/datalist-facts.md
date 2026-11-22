---
"@team6083/ui": minor
---

`FactList` and `Totals` are built on Chakra's `DataList`. Their props are the
same and they take `DataList.Root` props, but their text follows DataList's
sizes: labels and values are `sm` by default (`size="lg"` for body-size text).
`FactList` keeps `minChildWidth`, which now defaults to 9rem on a phone (two
columns) and 12rem from md; apps that passed `{ base: "9rem", md: "12rem" }`
can drop it.
