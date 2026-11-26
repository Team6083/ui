---
"@team6083/ui": minor
---

`DataTable` looks like a plain Chakra table, as OverHours' tables did: no
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
