# Contributing

## Setup

```bash
npm ci
npm test          # Vitest + Testing Library
npm run typecheck
npm run lint
npm run build     # tsc into dist/
npm run demo      # the demo site (demo/) on Vite, importing src/ directly
```

Develop on Node 26, the version CI uses. `engines` in `package.json` is the
minimum for apps that install the package.

When you add or change a block, show it in the demo too: each page in
`demo/src/pages` puts every block in an `Example` with the code an app would
write. The Pages workflow publishes the demo from `main`.

## What belongs here

- **Theme tokens** the team has decided on. Anything undecided stays Chakra's
  default; do not add a token "for later".
- **Blocks the team standard requires** of every app, such as the no-access
  page or the update banner.
  Their wording and behavior follow the standard; change the standard first.
- **A component two or more apps already need.** One app's component stays in
  that app until a second one needs it.

Everything else is Chakra. When Chakra's components and style props already
compose what an app needs, apps use them directly and `DESIGN.md` shows how.
A component of our own needs a clear reason, written in its doc comment:
behavior Chakra lacks (`DataTable`'s cards on a phone), a layout that is
easy to get wrong and the same everywhere (`TitleBar`), or a call that is much shorter
than the Chakra parts it stands for (`EmptyState`). Build it from Chakra's
parts, and design its props before adding it: they are what every app writes.

## Rules

- Components use semantic tokens (`fg.muted`, `brand.solid`), never raw hues,
  so a theme change reaches every app.
- Every user-facing string lives in `src/i18n.tsx` with both `en` and `zh-TW`.
- No organization strings other than the GitHub owner; apps pass names in.
- Files that use hooks or Chakra components start with `"use client"`, so
  Next.js server components can import the package.
- Each PR that changes the package adds a changeset (`npx changeset`). A change
  that alters how apps look or behave without code changes on their side is a
  major (a minor while on 0.x). Never edit `version` in `package.json` or
  `CHANGELOG.md` by hand; `npx changeset version` does both at release (see
  the README's Versions).
