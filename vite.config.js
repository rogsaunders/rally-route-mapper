import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import mkcert from "vite-plugin-mkcert";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    mkcert(), // ✅ This is the correct SSL plugin
    VitePWA({
      registerType: "autoUpdate",
      devOptions: {
        enabled: false,
      },
      includeAssets: ["favicon.svg", "apple-touch-icon.png"],
      manifest: {
        name: "Rally Route Mapper",
        short_name: "Rally Mapper",
        description: "Map car rally routes with GPS, waypoints, and exports",
        theme_color: "#1e3a8a",
        background_color: "#ffffff",
        display: "standalone",
        start_url: "/",
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ],
  server: {
    https: true, // ✅ Enable HTTPS
    host: true, // ✅ Allow access via local IP
    port: 5173, // Optional: keep your port
  },
});
