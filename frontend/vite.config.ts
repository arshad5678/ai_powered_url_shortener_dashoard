import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { fileURLToPath } from 'url';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@assets': path.resolve(dirname, './src/assets'),
      '@components': path.resolve(dirname, './src/components'),
      '@ui': path.resolve(dirname, './src/components/ui'),
      '@features': path.resolve(dirname, './src/features'),
      '@common': path.resolve(dirname, './src/common'),
      '@layouts': path.resolve(dirname, './src/layouts'),
      '@pages': path.resolve(dirname, './src/pages'),
      '@hooks': path.resolve(dirname, './src/hooks'),
      '@services': path.resolve(dirname, './src/services'),
      '@contexts': path.resolve(dirname, './src/contexts'),
      '@routes': path.resolve(dirname, './src/routes'),
      '@utils': path.resolve(dirname, './src/utils'),
      '@types': path.resolve(dirname, './src/types'),
      '@constants': path.resolve(dirname, './src/constants'),
      '@styles': path.resolve(dirname, './src/styles'),
    },
  },
  server: {
    port: 5173,
    host: true,
    strictPort: true,
    proxy: {
      // Proxy shortcode redirects to the backend in local development
      // Matches any 3 to 20 char alphanumeric slug that is not a frontend route/asset
      '^/(?!links|analytics|settings|assets|vite.svg|$)[a-zA-Z0-9_-]{3,20}$': {
        target: 'http://localhost:5050',
        changeOrigin: true,
        rewrite: (path) => `/r${path}`,
      },
    },
  },
});
