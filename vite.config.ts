// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: './', // IMPORTANTE: Isso é necessário para GitHub Pages
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
})