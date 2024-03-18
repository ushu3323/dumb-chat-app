import { ClientToServerEvents, ServerToClientEvents } from "../../types/socket";
import {
  type Socket,
  io,
  type ManagerOptions,
  type SocketOptions,
} from "socket.io-client";

export function createClient(
  opts: Partial<ManagerOptions & SocketOptions>
): Socket<ServerToClientEvents, ClientToServerEvents> {
  return io(opts);
}
