require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { rateLimit } = require("express-rate-limit");
const { MongoClient, ObjectId } = require("mongodb");
const { initializeApp } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { z } = require("zod");
const sharp = require("sharp");
const path = require("node:path");
const fs = require("node:fs/promises");
const { randomUUID } = require("node:crypto");
const production = process.env.NODE_ENV === "production";
if (
  production &&
  (process.env.FIREBASE_AUTH_EMULATOR_HOST ||
    process.env.FIREBASE_PROJECT_ID?.startsWith("demo-"))
)
  throw new Error(
    "Production must use a real Firebase project without an emulator.",
  );
if (!process.env.MONGODB_URI || !process.env.FIREBASE_PROJECT_ID)
  throw new Error("MONGODB_URI and FIREBASE_PROJECT_ID are required.");
const allowedOrigins = (
  process.env.ALLOWED_ORIGINS || "http://localhost:5173,http://127.0.0.1:5173"
).split(",");
if (
  production &&
  (!process.env.ALLOWED_ORIGINS ||
    !process.env.PUBLIC_API_URL?.startsWith("https://") ||
    !process.env.MEDIA_DIRECTORY)
)
  throw new Error(
    "Production requires ALLOWED_ORIGINS, HTTPS PUBLIC_API_URL and a persistent MEDIA_DIRECTORY.",
  );
initializeApp({ projectId: process.env.FIREBASE_PROJECT_ID });
const firebase = getAuth();
const client = new MongoClient(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 10000,
});
const db = client.db(process.env.DB_NAME || "ComunityBazar");
const users = db.collection("user"),
  listings = db.collection("listings"),
  orders = db.collection("orders");
const cart = db.collection("cart"),
  wishlist = db.collection("wishlist"),
  reviews = db.collection("reviews");
const app = express();
app.disable("x-powered-by");
if (process.env.TRUST_PROXY_HOPS)
  app.set("trust proxy", Number(process.env.TRUST_PROXY_HOPS));
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(
  cors({
    origin(origin, cb) {
      cb(null, !origin || allowedOrigins.includes(origin));
    },
    exposedHeaders: ["X-Request-ID"],
  }),
);
app.use((req, res, next) => {
  req.requestId = randomUUID();
  res.setHeader("X-Request-ID", req.requestId);
  next();
});
app.use(
  rateLimit({
    windowMs: 60000,
    limit: production ? 120 : 1500,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { error: "Too many requests. Please try again shortly." },
  }),
);
app.use(express.json({ limit: "128kb" }));
const fail = (status, message) => Object.assign(new Error(message), { status });
const id = (value) => {
  if (!/^[a-f0-9]{24}$/i.test(value || ""))
    throw fail(400, "Invalid record ID.");
  return new ObjectId(value);
};
const text = (max = 200) => z.string().trim().min(1).max(max);
const imageUrl = z
  .string()
  .max(2000)
  .refine(
    (s) => /^https?:\/\//.test(s) || /^\/(?!\/)/.test(s),
    "Invalid image URL.",
  );
