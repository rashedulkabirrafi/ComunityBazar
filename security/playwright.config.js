import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  timeout: 45000,
  workers: 1,
  use: {
    baseURL: "http://127.0.0.1:5173",
    headless: true,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  reporter: [
    ["list"],
    ["html", { outputFolder: "verification/browser-report", open: "never" }],
  ],
  outputDir: "verification/browser-artifacts",
});
