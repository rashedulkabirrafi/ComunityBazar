import { MongoClient } from "mongodb";
import { pathToFileURL } from "node:url";

export async function seed() {
  const client = new MongoClient("mongodb://127.0.0.1:27017");
  await client.connect();
  try {
    const db = client.db("ComunityBazar-local");
    const photoURL = "/favicon.svg";
    for (const [email, name, role] of [
      ["student@comunitybazar.test", "Local Student", "general user"],
      ["admin@comunitybazar.test", "Local Admin", "admin"],
    ]) {
      const call = async (method, body) => {
        const response = await fetch(
          `http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:${method}?key=demo-comunity-bazar-key`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          },
        );
        const result = await response.json();
        return { response, result };
      };
      let { response, result } = await call("signUp", {
        email,
        password: "Campus123!",
        returnSecureToken: true,
      });
      if (result.error?.message === "EMAIL_EXISTS")
        ({ response, result } = await call("signInWithPassword", {
          email,
          password: "Campus123!",
          returnSecureToken: true,
        }));
      if (!response.ok)
        throw new Error(`Test account setup failed: ${result.error?.message}`);
      const update = await call("update", {
        idToken: result.idToken,
        displayName: name,
        photoUrl: photoURL,
        returnSecureToken: true,
      });
      if (!update.response.ok) throw new Error("Could not set test profile");
      await db.collection("user").updateOne(
        { email },
        {
          $setOnInsert: {
            email,
            name,
            role,
            mainImageUrl: photoURL,
            createdAt: new Date(),
          },
        },
        { upsert: true },
      );
    }
    for (const [key, name, category, price, image, description] of [
      [
        "chair",
        "The Sunday reading chair",
        "Home & Living",
        4200,
        "chair",
        "A comfortable accent chair with a warm, natural finish. Light everyday wear. Demo listing for local evaluation.",
      ],
      [
        "headphones",
        "Wireless over-ear headphones",
        "Electronics",
        1800,
        "headphones",
        "Comfortable over-ear headphones with a carrying pouch. Fully working. Demo listing for local evaluation.",
      ],
      [
        "camera",
        "A camera for little adventures",
        "Electronics",
        12500,
        "camera",
        "A compact camera ready for its next photographer. Includes strap. Demo listing for local evaluation.",
      ],
      [
        "book",
        "A new chapter: the book collection",
        "Books",
        650,
        "books",
        "A small collection of well-loved reads. Clean pages with a little wear on the covers. Demo listing for local evaluation.",
      ],
      [
        "bag",
        "Everyday running sneakers",
        "Clothes & Fashion",
        1400,
        "shoes",
        "Lightweight sneakers for everyday walks. Carefully cleaned. Demo listing for local evaluation.",
      ],
      [
        "calculator",
        "The around-town bicycle",
        "Sports & Outdoors",
        6500,
        "bike",
        "An easygoing bike for everyday rides. Check fit and brakes at handover. Demo listing for local evaluation.",
      ],
    ]) {
      await db.collection("listings").updateOne(
        { localSeedKey: key },
        {
          $set: {
            localSeedKey: key,
            name,
            category,
            price,
            productType: "Used",
            location: "Dhanmondi, Dhaka",
            description,
            image: `/demo/${image}.jpg`,
            email: "admin@comunitybazar.test",
          },
          $setOnInsert: { stock: 5, createdAt: new Date() },
        },
        { upsert: true },
      );
    }
    await db
      .collection("listings")
      .updateMany({ stock: { $exists: false } }, { $set: { stock: 5 } });
    await db
      .collection("user")
      .updateMany({}, { $unset: { pass: "", password: "" } });
    console.log("Local test accounts and sample listings are ready.");
  } finally {
    await client.close();
  }
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
  await seed();
