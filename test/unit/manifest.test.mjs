import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

const manifest = JSON.parse(readFileSync('manifest.json', 'utf8'));

test('uses Manifest V3', () => {
  assert.equal(manifest.manifest_version, 3);
});

test('declared extension entry points exist', () => {
  const entryPoints = [
    manifest.background?.service_worker,
    manifest.action?.default_popup,
    manifest.options_page,
  ].filter(Boolean);

  assert.ok(entryPoints.length >= 2);
  for (const entryPoint of entryPoints) {
    assert.equal(existsSync(entryPoint), true, `Missing entry point: ${entryPoint}`);
  }
});

test('declares a compatible minimum Chrome version', () => {
  assert.ok(Number(manifest.minimum_chrome_version) >= 109);
});
