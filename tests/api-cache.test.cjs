const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

function harness() {
  let userId = 'buyer-a';
  const modules = new Map();
  const requests = [];
  let backend = async (method, url, body) => ({ data: body ?? { id: url, expires_in_seconds: 900 } });
  const api = Object.fromEntries(['get', 'put'].map(method => [method, async (url, body) => {
    requests.push({ method, url, body }); return backend(method, url, body);
  }]));
  const auth = { auth: { getSession: async () => ({ data: { session: userId ? { user: { id: userId } } : null }, error: null }) } };
  function load(relative) {
    const filename = path.resolve(__dirname, '../src', relative + '.ts');
    if (modules.has(filename)) return modules.get(filename).exports;
    const module = { exports: {} }; modules.set(filename, module);
    const code = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
    new Function('require', 'module', 'exports', code)(specifier => {
      if (specifier === '@/lib/supabase') return { supabase: auth };
      if (specifier === './client') return { __esModule: true, default: api };
      if (specifier.startsWith('@/')) return load(specifier.slice(2));
      if (specifier.startsWith('.')) return load(path.relative(path.resolve(__dirname, '../src'), path.resolve(path.dirname(filename), specifier)));
      return require(specifier);
    }, module, module.exports);
    return module.exports;
  }
  return { load, requests, user(id) { userId = id; load('store/apiCache').setCacheUser(id); }, backend(fn) { backend = fn; } };
}
const deferred = () => { let resolve, reject; const promise = new Promise((yes, no) => { resolve = yes; reject = no; }); return { promise, resolve, reject }; };
const tick = () => new Promise(resolve => setImmediate(resolve));

