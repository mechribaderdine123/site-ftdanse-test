import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
    proxy: {
      "/api": {
        // scripts/dev.mjs picks a free API port (4000, or the next one if the
        // docker-compose api service already owns 4000) and passes it here.
        // 127.0.0.1 avoids Node resolving localhost to ::1, which the Express
        // server does not listen on (ECONNRESET on /api calls).
        target: `http://127.0.0.1:${process.env.API_PORT || 4000}`,
        changeOrigin: true,
        secure: false,
      },
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime"],
  },
}));
