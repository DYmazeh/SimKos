import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            refresh: true,
        }),
        react(),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'resources/js'),
            ziggy: path.resolve('vendor/tightenco/ziggy/dist'),
            'ziggy-js': path.resolve('vendor/tightenco/ziggy/dist'),
        },
    },
    build: {
        rollupOptions: {
            output: {
                // Split vendor chunks supaya browser bisa cache lintas page navigation.
                // React + Inertia core jarang berubah, jadi user gak re-download saat
                // pindah halaman. Recharts cuma dipakai di Laporan Keuangan — diisolasi
                // ke chunk sendiri.
                manualChunks: {
                    'vendor-react': ['react', 'react-dom', 'react-is'],
                    'vendor-inertia': ['@inertiajs/react'],
                    'vendor-recharts': ['recharts'],
                    'vendor-lenis': ['lenis'],
                },
            },
        },
    },
});
