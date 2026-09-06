import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  if (mode === "production" && env.VITE_DEPLOY_ENV === "production") {
    if (
      !env.VITE_API_BASE_URL?.startsWith("https://") ||
      !env.VITE_APIKEY ||
      !env.VITE_PROJECTID ||
      env.VITE_PROJECTID.startsWith("demo-") ||
      env.VITE_AUTH_EMULATOR_URL
    )
      throw new Error(
        "Production requires an HTTPS API URL, real Firebase configuration, and no auth emulator.",
      );
  }
  return {
    plugins: [react()],
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("firebase")) return "firebase";
            if (id.includes("node_modules")) return "vendor";
          },
        },
      },
    },
  };
});
