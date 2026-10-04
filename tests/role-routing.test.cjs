const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
function setup({ buyer = false, seller = false, ready = true } = {}) {
  let userId = 'user-a';
  let failure;
  let readinessCalls = 0;
  let creates = 0;
  const missing = () => { throw { isAxiosError: true, response: { status: 404 } }; };
  const profile = exists => { if (failure) throw failure; return exists ? { id: 'profile' } : missing(); };
  const storeModule = { exports: {} };
  function compile(relative, module, resolve) {
    const source = fs.readFileSync(path.resolve(__dirname, '../src', relative), 'utf8');
    const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
    new Function('require', 'module', 'exports', code)(resolve, module, module.exports);
    return module.exports;
  }
  const store = compile('store/authStore.ts', storeModule, require).useAuthStore;
  const route = compile('lib/auth/roleRouting.ts', { exports: {} }, name => {
    if (name === '@/store/authStore') return { useAuthStore: store };
    if (name === '@/lib/supabase') return { supabase: { auth: { getSession: async () => ({ data: { session: userId ? { user: { id: userId } } : null }, error: null }) } } };
    if (name === '@/lib/api/buyer') return { getBuyerProfile: async () => profile(buyer) };
    if (name === '@/lib/api/seller') return { getSellerProfile: async () => profile(seller), ensureSellerProfile: async () => { if (failure) throw failure; creates++; seller = true; } };
    if (name === '@/lib/api/buyerPreferences') return { getBuyerReadiness: async () => { readinessCalls++; if (ready === null) return missing(); return { ready }; } };
    return require(name);
  });
  return { route, store, stats: () => ({ readinessCalls, creates }), fail: value => { failure = value; }, user: id => { userId = id; store.getState().setUser(id); } };
}
for (const [name, roles, expected] of [
  ['buyer-only', { buyer: true }, '/buyer-dashboard'],
  ['seller-only', { seller: true }, '/seller'],
  ['both profiles', { buyer: true, seller: true }, '/role-selection'],
  ['new account', {}, '/role-selection'],
]) test(`${name}: sign-in resolves the correct destination`, async () => {
  const h = setup(roles); assert.equal(await h.route.resolveSignInPath(), expected);
});
test('Seller direct Buyer URL redirects before readiness or forms can run', async () => {
  const h = setup({ seller: true }); assert.equal(await h.route.buyerRouteRedirect(), '/seller'); assert.equal(h.stats().readinessCalls, 0);
});
test('dual-profile explicit Seller choice cannot enter Buyer routes', async () => {
  const h = setup({ buyer: true, seller: true }); await h.route.selectRolePath('seller'); assert.equal(await h.route.buyerRouteRedirect(), '/seller');
});
test('dual-profile explicit Buyer choice can enter Buyer routes', async () => {
  const h = setup({ buyer: true, seller: true }); assert.equal(await h.route.selectRolePath('buyer'), '/buyer-dashboard'); assert.equal(await h.route.buyerRouteRedirect(), null);
});
test('Seller selection creates durable ownership without a business', async () => {
  const h = setup(); assert.equal(await h.route.selectRolePath('seller'), '/seller'); assert.equal(h.stats().creates, 1);
  h.store.getState().setRole(null); assert.equal(await h.route.resolveSignInPath(), '/seller');
});
test('new Buyer needs explicit choice before onboarding is permitted', async () => {
  const h = setup(); assert.equal(await h.route.buyerRouteRedirect(), '/role-selection');
  assert.equal(await h.route.selectRolePath('buyer'), '/buyer-onboarding'); assert.equal(await h.route.buyerRouteRedirect(), null);
});
for (const ready of [false, null]) test(`incomplete Buyer readiness ${ready} uses onboarding`, async () => {
  const h = setup({ buyer: true, ready }); assert.equal(await h.route.selectRolePath('buyer'), '/buyer-onboarding');
});
test('Seller-only cannot become Buyer through the role-selection screen', async () => {
  const h = setup({ seller: true }); assert.equal(await h.route.selectRolePath('buyer'), '/seller'); assert.equal(h.stats().readinessCalls, 0);
});
test('non-404 profile errors do not fall through to onboarding', async () => {
  const h = setup({ seller: true }); h.fail({ isAxiosError: true, response: { status: 503 } }); await assert.rejects(h.route.resolveSignInPath()); await assert.rejects(h.route.buyerRouteRedirect());
});
test('failed Seller creation does not select Seller or navigate', async () => {
  const h = setup(); h.fail(new Error('Unavailable')); await assert.rejects(h.route.selectRolePath('seller')); assert.equal(h.store.getState().role, null);
});
test('account switch and logout clear the previous role', async () => {
  const h = setup(); await h.route.selectRolePath('buyer'); h.user('user-b'); assert.equal(h.store.getState().role, null); assert.equal(await h.route.buyerRouteRedirect(), '/role-selection');
  h.user(null); assert.equal(await h.route.buyerRouteRedirect(), '/signin');
});