const categories = [
  "Electronics",
  "Books",
  "Home & Living",
  "Clothes & Fashion",
  "Sports & Outdoors",
  "Accessories",
];
const listingSchema = z.object({
  name: text(100),
  description: text(3000),
  category: z.enum(categories),
  price: z.coerce.number().finite().min(1).max(10000000).multipleOf(0.01),
  stock: z.coerce.number().int().min(1).max(100).default(1),
  productType: z.enum(["New", "Like new", "Used"]),
  location: text(120),
  image: imageUrl,
});
const profileSchema = z.object({
  name: text(80),
  mainImageUrl: imageUrl.optional(),
});
const projection = { pass: 0, password: 0 };
async function authenticate(req, res, next) {
  const token = req.get("authorization")?.match(/^Bearer (.+)$/)?.[1];
  if (!token) throw fail(401, "Please sign in to continue.");
  try {
    req.identity = await firebase.verifyIdToken(token, true);
  } catch {
    throw fail(401, "Your session expired. Please sign in again.");
  }
  if (!req.identity.email) throw fail(403, "An email account is required.");
  req.email = req.identity.email.toLowerCase();
  await users.updateOne(
    { email: req.email },
    {
      $setOnInsert: {
        email: req.email,
        uid: req.identity.uid,
        name: req.identity.name || "Community member",
        role: "general user",
        createdAt: new Date(),
      },
    },
    { upsert: true },
  );
  req.member = await users.findOne({ email: req.email }, { projection });
  if (req.member.disabled) throw fail(403, "This account has been disabled.");
  next();
}
function admin(req, res, next) {
  if (req.member.role !== "admin")
    throw fail(403, "Administrator access required.");
  next();
}
function self(req, res, next) {
  if (
    req.params.email.toLowerCase() !== req.email &&
    req.member.role !== "admin"
  )
    throw fail(403, "You cannot access another account.");
  next();
}
async function owned(collection, req) {
  const row = await collection.findOne({ _id: id(req.params.id) });
  if (!row) throw fail(404, "This record no longer exists.");
  if (row.email !== req.email && req.member.role !== "admin")
    throw fail(403, "You cannot change another member’s record.");
  return row;
}
app.get("/", (req, res) => res.json({ service: "ComunityBazar API" }));
app.get("/health", async (req, res) => {
  await db.command({ ping: 1 });
  res.json({ status: "ok" });
});
app.get("/listings", async (req, res) => {
  const { q, category, sort, page, limit } = z
    .object({
      q: z.string().max(100).default(""),
      category: z.string().max(80).default(""),
      sort: z.enum(["newest", "price-asc", "price-desc"]).default("newest"),
      page: z.coerce.number().int().min(1).max(10000).default(1),
      limit: z.coerce.number().int().min(1).max(48).default(12),
    })
    .parse(req.query);
  const query = { archived: { $ne: true }, stock: { $gt: 0 } };
  if (q)
    query.name = {
      $regex: q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      $options: "i",
    };
  if (category) query.category = category;
  const sorting =
    sort === "price-asc"
      ? { price: 1, _id: -1 }
      : sort === "price-desc"
        ? { price: -1, _id: -1 }
        : { createdAt: -1, _id: -1 };
  const [items, total] = await Promise.all([
    listings
      .find(query, { projection: { email: 0 } })
      .sort(sorting)
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray(),
    listings.countDocuments(query),
  ]);
  res.json({ items, total, page, pages: Math.ceil(total / limit) });
});
app.get("/listing/:id", async (req, res) => {
  const row = await listings.findOne({
    _id: id(req.params.id),
    archived: { $ne: true },
  });
  if (!row) throw fail(404, "This listing is no longer available.");
  const seller = await users.findOne({ email: row.email });
  const { email, ...publicRow } = row;
  res.json({
    ...publicRow,
    seller: seller?.name || "Community member",
    sellerSince: seller?.createdAt,
  });
});
app.get("/reviews/product/:productId", async (req, res) =>
  res.json(
    await reviews
      .find(
        { productId: id(req.params.productId).toString() },
        { projection: { userEmail: 0 } },
      )
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray(),
  ),
);
const mediaDir = path.resolve(
  process.env.MEDIA_DIRECTORY || path.join(__dirname, "../.local-data/uploads"),
);
app.use(
  "/media",
  express.static(mediaDir, {
    maxAge: "30d",
    immutable: true,
    dotfiles: "deny",
  }),
);
// Existing local image links continue to work.
app.use(
  "/local/uploads",
  express.static(mediaDir, { maxAge: "30d", dotfiles: "deny" }),
);
app.use(authenticate);
app.post(
  "/uploads",
  rateLimit({
    windowMs: 60000,
    limit: 15,
    standardHeaders: true,
    legacyHeaders: false,
  }),
  express.raw({
    type: ["image/png", "image/jpeg", "image/webp", "image/gif"],
    limit: "5mb",
  }),
  async (req, res) => {
    if (!Buffer.isBuffer(req.body) || !req.body.length)
      throw fail(400, "Choose a PNG, JPEG, WebP or GIF image under 5 MB.");
    let buffer;
    try {
      buffer = await sharp(req.body, { limitInputPixels: 24000000 })
        .rotate()
        .resize(1600, 1600, { fit: "inside", withoutEnlargement: true })
        .webp({ quality: 85 })
        .toBuffer();
    } catch {
      throw fail(400, "This image could not be read. Choose a valid image.");
    }
    const filename = `${randomUUID()}.webp`;
    await fs.mkdir(mediaDir, { recursive: true });
    await fs.writeFile(path.join(mediaDir, filename), buffer);
    res.status(201).json({
      url: `${process.env.PUBLIC_API_URL || "http://127.0.0.1:3000"}/media/${filename}`,
    });
  },
);
app.post("/users", async (req, res) => {
  const data = profileSchema.parse(req.body);
  await users.updateOne({ email: req.email }, { $set: data });
  res.json({ acknowledged: true });
});
app.get("/users/role/:email", self, async (req, res) =>
  res.json(
    await users.findOne(
      { email: req.params.email.toLowerCase() },
      { projection },
    ),
  ),
);
app.patch("/users/profile/:email", self, async (req, res) => {
  const data = profileSchema.parse(req.body);
  res.json(
    await users.updateOne(
      { email: req.params.email.toLowerCase() },
      { $set: data },
    ),
  );
});
app.get("/users", admin, async (req, res) =>
  res.json(
    await users
      .find({}, { projection })
      .sort({ createdAt: -1 })
      .limit(500)
      .toArray(),
  ),
);
app.patch("/users/:id", admin, async (req, res) => {
  const data = z
    .object({
      role: z.enum(["admin", "general user"]).optional(),
      disabled: z.boolean().optional(),
    })
    .refine((d) => Object.keys(d).length > 0)
    .parse(req.body);
  if (req.member._id.equals(id(req.params.id)))
    throw fail(400, "You cannot change your own administrative access.");
  const result = await users.updateOne(
    { _id: id(req.params.id) },
    { $set: data },
  );
  if (!result.matchedCount) throw fail(404, "Member not found.");
  res.json(result);
});
app.get("/listings/:email", self, async (req, res) =>
  res.json(
    await listings
      .find({ email: req.params.email.toLowerCase(), archived: { $ne: true } })
      .sort({ createdAt: -1 })
      .limit(200)
      .toArray(),
  ),
);
app.get("/admin/listings", admin, async (req, res) =>
  res.json(
    await listings
      .find({ archived: { $ne: true } })
      .sort({ createdAt: -1 })
      .limit(500)
      .toArray(),
  ),
);
app.post("/listings", async (req, res) => {
  const data = listingSchema.parse(req.body);
  res.status(201).json(
    await listings.insertOne({
      ...data,
      email: req.email,
      createdAt: new Date(),
    }),
  );
});
app.patch("/listings/:id", async (req, res) => {
  await owned(listings, req);
  res.json(
    await listings.updateOne(
      { _id: id(req.params.id) },
      { $set: listingSchema.parse(req.body) },
    ),
  );
});
app.delete("/listings/:id", async (req, res) => {
  await owned(listings, req);
  res.json(
    await listings.updateOne(
      { _id: id(req.params.id) },
      { $set: { archived: true, archivedAt: new Date() } },
    ),
  );
});
for (const [name, collection] of [
  ["cart", cart],
  ["wishlist", wishlist],
]) {
  app.get(`/${name}/:email`, self, async (req, res) =>
    res.json(
      await collection
        .find({ email: req.params.email.toLowerCase() })
        .sort({ createdAt: -1 })
        .limit(100)
        .toArray(),
    ),
  );
  app.post(`/${name}`, async (req, res) => {
    const { productId, quantity } = z
      .object({
        productId: text(24),
        quantity: z.coerce.number().int().min(1).max(20).default(1),
      })
      .parse(req.body);
    const wanted = name === "cart" ? quantity : 1;
    const product = await listings.findOne({
      _id: id(productId),
      archived: { $ne: true },
      stock: { $gte: wanted },
    });
    if (!product) throw fail(409, "This item is no longer available.");
    if (product.email === req.email)
      throw fail(400, "This is your own listing.");
    const { _id, email, ...snapshot } = product;
    const result = await collection.updateOne(
      { email: req.email, productId },
      {
        $setOnInsert: {
          name: snapshot.name,
          price: snapshot.price,
          image: snapshot.image,
          category: snapshot.category,
          location: snapshot.location,
          email: req.email,
          productId,
          quantity: wanted,
          createdAt: new Date(),
        },
      },
      { upsert: true },
    );
    if (result.upsertedCount)
      return res.json({
        acknowledged: true,
        duplicate: false,
        quantity: wanted,
        insertedId: result.upsertedId,
      });
    const existing = await collection.findOne({
      email: req.email,
      productId,
    });
    const total =
      name === "cart"
        ? Math.min(20, product.stock, (existing?.quantity || 1) + wanted)
        : existing?.quantity || 1;
    if (name === "cart" && total !== existing?.quantity)
      await collection.updateOne(
        { _id: existing._id },
        { $set: { quantity: total, price: product.price } },
      );
    res.json({ acknowledged: true, duplicate: true, quantity: total });
  });
  app.patch(`/${name}/:id`, async (req, res) => {
    const row = await owned(collection, req);
    const { quantity } = z
      .object({ quantity: z.coerce.number().int().min(1).max(20) })
      .parse(req.body);
    const product = await listings.findOne({
      _id: id(row.productId),
      archived: { $ne: true },
      stock: { $gte: quantity },
    });
    if (!product) throw fail(409, "Not enough stock is available.");
    res.json(
      await collection.updateOne(
        { _id: row._id },
        { $set: { quantity, price: product.price } },
      ),
    );
  });
  app.delete(`/${name}/:id`, async (req, res) => {
    const row = await owned(collection, req);
    res.json(await collection.deleteOne({ _id: row._id }));
  });
}
app.post("/orders", async (req, res) => {
  const data = z
    .object({
      name: text(80),
      mobile: z
        .string()
        .trim()
        .regex(/^[+\d ()-]{7,25}$/, "Enter a valid contact number."),
      location: text(300),
      extraNote: z.string().trim().max(500).default(""),
      idempotencyKey: z.string().uuid(),
    })
    .parse(req.body);
  const session = client.startSession();
  let order;
  try {
    await session.withTransaction(async () => {
      order = await orders.findOne(
        { email: req.email, idempotencyKey: data.idempotencyKey },
        { session },
      );
      if (order) return;
      const items = await cart
        .find({ email: req.email }, { session })
        .toArray();
      if (!items.length || items.length > 50)
        throw fail(400, "Your cart must contain between 1 and 50 items.");
      const snapshots = [];
      for (const item of items) {
        const quantity = z.number().int().min(1).max(20).parse(item.quantity);
        const product = await listings.findOneAndUpdate(
          {
            _id: id(item.productId),
            archived: { $ne: true },
            email: { $ne: req.email },
            stock: { $gte: quantity },
          },
          { $inc: { stock: -quantity } },
          { session, returnDocument: "before" },
        );
        if (!product)
          throw fail(
            409,
            `${item.name} is no longer available in the requested quantity. Update your cart.`,
          );
        if (Number(item.price) !== Number(product.price))
          throw fail(
            409,
            `${item.name} has a new price. Remove it and add it again to review the price.`,
          );
        snapshots.push({
          productId: item.productId,
          quantity,
          name: product.name,
          price: Number(product.price),
          image: product.image,
          sellerEmail: product.email,
        });
      }
      order = {
        _id: new ObjectId(),
        ...data,
        email: req.email,
        items: snapshots,
        totalPrice:
          Math.round(
            snapshots.reduce(
              (sum, item) => sum + item.price * item.quantity,
              0,
            ) * 100,
          ) / 100,
        paymentMethod: "Pay at handover",
        status: "placed",
        createdAt: new Date(),
      };
      await orders.insertOne(order, { session });
      await cart.deleteMany({ email: req.email }, { session });
    });
  } finally {
    await session.endSession();
  }
  res.status(201).json({ insertedId: order._id, totalPrice: order.totalPrice });
});
app.get("/orders/:email", self, async (req, res) =>
  res.json(
    await orders
      .find({ email: req.params.email.toLowerCase() })
      .sort({ createdAt: -1 })
      .limit(200)
      .toArray(),
  ),
);
app.get("/all-orders", admin, async (req, res) =>
  res.json(await orders.find().sort({ createdAt: -1 }).limit(500).toArray()),
);
app.patch("/orders/:id/status", admin, async (req, res) => {
  const { status } = z
    .object({ status: z.enum(["confirmed", "delivered", "cancelled"]) })
    .parse(req.body);
  const session = client.startSession();
  try {
    await session.withTransaction(async () => {
      const row = await orders.findOne({ _id: id(req.params.id) }, { session });
      if (!row) throw fail(404, "Order not found.");
      const transitions = {
        placed: ["confirmed", "cancelled"],
        confirmed: ["delivered", "cancelled"],
        delivered: [],
        cancelled: [],
      };
      if (!transitions[row.status]?.includes(status))
        throw fail(409, "This order cannot move to that status.");
      if (status === "cancelled")
        for (const item of row.items)
          await listings.updateOne(
            { _id: id(item.productId) },
            { $inc: { stock: item.quantity } },
            { session },
          );
      await orders.updateOne(
        { _id: row._id },
        { $set: { status, updatedAt: new Date() } },
        { session },
      );
    });
  } finally {
    await session.endSession();
  }
  res.json({ modifiedCount: 1 });
});
app.post("/reviews", async (req, res) => {
  const data = z
    .object({
      orderId: text(24),
      productId: text(24),
      rating: z.coerce.number().int().min(1).max(5),
      review: text(1500),
    })
    .parse(req.body);
  const order = await orders.findOne({
    _id: id(data.orderId),
    email: req.email,
    status: "delivered",
    "items.productId": id(data.productId).toString(),
  });
  if (!order)
    throw fail(403, "You can review an item after your order is completed.");
  res.status(201).json(
    await reviews.insertOne({
      ...data,
      userEmail: req.email,
      userName: req.member.name,
      createdAt: new Date(),
    }),
  );
});
app.get("/reviews/user/:email", self, async (req, res) =>
  res.json(
    await reviews
      .find({ userEmail: req.params.email.toLowerCase() })
      .limit(200)
      .toArray(),
  ),
);
app.use((req, res) => res.status(404).json({ error: "Endpoint not found." }));
app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  const status =
    error instanceof z.ZodError
      ? 400
      : error.code === 11000
        ? 409
        : error.status || 500;
  const message =
    error instanceof z.ZodError
      ? error.issues[0]?.message
      : error.code === 11000
        ? "This record already exists."
        : status < 500
          ? error.message
          : "Something went wrong. Please try again.";
  if (status >= 500)
    console.error(
      JSON.stringify({ requestId: req.requestId, message: error.message }),
    );
  res.status(status).json({ error: message, requestId: req.requestId });
});
async function start() {
  await client.connect();
  await db.command({ ping: 1 });
  await Promise.all([
    users.createIndex({ email: 1 }, { unique: true }),
    listings.createIndex({ archived: 1, createdAt: -1 }),
    listings.createIndex({ email: 1 }),
    cart.createIndex({ email: 1, productId: 1 }, { unique: true }),
    wishlist.createIndex({ email: 1, productId: 1 }, { unique: true }),
    orders.createIndex({ email: 1, createdAt: -1 }),
    orders.createIndex(
      { email: 1, idempotencyKey: 1 },
      {
        unique: true,
        partialFilterExpression: { idempotencyKey: { $type: "string" } },
      },
    ),
    reviews.createIndex(
      { userEmail: 1, orderId: 1, productId: 1 },
      {
        unique: true,
        partialFilterExpression: { orderId: { $type: "string" } },
      },
    ),
  ]);
  const server = app.listen(
    Number(process.env.PORT || 3000),
    process.env.HOST || "127.0.0.1",
    () => console.log("ComunityBazar API ready"),
  );
  const close = () =>
    server.close(async () => {
      await client.close();
      process.exit(0);
    });
  process.on("SIGTERM", close);
  process.on("SIGINT", close);
}
if (require.main === module)
  start().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
module.exports = { app, start };
