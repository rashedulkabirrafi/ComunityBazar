import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { MongoClient } from 'mongodb';
import { writeFileSync, unlinkSync } from 'node:fs';
const require = createRequire(new URL('../frontend/package.json', import.meta.url));
const { initializeApp, deleteApp } = require('firebase/app');
const { getAuth, connectAuthEmulator, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile, deleteUser } = require('firebase/auth');
const results = [];
const email = `smoke-${Date.now()}@campusbazar.test`;
const password = 'LocalSmoke123!';
const api = 'http://127.0.0.1:3000';
const app = initializeApp({ apiKey: 'demo-campus-bazar-key', projectId: 'demo-campus-bazar' }, 'local-check');
const auth = getAuth(app);
connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
const dbClient = new MongoClient('mongodb://127.0.0.1:27017');
let uploadName;
const ids = {};
function pass(name) { results.push({ name, status: 'PASS' }); console.log(`PASS ${name}`); }
async function request(path, method = 'GET', body, headers = {}) {
  const response = await fetch(`${api}${path}`, { method, headers: { 'Content-Type': 'application/json', ...headers }, body: body === undefined ? undefined : JSON.stringify(body), signal: AbortSignal.timeout(10000) });
  assert.equal(response.ok, true, `${method} ${path} returned ${response.status}`);
  return response.json();
}
try {
  await dbClient.connect();
  assert.equal((await fetch('http://127.0.0.1:5173/')).status, 200);
  pass('Frontend HTTP server');
  await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(auth.currentUser, { displayName: 'Smoke Test' });
  await signOut(auth);
  await signInWithEmailAndPassword(auth, email, password);
  assert.equal(auth.currentUser.displayName, 'Smoke Test');
  pass('Firebase SDK registration, profile, logout and login against local emulator');
  ids.user = (await request('/users', 'POST', { email, name: 'Smoke Test' })).insertedId;
  assert.equal((await request(`/users/role/${email}`)).role, 'general user');
  pass('Local application user persistence');
  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aXioAAAAASUVORK5CYII=', 'base64');
  const uploadResponse = await fetch(`${api}/local/uploads`, { method: 'POST', headers: { 'Content-Type': 'image/png' }, body: png });
  assert.equal(uploadResponse.status, 200);
  const image = (await uploadResponse.json()).data.display_url;
  uploadName = image.split('/').pop();
  assert.deepEqual(Buffer.from(await (await fetch(image)).arrayBuffer()), png);
  pass('Local image upload and retrieval');
  ids.listing = (await request('/listings', 'POST', { email, name: 'Smoke Test Listing', price: 100, category: 'Electronics', productType: 'Used', image })).insertedId;
  assert.equal((await request(`/listing/${ids.listing}`)).name, 'Smoke Test Listing');
  assert.ok((await request(`/listings/${email}`)).some(x => x._id === ids.listing));
  pass('Create listing, retrieve details and seller listings');
  const item = { email, productId: ids.listing, name: 'Smoke Test Listing', price: 100, quantity: 1, image };
  ids.cart = (await request('/cart', 'POST', item)).insertedId;
  await request(`/cart/${ids.cart}`, 'PATCH', { quantity: 2 });
  assert.equal((await request(`/cart/${email}`))[0].quantity, 2);
  pass('Cart add, quantity update and retrieval');
  ids.wishlist = (await request('/wishlist', 'POST', item)).insertedId;
  assert.equal((await request('/wishlist', 'POST', item)).duplicate, true);
  await request(`/wishlist/${ids.wishlist}`, 'PATCH', { quantity: 2 });
  assert.equal((await request(`/wishlist/${email}`))[0].quantity, 2);
  await request(`/wishlist/${ids.wishlist}`, 'DELETE');
  assert.equal((await request(`/wishlist/${email}`)).length, 0);
  pass('Wishlist add, duplicate handling, quantity update and removal');
  ids.order = (await request('/orders', 'POST', { email, items: [{ ...item, quantity: 2 }], totalPrice: 200, paymentMethod: 'Cash on Delivery' })).insertedId;
  await request(`/cart/clear/${email}`, 'DELETE');
  assert.equal((await request(`/cart/${email}`)).length, 0);
  assert.equal((await request(`/orders/${email}`))[0].status, 'placed');
  await request(`/orders/${ids.order}/status`, 'PATCH', { status: 'delivered' });
  assert.equal((await request(`/orders/${email}`))[0].status, 'delivered');
  pass('Order creation, cart clearing, history and status update');
  ids.review = (await request('/reviews', 'POST', { userEmail: email, productId: ids.listing, rating: 5, review: 'Local smoke test' })).insertedId;
  assert.equal((await request(`/reviews/product/${ids.listing}`))[0].rating, 5);
  assert.equal((await request(`/reviews/user/${email}`)).length, 1);
  pass('Review creation and retrieval');
  const adminHeaders = { 'x-user-email': 'admin@campusbazar.test' };
  assert.ok(Array.isArray(await request('/admin/listings', 'GET', undefined, adminHeaders)));
  await request(`/listings/${ids.listing}`, 'DELETE', undefined, adminHeaders);
  await request(`/orders/${ids.order}`, 'DELETE');
  await request(`/users/${ids.user}`, 'DELETE');
  pass('Existing admin listing and delete API behavior (not an authorization certification)');
  for (const [path, method, expected] of [[`/users/profile/${email}`, 'PATCH', 404], ['/debug/routes', 'GET', 500]]) {
    const response = await fetch(`${api}${path}`, { method, headers: { 'Content-Type': 'application/json' }, ...(method === 'PATCH' ? { body: '{}' } : {}) });
    results.push({ name: `${method} ${path}`, status: response.status === expected ? 'KNOWN DEFECT' : 'CHANGED', httpStatus: response.status });
    console.log(`KNOWN DEFECT ${method} ${path}: HTTP ${response.status}`);
  }
} catch (error) {
  results.push({ name: 'Local smoke checks', status: 'FAIL', error: error.message });
  console.error(error); process.exitCode = 1;
} finally {
  const db = dbClient.db('CampusBazar-local');
  for (const collection of ['user', 'listings', 'cart', 'wishlist', 'orders']) {
    await db.collection(collection).deleteMany({ email }).catch(() => {});
  }
  await db.collection('reviews').deleteMany({ userEmail: email }).catch(() => {});
  if (auth.currentUser) await deleteUser(auth.currentUser).catch(() => {});
  await deleteApp(app);
  await dbClient.close();
  if (uploadName) { try { unlinkSync(new URL(`../.local-data/uploads/${uploadName}`, import.meta.url)); } catch {} }
  writeFileSync(new URL('../verification/local-checks.json', import.meta.url), JSON.stringify({ checkedAt: new Date().toISOString(), results, scope: 'API and Firebase SDK integration; not browser UI or real external services' }, null, 2));
}
