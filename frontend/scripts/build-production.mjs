import { loadEnv } from "vite";
import { spawnSync } from "node:child_process";
const env = loadEnv("production", process.cwd(), "");
if (env.VITE_DEPLOY_ENV !== "production")
  throw new Error(
    "Set VITE_DEPLOY_ENV=production and real service configuration in .env.production.local before building for deployment.",
  );
const result = spawnSync(
  process.execPath,
  ["node_modules/vite/bin/vite.js", "build"],
  { stdio: "inherit" },
);
process.exit(result.status || 0);
