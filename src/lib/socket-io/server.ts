import { Server, type ServerOptions } from "socket.io";
import type { Server as HttpServer } from 'http';
import { ClientToServerEvents, ServerToClientEvents } from "../../types/socket";

export const createServer = (server?: HttpServer | undefined, opts?: Partial<ServerOptions>): Server<ClientToServerEvents, ServerToClientEvents> => new Server<ClientToServerEvents, ServerToClientEvents>(server, opts)
