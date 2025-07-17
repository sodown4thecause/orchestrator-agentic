import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': 'http://localhost:8000'
    }
  },
  css: {
    modules: {
      localsConvention: 'camelCaseOnly'
    },
    postcss: {
      plugins: [
        require('tailwindcss'),
        require('autoprefixer')
      ]
    }
  },
  build: {
    cssCodeSplit: true,
    minify: true,
    sourcemap: false
  }
})
