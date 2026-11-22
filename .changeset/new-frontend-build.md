---
"@team6083/ui": minor
---

`useNewFrontendBuild({ buildCommit, url })` is an optional check for a newer front end: it fetches a version file deployed with the front end (e.g. `/version.json` holding `{ "commit": "…" }`) when the tab regains focus and every five minutes, and turns true once that commit differs from the build's. It asks no API, so it works however many APIs a page calls. Pass the result to `AppCommitProvider`'s `outdated` to show the banner.
