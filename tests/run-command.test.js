import assert from 'node:assert/strict'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import { runCommand } from '../scripts/lib/run-command.js'

test('keeps inherited command errors available to the caller', async () => {
  const fixture = fileURLToPath(
    new URL('./fixtures/fail-with-existing-pages.js', import.meta.url),
  )

  await assert.rejects(
    runCommand(process.execPath, [fixture], { stdio: 'inherit' }),
    /8000002/,
  )
})
