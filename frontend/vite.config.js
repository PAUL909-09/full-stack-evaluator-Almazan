  import { defineConfig } from "vite";
  import react from "@vitejs/plugin-react";
  import { fileURLToPath, URL } from "node:url";
  import { dirname } from "node:path";

  const __dirname = dirname(fileURLToPath(import.meta.url));

  // https://vitejs.dev/config/
  export default defineConfig({
    plugins: [react()],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)), // Example usage
      },
    },
    server: {
      port: 5173,
    },

  });
