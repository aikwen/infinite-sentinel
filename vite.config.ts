import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],

  resolve: {
    alias: {
      '@': fileURLToPath(
        new URL('./src', import.meta.url),
      ),
    },
  },

  build: {
    lib: {
      entry: fileURLToPath(
        new URL('./src/index.ts', import.meta.url),
      ),
      name: 'InfiniteSentinel',
      fileName: 'infinite-sentinel',
      formats: ['es'],
    },

    rolldownOptions: {
      external: ['vue'],
    },
  },
})