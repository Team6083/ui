---
"@team6083/ui": patch
---

Releases move to npm, where installing needs no token; from this one on, each carries provenance. 0.1.0 is on npm too. Prereleases stay on GitHub Packages. Apps on 0.1.0: remove the `@team6083` lines from `.npmrc`, and the `packages: read` permission and `NODE_AUTH_TOKEN` from the steps that install dependencies.
