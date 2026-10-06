const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
function load(post) {
  const source = fs.readFileSync(path.resolve(__dirname, '../src/lib/api/matching/matching.ts'), 'utf8');
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true } }).outputText;
  const module = { exports: {} };
  new Function('require', 'module', 'exports', code)(name => {
    if (name === '@/lib/api/client') return { __esModule: true, default: { post } };
    return require(name);
  }, module, module.exports);
  return module.exports;
}
test('explanation is on demand and sends only match identity, never frontend evidence', async () => {
  const calls = [];
  const api = load(async (...args) => { calls.push(args); return { data: { match_id: 'match', explanation: 'Saved geographic alignment is strong.' } }; });
  assert.equal(calls.length, 0);
  assert.equal(await api.explainBuyerMatch('match'), 'Saved geographic alignment is strong.');
  assert.deepEqual(calls, [['/api/matches/match/ai-explanation']]);
});
for (const status of [401, 404, 409, 429, 503]) {
  test(`explanation ${status} failure is safe and retryable`, async () => {
    let failed = true;
    const api = load(async () => {
      if (failed) throw { isAxiosError: true, response: { status, data: { detail: 'SECRET provider error' } } };
      return { data: { explanation: 'Retry succeeded.' } };
    });
    await assert.rejects(api.explainBuyerMatch('match'), error => !error.message.includes('SECRET'));
    failed = false;
    assert.equal(await api.explainBuyerMatch('match'), 'Retry succeeded.');
  });
}
