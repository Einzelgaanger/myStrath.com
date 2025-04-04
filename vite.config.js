import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, './client/src'),
            "@shared": path.resolve(__dirname, './shared'),
            "@shared/schema": path.resolve(__dirname, './shared/client-schema.ts'),
        },
        dedupe: ['react', 'react-dom', '@tanstack/react-query']
    },
    root: path.resolve(__dirname, "client"),
    publicDir: path.resolve(__dirname, "client/public"),
    server: {
        port: 3000,
    },
    build: {
        outDir: path.resolve(__dirname, "dist/client"),
        emptyOutDir: true,
        sourcemap: true,
        rollupOptions: {
            input: path.resolve(__dirname, "client/index.html"),
            external: [
                'pg',
                'express',
                'express-rate-limit',
                'helmet',
                'compression',
                'cors',
                'multer',
                'passport',
                'passport-local',
                'jsonwebtoken',
                'bcryptjs',
                'ws',
                'uuid',
                'nanoid',
                'memorystore',
                'connect-pg-simple'
            ],
            output: {
                manualChunks: {
                    vendor: ['react', 'react-dom', 'wouter', '@tanstack/react-query']
                }
            }
        },
        assetsDir: 'assets',
        base: '/',
        chunkSizeWarningLimit: 1000,
    },
    define: {
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
    }
});
