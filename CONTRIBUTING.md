# Contributing

## Setup

```bash
npm ci
npm test          # Vitest + Testing Library
npm run typecheck
npm run lint
npm run build     # tsc into dist/
```

Node's major version is the one in `package.json` `engines`.

## What belongs here

- **Theme tokens** the team has decided on. Anything undecided stays Chakra's
  default; do not add a token "for later".
- **Blocks the team standard requires** of every app (the wiki's
  `/it-team/standards`), such as the no-access page or the update banner.
  Their wording and behavior follow the standard; change the standard first.
- **A component two or more apps already need.** One app's component stays in
  that app until a second one needs it.

## Rules

- Components use semantic tokens (`fg.muted`, `brand.solid`), never raw hues,
  so a theme change reaches every app.
- Every user-facing string lives in `src/i18n.tsx` with both `en` and `zh-TW`.
- No organization strings other than the GitHub owner; apps pass names in.
- Files that use hooks or Chakra components start with `"use client"`, so
  Next.js server components can import the package.
- A change that alters how apps look or behave without code changes on their
  side is a major version (see `CHANGELOG.md`).
