import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  server: { port: 1422, strictPort: true },
  test: { globals: true, environment: 'jsdom', include: ['src/**/*.test.ts', 'src/**/*.test.tsx'] },
})
