import express from "express";
import { Server } from "socket.io";
import type { ClientToServerEvents, ServerToClientEvents } from "../types/socket";

export const app = express();
export const io: Server<ClientToServerEvents, ServerToClientEvents> = new Server()

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

if (process.env.NODE_ENV !== "development") {
  // Vite server is not running, we need to run a server ourselves
  const port = process.env.PORT || 3000;
  const server = app.listen(port, () => console.log("Listening at port", port));
  io.attach(server);
}
