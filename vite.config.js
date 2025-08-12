import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  // Configuración para el desarrollo del frontend
  root: 'public', // El directorio raíz para Vite es la carpeta public
  server: {
    port: 5173, // Puerto para el servidor de desarrollo de Vite
    open: true, // Abrir automáticamente en el navegador
    proxy: {
      // Proxy para las APIs hacia el servidor Express
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    outDir: '../dist', // Directorio de salida relativo a 'public'
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'public/index.html')
      }
    }
  },
  // Configuración para módulos ES
  esbuild: {
    target: 'es2020'
  }
});
