import { type ViteDevServer, defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import './src/server'; // import this to reload vite server on serverside file changes
import type { Server } from 'socket.io';

const hmrserver = () => ({
    name: "hmr-server",
    configureServer: async (server: ViteDevServer) => {
      const { io } = await server.ssrLoadModule('./src/server') as {io: Server};
      io.attach(server.httpServer!);
      server.middlewares.use(async (req, res, next) => {
        const { app } = await server.ssrLoadModule('./src/server');
        return app(req, res, next)
      })
    }
})

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), hmrserver()],
})
