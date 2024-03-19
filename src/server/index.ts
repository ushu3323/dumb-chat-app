import express from "express";
import { createServer as createSocketServer } from "../lib/socket-io/server";
import fs from 'fs'
import path from 'path'
import { createServer as createViteServer } from 'vite'

async function createServer() {
  const app = express()
  const io = createSocketServer();

  io.on('connection', (socket) => {
    socket.broadcast.emit("userJoined", socket.id);

    socket.on("message", (payload, callback) => {
      socket.broadcast.emit("message", {
        ...payload,
        author_id: socket.id,
      })
      callback({status: "OK"})
    })
  })

  app.get("/api", (_req, res) => {
    res.send("Hello!")
  })

  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'custom'
  })

  app.use(vite.middlewares)
  app.use('*', async (req, res, next) => {
    const url = req.originalUrl

    try {
      let template = fs.readFileSync(
        path.resolve(process.cwd(), 'index.html'),
        'utf-8',
      )
      template = await vite.transformIndexHtml(url, template)
      res.status(200).set({ 'Content-Type': 'text/html' }).end(template)
    } catch (e) {
      vite.ssrFixStacktrace(e as Error)
      next(e)
    }
  })

  const port = +(process.env.PORT || 3000);
  const server = app.listen(port, () => console.log("Server is listening at port", port))
  io.attach(server);
}

createServer()
