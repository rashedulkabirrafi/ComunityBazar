import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
async function login(page, email = "student@comunitybazar.test") {
  await page.goto("/Login");
  await page.getByLabel("Email address", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill("Campus123!");
  await page.getByRole("button", { name: "Log in", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Make yourself at home." }),
  ).toBeVisible();
}
test("home, marketplace and responsive accessibility", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Good things. New beginnings." }),
  ).toBeVisible();
  await expect(page.locator(".product-card")).toHaveCount(4);
  await page.screenshot({
    path: "verification/home-desktop.png",
    fullPage: true,
  });
  const audit = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(audit.violations).toEqual([]);
  await page
    .getByRole("textbox", { name: "Search the marketplace" })
    .fill("reading chair");
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await expect(page.locator(".product-card")).toHaveCount(1);
  await page.getByRole("button", { name: "Clear filters" }).click();
  await expect(page.locator(".product-card")).toHaveCount(6);
  await page.getByRole("button", { name: "Books", exact: true }).click();
  await expect(page.locator(".product-card")).toHaveCount(1);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.locator(".product-card")).toHaveCount(4);
  await page.screenshot({
    path: "verification/home-mobile.png",
    fullPage: true,
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Open menu" }).click();
  await page
    .getByRole("navigation", { name: "Mobile navigation" })
    .getByRole("link", { name: "Discover" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Find your next good thing." }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
test("member login, profile persistence, protected admin navigation and saved finds", async ({
  page,
}) => {
  await login(page);
  await page.getByLabel("Your name", { exact: true }).fill("Local Student");
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await expect(
    page.getByRole("status").filter({ hasText: "Your profile is up to date." }),
  ).toBeVisible();
  await page.goto("/dashboard/AllUsers");
  await expect(page).toHaveURL(/MyProfile/);
  await page.goto("/Marketplace");
  await page.locator(".product-card").first().getByRole("link").first().click();
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(
    page
      .getByRole("status")
      .filter({ hasText: /Saved for another look|already/ }),
  ).toBeVisible();
  await page.goto("/dashboard/MyWishlist");
  await expect(page.locator(".product-card").first()).toBeVisible();
  await page.screenshot({
    path: "verification/saved-desktop.png",
    fullPage: true,
  });
  await page.goto("/dashboard/MyCart");
  await expect(
    page.getByRole("heading", { name: "A bag full of possibility." }),
  ).toBeVisible();
  const audit = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(audit.violations).toEqual([]);
});
test("admin pages, auth errors, and missing route", async ({ page }) => {
  await page.goto("/Login");
  await page
    .getByLabel("Email address", { exact: true })
    .fill("nobody@example.test");
  await page.getByLabel("Password", { exact: true }).fill("incorrect123");
  await page.getByRole("button", { name: "Log in", exact: true }).click();
  await expect(page.getByRole("alert")).toBeVisible();
  await login(page, "admin@comunitybazar.test");
  await page.goto("/dashboard/AllUsers");
  await expect(
    page.getByRole("heading", { name: "People make the place." }),
  ).toBeVisible();
  await expect(page.getByRole("table")).toBeVisible();
  await page.goto("/dashboard/AllProducts");
  await expect(
    page.getByRole("heading", { name: "Keep good things in view." }),
  ).toBeVisible();
  await page.screenshot({
    path: "verification/admin-desktop.png",
    fullPage: true,
  });
  await page.goto("/does-not-exist");
  await expect(
    page.getByRole("heading", { name: "This find isn’t here." }),
  ).toBeVisible();
});
test("complete registration, listing, checkout, admin handover, and review flow", async ({
  page,
}) => {
  const { MongoClient } = await import("mongodb");
  const { unlinkSync } = await import("node:fs");
  const stamp = Date.now(),
    seller = `ui-seller-${stamp}@comunitybazar.test`,
    buyer = `ui-buyer-${stamp}@comunitybazar.test`,
    item = `A fresh beginning ${stamp}`,
    password = "UiTestFlow123!";
  const dbClient = new MongoClient("mongodb://127.0.0.1:27017");
  await dbClient.connect();
  const db = dbClient.db("ComunityBazar-local");
  async function register(email, name) {
    await page.goto("/Register");
    await page.getByLabel("Your name", { exact: true }).fill(name);
    await page.getByLabel("Email address", { exact: true }).fill(email);
    await page.getByLabel("Password", { exact: true }).fill(password);
    await page.getByRole("button", { name: "Create your account" }).click();
    await expect(
      page.getByRole("heading", { name: "Make yourself at home." }),
    ).toBeVisible();
  }
  async function logout() {
    await page.goto("/dashboard/MyProfile");
    await page.getByRole("button", { name: "Sign out", exact: true }).click();
    await expect(
      page.getByRole("heading", { name: "Good things. New beginnings." }),
    ).toBeVisible();
  }
  try {
    await register(seller, "Test Seller");
    await page.goto("/dashboard/AddListing");
    await page
      .getByLabel("Item photo")
      .setInputFiles("frontend/public/demo/books.jpg");
    await page.getByLabel("What are you selling?").fill(item);
    await page.getByLabel("Category", { exact: true }).selectOption("Books");
    await page.getByLabel("Price (৳)").fill("375");
    await page.getByLabel("Your area", { exact: true }).fill("Dhanmondi");
    await page
      .getByLabel("Tell its story", { exact: true })
      .fill("A careful description for this end-to-end test listing.");
    await page.getByRole("button", { name: "Publish listing" }).click();
    await expect(
      page.getByRole("heading", { name: "Your listings." }),
    ).toBeVisible();
    await expect(page.getByRole("table")).toContainText(item);
    await logout();
    await register(buyer, "Test Buyer");
    await page.goto(`/Marketplace?q=${encodeURIComponent(item)}`);
    await page.locator(".product-card").getByRole("link").first().click();
    await page.getByRole("button", { name: "Add to bag", exact: true }).click();
    await expect(page.getByRole("status")).toContainText(
      "Added to your shopping bag.",
    );
    await page.goto("/dashboard/MyCart");
    await page.getByRole("button", { name: "Continue to checkout" }).click();
    await page.getByLabel("Contact number").fill("01712345678");
    await page
      .getByLabel("Preferred meeting area")
      .fill("Public library, Saturday afternoon");
    await page.screenshot({
      path: "verification/checkout-desktop.png",
      fullPage: true,
    });
    await page.getByRole("button", { name: /Place order/ }).click();
    await expect(
      page.getByRole("heading", { name: "Their next chapter is yours." }),
    ).toBeVisible();
    await expect(page.locator(".order-card")).toContainText(item);
    await logout();
    await login(page, "admin@comunitybazar.test");
    await page.goto("/dashboard/AllOrders");
    const order = page.locator(".order-card").filter({ hasText: item });
    await order.getByRole("combobox").selectOption("confirmed");
    await expect(order.locator(".status")).toHaveText("confirmed");
    await order.getByRole("combobox").selectOption("delivered");
    await expect(order.locator(".status")).toHaveText("delivered");
    await logout();
    await page.goto("/Login");
    await page.getByLabel("Email address", { exact: true }).fill(buyer);
    await page.getByLabel("Password", { exact: true }).fill(password);
    await page.getByRole("button", { name: "Log in", exact: true }).click();
    await expect(
      page.getByRole("heading", { name: "Make yourself at home." }),
    ).toBeVisible();
    await page.goto("/dashboard/MyOrders");
    await page.getByRole("button", { name: "Write a review" }).click();
    await page
      .getByLabel("Your review", { exact: true })
      .fill("A smooth local handover.");
    await page.getByRole("button", { name: "Publish review" }).click();
    await expect(
      page
        .getByRole("status")
        .filter({ hasText: "Thank you for sharing your experience." }),
    ).toBeVisible();
  } finally {
    const listings = await db
      .collection("listings")
      .find({ email: seller })
      .toArray();
    for (const listing of listings) {
      if (listing.image?.includes("/media/"))
        try {
          unlinkSync(`.local-data/uploads/${listing.image.split("/").pop()}`);
        } catch {}
    }
    for (const email of [seller, buyer]) {
      for (const name of ["user", "listings", "cart", "wishlist", "orders"])
        await db.collection(name).deleteMany({ email });
      await db.collection("reviews").deleteMany({ userEmail: email });
      const signIn = await fetch(
        "http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=demo-comunity-bazar-key",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, returnSecureToken: true }),
        },
      );
      const token = (await signIn.json()).idToken;
      if (token)
        await fetch(
          "http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:delete?key=demo-comunity-bazar-key",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idToken: token }),
          },
        );
    }
    await dbClient.close();
  }
});
