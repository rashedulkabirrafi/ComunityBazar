import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { fileURLToPath } from "node:url";
const shots = fileURLToPath(new URL("../verification/", import.meta.url));
const viewports = [
  { name: "desktop", width: 1280, height: 800 },
  { name: "mobile", width: 390, height: 844 },
];
const publicPages = [
  ["home", "/"],
  ["marketplace", "/Marketplace"],
  ["marketplace-filtered", "/Marketplace?q=chair&category=Home+%26+Living"],
  ["about", "/about"],
  ["safety", "/safety"],
  ["privacy", "/privacy"],
  ["login", "/Login"],
  ["register", "/Register"],
  ["not-found", "/does-not-exist"],
];
const memberPages = [
  ["profile", "/dashboard/MyProfile"],
  ["add-listing", "/dashboard/AddListing"],
  ["my-listings", "/dashboard/MyListing"],
  ["saved", "/dashboard/MyWishlist"],
  ["cart", "/dashboard/MyCart"],
  ["orders", "/dashboard/MyOrders"],
];
const adminPages = [
  ["all-users", "/dashboard/AllUsers"],
  ["all-orders", "/dashboard/AllOrders"],
  ["all-products", "/dashboard/AllProducts"],
];
async function audit(page, label, viewport) {
  await expect(page.locator("main")).toBeVisible();
  await page.waitForFunction(() => !document.querySelector("[data-loading]"), {
    timeout: 10000,
  });
  const overflow = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
    culprits: [...document.querySelectorAll("body *")]
      .filter((el) => el.getBoundingClientRect().right > window.innerWidth + 1)
      .slice(0, 5)
      .map((el) => `${el.tagName}.${el.className}`),
  }));
  expect(
    overflow.scrollWidth,
    `${label} overflows horizontally: ${overflow.culprits.join(", ")}`,
  ).toBeLessThanOrEqual(overflow.innerWidth);
  const { violations } = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(
    violations.map((v) => `${v.id}: ${v.nodes[0]?.target}`),
    `${label} accessibility violations`,
  ).toEqual([]);
  await page.screenshot({
    path: `${shots}responsive/${viewport}-${label}.png`,
    fullPage: true,
  });
}
async function login(page, email) {
  await page.goto("/Login");
  await page.getByLabel("Email address", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill("Campus123!");
  await page.getByRole("button", { name: "Log in", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Make yourself at home." }),
  ).toBeVisible();
}
for (const viewport of viewports) {
  test.describe(viewport.name, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } });
    test(`public pages render without overflow or violations`, async ({
      page,
    }) => {
      const errors = [];
      page.on("pageerror", (e) => errors.push(e.message));
      for (const [label, path] of publicPages) {
        await page.goto(path);
        await audit(page, label, viewport.name);
      }
      const listing = await page.evaluate(async () =>
        (
          await (await fetch("http://127.0.0.1:3000/listings?limit=1")).json()
        ).items[0]._id.toString(),
      );
      await page.goto(`/ViewDetails/${listing}`);
      await audit(page, "listing-details", viewport.name);
      await page.getByRole("link", { name: "View profile" }).click();
      await audit(page, "seller-profile", viewport.name);
      expect(errors).toEqual([]);
    });
    test(`member and admin pages render without overflow or violations`, async ({
      page,
    }) => {
      const errors = [];
      page.on("pageerror", (e) => errors.push(e.message));
      await login(page, "student@comunitybazar.test");
      for (const [label, path] of memberPages) {
        await page.goto(path);
        await audit(page, label, viewport.name);
      }
      await login(page, "admin@comunitybazar.test");
      for (const [label, path] of [...adminPages, ...memberPages.slice(0, 1)]) {
        await page.goto(path);
        await audit(page, `admin-${label}`, viewport.name);
      }
      expect(errors).toEqual([]);
    });
    test(`primary navigation works`, async ({ page }) => {
      await page.goto("/");
      const menu = page.getByRole("button", { name: "Open menu" });
      if (viewport.name === "mobile") {
        await expect(menu).toBeVisible();
        await menu.click();
        await page
          .getByRole("navigation", { name: "Mobile navigation" })
          .getByRole("link", { name: "Discover" })
          .click();
      } else {
        await expect(menu).toBeHidden();
        await page
          .getByRole("navigation", { name: "Main navigation" })
          .getByRole("link", { name: "Discover" })
          .click();
      }
      await expect(
        page.getByRole("heading", { name: "Find your next good thing." }),
      ).toBeVisible();
      await page
        .locator(".product-card")
        .first()
        .getByRole("link")
        .first()
        .click();
      await expect(
        page.getByRole("button", { name: "Add to bag" }),
      ).toBeVisible({ timeout: 10000 });
    });
  });
}
