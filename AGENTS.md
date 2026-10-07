# dsh-firecrawl 开发约定

`@firecrawl/dsh-firecrawl` 为 DSH 提供 Firecrawl search 与 fetch provider。根入口注册 search，`/fetch` 独立注册 fetch，因此可以保留另一个 search provider。两个入口都导出命名的 `name`、`inject`、`Config`、`apply`。

## 边界

- **不贡献自动 `dsh.bundle` 配置。** 本包是独立的 profile dependency。
- 调用方拥有 provider 选择、凭据与部署配置。`auto-install-peers=false` 下由官方 profile resolver 从 Host 提供共享的 Cordis、launch-environment 与 Web peers。
- fetch provider 必须可回收：注册 `ctx.web` 的 dispose 型 provider，发送 `POST /v2/scrape`，返回带页面 HTTP 状态的解码 HTML/文本，并按 `maxBodyChars`（默认 100000）截断正文；网络/API 错误与取消转为类型化 Web 错误。
- 凭据来自 `apiKey` 配置或启动环境的 `FIRECRAWL_API_KEY`。不要把凭据写入日志、错误信息或模型可见输出。
- **不要宣称第三方访问或数据处理保证**：Firecrawl 在其自身基础设施上抓取模型选定的 URL。

## 验证

```sh
pnpm check
```

`pnpm check` = typecheck + test + build + `check:package`。**测试只用 mock API 响应，不打真实 Firecrawl 请求**；针对用户授权 key 的实网集成检查单独安排，走 `pnpm test:e2e` 的独立配置。
