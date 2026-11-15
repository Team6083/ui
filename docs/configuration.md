# Configuration

This package reads no environment variables. Apps configure it through props:

| Where | Prop | What it does |
| --- | --- | --- |
| `UiProvider` | `locale` | The app's current locale; Chinese tags pick `zh-TW`, everything else `en` |
| `UiProvider` | `system` | Replaces the team theme, e.g. with one built on it |
| `UiProvider` | `nonce` | Passed to next-themes' inline script for a nonce-based CSP |
| `AppCommitProvider` | `buildCommit` | The commit this build came from; empty turns the check off |
| `AppCommitProvider` | `pollUrl`, `pollIntervalMs` | An endpoint returning `X-App-Commit`, checked on focus and on an interval |
| `createRuntimeConfig` | `basePath`, `parse` | Where `config.json` lives and how to validate it |

Chakra injects styles at run time, so the app's CSP needs
`style-src 'self' 'unsafe-inline'` (see the wiki's common standard).
