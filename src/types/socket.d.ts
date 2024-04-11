import { Message, User } from "./chat";

export type ServerToClientEvents = {
  message: (msg: Message) => void;
  listUsers: (users: User[]) => void;
  userJoined: (user: User) => void;
  userLeft: (user: User) => void;
};

export type ClientToServerEvents = {
  message: (
    payload: Pick<Message, "content" | "id">,
    callback: (result: { status: "OK" | "INTERNAL_SERVER_ERROR" }) => void
  ) => void;
};

export type SocketData = {
  username: string;
}