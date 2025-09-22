import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  server: {
    proxy: {
      '/backend': {
        target:'http://localhost:3000',
        secure: false,
      }, // Proxying API requests to the backend server
    }
  },
  plugins: [react()
  , tailwindcss()
  ],
})
