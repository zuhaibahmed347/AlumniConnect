import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@alumni-connect/shared': path.resolve(__dirname, '../shared/src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        /* Only large, leaf-level libraries get a named chunk. React itself is
           deliberately NOT listed: forcing react/react-dom into a separate
           manual chunk can put them after their consumers in the module graph,
           which surfaces as "Cannot read properties of undefined" from
           reconciler/event code. Let Rollup order those naturally. */
        manualChunks: {
          three: ['three', '@react-three/fiber'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-tabs'],
          charts: ['recharts'],
          forms: ['react-hook-form', '@hookform/resolvers', 'zod'],
        },
      },
    },
  },
})
