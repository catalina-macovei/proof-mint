import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/users': 'http://localhost:3000',
      '/students': 'http://localhost:3000',  
      '/faculties': 'http://localhost:3000',
      '/universities': 'http://localhost:3000',
      '/applications': 'http://localhost:3000',
    }
  },
})
