import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { MongoClient } from "mongodb";
import { writeFileSync, mkdirSync, unlinkSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
const require = createRequire(
  new URL("../frontend/package.json", import.meta.url),
);
const { initializeApp, deleteApp } = require("firebase/app");
const {
  getAuth,
  connectAuthEmulator,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  deleteUser,
} = require("firebase/auth");
const root = new URL("../", import.meta.url),
  base = "http://127.0.0.1:3000";
const results = [],
  accounts = [],
  ids = {},
  stamp = Date.now();
const dbClient = new MongoClient("mongodb://127.0.0.1:27017");
await dbClient.connect();
const db = dbClient.db("ComunityBazar-local");
function pass(name) {
  results.push({ name, status: "PASS" });
  console.log(`PASS ${name}`);
}
async function account(kind, existing = false) {
  const email = existing
    ? "admin@comunitybazar.test"
    : `${kind}-${stamp}@comunitybazar.test`;
  const app = initializeApp(
    { apiKey: "demo-comunity-bazar-key", projectId: "demo-comunity-bazar" },
    kind,
  );
  const auth = getAuth(app);
  connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
  await (
    existing ? signInWithEmailAndPassword : createUserWithEmailAndPassword
  )(auth, email, existing ? "Campus123!" : "LocalSmoke123!");
  const row = {
    email,
    app,
    auth,
    existing,
    token: await auth.currentUser.getIdToken(),
  };
  accounts.push(row);
  return row;
}
async function request(
  path,
  { actor, method = "GET", body, headers = {}, expect = 200 } = {},
) {
  const res = await fetch(base + path, {
    method,
    headers: {
      ...(actor ? { Authorization: `Bearer ${actor.token}` } : {}),
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(20000),
  });
  const data = await res.json();
  assert.equal(
    res.status,
    expect,
    `${method} ${path}: ${res.status} ${data.error || ""}`,
  );
  return data;
}
let uploadFile;
try {
  await request("/health");
  assert.equal((await fetch("http://127.0.0.1:5173")).status, 200);
  pass("API health and frontend availability");
  await request("/users", { expect: 401 });
  await request("/all-orders", {
    headers: { "x-user-email": "admin@comunitybazar.test" },
    expect: 401,
  });
  await request("/users", {
    headers: { Authorization: "Bearer forged" },
    expect: 401,
  });
  pass("Anonymous and forged tokens cannot access protected data");
  const buyer = await account("buyer"),
    seller = await account("seller"),
    admin = await account("admin", true);
  await request("/users", {
    actor: buyer,
    method: "POST",
    body: {
      name: "Security Test Buyer",
      pass: "MUST_NOT_BE_STORED",
      role: "admin",
    },
  });
  const member = await request(`/users/role/${buyer.email}`, { actor: buyer });
  assert.equal(member.role, "general user");
  assert.equal(member.pass, undefined);
  assert.equal(
    (await db.collection("user").findOne({ email: buyer.email })).pass,
    undefined,
  );
  pass("User provisioning strips passwords and prevents role escalation");
  await request("/users", { actor: buyer, expect: 403 });
  await request(`/cart/${admin.email}`, { actor: buyer, expect: 403 });
  await request(`/orders/${admin.email}`, { actor: buyer, expect: 403 });
  pass("Member isolation and administrative permissions");
  await request(`/users/profile/${buyer.email}`, {
    actor: buyer,
    method: "PATCH",
    body: { name: "Updated Buyer" },
  });
  assert.equal(
    (await request(`/users/role/${buyer.email}`, { actor: buyer })).name,
    "Updated Buyer",
  );
  pass("Profile updates persist to MongoDB");
  const image = readFileSync(
    new URL("../frontend/public/demo/chair.jpg", import.meta.url),
  );
  const uploaded = await fetch(base + "/uploads", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${seller.token}`,
      "Content-Type": "image/jpeg",
    },
    body: image,
  });
  assert.equal(uploaded.status, 201);
  const imageUrl = (await uploaded.json()).url;
  uploadFile = imageUrl.split("/").pop();
  assert.equal(
    (await fetch(imageUrl)).headers.get("content-type"),
    "image/webp",
  );
  const malformed = await fetch(base + "/uploads", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${seller.token}`,
      "Content-Type": "image/png",
    },
    body: "not an image",
  });
  assert.equal(malformed.status, 400);
  pass(
    "Authenticated image uploads are decoded and re-encoded; invalid files rejected",
  );
  await request("/listings", {
    actor: seller,
    method: "POST",
    body: { name: "Invalid", price: -5 },
    expect: 400,
  });
  await request("/listing/not-an-id", { expect: 400 });
  ids.listing = (
    await request("/listings", {
      actor: seller,
      method: "POST",
      body: {
        name: `Security item ${stamp}`,
        description: "Automated integration test listing.",
        category: "Books",
        price: 125,
        stock: 3,
        productType: "Used",
        location: "Test area",
        image: imageUrl,
        email: buyer.email,
      },
      expect: 201,
    })
  ).insertedId;
  const product = await request(`/listing/${ids.listing}`);
  assert.equal(product.email, undefined);
  assert.equal(
    (
      await db
        .collection("listings")
        .findOne({ _id: new (require("mongodb").ObjectId)(ids.listing) })
    ).email,
    seller.email,
  );
  await request(`/listings/${ids.listing}`, {
    actor: buyer,
    method: "DELETE",
    expect: 403,
  });
  pass("Listing validation, verified ownership and public data minimization");
  const filtered = await request(`/listings?q=${stamp}`);
  assert.equal(filtered.items.length, 1);
  await request("/listings?limit=9999", { expect: 400 });
  await request("/listings?q=%5B.*");
  pass("Search handles literal special characters and bounded pagination");
  await request("/cart", {
    actor: buyer,
    method: "POST",
    body: { productId: ids.listing, price: 1, email: seller.email },
  });
  const cart = (await request(`/cart/${buyer.email}`, { actor: buyer }))[0];
  assert.equal(cart.price, 125);
  await request(`/cart/${cart._id}`, {
    actor: buyer,
    method: "PATCH",
    body: { quantity: -1 },
    expect: 400,
  });
  await request(`/cart/${cart._id}`, {
    actor: buyer,
    method: "PATCH",
    body: { quantity: 4 },
    expect: 409,
  });
  await request(`/cart/${cart._id}`, {
    actor: buyer,
    method: "PATCH",
    body: { quantity: 2 },
  });
  await request(`/cart/${cart._id}`, {
    actor: seller,
    method: "DELETE",
    expect: 403,
  });
  pass("Cart trusts server prices and validates ownership, quantity and stock");
  await request("/wishlist", {
    actor: buyer,
    method: "POST",
    body: { productId: ids.listing },
  });
  assert.equal(
    (
      await request("/wishlist", {
        actor: buyer,
        method: "POST",
        body: { productId: ids.listing },
      })
    ).duplicate,
    true,
  );
  pass("Wishlist duplicate protection");
  const payload = {
    name: "Security Buyer",
    mobile: "01712345678",
    location: "Public library",
    idempotencyKey: crypto.randomUUID(),
    totalPrice: 1,
  };
  const order = await request("/orders", {
    actor: buyer,
    method: "POST",
    body: payload,
    expect: 201,
  });
  ids.order = order.insertedId;
  assert.equal(order.totalPrice, 250);
  assert.equal(
    (
      await request("/orders", {
        actor: buyer,
        method: "POST",
        body: payload,
        expect: 201,
      })
    ).insertedId,
    ids.order,
  );
  assert.equal((await request(`/listing/${ids.listing}`)).stock, 1);
  assert.equal(
    (await request(`/cart/${buyer.email}`, { actor: buyer })).length,
    0,
  );
  pass(
    "Transactional checkout calculates totals, reserves stock and is idempotent",
  );
  await request("/reviews", {
    actor: buyer,
    method: "POST",
    body: {
      orderId: ids.order,
      productId: ids.listing,
      rating: 5,
      review: "Too early",
    },
    expect: 403,
  });
  await request(`/orders/${ids.order}/status`, {
    actor: buyer,
    method: "PATCH",
    body: { status: "delivered" },
    expect: 403,
  });
  await request(`/orders/${ids.order}/status`, {
    actor: admin,
    method: "PATCH",
    body: { status: "delivered" },
    expect: 409,
  });
  await request(`/orders/${ids.order}/status`, {
    actor: admin,
    method: "PATCH",
    body: { status: "confirmed" },
  });
  await request(`/orders/${ids.order}/status`, {
    actor: admin,
    method: "PATCH",
    body: { status: "delivered" },
  });
  await request("/reviews", {
    actor: buyer,
    method: "POST",
    body: {
      orderId: ids.order,
      productId: ids.listing,
      rating: 5,
      review: "A verified completed order.",
    },
    expect: 201,
  });
  await request("/reviews", {
    actor: buyer,
    method: "POST",
    body: {
      orderId: ids.order,
      productId: ids.listing,
      rating: 5,
      review: "Duplicate",
    },
    expect: 409,
  });
  assert.equal(
    (await request(`/reviews/product/${ids.listing}`))[0].userEmail,
    undefined,
  );
  pass("Order transitions and completed-purchase reviews are enforced");
  await request("/cart", {
    actor: buyer,
    method: "POST",
    body: { productId: ids.listing },
  });
  const second = await request("/orders", {
    actor: buyer,
    method: "POST",
    body: { ...payload, idempotencyKey: crypto.randomUUID() },
    expect: 201,
  });
  await request(`/orders/${second.insertedId}/status`, {
    actor: admin,
    method: "PATCH",
    body: { status: "cancelled" },
  });
  assert.equal((await request(`/listing/${ids.listing}`)).stock, 1);
  await request(`/orders/${second.insertedId}/status`, {
    actor: admin,
    method: "PATCH",
    body: { status: "cancelled" },
    expect: 409,
  });
  pass("Cancellation restores stock once only");
  await request("/debug/routes", { actor: admin, expect: 404 });
  await request(`/listings/${ids.listing}`, {
    actor: seller,
    method: "DELETE",
  });
  await request(`/listing/${ids.listing}`, { expect: 404 });
  pass("Obsolete debug route removed and listings archive safely");
  const result = spawnSync(process.execPath, ["index.js"], {
    cwd: new URL("../backend", import.meta.url),
    env: {
      ...process.env,
      NODE_ENV: "production",
      FIREBASE_AUTH_EMULATOR_HOST: "127.0.0.1:9099",
    },
    encoding: "utf8",
  });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Production must use/);
  pass("Production refuses emulator authentication");
} catch (error) {
  results.push({
    name: "Integration suite",
    status: "FAIL",
    error: error.message,
  });
  console.error(error);
  process.exitCode = 1;
} finally {
  for (const account of accounts) {
    if (!account.existing) {
      for (const name of ["user", "listings", "cart", "wishlist", "orders"])
        await db.collection(name).deleteMany({ email: account.email });
      await db.collection("reviews").deleteMany({ userEmail: account.email });
      await deleteUser(account.auth.currentUser).catch(() => {});
    }
    await deleteApp(account.app);
  }
  if (uploadFile)
    try {
      unlinkSync(
        new URL(`../.local-data/uploads/${uploadFile}`, import.meta.url),
      );
    } catch {}
  await dbClient.close();
  mkdirSync(new URL("../verification", import.meta.url), { recursive: true });
  writeFileSync(
    new URL("../verification/local-checks.json", import.meta.url),
    JSON.stringify({ checkedAt: new Date(), results }, null, 2),
  );
}
