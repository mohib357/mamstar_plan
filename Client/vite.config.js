import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173, // Preferred port
        strictPort: false, // Allow automatic port selection
        host: true, // Allow external access
        proxy: {
            '/api': {
                target: 'http://localhost:5001',
                changeOrigin: true
            }
        }
    }
})