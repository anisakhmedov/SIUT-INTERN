import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Forward evaluation API calls to backend during development.
      // Adjust target if your backend runs on a different host/port.
      '/internship-evaluations': {
        target: 'https://siut-internships-5e35adaf79be.herokuapp.com',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
