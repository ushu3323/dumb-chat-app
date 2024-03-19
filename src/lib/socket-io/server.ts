import { Server, type ServerOptions } from "socket.io";
import type { Server as HttpServer } from "http";
import { ClientToServerEvents, ServerToClientEvents } from "../../types/socket";

export const createServer = (
  server?: HttpServer | undefined,
  opts?: Partial<ServerOptions>
): Server<ClientToServerEvents, ServerToClientEvents> => {
  const io = new Server<ClientToServerEvents, ServerToClientEvents>(
    server,
    opts
  );

  io.on("connection", (socket) => {
    socket.broadcast.emit("userJoined", socket.id);

    socket.on("message", (payload, callback) => {
      socket.broadcast.emit("message", {
        ...payload,
        author_id: socket.id,
      });
      callback({ status: "OK" });
    });
  });

  return io;
};
