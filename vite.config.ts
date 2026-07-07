import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/Local-Autonomy-Act/',
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    port: 5174,
    open: true,
  },
})
