# Firecrawl fetch provider for DeepSeek Harness

This personal `0.1.0-fork1` build adapts the published `@firecrawl/dsh-firecrawl@0.1.0` source to DSH `0.1.7-rc.2`. The package still exports the root Firecrawl search plugin, but the personal Web composition uses only `/fetch`; `web_search` remains on DeepSeek. This package does not automatically contribute a `dsh.bundle` patch: the upstream patch would pin Firecrawl search and overwrite the Web tool configuration.

Install this independent plugin as an ordinary dependency in the resolving profile (`autoInstallPeers: false`), with the official top-level `dsh` and official `dsh-web-app`; global pnpm overrides are reserved for same-name official forks. Declare the shared `/fetch` row and tool setup in `$DSH_HOME/cordis.patch.yml`, including deployment-specific endpoint and credential references. This is not a Web-specific plugin; do not add a duplicate row to a profile patch. No profile or global installation is changed by this source package.

The fetch plugin accepts `apiKey` (or `$FIRECRAWL_API_KEY` from the launch environment), `baseURL`, `format` (`markdown` or `html`), `onlyMainContent`, `maxAgeMs`, `waitForMs`, `mobile`, `blockAds`, `proxy`, `timeoutMs`, `maxBodyChars`, and `maxUrlLength`. It registers a disposable `ctx.web` fetch provider, sends `POST /v2/scrape`, returns decoded HTML/text with the page HTTP status, and caps the decoded body to `maxBodyChars` (default 100000). Network/API errors and cancellation become typed Web errors. Firecrawl retrieves the model-selected URL on its infrastructure; do not treat this as a guarantee about third-party access or data handling.

Validation uses mocked API responses and no real Firecrawl request. A live integration check against a user-authorized key is separate.
