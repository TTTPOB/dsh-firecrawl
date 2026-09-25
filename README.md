# Firecrawl fetch provider for DeepSeek Harness

This personal `0.1.0-fork1` build adapts the published `@firecrawl/dsh-firecrawl@0.1.0` source to DSH `0.1.7-rc.2`. It contributes **only** the `/fetch` plugin; `web_search` remains on DeepSeek. The package intentionally does not declare a `dsh.bundle` patch: the upstream bundle would pin Firecrawl search and overwrite the Web tool configuration.

Install the built tarball through the global overrides composition, retaining the official top-level `dsh` and the `dsh-web-app` direct dependency on `@firecrawl/dsh-firecrawl@0.1.0`. Mount `@firecrawl/dsh-firecrawl/fetch` as a plugin in your own profile patch, pin `web.fetchProvider: firecrawl`, and enable `tool-web.fetch`; when replacing a row config, restate all its required settings. Do not mount the root Firecrawl search plugin or apply the upstream `cordis.patch.yml`. No profile or global installation is changed by this source package.

The fetch plugin accepts `apiKey` (or `$FIRECRAWL_API_KEY` from the launch environment), `baseURL`, `format` (`markdown` or `html`), `onlyMainContent`, `maxAgeMs`, `waitForMs`, `mobile`, `blockAds`, `proxy`, `timeoutMs`, `maxBodyChars`, and `maxUrlLength`. It registers a disposable `ctx.web` fetch provider, sends `POST /v2/scrape`, returns decoded HTML/text with the page HTTP status, and caps the decoded body to `maxBodyChars` (default 100000). Network/API errors and cancellation become typed Web errors. Firecrawl retrieves the model-selected URL on its infrastructure; do not treat this as a guarantee about third-party access or data handling.

Validation uses mocked API responses and no real Firecrawl request. A live integration check against a user-authorized key is separate.
