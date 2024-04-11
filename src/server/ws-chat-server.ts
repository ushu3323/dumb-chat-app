import { Server, ServerOptions, Socket as SocketIOSocket } from "socket.io";
import type { Server as HttpServer } from "http";
import {
  ClientToServerEvents,
  ServerToClientEvents,
  SocketData,
} from "../types/socket";
import { Message, User } from "../types/chat";

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
      const currentUsername = socket.data.username;

      socket.broadcast.emit("userJoined", {
        id: socket.id,
        username: currentUsername,
      });

      const users: User[] = [];
      for (const [username, socket] of this.#usernames.entries()) {
        if (username === currentUsername) continue;
        users.push({ id: socket.id, username });
      }
      socket.emit("listUsers", users);

      socket.on("message", (payload, callback) => {
        socket.broadcast.emit("message", {
          ...payload,
          author: currentUsername,
        } satisfies Message);

        callback({ status: "OK" });
      });

      socket.on("disconnect", () => {
        socket.broadcast.emit("userLeft", { id: socket.id, username: currentUsername });
        this.#usernames.delete(currentUsername);
      });
    });
  }
}
