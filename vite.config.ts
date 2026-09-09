import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

const stripPrivilegedClientConfig = () => ({
  name: 'vite-plugin-strip-privileged-client-config',
  enforce: 'pre' as const,
  transform(code: string, id: string) {
    if (!id.replace(/\\/g, '/').endsWith('/src/context/TourContext.tsx')) return null;

    const replacements: Array<[string, string]> = [
      ["r2AccountId: 'a9e18b43f76902cd98ef11'", "r2AccountId: ''"],
      ["r2AccessKeyId: 'r2_prod_key_77a9'", "r2AccessKeyId: ''"],
      ["r2SecretAccessKey: '********************************'", "r2SecretAccessKey: ''"],
      ["d1DatabaseId: '165b7b99-72e3-443e-aee9-8bf0f8c6c26b'", "d1DatabaseId: ''"],
      ["d1ApiToken: 'd1_token_bhaktisathi_prod_882'", "d1ApiToken: ''"],
      ["d1DatabaseName: 'bhakti-sathi-db'", "d1DatabaseName: ''"],
      ["r2BucketName: 'bhakti-sathi'", "r2BucketName: ''"],
      ["d1BucketName: 'bhakti-sathi'", "d1BucketName: ''"],
    ];

    let transformed = code;
    for (const [from, to] of replacements) transformed = transformed.split(from).join(to);
    return transformed === code ? null : { code: transformed, map: null };
  },
});

export default defineConfig(() => {
  return {
    plugins: [
      stripPrivilegedClientConfig(),
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['icon.png'],
        manifest: {
          id: '/',
          name: 'Bhakti Sathi',
          short_name: 'BhaktiSathi',
          description: "India's Premier Sacred Pilgrimage & Yatra Tour Packages across Mata Vaishno Devi, Himachal Devi Darshan, Varanasi, Ayodhya, Chardham Yatra, and more.",
          theme_color: '#FF4B00',
          background_color: '#FAFAFA',
          display: 'standalone',
          start_url: '/',
          scope: '/',
          icons: [
            { src: '/icon.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
            { src: '/icon.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
            { src: '/icon.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
          maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'gstatic-fonts-cache',
                expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
          ],
        },
        devOptions: { enabled: false },
      }),
    ],
    resolve: {
      alias: { '@': path.resolve(__dirname, '.') },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
