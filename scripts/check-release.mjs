#!/usr/bin/env node
import { readFileSync } from 'node:fs'

const manifest = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))
const expected = `v${manifest.version}`
const tag = process.argv[2]
if (tag !== expected) {
  throw new Error(`Release tag must match package.json exactly: expected ${expected}, received ${tag ?? '(missing)'}`)
}
console.log(`Release tag verified: ${tag} (${manifest.name}@${manifest.version})`)
