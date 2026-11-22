---
"@team6083/ui": minor
---

`useFrontendOutdated({ buildCommit, url })` is an optional check for a newer front end: it fetches a version file deployed with the front end (e.g. `/version.json` holding `{ "commit": "…" }`) when the tab regains focus and every five minutes, and turns true once that commit differs from the build's. It asks no API, so it works however many APIs a page calls. Pass it to `AppCommitProvider`'s new `frontendOutdated`: the banner and `BuildInfo`'s mark show, but `useAppOutdated` stays false and `useCommitCheckedFetch` keeps allowing writes. The banner then says a newer version is available instead of that saving is paused (`outdated.frontendDescription` in the messages). `useReloadNeeded` is true for either kind.
