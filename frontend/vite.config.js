import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()],

  build: {
    // Increase warning limit (you can adjust this value)
    chunkSizeWarningLimit: 1000,

    rollupOptions: {
      output: {
        // Automatically put all dependencies from node_modules into a "vendor" chunk
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
  },
})