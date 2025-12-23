import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import vercel from "@astrojs/vercel/serverless";

export default defineConfig({
    site: "https://corebiz-yoezequiel.vercel.app",
    integrations: [tailwind()],
    output: "server",
    adapter: vercel(),
    server: {
        port: 4321,
        host: true,
    },
});