test('parallel mounts share one request; warm navigation uses saved API data', async () => {
  const h = harness(); const user = h.load('lib/api/user'); const d = deferred(); h.backend(() => d.promise);
  const first = user.getCurrentUser(), second = user.getCurrentUser(); await tick();
  assert.equal(h.requests.length, 1); d.resolve({ data: { id: 'a', phone: '123' } });
  await Promise.all([first, second]); assert.equal((await user.getCurrentUser()).phone, '123'); assert.equal(h.requests.length, 1);
});
test('stale data remains readable while one background request refreshes it', async () => {
  const h = harness(), c = h.load('store/apiCache'); await c.cachedRead('user', async () => 'old', -1);
  const d = deferred(); const refresh = c.cachedRead('user', () => d.promise); await tick();
  assert.equal(c.useApiCache.getState().entries.user.data, 'old'); d.resolve('new'); await refresh;
  assert.equal(c.useApiCache.getState().entries.user.data, 'new');
});
test('successful writes replace cached profile and retire a late old GET', async () => {
  const h = harness(), c = h.load('store/apiCache'), buyer = h.load('lib/api/buyer'); const d = deferred();
  h.backend((method) => method === 'get' ? d.promise : Promise.resolve({ data: { about_me: 'Saved edit' } }));
  const old = buyer.getBuyerProfile(); await tick(); await buyer.upsertBuyerProfile({ about_me: 'Saved edit' });
  d.resolve({ data: { about_me: 'Old text' } }); await old;
  assert.equal(c.useApiCache.getState().entries.buyerProfile.data.about_me, 'Saved edit');
  assert.equal((await buyer.getBuyerProfile()).about_me, 'Saved edit'); assert.equal(h.requests.length, 2);
});
test('account switch clears data and rejects late responses from previous user', async () => {
  const h = harness(), c = h.load('store/apiCache'), d = deferred();
  const old = c.cachedRead('user', () => d.promise); await tick(); h.user('buyer-b'); d.resolve('private-a');
  await assert.rejects(old); assert.deepEqual(c.useApiCache.getState().entries, {});
  assert.equal(await c.cachedRead('user', async () => 'private-b'), 'private-b'); h.user(null);
  assert.deepEqual(c.useApiCache.getState().entries, {}); await assert.rejects(c.cachedRead('user', async () => 'no'));
});
test('expected 404 remains a rejection, deduplicates briefly, and creation replaces it', async () => {
  const h = harness(), buyer = h.load('lib/api/buyer');
  h.backend(async method => { if (method === 'get') throw { response: { status: 404 } }; return { data: { id: 'created' } }; });
  await assert.rejects(buyer.getBuyerProfile()); await assert.rejects(buyer.getBuyerProfile()); assert.equal(h.requests.length, 1);
  await buyer.upsertBuyerProfile({}); assert.equal((await buyer.getBuyerProfile()).id, 'created');
});
test('failed refresh retains saved data with an explicit error; retry can recover', async () => {
  const h = harness(), c = h.load('store/apiCache'); await c.cachedRead('user', async () => 'saved', -1);
  await assert.rejects(c.cachedRead('user', async () => { throw new Error('offline'); }));
  assert.equal(c.useApiCache.getState().entries.user.data, 'saved'); assert.ok(c.useApiCache.getState().entries.user.error);
  c.invalidateResource('user'); await c.cachedRead('user', async () => 'recovered'); assert.equal(c.useApiCache.getState().entries.user.error, undefined);
});
test('phone and photo mutations update user; photo confirmation invalidates signed URL', async () => {
  const h = harness(), user = h.load('lib/api/user'); await user.getCurrentUser(); await user.getProfileImage();
  await user.updateUserPhone('123'); assert.equal((await user.getCurrentUser()).phone, '123');
  await user.confirmProfileImage('photo'); await user.getProfileImage();
  assert.equal(h.requests.filter(r => r.method === 'get' && r.url === '/intake/user').length, 1);
  assert.equal(h.requests.filter(r => r.method === 'get' && r.url.endsWith('profile-image')).length, 2);
});
test('preferences preserve structured payload and readiness always comes from backend', async () => {
  const h = harness(), prefs = h.load('lib/api/buyerPreferences');
  const location = { city: 'Austin', state: 'Texas', county: 'Travis', zip_code: '78701', country_code: 'us' };
  await prefs.saveBuyerPreferences({ target_locations: [location] }); const saved = await prefs.getBuyerPreferences();
  assert.equal(saved.target_locations[0].zip_code, '78701');
  assert.deepEqual(h.requests[0].body.target_locations[0], { ...location, country_code: 'US' });
  await prefs.getBuyerReadiness(); await prefs.getBuyerReadiness();
  assert.equal(h.requests.filter(r => r.url.endsWith('readiness')).length, 2);
});
test('taxonomy repeated section mounts share fresh results', async () => {
  const h = harness(), taxonomy = h.load('lib/api/taxonomy');
  await Promise.all([taxonomy.getIndustryOptions(), taxonomy.getIndustryOptions(), taxonomy.getBusinessModelOptions()]);
  await taxonomy.getIndustryOptions(); await taxonomy.getBusinessModelOptions(); assert.equal(h.requests.length, 2);
});
test('Dashboard -> Profile -> Account -> Profile uses four total data GETs', async () => {
  const h = harness(), user = h.load('lib/api/user'), buyer = h.load('lib/api/buyer'), prefs = h.load('lib/api/buyerPreferences');
  const all = () => Promise.all([user.getCurrentUser(), buyer.getBuyerProfile(), prefs.getBuyerPreferences(), user.getProfileImage()]);
  await all(); await all(); await Promise.all([user.getCurrentUser(), buyer.getBuyerProfile()]); await all();
  assert.equal(h.requests.length, 4);
});

test('independent profile requests run together and optional photo does not gate core data', async () => {
  const h = harness(), user = h.load('lib/api/user'), buyer = h.load('lib/api/buyer'), prefs = h.load('lib/api/buyerPreferences');
  const waits = new Map(); h.backend((method, url) => { const d = deferred(); waits.set(url, d); return d.promise; });
  const core = Promise.all([user.getCurrentUser(), buyer.getBuyerProfile(), prefs.getBuyerPreferences()]);
  const image = user.getProfileImage(); await tick(); assert.equal(waits.size, 4);
  for (const [url, d] of waits) if (!url.endsWith('profile-image')) d.resolve({ data: { id: url } });
  await core;
  const entries = h.load('store/apiCache').useApiCache.getState().entries;
  assert.ok(entries.user.hasData && entries.buyerProfile.hasData && entries.buyerPreferences.hasData);
  assert.equal(entries.profileImage, undefined);
  waits.get('/intake/user/profile-image').resolve({ data: { url: 'photo', expires_in_seconds: 900 } }); await image;
});

test('expired signed image URLs are fetched again rather than treated as fresh', async () => {
  const h = harness(), user = h.load('lib/api/user'); h.backend(async () => ({ data: { url: 'short-lived', expires_in_seconds: 10 } }));
  await user.getProfileImage(); await user.getProfileImage(); assert.equal(h.requests.length, 2);
});
