---
"@team6083/ui": minor
---

`BuildInfo` takes a `name` for this page's build and the builds of the other components it works with as `components` (`[{ name: "API", version, commit, builtAt }]`, e.g. from `GET /api/v1/meta`). When every build shares a commit and a version it shows that one; otherwise this page's own, with a warning mark while the app is outdated. Clicking it lists every build's version, commit and build time, with a button that copies them for an issue.

The line shows the version, else the short commit, in the footer's own color; the build time moves to the details. Only an outdated app's build stands out, in orange with a warning mark.
