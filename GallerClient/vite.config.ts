import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { VitePWA } from "vite-plugin-pwa";
import svgr from "vite-plugin-svgr";
// import fs from "fs";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // mkcert(),
    svgr(),

    VitePWA({
      registerType: "autoUpdate",
      // devOptions: {
      //   enabled: true,
      // },
      workbox: {
        cleanupOutdatedCaches: true, // Удаление старых кэшей
        skipWaiting: true, // Новый SW сразу заменяет старый
        clientsClaim: true, // Применяет новый SW ко всем вкладкам
        runtimeCaching: [
          // {
          //   urlPattern: ({ url }) => url.pathname.startsWith("/sounds/"),
          //   handler: "CacheFirst",
          //   options: {
          //     cacheName: "sounds-cache-v1",
          //     expiration: {
          //       maxEntries: 50,
          //       maxAgeSeconds: 60 * 60 * 24 * 30, // 30 дней
          //     },
          //     cacheableResponse: {
          //       statuses: [200, 206],
          //     },
          //   },
          // },
          {
            urlPattern: () => true,
            handler: "NetworkOnly", // Полное отключение кеширования
          },
        ],
      },
      manifest: {
        name: "Галерея художницы",
        short_name: "Галерея",
        theme_color: "#ffffff",
        display: "standalone",
        start_url: ".",
      },
    }),
  ],
  resolve: {
    alias: {
      app: "/src/app",
      entities: "/src/entities",
      features: "/src/features",
      pages: "/src/pages",
      shared: "/src/shared",
      widgets: "/src/widgets",
    },
  },
  server: {
    port: 3000,
    // https: {
    //   key: fs.readFileSync(path.resolve(__dirname, '192.168.1.93+3-key.pem')),
    //   cert: fs.readFileSync(path.resolve(__dirname, '192.168.1.93+3.pem'))
    // },
    // host: '192.168.1.93',
    strictPort: true,
    host: true,
    // hmr: false,
    // https: true,
    origin: "http://0.0.0.0:3000",
  },
});
