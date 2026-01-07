import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Plugin to set correct MIME type for SVG files
const svgMimeTypePlugin = () => {
  return {
    name: 'svg-mime-type',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url && req.url.endsWith('.svg')) {
          res.setHeader('Content-Type', 'image/svg+xml')
        }
        next()
      })
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), svgMimeTypePlugin()],
  publicDir: 'public',
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: false,
    allowedHosts: [
      'localhost',
    ],
    cors: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path, // Keep the /api prefix
      },
      '/health': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
      '/create-checkout-session': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  // Configure how assets are handled
  assetsInclude: ['**/*.svg'],
})
