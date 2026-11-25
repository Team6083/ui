---
"@team6083/ui": patch
---

`useFrontendOutdated` and `AppCommitProvider`'s `pollUrl` no longer poll when
`buildCommit` isn't a SHA (`dev`, `unknown`, `1.2.0`): such a build can never
be reported as outdated, so the requests were wasted. The README now lists
`useReloadNeeded`, says what to use for `url` instead of a relative
`BASE_URL`, and its Vite snippet reads the commit from the resolved config, so
`version.json` matches the page when `root` or `envDir` is set.
