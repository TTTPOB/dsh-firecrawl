# Firecrawl fetch provider for DeepSeek Harness

This personal `0.1.0-fork1` build adapts the published `@firecrawl/dsh-firecrawl@0.1.0` source to DSH `0.1.7-rc.2`. The package still exports the root Firecrawl search plugin, but the personal Web composition uses only `/fetch`; `web_search` remains on DeepSeek. This package does not automatically contribute a `dsh.bundle` patch: the upstream patch would pin Firecrawl search and overwrite the Web tool configuration.

Install the built tarball through the global overrides composition, retaining the official top-level `dsh` and the personal `dsh-web-app` direct dependency on `@firecrawl/dsh-firecrawl@0.1.0`. That Web composition owns the `/fetch` plugin row and tool setup; do not mount or enable them again in the profile. Use the profile patch only for deployment-specific configuration such as endpoint and credential references. No profile or global installation is changed by this source package.

The fetch plugin accepts `apiKey` (or `$FIRECRAWL_API_KEY` from the launch environment), `baseURL`, `format` (`markdown` or `html`), `onlyMainContent`, `maxAgeMs`, `waitForMs`, `mobile`, `blockAds`, `proxy`, `timeoutMs`, `maxBodyChars`, and `maxUrlLength`. It registers a disposable `ctx.web` fetch provider, sends `POST /v2/scrape`, returns decoded HTML/text with the page HTTP status, and caps the decoded body to `maxBodyChars` (default 100000). Network/API errors and cancellation become typed Web errors. Firecrawl retrieves the model-selected URL on its infrastructure; do not treat this as a guarantee about third-party access or data handling.

Validation uses mocked API responses and no real Firecrawl request. A live integration check against a user-authorized key is separate.
