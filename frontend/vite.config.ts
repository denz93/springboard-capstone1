import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(async () => {
  const env = loadEnv(process.env.MODE, process.cwd(), '')
  console.log({env})
  return {
    define: {
      __API_URL__: JSON.stringify(env['API_URL']??'http://localhost:5000')
    },
    resolve: {
      preserveSymlinks: false,
      alias: {
        '@': path.resolve(__dirname, "./src")
      }
    },
    optimizeDeps: {
      exclude: [],
  
    },
    plugins: [react({exclude: ''})],
  }
})
