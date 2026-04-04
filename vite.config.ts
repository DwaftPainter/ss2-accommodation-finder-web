import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import * as path from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
    plugins: [react(), tailwindcss()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
            "@/components": path.resolve(__dirname, "./src/components"),
            "@/lib": path.resolve(__dirname, "./src/lib"),
            "@/hooks": path.resolve(__dirname, "./src/hooks"),
            "@/stores": path.resolve(__dirname, "./src/stores"),
            "@/services": path.resolve(__dirname, "./src/services")
        }
    },
    server: {
        port: 5173,
        open: true,
        proxy: {
            "/api": "http://localhost:5000",
            "/auth": "http://localhost:5000"
        }
    }
});
