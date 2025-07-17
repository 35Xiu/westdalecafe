import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: resolve(process.cwd(), 'index.html'),
        menu: resolve(process.cwd(), 'menu.html'),
        contact: resolve(process.cwd(), 'contact.html'),
        shop: resolve(process.cwd(), 'shop.html'),
        login: resolve(process.cwd(), 'login.html'),
        profile: resolve(process.cwd(), 'profile.html'),
        'test-mobile-menu': resolve(process.cwd(), 'test-mobile-menu.html')
      }
    }
  },
  optimizeDeps: {
    include: ['@supabase/supabase-js']
  }
}); 