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
      [
        "laptop",
        "A laptop for your next big idea",
        "Electronics",
        28500,
        "laptop",
        "A lightweight laptop for studying, everyday work, and browsing. Check its specifications and condition at handover. Demo listing for local evaluation.",
      ],
      [
        "keyboard",
        "The tidy-desk keyboard",
        "Electronics",
        2200,
        "keyboard",
        "A compact keyboard to freshen up your workspace. Check the layout and connection type before taking it home. Demo listing for local evaluation.",
      ],
      [
        "watch",
        "A timeless everyday watch",
        "Accessories",
        1850,
        "watch",
        "A simple wristwatch for everyday outfits. Inspect the strap, case, and timekeeping at handover. Demo listing for local evaluation.",
      ],
      [
        "backpack",
        "The go-everywhere backpack",
        "Clothes & Fashion",
        1250,
        "backpack",
        "A practical backpack for classes, workdays, and short adventures. Check the pockets and fit in person. Demo listing for local evaluation.",
      ],
      [
        "lamp",
        "A little light for your reading corner",
        "Home & Living",
        1600,
        "lamp",
        "An accent lamp to bring a warm touch to your desk or bedside. Inspect the plug and working condition at handover. Demo listing for local evaluation.",
      ],
      [
        "plant",
        "A little green for your shelf",
        "Home & Living",
        750,
        "plant",
        "A potted plant to brighten a sunny corner. Discuss watering needs and collection arrangements before handover. Demo listing for local evaluation.",
      ],
      [
        "guitar",
        "Your next acoustic session",
        "Sports & Outdoors",
        5800,
        "guitar",
        "An acoustic guitar ready for a new player. Try its sound and check the strings and body before purchase. Demo listing for local evaluation.",
      ],
      [
        "mug",
        "The slow-morning coffee mug",
        "Home & Living",
        350,
        "mug",
        "A ceramic mug for coffee, tea, and slower mornings. Check its size and finish in person. Demo listing for local evaluation.",
      ],
      [
        "sunglasses",
        "Sunglasses for sunny little escapes",
        "Accessories",
        950,
        "sunglasses",
        "A pair of sunglasses for everyday wear. Check lens condition and fit before purchase. Demo listing for local evaluation.",
      ],
      [
        "speaker",
        "A soundtrack for your space",
        "Electronics",
        2900,
        "speaker",
        "A compact speaker for your desk or living space. Test audio and connectivity at handover. Demo listing for local evaluation.",
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
