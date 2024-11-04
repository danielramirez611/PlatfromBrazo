import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',  // Esto permite que Vite escuche en todas las interfaces de red
    port: 5173,       // Puedes especificar el puerto que deseas usar
    proxy: {
      // Proxy todas las solicitudes a /my-ips a tu backend en localhost:5000
      '/my-ips': {
        target: 'http://localhost:5000',  // La URL de tu backend
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/my-ips/, '/my-ips',)
      },
       // Proxy para /ips-ver
       '/ips-ver': {
        target: 'http://localhost:5000',  // La URL de tu backend para ips-ver
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ips-ver/, '/ips-ver')
      },
      // Puedes agregar más proxies si tienes otras rutas backend
    },
  },
  esbuild: {
    // Ignora los errores de TypeScript en la compilación
    loader: 'tsx',
    include: /src\/.*\.tsx?$/,
    logLevel: 'error',
    ignoreAnnotations: true // Ignora las anotaciones de tipos

  },
  build: {
    minify: false,        // Desactiva la minificación para acelerar
    sourcemap: false,     // No genera mapas de código fuente
    rollupOptions: {
      onwarn: (warning, warn) => {
        // Ignorar todas las advertencias de compilación
        if (warning.code !== 'PLUGIN_WARNING') {
          warn(warning);
        }
      }
    }
  }

});