# Firecrawl fetch provider for DeepSeek Harness

`@firecrawl/dsh-firecrawl@0.2.0-fork1` provides Firecrawl search and fetch plugins for DSH `0.2.1-rc.1`. The root entry registers search; `/fetch` registers fetch independently, allowing another search provider such as DeepSeek to remain selected. Both entries expose named `name`, `inject`, `Config`, and `apply` exports. The package contributes no automatic `dsh.bundle` configuration.

The package is an independent profile dependency. With `auto-install-peers=false`, the official DSH profile resolver supplies its shared Cordis, launch-environment, and Web peers from the Host installation. The caller owns provider selection, credentials, and deployment configuration.

The fetch plugin accepts `apiKey` (or `$FIRECRAWL_API_KEY` from the launch environment), `baseURL`, `format` (`markdown` or `html`), `onlyMainContent`, `maxAgeMs`, `waitForMs`, `mobile`, `blockAds`, `proxy`, `timeoutMs`, `maxBodyChars`, and `maxUrlLength`. It registers a disposable `ctx.web` fetch provider, sends `POST /v2/scrape`, returns decoded HTML/text with the page HTTP status, and caps the decoded body to `maxBodyChars` (default 100000). Network/API errors and cancellation become typed Web errors. Firecrawl retrieves the model-selected URL on its infrastructure; do not treat this as a guarantee about third-party access or data handling.

Validation uses mocked API responses and no real Firecrawl request. A live integration check against a user-authorized key is separate.
