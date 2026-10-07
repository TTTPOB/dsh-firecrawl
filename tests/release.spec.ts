import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const script = new URL('../scripts/check-release.mjs', import.meta.url)
const manifest = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))

describe('release tag validation', () => {
  it('accepts only the exact manifest version', () => {
    const result = spawnSync(process.execPath, [script.pathname, `v${manifest.version}`], { encoding: 'utf8' })
    expect(result.status).toBe(0)
    expect(result.stdout).toContain(`${manifest.name}@${manifest.version}`)
  })

  it.each([{ args: [] }, { args: ['v0.0.0'] }, { args: [manifest.version] }])('rejects missing or mismatched tags $args', ({ args }) => {
    const result = spawnSync(process.execPath, [script.pathname, ...args], { encoding: 'utf8' })
    expect(result.status).toBe(1)
    expect(result.stderr).toContain(`expected v${manifest.version}`)
  })
})
