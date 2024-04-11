import { Server, ServerOptions, Socket as SocketIOSocket } from "socket.io";
import type { Server as HttpServer } from "http";
import {
  ClientToServerEvents,
  ServerToClientEvents,
  SocketData,
} from "../types/socket";
import { Message } from "../types/chat";

type Socket = SocketIOSocket<
  ClientToServerEvents,
  ServerToClientEvents,
  Record<string, never>,
  SocketData
>;

export default class WSChatServer extends Server<
  ClientToServerEvents,
  ServerToClientEvents,
  Record<string, never>,
  SocketData
> {
  #usernames: Map<string, Socket>;

  constructor(server?: HttpServer, opts?: Partial<ServerOptions>) {
    super(server, opts);
    this.#usernames = new Map();

    this.use(async (socket, next) => {
      const username = socket.handshake.auth.username;
      if (!username) {
        return next(new Error("UNAUTHORIZED"));
      }

      // Check if username is taken
      if (this.#usernames.has(username)) {
        return next(new Error("USERNAME_TAKEN"));
      }

      socket.data.username = username;
      this.#usernames.set(socket.data.username, socket);
      next();
    });

    this.on("connection", (socket) => {
      const username = socket.data.username;
      socket.broadcast.emit("userJoined", {
        id: socket.id,
        username,
      });

      socket.on("message", (payload, callback) => {
        socket.broadcast.emit("message", {
          ...payload,
          author: username,
        } satisfies Message);

        callback({ status: "OK" });
      });
    });
  }
}
