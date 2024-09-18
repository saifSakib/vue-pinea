import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    proxy: {
      '/api': 'http://localhost:3000' // Adjust the URL as needed
    }
  }
  // devServer: {
  //   proxy: {
  //     '/api': {
  //       target: 'http://localhost:3000', // Replace with your API server's URL
  //       changeOrigin: true,
  //       pathRewrite: {
  //         '^/api': '' // Remove the '/api' path prefix
  //       }
  //     }
  //   }
  // }
})
