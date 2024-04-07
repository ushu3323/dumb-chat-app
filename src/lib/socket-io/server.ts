import { Server, type ServerOptions } from "socket.io";
import type { Server as HttpServer } from "http";
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  SocketData,
} from "../../types/socket";

type ServerType = Server<
  ClientToServerEvents,
  ServerToClientEvents,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any,
  SocketData
>;

export const createServer = (
  server?: HttpServer | undefined,
  opts?: Partial<ServerOptions>
): ServerType => {
  const io: ServerType = new Server(server, opts);

  io.use(async (socket, next) => {
    const username = socket.handshake.auth.username;
    if (!username) {
      return next(new Error("UNAUTHORIZED"));
    }

    // Check if username exists
    const sockets = await io.fetchSockets();
    if (sockets.find((s) => s.data.username === username)) {
      return next(new Error("USERNAME_EXISTS"));
    }

    socket.data.username = username;
    next();
  });

  io.on("connection", (socket) => {
    socket.broadcast.emit("userJoined", {
      id: socket.id,
      username: socket.data.username,
    });

    socket.on("message", (payload, callback) => {
      socket.broadcast.emit("message", {
        ...payload,
        author: socket.data.username,
      });

      callback({ status: "OK" });
    });
  });

  return io;
};
