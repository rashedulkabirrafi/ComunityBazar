import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
const root = fileURLToPath(new URL("../", import.meta.url));
process.chdir(root);
for (const [source, target] of [
  ["frontend/.env.example", "frontend/.env.local"],
  ["backend/.env.example", "backend/.env"],
]) {
  if (!existsSync(target)) {
    copyFileSync(source, target);
    console.log(`Created ${target}`);
  } else console.log(`Kept existing ${target}`);
}
mkdirSync("verification", { recursive: true });
for (const directory of ["frontend", "backend"]) {
  const result = spawnSync(
    process.platform === "win32" ? "npm.cmd" : "npm",
    ["ci"],
    { cwd: `${root}${directory}`, stdio: "inherit" },
  );
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status || 1);
}
console.log("Setup complete. Run npm start.");
