import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import test from 'node:test';

const require = createRequire(import.meta.url);
const core = require('../../content-script/reader-core.js');

test('normalizes whitespace without losing paragraph boundaries', () => {
  assert.equal(core.normalizeText(' Hello\u00a0  world.\n\n\nNext. '), 'Hello world.\n\nNext.');
});

test('splits readable text and caps long segments', () => {
  const sentences = core.splitSentences('First sentence. Second sentence.', 'en-US');
  assert.equal(sentences.length, 2);
  assert.ok(sentences.every((sentence) => sentence.length <= 280));
});

test('sanitizes settings and preserves invariants', () => {
  const settings = core.sanitizeSettings({ rate: 99, volume: -4, uiLanguage: 'fr', highContrast: true });
  assert.equal(settings.rate, 2);
  assert.equal(settings.volume, 0);
  assert.equal(settings.uiLanguage, 'en');
  assert.equal(settings.highContrast, true);
});
