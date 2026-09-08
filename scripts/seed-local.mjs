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
    for (const [
      key,
      name,
      category,
      price,
      image,
      description,
      details = {},
    ] of [
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
      [
        "tablet",
        "A tablet for notes and late-night reading",
        "Electronics",
        9800,
        "laptop",
        "A slim tablet that handles lecture notes, ebooks, and video calls. Check the battery health and screen at handover. Demo listing for local evaluation.",
        { productType: "Like new", location: "Banani, Dhaka", stock: 3 },
      ],
      [
        "novels",
        "A stack of paperback novels",
        "Books",
        820,
        "books",
        "Six paperbacks from a shelf that has been read and loved. Spines are intact. Demo listing for local evaluation.",
        { location: "Mirpur, Dhaka", stock: 4 },
      ],
      [
        "side-table",
        "A little side table for small spaces",
        "Home & Living",
        2300,
        "chair",
        "A compact side table that fits beside a sofa or bed. Minor marks on the top. Demo listing for local evaluation.",
        { location: "Mirpur, Dhaka", stock: 2 },
      ],
      [
        "denim",
        "Straight-leg denim jacket",
        "Clothes & Fashion",
        1950,
        "backpack",
        "A classic denim jacket that has softened nicely with wear. Size medium. Demo listing for local evaluation.",
        { location: "Banani, Dhaka", stock: 2 },
      ],
      [
        "cricket",
        "A cricket kit for weekend matches",
        "Sports & Outdoors",
        4300,
        "bike",
        "Bat, pads, and gloves for weekend games at the field. Check the grip and straps at handover. Demo listing for local evaluation.",
        { location: "Mirpur, Dhaka", stock: 2 },
      ],
      [
        "tote",
        "A canvas tote for the bazar run",
        "Accessories",
        550,
        "backpack",
        "A sturdy canvas tote with reinforced handles. Washes well. Demo listing for local evaluation.",
        { location: "Mirpur, Dhaka", stock: 9 },
      ],
      [
        "earbuds",
        "Pocket-sized wireless earbuds",
        "Electronics",
        1650,
        "headphones",
        "Compact earbuds with their charging case. Both sides tested and working. Demo listing for local evaluation.",
        { location: "Mirpur, Dhaka", stock: 8 },
      ],
      [
        "textbooks",
        "First-year course textbooks",
        "Books",
        2400,
        "books",
        "A set of course books with light highlighting in the margins. Great for a fresh semester. Demo listing for local evaluation.",
        { location: "Bashundhara, Dhaka", stock: 6 },
      ],
      [
        "floor-lamp",
        "A tall lamp for the corner you never use",
        "Home & Living",
        2750,
        "lamp",
        "A floor lamp with a warm shade and a steady base. Bulb included. Demo listing for local evaluation.",
        { productType: "Like new", location: "Banani, Dhaka", stock: 4 },
      ],
      [
        "sandals",
        "Everyday leather sandals",
        "Clothes & Fashion",
        1100,
        "shoes",
        "Leather sandals with plenty of wear left in the soles. Cleaned before listing. Demo listing for local evaluation.",
        { location: "Mirpur, Dhaka", stock: 5 },
      ],
      [
        "yoga",
        "A yoga mat and blocks",
        "Sports & Outdoors",
        1250,
        "plant",
        "A cushioned mat with two foam blocks and a carry strap. Cleaned after every use. Demo listing for local evaluation.",
        { productType: "Like new", location: "Banani, Dhaka", stock: 6 },
      ],
      [
        "wallet",
        "A slim leather wallet",
        "Accessories",
        750,
        "watch",
        "A slim wallet with card slots and a note pocket. Leather has aged gently. Demo listing for local evaluation.",
        { location: "Mohakhali, Dhaka", stock: 5 },
      ],
      [
        "monitor-keyboard",
        "A mechanical keyboard with a soft click",
        "Electronics",
        3400,
        "keyboard",
        "A mechanical keyboard with quiet switches and a braided cable. Try the feel before you decide. Demo listing for local evaluation.",
        { productType: "Like new", location: "Uttara, Dhaka", stock: 2 },
      ],
      [
        "poetry",
        "A small shelf of poetry",
        "Books",
        540,
        "books",
        "Slim poetry volumes for slow evenings. Clean pages throughout. Demo listing for local evaluation.",
        { productType: "Like new", location: "Banani, Dhaka", stock: 3 },
      ],
      [
        "planters",
        "Two terracotta planters",
        "Home & Living",
        480,
        "plant",
        "A pair of terracotta pots with drainage holes and saucers. Plants not included. Demo listing for local evaluation.",
        { location: "Mohakhali, Dhaka", stock: 7 },
      ],
      [
        "kurta",
        "A cotton kurta for warm afternoons",
        "Clothes & Fashion",
        1350,
        "backpack",
        "A breathable cotton kurta in a neutral shade. Washed and pressed. Demo listing for local evaluation.",
        { productType: "Like new", location: "Uttara, Dhaka", stock: 4 },
      ],
      [
        "badminton",
        "Badminton rackets for two",
        "Sports & Outdoors",
        1800,
        "guitar",
        "Two rackets with fresh grips and a tube of shuttles. Ready for the courts. Demo listing for local evaluation.",
        { location: "Uttara, Dhaka", stock: 4 },
      ],
      [
        "scarf",
        "A light scarf for winter mornings",
        "Accessories",
        620,
        "sunglasses",
        "A soft woven scarf for cool mornings and evening walks. Freshly laundered. Demo listing for local evaluation.",
        { productType: "Like new", location: "Banani, Dhaka", stock: 4 },
      ],
      [
        "lens",
        "A portrait lens for your camera bag",
        "Electronics",
        7400,
        "camera",
        "A fast prime lens with a clean front element. Bring your body to test the mount at handover. Demo listing for local evaluation.",
        { location: "Mohakhali, Dhaka", stock: 1 },
      ],
      [
        "cookbook",
        "The weekend cookbook",
        "Books",
        690,
        "books",
        "A hardcover cookbook with everyday recipes and a few kitchen notes pencilled in. Demo listing for local evaluation.",
        { location: "Uttara, Dhaka", stock: 5 },
      ],
      [
        "mug-set",
        "A set of four breakfast mugs",
        "Home & Living",
        900,
        "mug",
        "Four matching stoneware mugs, no chips or cracks. Washed and ready. Demo listing for local evaluation.",
        { location: "Bashundhara, Dhaka", stock: 3 },
      ],
      [
        "sneakers-white",
        "Court sneakers in off-white",
        "Clothes & Fashion",
        2100,
        "shoes",
        "Low-top sneakers with clean uppers and even tread. Laces replaced. Demo listing for local evaluation.",
        { location: "Mohakhali, Dhaka", stock: 3 },
      ],
      [
        "camping",
        "A two-person camping tent",
        "Sports & Outdoors",
        5200,
        "backpack",
        "A lightweight tent with all poles and pegs accounted for. Dried and packed properly. Demo listing for local evaluation.",
        { location: "Bashundhara, Dhaka", stock: 1 },
      ],
      [
        "watch-sport",
        "A sport watch that counts your steps",
        "Accessories",
        2650,
        "watch",
        "A fitness watch with its charging cable and a spare strap. Battery still holds a full day. Demo listing for local evaluation.",
        { location: "Uttara, Dhaka", stock: 2 },
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
            productType: details.productType || "Used",
            location: details.location || "Dhanmondi, Dhaka",
            description,
            image: `/demo/${image}.jpg`,
            email: "admin@comunitybazar.test",
          },
          $setOnInsert: { stock: details.stock ?? 5, createdAt: new Date() },
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
