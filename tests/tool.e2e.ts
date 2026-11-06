/**
 * Guarded live run through the FULL model-facing stack: the real
 * `@deepseek-ai/dsh-tool-web` tools dispatched by the real `ctx.tools`
 * registry, over the real `ctx.web` seam, against the real Firecrawl API.
 *
 * This is the layer the model actually touches. `live.e2e.ts` covers the seam;
 * this covers what a `web_search` / `web_fetch` tool call really returns.
 *
 * Requires FIRECRAWL_API_KEY and spends credits: `pnpm run test:e2e`.
 */

import { Context } from '@deepseek-ai/cordis'
import { ToolCallId } from '@deepseek-ai/dsh-llm'
import SystemPromptRuntime from '@deepseek-ai/dsh-system-prompt'
import ToolRuntime, { type ToolActivationContext } from '@deepseek-ai/dsh-tools'
import * as NativeExecutor from '@deepseek-ai/dsh-tool-executor-native'
import * as toolWeb from '@deepseek-ai/dsh-tool-web'
import WebRuntime from '@deepseek-ai/dsh-web'
import { describe, expect, it } from 'vitest'
import * as searchPlugin from '../src/index.ts'
import * as fetchPlugin from '../src/fetch.ts'

const envKey = process.env.FIRECRAWL_API_KEY
if (envKey === undefined || envKey.length === 0) {
  throw new Error('FIRECRAWL_API_KEY must be present for the guarded live run')
}
const apiKey: string = envKey

/** Explicit live composition; no bundle is installed by this package. */
async function harness(): Promise<Context> {
  const ctx = new Context()
  await ctx.plugin(ToolRuntime, {})
  await ctx.plugin(SystemPromptRuntime)
  await ctx.plugin(NativeExecutor)
  await ctx.plugin(WebRuntime, { searchProvider: 'firecrawl', fetchProvider: 'firecrawl' })
  await ctx.plugin(searchPlugin, { apiKey, ...(process.env.FIRECRAWL_BASE_URL ? { baseURL: process.env.FIRECRAWL_BASE_URL } : {}) })
  await ctx.plugin(fetchPlugin, { apiKey, onlyMainContent: false, ...(process.env.FIRECRAWL_BASE_URL ? { baseURL: process.env.FIRECRAWL_BASE_URL } : {}) })
  await ctx.plugin(toolWeb, { search: true, fetch: true, searchTimeoutMs: 60_000, fetchTimeoutMs: 60_000 })
  return ctx
}

let call = 0
async function invoke(ctx: Context, name: string, args: unknown) {
  const id = ToolCallId(`live-${call += 1}`)
  const signal = new AbortController().signal
  // These calls use only agent scope identity, not a model loop or Session log.
  const agent = {} as ToolActivationContext['agent']
  const toolSet = await ctx.tools.resolve({ agent, modelSelection: { provider: 'live', model: 'live' }, signal })
  try {
    const batch = await ctx.tools.execute({
      calls: [{ type: 'tool-call', id, name, arguments: JSON.stringify(args) }],
      agent, toolSet, signal,
    })
    expect(batch.results).toHaveLength(1)
    expect(batch.results[0]!.callId).toBe(id)
    return batch.results[0]!.result
  } finally {
    toolSet.dispose()
  }
}

/** Flatten a tool result's content blocks to the text the model would read. */
function text(content: readonly { type: string, text?: string }[]): string {
  return content.filter(block => block.type === 'text').map(block => block.text ?? '').join('\n')
}

function report(check: string, detail: Record<string, unknown>): void {
  process.stdout.write(`${JSON.stringify({ check, status: 'passed', ...detail })}\n`)
}

describe('model-facing tool surface', () => {
  it('registers both web tools once the providers are mounted', async () => {
    const ctx = await harness()
    expect(ctx.tools.get('web_search')).toBeDefined()
    expect(ctx.tools.get('web_fetch')).toBeDefined()
    report('tools-registered', { tools: ['web_search', 'web_fetch'] })
  })

  it('answers a live web_search call with rendered sources', async () => {
    const ctx = await harness()
    const result = await invoke(ctx, 'web_search', { queries: ['wikipedia'] })

    expect(result.isError, text(result.content)).toBe(false)
    const rendered = text(result.content)
    expect(rendered.length).toBeGreaterThan(0)
    expect(rendered).toMatch(/https?:\/\//)
    report('web_search', { chars: rendered.length, preview: rendered.slice(0, 200).replace(/\s+/g, ' ') })
  }, 90_000)

  it('answers a live web_fetch call with page text', async () => {
    const ctx = await harness()
    const result = await invoke(ctx, 'web_fetch', { url: 'https://example.com' })

    expect(result.isError, text(result.content)).toBe(false)
    expect(text(result.content)).toContain('HTTP 200')
    expect(result.value).toMatchObject({ statusCode: 200, body: { content: expect.stringMatching(/\S/) } })
    report('web_fetch', { chars: text(result.content).length, preview: text(result.content).slice(0, 200) })
  }, 90_000)

  it('reports a bad fetch target as a structured tool error, not a crash', async () => {
    const ctx = await harness()
    const result = await invoke(ctx, 'web_fetch', { url: 'file:///etc/passwd' })

    expect(result.isError).toBe(true)
    report('web_fetch-guard', { isError: result.isError })
  }, 30_000)
})
